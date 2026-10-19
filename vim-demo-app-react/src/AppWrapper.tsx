import React, { useEffect, useState } from "react";
import { initVimSDK, VimSDK } from "@vimconnect/app-sdk";
import { Toaster } from "@/components/ui/toaster";
import {
  VimSdkContext,
  VimSdkPatientProvider,
  VimSdkEncounterProvider,
  VimSdkReferralProvider,
  VimSdkOrdersProvider,
} from "@/hooks/providers";
import { AppConfigProvider } from "@/hooks/providers/AppConfigContext";

export const AppWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [vimSdk, setVimSdk] = useState<VimSDK | undefined>(undefined);
  const [initError, setInitError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    initVimSDK()
      .then((sdk) => {
        if (!cancelled) setVimSdk(sdk);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setInitError(
            error instanceof Error ? error.message : "Unknown SDK error"
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (initError) {
    return <div>Vim SDK failed to load: {initError}</div>;
  }

  if (!vimSdk) {
    return <div>Loading VimSDK...</div>;
  }

  return (
    <VimSdkContext.Provider value={vimSdk}>
      <AppConfigProvider>
        <VimSdkPatientProvider>
          <VimSdkReferralProvider>
            <VimSdkOrdersProvider>
              <VimSdkEncounterProvider>{children}</VimSdkEncounterProvider>
            </VimSdkOrdersProvider>
          </VimSdkReferralProvider>
        </VimSdkPatientProvider>
      </AppConfigProvider>
      <Toaster />
    </VimSdkContext.Provider>
  );
};
