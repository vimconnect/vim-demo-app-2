import { useEncounter } from '@/hooks/useEncounter';
import {
  EntityFieldContent,
  EntityFieldTitle,
  EntitySectionContent,
  EntitySectionTitle,
} from '../ui/entityContent';
import { DiagnosisMultiSelectField } from '../update-fields/diagnosisMultiSelectField';
import { TextareaField } from '../update-fields/textAreaField';
import { EncounterUpdateField } from '../update-fields/updateFieldWrapper';
import { FormInputs, useEncounterFormContext } from './encounter.form';
import { useEffect, useMemo, useCallback } from 'react';
import { useWatch } from 'react-hook-form';


/**
 * Type definition for a diagnosis code in form control format
 * Used for managing codes in react-hook-form and dropdown selections
 */
interface FormDiagnosisCode {
  id: string;
  label: string;
  note?: string;
}

/**
 * Type definition for diagnosis code API payload
 * Used when sending diagnosis codes to the API (description is required)
 */
interface DiagnosisCodePayload {
  code: string;
  description: string;
}

/**
 * Default ICD-10 diagnosis codes available for selection
 */
const DEFAULT_DIAGNOSIS_CODES = [
  { id: 'E11.21', label: 'DM with nephropathy' },
  { id: 'E72.20', label: 'Disorder of urea cycle metabolism' },
  { id: 'I48.0', label: 'Paroxysmal atrial fibrillation' },
  { id: 'D69.6', label: 'Thrombocytopenia, unspecified' },
  { id: 'K55.1', label: 'Chronic vascular disorders of intestine' },
  { id: 'G31.9', label: 'Degenerative disease of nervous system, unspecified' },
  { id: 'F20.9', label: 'Schizophrenia, unspecified' },
  { id: 'A00000', label: 'Invalid ICD' },
];

/**
 * Permission configuration for updating diagnosis codes
 * Shared across all diagnosis code update operations
 */
const DIAGNOSIS_CODES_CAN_UPDATE_PARAM = {
  assessment: {
    diagnoses: true,
  },
} as const;


const GENERAL_NOTES_CAN_UPDATE_PARAM = {
  assessment: {
    generalNotes: true,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a single diagnosis code entry for the API payload.
 * Converts from various formats to the API-expected format.
 */
const createDiagnosisCodeEntry = (
  code: string,
  description: string,
): DiagnosisCodePayload => ({ code, description });

/**
 * Creates the full payload for updating diagnosis codes.
 * Handles both single diagnosis codes and arrays of diagnosis codes.
 * Returns a properly typed payload for the EncounterUpdateField component.
 */
const createDiagnosisCodesUpdatePayload = (
  codes: DiagnosisCodePayload | DiagnosisCodePayload[],
) => {
  const diagnoses = Array.isArray(codes) ? codes : [codes];
  return { assessment: { diagnoses } };
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Editable note field for diagnosis codes (both saved and new)
 * Provides save/cancel functionality with optional prefix adornment for saved notes
 */

/**
 * Wrapper component that combines EncounterUpdateField with DiagnosisCodeNoteField
 * Handles individual saving of diagnosis code notes to the API
 */

/**
 * Component to display saved diagnosis codes from the encounter
 * Each code has an editable note field with individual save functionality
 * Note changes can be saved individually or via "Push all to EHR"
 */

/**
 * Component to display new diagnosis codes (not yet saved to encounter)
 * Each code has an editable note field with individual save functionality
 */

/**
 * Assessment component - manages diagnosis codes and general notes
 * Uses form control fields: diagnosisCodes and assessmentGeneralNotes
 */
export const EncounterAssessment = () => {
  const { control, setValue } = useEncounterFormContext();
  const { encounter } = useEncounter();
  const { assessment } = encounter || {};

  // ============================================================================
  // STATE AND MEMOIZED VALUES
  // ============================================================================

  // Watch the diagnosisCodes field from form control using useWatch hook
  const watchedDiagnosisCodes = useWatch({ control, name: 'diagnosisCodes' });
  const formDiagnosisCodes = useMemo(() => watchedDiagnosisCodes || [], [watchedDiagnosisCodes]);

  // Saved diagnosis codes from the API - memoized to prevent unnecessary re-renders
  const savedDiagnosisCodes = useMemo(
    () => assessment?.diagnoses || [],
    [assessment?.diagnoses],
  );

  // Separate new codes from saved code updates
  // New codes: codes in form that are NOT in saved codes
  // Saved code updates: codes in form that ARE in saved codes (editing notes)
  const { newCodes, savedCodeIds } = useMemo(() => {
    const savedIds = new Set(
      savedDiagnosisCodes.map((code) => code.code).filter((code): code is string => Boolean(code)),
    );
    const newCodesArray = formDiagnosisCodes.filter(
      (code: FormDiagnosisCode) => !savedIds.has(code.id),
    );
    return { newCodes: newCodesArray, savedCodeIds: savedIds };
  }, [formDiagnosisCodes, savedDiagnosisCodes]);


  // Get currently selected options for the multi-select field (only new codes)
  const selectedOptions = useMemo(
    () =>
      newCodes.map(
        (code: FormDiagnosisCode): FormDiagnosisCode => ({
          id: code.id,
          label: code.label,
        }),
      ),
    [newCodes],
  );

  // All available diagnosis codes (no filtering)
  // Saved codes will be shown as disabled in the dropdown
  const availableOptions = useMemo(() => {
    return DEFAULT_DIAGNOSIS_CODES;
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Clear form control when NEW codes are saved to API
  // Don't auto-remove saved code updates - let the user manage them
  useEffect(() => {
    if (formDiagnosisCodes.length > 0 && savedDiagnosisCodes.length > 0) {
      const savedCodeIds = new Set(savedDiagnosisCodes.map((code) => code.code));

      // Only filter out NEW codes that have now been saved
      // Keep saved code updates in the form (don't auto-remove them)
      const remainingCodes = formDiagnosisCodes.filter(
        (formCode: { id: string; label: string; note?: string }) => {
          const isSavedCode = savedCodeIds.has(formCode.id);

          // Keep all saved code updates (user is editing existing codes)
          if (isSavedCode) {
            return true;
          }

          // For new codes: once the code shows up in saved codes it has landed.
          if (savedDiagnosisCodes.some((sc) => sc.code === formCode.id)) {
            return false;
          }

          // Keep new codes that aren't saved yet
          return true;
        },
      );

      // Update form control if anything was removed
      if (remainingCodes.length !== formDiagnosisCodes.length) {
        setValue('diagnosisCodes', remainingCodes.length > 0 ? remainingCodes : null);
      }
    }
  }, [savedDiagnosisCodes, formDiagnosisCodes, setValue]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handles changes to the multi-select dropdown
   * Updates the form control with newly selected codes while preserving saved code updates
   */
  const handleSelectionChange = useCallback(
    (selected: FormDiagnosisCode[]) => {
      // Convert selected options to form format
      const newFormCodes: FormDiagnosisCode[] = selected.map((option) => {
        // Preserve existing note if the code was already selected
        const existingCode = formDiagnosisCodes.find(
          (code: FormDiagnosisCode) => code.id === option.id,
        );
        return {
          id: option.id,
          label: option.label,
          note: existingCode?.note || '',
        };
      });

      // Get saved code updates from form control
      const savedCodeUpdates = formDiagnosisCodes.filter((code: FormDiagnosisCode) => {
        const savedCodeIds = new Set(savedDiagnosisCodes.map((sc) => sc.code));
        return savedCodeIds.has(code.id);
      });

      // Combine new codes with saved code updates
      const allCodes = [...savedCodeUpdates, ...newFormCodes];

      // Update form control and mark as dirty to enable "Push all to EHR" button
      setValue('diagnosisCodes', allCodes, { shouldDirty: true });
    },
    [formDiagnosisCodes, savedDiagnosisCodes, setValue],
  );




  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Clear form control when NEW codes are saved to API
  // Don't auto-remove saved code updates - let the user manage them
  useEffect(() => {
    if (formDiagnosisCodes.length > 0 && savedDiagnosisCodes.length > 0) {
      const savedCodeIds = new Set(savedDiagnosisCodes.map((code) => code.code));

      // Only filter out NEW codes that have now been saved
      // Keep saved code updates in the form (don't auto-remove them)
      const remainingCodes = formDiagnosisCodes.filter(
        (formCode: { id: string; label: string; note?: string }) => {
          const isSavedCode = savedCodeIds.has(formCode.id);

          // Keep all saved code updates (user is editing existing codes)
          if (isSavedCode) {
            return true;
          }

          // For new codes: once the code shows up in saved codes it has landed.
          if (savedDiagnosisCodes.some((sc) => sc.code === formCode.id)) {
            return false;
          }

          // Keep new codes that aren't saved yet
          return true;
        },
      );

      // Update form control if anything was removed
      if (remainingCodes.length !== formDiagnosisCodes.length) {
        setValue('diagnosisCodes', remainingCodes.length > 0 ? remainingCodes : null);
      }
    }
  }, [savedDiagnosisCodes, formDiagnosisCodes, setValue]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <EntitySectionTitle title="Assessment" />
      <EntitySectionContent>
        {/* Saved diagnosis codes section */}
        <EntityFieldContent>
          {savedDiagnosisCodes.length > 0 && (
            <div className="space-y-2 mb-4">
              {savedDiagnosisCodes.map((item, index) => (
                <div key={index} className="border rounded-md p-3">
                  <p className="text-sm font-semibold">
                    {item.code} - {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Multi-select dropdown for adding new diagnosis codes */}
          {/* EncounterUpdateField wrapper enables bulk save via check button */}
          <EncounterUpdateField<FormDiagnosisCode[]>
            value={formDiagnosisCodes}
            canUpdateParam={DIAGNOSIS_CODES_CAN_UPDATE_PARAM}
            valueToUpdatePayload={(items) =>
              createDiagnosisCodesUpdatePayload(
                items.map((item) => createDiagnosisCodeEntry(item.id, item.label)),
              )
            }
            render={({ field }) => (
              <DiagnosisMultiSelectField<FormDiagnosisCode[]>
                placeholder="Add ICD-10"
                includeOptionsFields
                formatOption={(option) => `${option.id} - ${option.label}`}
                selectedOptions={selectedOptions}
                onSelectedChange={handleSelectionChange}
                options={availableOptions}
                disabledOptionIds={savedCodeIds}
                disabled={field.disabled}
                onChange={() => {
                  // Bulk save: Submit only NEW codes to API
                  // Saved code updates go via "Push all to EHR" button
                  field.onChange(newCodes);
                }}
              />
            )}
          />
        </EntityFieldContent>

        {/* New diagnosis codes section */}
        {newCodes.length > 0 && (
          <div className="space-y-2 mt-4">
            {newCodes.map((code: FormDiagnosisCode, index: number) => (
              <div key={index} className="border rounded-md p-3 bg-blue-50">
                <p className="text-sm font-semibold">
                  {code.id} - {code.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* General notes section */}
        <EntityFieldContent>
          <EntityFieldTitle title="General notes" />
          <EncounterUpdateField<string | undefined>
            canUpdateParam={GENERAL_NOTES_CAN_UPDATE_PARAM}
            valueToUpdatePayload={(value) => ({
              assessment: {
                generalNotes: value,
              },
            })}
            render={({ field }) => (
              <TextareaField<FormInputs>
                placeholder="Add notes here"
                control={control}
                name="assessmentGeneralNotes"
                onTextareaSubmit={field.onChange}
                disabled={field.disabled}
                clearAfterChange
                prefixAdornment={assessment?.generalNotes}
              />
            )}
          />
        </EntityFieldContent>
      </EntitySectionContent>
    </>
  );
};
