import { useCallback, useEffect, useMemo, useState } from "react";
import { Encounter } from "@vimconnect/app-sdk";
import { useVimSdkContext } from "./useVimSdkContext";
import { FieldMask, assertWritten, maskToFields } from "./writeback";

/**
 * `getCapability` on the app surface answers for the whole entity, not per
 * field, so `canUpdateParams` is entity-level here. The mask is still used —
 * it scopes the permission request to the fields actually being written.
 */
export const useUpdateEncounter = (paramsToCheck?: FieldMask) => {
  const vimSdk = useVimSdkContext();
  const fields = useMemo(() => maskToFields(paramsToCheck), [paramsToCheck]);

  const [canUpdateParams, setCanUpdateParams] = useState<boolean>(false);

  useEffect(() => {
    const refresh = () =>
      setCanUpdateParams(
        Boolean(paramsToCheck) &&
          vimSdk.ehr.context.encounter.getCapability("update").available
      );

    refresh();
    return vimSdk.ehr.context.getUpdatableEntities(refresh);
  }, [vimSdk, paramsToCheck]);

  const updateEncounter = useCallback(
    async (data: Partial<Encounter>) => {
      const capability = vimSdk.ehr.context.encounter.getCapability("update");
      if (!capability.available) {
        throw new Error(
          capability.reason ?? "Encounter writeback is not available"
        );
      }

      if (!vimSdk.ehr.context.encounter.hasPermission("update")) {
        const decision = await vimSdk.ehr.context.encounter.requestPermission(
          "update",
          fields.length ? { fields } : undefined
        );
        if (decision !== "granted") {
          throw new Error("Permission to update the encounter was denied");
        }
      }

      return assertWritten(data, await vimSdk.ehr.context.encounter.update(data));
    },
    [vimSdk, fields]
  );

  return useMemo(
    () => ({
      canUpdateParams,
      updateEncounter,
    }),
    [canUpdateParams, updateEncounter]
  );
};
