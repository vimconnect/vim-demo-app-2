import { useContext } from "react";
import { VimSdkPatientContext } from "./providers";

export const usePatient = () => {
  return useContext(VimSdkPatientContext);
};
