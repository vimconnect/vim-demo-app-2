import React, { useEffect, useState } from "react";
import { initVimSDK, VimSDK } from "@vimconnect/app-sdk";
import { Toaster } from "@/components/ui/toaster";
import {
  VimOSContext,
  VimOSPatientProvider,
  VimOSEncounterProvider,
  VimOSReferralProvider,
  VimOSOrdersProvider,
} from "@/hooks/providers";
import { AppConfigProvider } from "@/hooks/providers/AppConfigContext";

export const AppWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [vimOS, setVimOS] = useState<VimSDK | undefined>(undefined);
  const [initError, setInitError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    initVimSDK()
      .then((sdk) => {
        if (!cancelled) setVimOS(sdk);
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

  if (!vimOS) {
    return <div>Loading VimSDK...</div>;
  }

  return (
    <VimOSContext.Provider value={vimOS}>
      <AppConfigProvider>
        <VimOSPatientProvider>
          <VimOSReferralProvider>
            <VimOSOrdersProvider>
              <VimOSEncounterProvider>{children}</VimOSEncounterProvider>
            </VimOSOrdersProvider>
          </VimOSReferralProvider>
        </VimOSPatientProvider>
      </AppConfigProvider>
      <Toaster />
    </VimOSContext.Provider>
  );
};
