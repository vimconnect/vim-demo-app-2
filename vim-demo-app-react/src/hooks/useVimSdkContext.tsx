import { useContext } from "react";
import { VimSdkContext } from "./providers";

export const useVimSdkContext = () => {
  return useContext(VimSdkContext);
};
