import { useForm, useFormContext } from "react-hook-form";
import { Referral } from "@vimconnect/app-sdk";

export interface ReferralFormInputs {
  specialty?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  priority?: string | null;
  authCode?: string | null;
  reasons?: string | null;
  notes?: string | null;
  numberOfVisits?: number | null;
  conditions?: { id: string; label: string }[] | null;
  targetProvider?: Referral["targetProvider"] | null;
}

export const useReferralForm = useForm<ReferralFormInputs>;
export const useReferralFormContext = useFormContext<ReferralFormInputs>;
