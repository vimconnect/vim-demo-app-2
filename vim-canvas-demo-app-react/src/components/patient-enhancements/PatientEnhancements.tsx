import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { useVimOSPatient } from "@/hooks/usePatient";
import { ProblemList } from "./ProblemList";
import { MedicationList } from "./MedicationList";
import { AllergyList } from "./AllergyList";
import { InsuranceList } from "./InsuranceList";
import { Allergy, Diagnosis, Insurance, Medication } from "@vimconnect/app-sdk";
import { useVimOsContext } from "@/hooks/useVimOsContext";
import { capitalize } from "@/lib/utils";
import { Loading } from "../ui/loading";

type EnhancementName =
  | "problem list"
  | "medication list"
  | "allergy list"
  | "insurances";

type EnhancementFunction =
  | "getProblems"
  | "getMedications"
  | "getAllergies"
  | "getInsurances";

/**
 * `ehr.api` is typed `Record<string, any>`, so the `{ success, data }` envelope
 * is declared but never enforced at runtime — an operation may resolve to the
 * bare array instead. Read through both rather than trusting the type.
 */
const asList = <T,>(result: unknown): T[] => {
  if (Array.isArray(result)) return result as T[];
  const data = (result as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
};

type Enhancement = {
  name: EnhancementName;
  function: EnhancementFunction;
};

const enhancements: Enhancement[] = [
  {
    name: "problem list",
    function: "getProblems",
  },
  {
    name: "medication list",
    function: "getMedications",
  },
  {
    name: "allergy list",
    function: "getAllergies",
  },
  {
    name: "insurances",
    function: "getInsurances",
  },
];

export const PatientEnhancements = () => {
  const { patient } = useVimOSPatient();
  const vimOS = useVimOsContext();
  const [enhancementResult, setEnhancementResult] = useState<
    Partial<{
      "problem list": Diagnosis[];
      "medication list": Medication[];
      "allergy list": Allergy[];
      insurances: Insurance[];
    }>
  >({});
  const [loadingStates, setLoadingStates] = useState<
    Partial<Record<EnhancementName, boolean>>
  >({});
  const [errorStates, setErrorStates] = useState<
    Partial<Record<EnhancementName, string>>
  >({});

  const onEnhancementClick = useCallback(
    async (enhancement: Enhancement) => {
      if (!patient) return;

      // Clear any previous error and set loading state
      setErrorStates((prev) => ({
        ...prev,
        [enhancement.name]: undefined,
      }));
      setLoadingStates((prev) => ({
        ...prev,
        [enhancement.name]: true,
      }));

      try {
        if (enhancement.function === "getProblems") {
          const result = await vimOS.ehr.api.patient.getProblems();
          setEnhancementResult((prev) => ({
            ...prev,
            "problem list": asList<Diagnosis>(result),
          }));
        } else if (enhancement.function === "getMedications") {
          const result = await vimOS.ehr.api.patient.getMedications();
          setEnhancementResult((prev) => ({
            ...prev,
            "medication list": asList<Medication>(result),
          }));
        } else if (enhancement.function === "getAllergies") {
          const result = await vimOS.ehr.api.patient.getAllergies();
          setEnhancementResult((prev) => ({
            ...prev,
            "allergy list": asList<Allergy>(result),
          }));
        } else if (enhancement.function === "getInsurances") {
          const result = await vimOS.ehr.api.patient.getInsurances();
          setEnhancementResult((prev) => ({
            ...prev,
            insurances: asList<Insurance>(result),
          }));
        } else {
          throw new Error(
            `Unknown enhancement function: ${enhancement.function}`
          );
        }
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } }).data?.message ===
          "NOT_SUPPORTED_IN_EHR_SYSTEM" //not supported
            ? `${capitalize(
                enhancement.name
              )} is not supported in this EHR system yet.`
            : `Failed to fetch ${enhancement.name}. Please try again.`;
        setErrorStates((prev) => ({
          ...prev,
          [enhancement.name]: errorMessage,
        }));
      } finally {
        // Clear loading state
        setLoadingStates((prev) => ({
          ...prev,
          [enhancement.name]: false,
        }));
      }
    },
    [patient, vimOS]
  );

  return (
    <div>
      {enhancements.map((enhancement) => (
        <div key={enhancement.name} className="mb-2">
          <Button
            onClick={() => onEnhancementClick(enhancement)}
            variant="outline"
            disabled={loadingStates[enhancement.name]}
            className="w-full justify-center bg-white border-2 border-black text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            {loadingStates[enhancement.name] ? (
              <Loading />
            ) : (
              `Get patient ${enhancement.name}`
            )}
          </Button>
          {(enhancementResult[enhancement.name] ||
            errorStates[enhancement.name]) && (
            <div className="mt-2">
              {errorStates[enhancement.name] ? (
                <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <p className="text-red-700 text-sm font-medium">
                      {errorStates[enhancement.name]}
                    </p>
                  </div>
                </div>
              ) : enhancementResult[enhancement.name]?.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No {enhancement.name} returned for this patient.
                </p>
              ) : (
                <>
                  {enhancement.name === "problem list" &&
                    enhancementResult["problem list"] && (
                      <ProblemList
                        problems={enhancementResult["problem list"]}
                      />
                    )}
                  {enhancement.name === "medication list" &&
                    enhancementResult["medication list"] && (
                      <MedicationList
                        medications={enhancementResult["medication list"]}
                      />
                    )}
                  {enhancement.name === "allergy list" &&
                    enhancementResult["allergy list"] && (
                      <AllergyList
                        allergies={enhancementResult["allergy list"]}
                      />
                    )}
                  {enhancement.name === "insurances" &&
                    enhancementResult.insurances && (
                      <InsuranceList insurances={enhancementResult.insurances} />
                    )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
