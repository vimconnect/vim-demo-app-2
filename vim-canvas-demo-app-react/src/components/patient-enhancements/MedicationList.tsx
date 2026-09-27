import { useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  EntityFieldContent,
  EntityFieldTitle,
  EntityFieldReadonlyText,
} from "../ui/entityContent";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Medication } from "@vimconnect/app-sdk";

/**
 * `MedicationSchema` declares every field flat, but the collection delivers
 * medicationName, ndcCode, status and recordedDate inside `basicInformation`
 * while leaving form, frequency and strength at the top level. Read both.
 */
type DeliveredMedication = Medication & {
  basicInformation?: Partial<
    Pick<Medication, "medicationName" | "ndcCode" | "status" | "recordedDate">
  >;
};

const field = <K extends keyof Medication>(
  medication: DeliveredMedication,
  key: K
): Medication[K] | undefined =>
  medication[key] ??
  (medication.basicInformation?.[
    key as keyof DeliveredMedication["basicInformation"]
  ] as Medication[K] | undefined);

interface MedicationListProps {
  medications: Medication[];
}

export const MedicationList = ({ medications }: MedicationListProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-[50px] flex items-center hover:bg-gray-100 bg-white justify-between p-0"
        >
          <div className="flex gap-2 items-center">
            <div className="flex flex-col items-start">
              <h4 className="text-sm font-semibold">Medication list</h4>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CaretDownIcon className="h-4 w-4" />
          </div>
        </Button>
      </CollapsibleTrigger>
      <div className="w-full flex items-center bg-white justify-between">
        <Separator className="mb-1" />
      </div>
      <CollapsibleContent className="animateCollapsibleContent">
        <div className="w-full flex items-center bg-white justify-between rounded-b-lg pt-1">
          <div className="w-full">
            {medications.map((medication, index) => (
              <div key={index} className="mb-4">
                <EntityFieldContent>
                  <EntityFieldTitle title="Medication name" />
                  <EntityFieldReadonlyText
                    text={field(medication, "medicationName") || "--"}
                  />
                </EntityFieldContent>
                <div className="grid grid-cols-2 gap-4">
                  <EntityFieldContent>
                    <EntityFieldTitle title="NDC code" />
                    <EntityFieldReadonlyText
                      text={field(medication, "ndcCode") || "--"}
                    />
                  </EntityFieldContent>
                  <EntityFieldContent>
                    <EntityFieldTitle title="Strength" />
                    <EntityFieldReadonlyText
                      text={field(medication, "strength") || "--"}
                    />
                  </EntityFieldContent>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EntityFieldContent>
                    <EntityFieldTitle title="Form" />
                    <EntityFieldReadonlyText
                      text={field(medication, "form") || "--"}
                    />
                  </EntityFieldContent>
                  <EntityFieldContent>
                    <EntityFieldTitle title="Status" />
                    <EntityFieldReadonlyText
                      text={field(medication, "status") || "--"}
                    />
                  </EntityFieldContent>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EntityFieldContent>
                    <EntityFieldTitle title="Frequency" />
                    <EntityFieldReadonlyText
                      text={field(medication, "frequency") || "--"}
                    />
                  </EntityFieldContent>
                </div>
                <EntityFieldContent>
                  <EntityFieldTitle title="Recorded date" />
                  <EntityFieldReadonlyText
                    text={field(medication, "recordedDate") || "--"}
                  />
                </EntityFieldContent>
                {index < medications.length - 1 && (
                  <Separator className="my-2" />
                )}
              </div>
            ))}
            <Separator className="mt-4" />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
