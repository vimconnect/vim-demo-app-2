import { useEffect, useState } from "react";
import { useVimOsContext } from "./useVimOsContext";

export const useIdToken = () => {
  const { sessionContext } = useVimOsContext();

  const [idToken, setIdToken] = useState<string | undefined>();

  useEffect(() => {
    if (sessionContext) {
      (async () => {
        try {
          setIdToken((await sessionContext.getIdToken())?.idToken);
        } catch {
          // SDK error — leave idToken undefined
        }
      })();
    }
  }, [sessionContext, setIdToken]);

  return { idToken };
};
