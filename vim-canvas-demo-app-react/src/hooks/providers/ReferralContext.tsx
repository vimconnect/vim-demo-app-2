import { createContext, useEffect, useState } from "react";
import { Referral } from "@vimconnect/app-sdk";
import { useVimOsContext } from "../useVimOsContext";
import { useAppConfig } from "../useAppConfig";

interface ReferralContext {
  referral: Partial<Referral> | undefined;
}

export const VimOSReferralContext = createContext<ReferralContext>({
  referral: undefined,
});

export const VimOSReferralProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { updateNotification } = useAppConfig();
  const vimOS = useVimOsContext();
  const [referral, setReferral] = useState<Partial<Referral> | undefined>(
    undefined
  );

  useEffect(() => {
    return vimOS.ehr.context.onChange(
      "referral_start:referral",
      (_previous, current) => setReferral(current?.fields)
    );
  }, [vimOS]);

  useEffect(() => {
    updateNotification("referral", referral ? 1 : 0);
  }, [referral, updateNotification]);

  return (
    <VimOSReferralContext.Provider
      value={{
        referral,
      }}
    >
      {children}
    </VimOSReferralContext.Provider>
  );
};
