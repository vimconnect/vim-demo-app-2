import {
  EntityFieldContent,
  EntityFieldTitle,
  EntitySectionContent,
  EntitySectionTitle,
} from "../ui/entityContent";
import { TextareaField } from "../update-fields/textAreaField";
import { EncounterUpdateField } from "../update-fields/updateFieldWrapper";
import { FormInputs, useEncounterFormContext } from "./encounter.form";
import { useEncounter } from "@/hooks/useEncounter";

export const EncounterPlan = () => {
  const { control } = useEncounterFormContext();
  const { encounter } = useEncounter();
  const { plan } = encounter || {};

  return (
    <>
      <EntitySectionTitle title="Plan" />
      <EntitySectionContent>
        <EntityFieldContent>
          <EntityFieldTitle title="General notes" />
          <EncounterUpdateField<string | undefined>
            canUpdateParam={{
              plan: {
                generalNotes: true,
              },
            }}
            valueToUpdatePayload={(value) => ({
              plan: {
                generalNotes: value,
              },
            })}
            render={({ field }) => (
              <TextareaField<FormInputs>
                placeholder="Add notes here"
                control={control}
                name={"planGeneralNotes"}
                onTextareaSubmit={field.onChange}
                disabled={field.disabled}
                clearAfterChange
                prefixAdornment={plan?.generalNotes}
              />
            )}
          />
        </EntityFieldContent>
      </EntitySectionContent>
    </>
  );
};
