import { createContext, useEffect, useState } from "react";
import { Patient } from "@vimconnect/app-sdk";
import { useVimOsContext } from "../useVimOsContext";
import { useAppConfig } from "../useAppConfig";

interface PatientContext {
  patient: Partial<Patient> | undefined;
}

export const VimOSPatientContext = createContext<PatientContext>({
  patient: undefined,
});

/**
 * Both keys supply the patient, and both go empty while the EHR moves from an
 * open chart into an encounter. Clearing on either one blanks the patient
 * mid-transition, so the last value is held until the key that supplied it
 * clears.
 */
const PATIENT_KEYS = ["chart_open:patient", "encounter_open:patient"] as const;
type PatientSource = (typeof PATIENT_KEYS)[number];

interface HeldPatient {
  fields: Partial<Patient>;
  source: PatientSource;
}

export const VimOSPatientProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { updateNotification } = useAppConfig();
  const vimOS = useVimOsContext();
  const [held, setHeld] = useState<HeldPatient | undefined>(undefined);

  useEffect(() => {
    const unsubscribers = PATIENT_KEYS.map((key) =>
      vimOS.ehr.context.onChange(key, (_previous, current) => {
        setHeld((previous) => {
          if (current?.fields) return { fields: current.fields, source: key };
          return previous?.source === key ? undefined : previous;
        });
      })
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [vimOS]);

  useEffect(() => {
    updateNotification("patient", held ? 1 : 0);
  }, [held, updateNotification]);

  return (
    <VimOSPatientContext.Provider
      value={{
        patient: held?.fields,
      }}
    >
      {children}
    </VimOSPatientContext.Provider>
  );
};
