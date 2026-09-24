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
