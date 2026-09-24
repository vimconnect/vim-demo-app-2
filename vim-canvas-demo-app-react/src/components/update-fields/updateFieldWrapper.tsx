import { useToast } from "@/hooks/use-toast";
import { useUpdateEncounter } from "@/hooks/useUpdateEncounter";
import { useUpdateReferral } from "@/hooks/useUpdateReferral";
import { useCallback, useMemo } from "react";
import { Encounter, Referral } from "@vimconnect/app-sdk";
import { FieldMask } from "@/hooks/writeback";
import { UpdateField } from "./types";

interface UpdateFieldProps<
  T = unknown,
  VAL_TO_UPDATE extends (value: T) => Promise<unknown> = (
    value: T
  ) => Promise<unknown>
> {
  value?: T;
  canUpdate: boolean;
  updateOnNewValue: VAL_TO_UPDATE;
  toastSuccessTitle?: string;
  render: (props: { field: UpdateField<T> }) => JSX.Element;
}

function EntityUpdateField<
  T,
  VAL_TO_UPDATE extends (value: T) => Promise<unknown>
>({
  value,
  updateOnNewValue,
  render,
  canUpdate,
  toastSuccessTitle,
}: UpdateFieldProps<T, VAL_TO_UPDATE>) {
  const { toast } = useToast();

  const onChange = useCallback(
    (newValue: T) => {
      updateOnNewValue(newValue)
        .then(() => {
          toast({
            variant: "default",
            title: toastSuccessTitle,
          });
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error ? JSON.stringify(error) : "An error occurred.",
          });
        });
    },
    [toast, toastSuccessTitle, updateOnNewValue]
  );

  const renderData = useMemo(
    () => ({
      field: {
        value,
        disabled: !canUpdate,
        onChange,
      },
    }),
    [value, canUpdate, onChange]
  );

  return render(renderData);
}

type ReferralUpdateFieldProps<T = unknown> = Pick<
  UpdateFieldProps<T>,
  "render" | "value"
> & {
  canUpdateParam: FieldMask;
  valueToUpdatePayload: (value: T) => Partial<Referral>;
};

export function ReferralUpdateField<T = unknown>({
  value,
  valueToUpdatePayload,
  render,
  canUpdateParam,
}: ReferralUpdateFieldProps<T>) {
  const { canUpdateParams, updateReferral } = useUpdateReferral(canUpdateParam);

  return (
    <EntityUpdateField
      canUpdate={canUpdateParams}
      updateOnNewValue={(newValue) =>
        updateReferral(valueToUpdatePayload(newValue))
      }
      render={render}
      value={value}
      toastSuccessTitle="Referral updated!"
    />
  );
}

type EncounterUpdateFieldProps<T = unknown> = Pick<
  UpdateFieldProps<T>,
  "render" | "value"
> & {
  canUpdateParam: FieldMask;
  valueToUpdatePayload: (value: T) => Partial<Encounter>;
};

export function EncounterUpdateField<T = unknown>({
  value,
  valueToUpdatePayload,
  render,
  canUpdateParam,
}: EncounterUpdateFieldProps<T>) {
  const { canUpdateParams, updateEncounter } =
    useUpdateEncounter(canUpdateParam);

  return (
    <EntityUpdateField
      canUpdate={canUpdateParams}
      updateOnNewValue={(newValue) =>
        updateEncounter(valueToUpdatePayload(newValue))
      }
      toastSuccessTitle="Encounter updated!"
      render={render}
      value={value}
    />
  );
}
