import { useContext } from "react";
import { VimSdkReferralContext } from "./providers";

export const useReferral = () => {
  return useContext(VimSdkReferralContext);
};
