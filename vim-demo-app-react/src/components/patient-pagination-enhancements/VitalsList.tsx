import { useState, useCallback } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { EntityFieldTitle, EntityFieldReadonlyText } from "../ui/entityContent";
import { Vital } from "@vimconnect/app-sdk";
import { useVimSdkContext } from "@/hooks/useVimSdkContext";
import { usePatient } from "@/hooks/usePatient";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { CollapsibleHeader } from "./CollapsibleHeader";

export const VitalsList = () => {
  const { patient } = usePatient();
  const vimSdk = useVimSdkContext();
  const [vitals, setVitals] = useState<Vital[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  /** `getVitals()` takes no date range and returns everything in one call. */
  const handleActionClick = useCallback(async () => {
    if (!patient) return;

    setError(undefined);
    setIsLoading(true);
    setIsOpen(true);

    try {
      const result = await vimSdk.ehr.api.patient.getVitals();
      setVitals(result.data ?? []);
    } catch (err) {
      setError(
        (err as { data?: { message?: string } }).data?.message ===
          "NOT_SUPPORTED_IN_EHR_SYSTEM"
          ? "Vitals is not supported in this EHR system yet."
          : "Failed to fetch vitals. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [patient, vimSdk]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Separator className="my-4" />
      <CollapsibleHeader
        title="Get patient vitals"
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        disabled={!vitals && !error}
      />
      <Button
        onClick={handleActionClick}
        disabled={isLoading || !patient}
        className="bg-white border-2 border-black text-gray-800 hover:bg-gray-50 px-6 py-2 w-full mt-2"
      >
        {isLoading ? "Loading vitals..." : "Get patient vitals"}
      </Button>
      <CollapsibleContent className="animateCollapsibleContent">
        {(vitals || error) && (
          <div className="mt-2">
            <Separator className="my-4" />
            <h4 className="text-sm font-semibold mb-2">Vitals</h4>
            <Separator className="my-4" />
            {error ? (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            ) : (
              vitals && (
                <div className="w-full">
                  <p className="text-xs text-muted-foreground mb-2">
                    {vitals.length} vital{vitals.length === 1 ? "" : "s"}
                  </p>

                  {vitals.map((vital, index) => {
                    const { basicInformation } = vital;
                    const { name, unit, loinc } = basicInformation ?? {};
                    const { values } = vital;
                    return (
                      <div key={name} className="mb-4">
                        <div className="mb-4">
                          <h5 className="text-sm font-bold mb-2">
                            Basic information
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <EntityFieldTitle title="Name" />
                              <EntityFieldReadonlyText text={name || "--"} />
                            </div>
                            <div>
                              <EntityFieldTitle title="Unit" />
                              <EntityFieldReadonlyText text={unit || "--"} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <EntityFieldTitle title="Loinc" />
                              <EntityFieldReadonlyText text={loinc || "--"} />
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="mb-4">
                          <h5 className="text-sm font-bold mb-2">
                            Measurements
                          </h5>
                          {(values ?? []).map((measurement, measurementIndex) => {
                            const isNotLastMeasurement =
                              measurementIndex < (values ?? []).length - 1;

                            return (
                              <div key={measurement.value} className="mb-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <EntityFieldTitle title="Value" />
                                    <EntityFieldReadonlyText
                                      text={measurement.value || "--"}
                                    />
                                  </div>
                                  <div>
                                    <EntityFieldTitle title="Measurement Date" />
                                    <EntityFieldReadonlyText
                                      text={measurement.measurementDate || "--"}
                                    />
                                  </div>
                                </div>
                                {isNotLastMeasurement && (
                                  <Separator className="my-2" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {index < vitals.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    );
                  })}
                  <Separator className="mt-4" />

                </div>
              )
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
