import { useCallback, useEffect, useMemo, useState } from "react";
import { Referral } from "@vimconnect/app-sdk";
import { useVimSdkContext } from "./useVimSdkContext";
import { FieldMask, assertWritten, maskToFields } from "./writeback";

/**
 * `getCapability` on the app surface answers for the whole entity, not per
 * field, so `canUpdateParams` is entity-level here. The mask is still used —
 * it scopes the permission request to the fields actually being written.
 */
export const useUpdateReferral = (paramsToCheck?: FieldMask) => {
  const vimSdk = useVimSdkContext();
  const fields = useMemo(() => maskToFields(paramsToCheck), [paramsToCheck]);

  const [canUpdateParams, setCanUpdateParams] = useState<boolean>(false);

  useEffect(() => {
    const refresh = () =>
      setCanUpdateParams(
        Boolean(paramsToCheck) &&
          vimSdk.ehr.context.referral.getCapability("update").available
      );

    refresh();
    return vimSdk.ehr.context.getUpdatableEntities(refresh);
  }, [vimSdk, paramsToCheck]);

  const updateReferral = useCallback(
    async (data: Partial<Referral>) => {
      const capability = vimSdk.ehr.context.referral.getCapability("update");
      if (!capability.available) {
        throw new Error(
          capability.reason ?? "Referral writeback is not available"
        );
      }

      if (!vimSdk.ehr.context.referral.hasPermission("update")) {
        const decision = await vimSdk.ehr.context.referral.requestPermission(
          "update",
          fields.length ? { fields } : undefined
        );
        if (decision !== "granted") {
          throw new Error("Permission to update the referral was denied");
        }
      }

      return assertWritten(data, await vimSdk.ehr.context.referral.update(data));
    },
    [vimSdk, fields]
  );

  return useMemo(
    () => ({
      canUpdateParams,
      updateReferral,
    }),
    [canUpdateParams, updateReferral]
  );
};
