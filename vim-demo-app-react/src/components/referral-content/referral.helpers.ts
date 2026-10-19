import { ReferralFormInputs } from "./referral.form";
import { Referral } from "@vimconnect/app-sdk";
import { get, set, isEmpty, isNil } from "lodash-es";

const CODE_FORM_FIELDS = ["conditions"];

export const FORM_DATA_TO_SDK_PATH_MAPPING: Record<
  keyof ReferralFormInputs,
  string
> = {
  specialty: "basicInformation.specialty",
  startDate: "basicInformation.startDate",
  endDate: "basicInformation.endDate",
  status: "basicInformation.status",
  priority: "basicInformation.priority",
  authCode: "basicInformation.authCode",
  reasons: "basicInformation.reasons",
  notes: "basicInformation.notes",
  numberOfVisits: "basicInformation.numberOfVisits",
  targetProvider: "targetProvider",
  conditions: "conditions",
};

const SDK_PATH_TO_FORM_DATA_MAPPING = Object.fromEntries(
  Object.entries(FORM_DATA_TO_SDK_PATH_MAPPING).map(([key, value]) => [
    value,
    key,
  ])
);

const removeUndefinedProperties = (obj: unknown) => {
  if (Array.isArray(obj) || typeof obj !== "object" || obj === null) {
    return obj;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null) {
      const nestedResult = removeUndefinedProperties(value);
      if (Object.keys(nestedResult as Record<string, unknown>).length > 0) {
        result[key] = nestedResult;
      }
    } else if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
};

export const buildReferralPayload = (
  formData: ReferralFormInputs
): Partial<Referral> => {
  const sdkFields = Object.keys(SDK_PATH_TO_FORM_DATA_MAPPING);

  const rawPayload: Partial<Referral> = {};

  sdkFields.forEach((field) => {
    const formDataName = SDK_PATH_TO_FORM_DATA_MAPPING[field];
    const formDataValue = get(formData, formDataName);

    let value;

    if (CODE_FORM_FIELDS.includes(formDataName)) {
      const mappedCodeValues = formDataValue?.length
        ? formDataValue.map(({ id, label }: { id: string; label: string }) => ({
            code: id,
            description: label,
          }))
        : undefined;
      value = mappedCodeValues;
    } else if (formDataName === "priority" && formDataValue) {
      value = formDataValue as "ROUTINE" | "URGENT" | "STAT";
    } else {
      value = formDataValue || undefined;
    }

    set(rawPayload, field, value);
  });

  const payload = removeUndefinedProperties(rawPayload);

  return payload as Partial<Referral>;
};

export const prepareResetFields = (): Partial<ReferralFormInputs> => {
  const formFields = Object.keys(
    FORM_DATA_TO_SDK_PATH_MAPPING
  ) as (keyof ReferralFormInputs)[];

  const resetData: Partial<ReferralFormInputs> = {};

  formFields.forEach((field) => {
    resetData[field] = null;
  });

  return resetData;
};

export const hasValue = (
  value: string | number | null | undefined | object
): boolean => {
  return (
    !isNil(value) &&
    !isEmpty(value?.toString()) &&
    (typeof value !== "string" || value?.toString()?.trim() !== "")
  );
};
