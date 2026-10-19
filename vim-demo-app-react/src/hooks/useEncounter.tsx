import { useContext } from "react";
import { VimSdkEncounterContext } from "./providers";

export const useEncounter = () => {
  return useContext(VimSdkEncounterContext);
};
