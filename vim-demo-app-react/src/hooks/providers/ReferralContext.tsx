import { createContext, useEffect, useState } from "react";
import { Referral } from "@vimconnect/app-sdk";
import { useVimSdkContext } from "../useVimSdkContext";
import { useAppConfig } from "../useAppConfig";

interface ReferralContext {
  referral: Partial<Referral> | undefined;
}

export const VimSdkReferralContext = createContext<ReferralContext>({
  referral: undefined,
});

export const VimSdkReferralProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { updateNotification } = useAppConfig();
  const vimSdk = useVimSdkContext();
  const [referral, setReferral] = useState<Partial<Referral> | undefined>(
    undefined
  );

  useEffect(() => {
    return vimSdk.ehr.context.onChange(
      "referral_start:referral",
      (_previous, current) => setReferral(current?.fields)
    );
  }, [vimSdk]);

  useEffect(() => {
    updateNotification("referral", referral ? 1 : 0);
  }, [referral, updateNotification]);

  return (
    <VimSdkReferralContext.Provider
      value={{
        referral,
      }}
    >
      {children}
    </VimSdkReferralContext.Provider>
  );
};
