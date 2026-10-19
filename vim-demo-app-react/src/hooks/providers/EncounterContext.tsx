import { createContext, useEffect, useState } from "react";
import { Encounter } from "@vimconnect/app-sdk";
import { useVimSdkContext } from "../useVimSdkContext";
import { useAppConfig } from "../useAppConfig";

interface EncounterContext {
  encounter: Partial<Encounter> | undefined;
}

export const VimSdkEncounterContext = createContext<EncounterContext>({
  encounter: undefined,
});

export const VimSdkEncounterProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { updateNotification } = useAppConfig();
  const vimSdk = useVimSdkContext();
  const [encounter, setEncounter] = useState<Partial<Encounter> | undefined>(
    undefined
  );

  useEffect(() => {
    return vimSdk.ehr.context.onChange(
      "encounter_open:encounter",
      (_previous, current) => setEncounter(current?.fields)
    );
  }, [vimSdk]);

  useEffect(() => {
    updateNotification("encounter", encounter ? 1 : 0);
  }, [encounter, updateNotification]);

  return (
    <VimSdkEncounterContext.Provider
      value={{
        encounter,
      }}
    >
      {children}
    </VimSdkEncounterContext.Provider>
  );
};
