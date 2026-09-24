import { createContext, useEffect, useState } from "react";
import { Encounter } from "@vimconnect/app-sdk";
import { useVimOsContext } from "../useVimOsContext";
import { useAppConfig } from "../useAppConfig";

interface EncounterContext {
  encounter: Partial<Encounter> | undefined;
}

export const VimOSEncounterContext = createContext<EncounterContext>({
  encounter: undefined,
});

export const VimOSEncounterProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { updateNotification } = useAppConfig();
  const vimOS = useVimOsContext();
  const [encounter, setEncounter] = useState<Partial<Encounter> | undefined>(
    undefined
  );

  useEffect(() => {
    return vimOS.ehr.context.onChange(
      "encounter_open:encounter",
      (_previous, current) => setEncounter(current?.fields)
    );
  }, [vimOS]);

  useEffect(() => {
    updateNotification("encounter", encounter ? 1 : 0);
  }, [encounter, updateNotification]);

  return (
    <VimOSEncounterContext.Provider
      value={{
        encounter,
      }}
    >
      {children}
    </VimOSEncounterContext.Provider>
  );
};
