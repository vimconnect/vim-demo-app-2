import type { UpdateResult } from "@vimconnect/app-sdk";

/**
 * The field masks the update components pass (`{ basicInformation: { specialty: true } }`)
 * are this app's own convention — the SDK takes dot-paths instead.
 */
export type FieldMask = { [key: string]: true | FieldMask };

export const maskToFields = (mask: FieldMask | undefined): string[] => {
  if (!mask) return [];
  return Object.entries(mask).flatMap(([key, value]) =>
    value === true
      ? [key]
      : maskToFields(value).map((nested) => `${key}.${nested}`)
  );
};

/** Dot-paths of the values a payload writes; arrays are values, not containers. */
const payloadPaths = (data: object, prefix = ""): string[] =>
  Object.entries(data).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === "object" && !Array.isArray(value)
      ? payloadPaths(value, path)
      : [path];
  });

/**
 * `update()` resolves rather than throws when a write does not land: a failure
 * comes back as `success: false`, and a field the EHR did not take is simply
 * absent from `updatedFields`. Turn both into errors so a dropped write is
 * not reported as saved.
 *
 * A field listed in `skippedValues` already held that value in the EHR, so it
 * counts as written.
 */
export const assertWritten = (
  data: object,
  result: UpdateResult
): UpdateResult => {
  if (!result.success) {
    throw new Error(
      [result.error ?? "Update failed", result.details]
        .filter(Boolean)
        .join(": ")
    );
  }

  const landed = [
    ...(result.updatedFields ?? []),
    ...Object.keys(result.skippedValues ?? {}),
  ];
  // Either side may be the coarser path (`objective` vs `objective.generalNotes`).
  const notWritten = payloadPaths(data).filter(
    (path) =>
      !landed.some(
        (field) =>
          field === path ||
          path.startsWith(`${field}.`) ||
          field.startsWith(`${path}.`)
      )
  );
  if (notWritten.length) {
    console.warn("[writeback] fields not written", { data, result });
    throw new Error(
      `Not written to the EHR: ${notWritten.join(", ")}` +
        (result.details ? ` (${result.details})` : "")
    );
  }

  return result;
};

/** Toast text for anything a writeback rejects with; an Error stringifies to `{}`. */
export const describeError = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : error
      ? JSON.stringify(error)
      : "An error occurred.";
