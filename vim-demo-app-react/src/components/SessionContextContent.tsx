import { useVimSdkContext } from "@/hooks/useVimSdkContext";
import { CopyIcon } from "@radix-ui/react-icons";
import { Separator } from "./ui/separator";
import { useAppConfig } from "@/hooks/useAppConfig";
import { JSONView } from "./ui/jsonView";
import {
  EntityFieldReadonlyText,
  EntityFieldTitle,
  EntitySectionContent,
  EntitySectionTitle,
} from "./ui/entityContent";
import { Button } from "./ui/button";
import { useIdToken } from "@/hooks/useIdToken";
import { useState } from "react";

export const SessionContextContent = () => {
  const { jsonMode } = useAppConfig();
  const { sessionContext } = useVimSdkContext();
  const { idToken } = useIdToken();

  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const copyToClipboard = () => {
    if (idToken) {
      navigator.clipboard.writeText(idToken).then(() => {
        setCopyMessage("ID Token copied to clipboard");
        setTimeout(() => setCopyMessage(null), 2000);
      });
    } else {
      setCopyMessage("ID Token is not available.");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  return (
    <div className="w-full">
      {jsonMode ? (
        <JSONView value={sessionContext ?? undefined} />
      ) : (
        <>
          <EntitySectionTitle title="Session Context" />
          <EntitySectionContent>
            <EntityFieldTitle title="Session ID" />
            <EntityFieldReadonlyText text={sessionContext?.sessionId} />
          </EntitySectionContent>
          <Separator className="mb-1" />
          <EntitySectionTitle title="Identifiers" />
          <EntitySectionContent>
            <EntityFieldTitle title="Vim user ID" />
            <EntityFieldReadonlyText text={sessionContext?.userId} />
            <EntityFieldTitle title="Device ID" />
            <EntityFieldReadonlyText text={sessionContext?.deviceId} />
          </EntitySectionContent>
          <Separator className="mb-1" />
          <EntitySectionTitle title="EHR Information" />
          <EntitySectionContent>
            <EntityFieldTitle title="EHR type" />
            <EntityFieldReadonlyText text={sessionContext?.ehrType} />
          </EntitySectionContent>
          <Separator className="mb-1" />
          <EntitySectionTitle title="Account" />
          <EntitySectionContent>
            <EntityFieldTitle title="Account name" />
            <EntityFieldReadonlyText text={sessionContext?.account?.name} />
            <EntityFieldTitle title="Account ID" />
            <EntityFieldReadonlyText text={sessionContext?.account?.id} />
          </EntitySectionContent>
          <EntitySectionTitle title="Get ID token" />
          <EntitySectionContent>
            <EntityFieldTitle title="ID Token" />
            <div className="flex align-middle gap-3">
              <EntityFieldReadonlyText
                className="text-ellipsis overflow-hidden whitespace-nowrap min-w-0"
                text={idToken}
              />
              {idToken && (
                <Button
                  size={"sm"}
                  className="inline-flex aspect-square items-center justify-center whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/90 rounded-md h-7 w-7 p-0"
                  variant={"ghost"}
                  onClick={copyToClipboard}
                  title="Copy ID token"
                >
                  <CopyIcon />
                </Button>
              )}
            </div>
            {copyMessage && (
              <div className="mt-1 text-xs text-green-600">{copyMessage}</div>
            )}
          </EntitySectionContent>
        </>
      )}
    </div>
  );
};
