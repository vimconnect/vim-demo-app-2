import { CaretSortIcon } from "@radix-ui/react-icons";
import { Patient } from "@vimconnect/app-sdk";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  EntityFieldContent,
  EntityFieldReadonlyText,
  EntityFieldTitle,
  EntitySectionContent,
  EntitySectionTitle,
} from "./ui/entityContent";

/**
 * The provider carried inline on an entity — flat, and the same shape wherever
 * it appears (patient.pcp, referral.targetProvider, encounter.provider).
 * Facility, contact details and degree are not on it; those live on the
 * ProviderRecord entity behind `ehr.api.provider.getById()`.
 */
export type InlineProvider = NonNullable<Patient["pcp"]>;

export const ProviderSection = ({
  provider,
  title,
}: {
  provider?: InlineProvider;
  title: string;
}) => {
  return (
    <Collapsible>
      <div className="flex w-full justify-between items-center">
        <EntitySectionTitle title={title} />
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <CaretSortIcon className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <EntitySectionTitle title="Provider Identifier" />
        <EntitySectionContent>
          <EntityFieldContent>
            <EntityFieldTitle title="NPI" />
            <EntityFieldReadonlyText text={provider?.npi} />
          </EntityFieldContent>
          <EntityFieldContent>
            <EntityFieldTitle title="EHR ID" />
            <EntityFieldReadonlyText text={provider?.ehrProviderId} />
          </EntityFieldContent>
        </EntitySectionContent>
        <EntitySectionTitle title="Provider Demographics" />
        <EntitySectionContent>
          <EntityFieldContent>
            <EntityFieldTitle title="First name" />
            <EntityFieldReadonlyText text={provider?.firstName} />
          </EntityFieldContent>
          <EntityFieldContent>
            <EntityFieldTitle title="Middle name" />
            <EntityFieldReadonlyText text={provider?.middleName} />
          </EntityFieldContent>
          <EntityFieldContent>
            <EntityFieldTitle title="Last name" />
            <EntityFieldReadonlyText text={provider?.lastName} />
          </EntityFieldContent>
          <EntityFieldContent>
            <EntityFieldTitle title="Speciality" />
            <EntityFieldReadonlyText text={provider?.specialty} />
          </EntityFieldContent>
        </EntitySectionContent>
      </CollapsibleContent>
    </Collapsible>
  );
};
