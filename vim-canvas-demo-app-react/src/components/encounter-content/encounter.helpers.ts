import { FormInputs } from './encounter.form';
import { Encounter } from '@vimconnect/app-sdk';
import { get, set } from 'lodash-es';

const CODE_FORM_FIELDS = ['diagnosisCodes', 'procedureCodes'];

export const FORM_DATA_TO_VIM_OS_PATH_MAPPING: Record<keyof FormInputs, string> = {
  subjectiveGeneralNotes: 'subjective.generalNotes',
  subjectiveChiefComplaint: 'subjective.chiefComplaintNotes',
  subjectiveHistoryOfPresentIllness: 'subjective.historyOfPresentIllnessNotes',
  subjectiveReviewOfSystems: 'subjective.reviewOfSystemsNotes',
  objectiveGeneralNotes: 'objective.generalNotes',
  objectivePhysicalExamNotes: 'objective.physicalExamNotes',
  assessmentGeneralNotes: 'assessment.generalNotes',
  planGeneralNotes: 'plan.generalNotes',
  patientInstructionsGeneralNotes: 'patientInstructions.generalNotes',
  encounterNotesGeneralNotes: 'encounterNotes.generalNotes',
  diagnosisCodes: 'assessment.diagnoses',
  procedureCodes: 'billingInformation.procedureCodes',
};

const VIM_OS_PATH_TO_FORM_DATA_MAPPING = Object.fromEntries(
  Object.entries(FORM_DATA_TO_VIM_OS_PATH_MAPPING).map(([key, value]) => [value, key]),
);

const removeUndefinedProperties = (obj: unknown) => {
  if (Array.isArray(obj) || typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
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

/**
 * The legacy per-field updatability map is gone — `getCapability('update')`
 * answers for the whole entity — so every mapped field the form holds is sent.
 */
export const buildEncounterPayload = (formData: FormInputs): Partial<Encounter> => {
  const vimOsFields = Object.keys(VIM_OS_PATH_TO_FORM_DATA_MAPPING);

  const rawPayload: Partial<Encounter> = {};

  vimOsFields.forEach((field) => {
    const formDataName = VIM_OS_PATH_TO_FORM_DATA_MAPPING[field];
    const value = get(formData, formDataName) ?? undefined;

    if (CODE_FORM_FIELDS.includes(formDataName)) {
      const mappedCodeValues = value?.map(
        ({ id, label, note }: { id: string; label: string; note?: string }) => ({
          code: id,
          description: label,
          ...(note && { note }),
        }),
      );
      set(rawPayload, field, mappedCodeValues);
    } else {
      set(rawPayload, field, value);
    }
  });

  const payload = removeUndefinedProperties(rawPayload);

  return payload as Partial<Encounter>;
};

export const prepareResetFields = (): Partial<FormInputs> => {
  const formFields = Object.keys(FORM_DATA_TO_VIM_OS_PATH_MAPPING) as (keyof FormInputs)[];
  const resetData: Partial<FormInputs> = {};

  formFields.forEach((field) => {
    resetData[field] = null;
  });

  return resetData;
};
