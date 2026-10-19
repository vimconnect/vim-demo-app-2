import encounterSvg from "@/assets/encounter.svg";

import patientSvg from "@/assets/patient.svg";
import referralSvg from "@/assets/referral.svg";
import userSvg from "@/assets/user.svg";
import { useEffect, useState } from "react";
import { EncounterContent } from "./components/encounter-content";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { OrdersWrapper } from "./components/orders/OrdersWrapper";
import { PatientContent } from "./components/PatientContent";
import { ReferralContent } from "./components/referral-content";
import { SessionContextContent } from "./components/SessionContextContent";
import { Button } from "./components/ui/button";
import {
  CollapsibleEntity,
  CollapsibleEntityContent,
} from "./components/ui/collapsibleEntity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { useEncounter } from "./hooks/useEncounter";
import { useOrders } from "./hooks/useOrders";
import { usePatient } from "./hooks/usePatient";
import { useReferral } from "./hooks/useReferral";
import { useVimSdkContext } from "./hooks/useVimSdkContext";
import { loadSettings } from "./utils/settings-api";
import { useIdToken } from "./hooks/useIdToken";

function App() {
  const vimSdk = useVimSdkContext();
  const { patient } = usePatient();
  const { encounter } = useEncounter();
  const { referral } = useReferral();
  const { orders } = useOrders();
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined);
  const [redirectModalOpen, setRedirectModal] = useState(false);
  const [themeColor, setThemeColor] = useState<string>("#04B39F");
  const { idToken } = useIdToken();

  useEffect(() => {
    vimSdk.hub.setActivationStatus("ENABLED");
    try {
      vimSdk.hub.pushNotification.show({
        text: `Explore the <b>Vim Connect Demo</b> app to view SDK capabilities, grab app code, and unlock opportunities`,
        notificationId: crypto.randomUUID(),
        actionButtons: {
          leftButton: {
            text: "View code",
            buttonStyle: "LINK",
            callback: () => {
              setRedirectUrl("https://github.com/vimconnect/vim-demo-app-2");
              setRedirectModal(true);
            },
            openAppButton: true,
          },
          rightButton: {
            text: "Explore app",
            buttonStyle: "PRIMARY",
            openAppButton: true,
            callback: () => {},
          },
        },
      });
    } catch (e) {
      console.error("failed to show push notification", e);
    }
  }, [vimSdk, setRedirectUrl]);

  const onRedirectModalChange = (open: boolean) => {
    if (!open) {
      setRedirectUrl(undefined);
    }
    setRedirectModal(open);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await loadSettings(idToken!);
      setThemeColor((prev) =>
        settings?.theme_color ? settings.theme_color : prev
      );
    };
    if (idToken) {
      fetchSettings();
    }
  }, [idToken]);

  return (
    <div className="w-full top-0 left-0 pb-6">
      <Navbar themeColor={themeColor} />

      <CollapsibleEntity
        entityTitle="User"
        entityIconUrl={userSvg}
        themeColor={themeColor}
      >
        <CollapsibleEntityContent>
          <SessionContextContent />
        </CollapsibleEntityContent>
      </CollapsibleEntity>

      {patient && (
        <CollapsibleEntity
          entityTitle="Patient"
          entityIconUrl={patientSvg}
          themeColor={themeColor}
        >
          <CollapsibleEntityContent>
            <PatientContent />
          </CollapsibleEntityContent>
        </CollapsibleEntity>
      )}
      {encounter && (
        <CollapsibleEntity
          entityTitle="Encounter"
          entityIconUrl={encounterSvg}
          themeColor={themeColor}
        >
          <CollapsibleEntityContent>
            <EncounterContent />
          </CollapsibleEntityContent>
        </CollapsibleEntity>
      )}
      {referral && (
        <CollapsibleEntity
          entityTitle="Referral"
          entityIconUrl={referralSvg}
          themeColor={themeColor}
        >
          <CollapsibleEntityContent>
            <ReferralContent />
          </CollapsibleEntityContent>
        </CollapsibleEntity>
      )}
      <OrdersWrapper orders={orders} themeColor={themeColor} />
      <Dialog open={redirectModalOpen} onOpenChange={onRedirectModalChange}>
        <DialogContent className="max-w-[calc(100%-100px)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Redirect Confirmation</DialogTitle>
            <DialogDescription>
              You are about to be redirected to an external link. Are you sure
              you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center gap-1">
            <Button
              variant="secondary"
              onClick={() => onRedirectModalChange(false)}
            >
              Cancel
            </Button>
            <a href={redirectUrl} target="_blank">
              <Button>Redirect</Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer themeColor={themeColor} />
    </div>
  );
}

export default App;
