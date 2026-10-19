import { useAppConfig } from '@/hooks/useAppConfig';
import { Fragment } from 'react';
import { Order } from '@vimconnect/app-sdk';
import {
  EntityFieldContent,
  EntityFieldReadonlyList,
  EntityFieldReadonlyText,
  EntityFieldTitle,
  EntitySectionContent,
  EntitySectionTitle,
} from '../ui/entityContent';
import { JSONView } from '../ui/jsonView';
import { Separator } from '../ui/separator';
import { formatContentDate } from '@/utils/formatContentDate';

interface OrderContentProps {
  order: Partial<Order>;
}

export const OrderContent: React.FC<OrderContentProps> = ({ order }) => {
  const { jsonMode } = useAppConfig();

  return (
    <div className="w-full">
      {jsonMode ? (
        <JSONView value={order} />
      ) : (
        <>
          <EntitySectionTitle title="Identifier" />
          <EntitySectionContent>
            <EntityFieldContent>
              <EntityFieldTitle title="EHR Order ID" />
              <EntityFieldReadonlyText text={order?.identifiers?.ehrOrderId} />
            </EntityFieldContent>
          </EntitySectionContent>
          <Separator className="mb-1" />
          <EntitySectionTitle title="Basic Information" />
          <EntitySectionContent>
            <EntityFieldContent>
              <EntityFieldTitle title="Created date" />
              <EntityFieldReadonlyText
                text={formatContentDate(order?.basicInformation?.createdDate)}
              />
            </EntityFieldContent>
            <EntityFieldContent>
              <EntityFieldTitle title="Type" />
              <EntityFieldReadonlyText text={order?.basicInformation?.type} />
            </EntityFieldContent>
            <EntityFieldContent>
              <EntityFieldTitle title="EHR Encounter ID" />
              <EntityFieldReadonlyText text={order?.basicInformation?.ehrEncounterId} />
            </EntityFieldContent>
            <EntityFieldContent>
              <EntityFieldTitle title="Reason" />
              <EntityFieldReadonlyText text={order?.basicInformation?.reason} />
            </EntityFieldContent>
            <EntityFieldContent>
              <EntityFieldTitle title="Order name" />
              <EntityFieldReadonlyText
                text={order?.basicInformation?.orderName}
              />
            </EntityFieldContent>
          </EntitySectionContent>
          <Separator className="mb-1" />
          <EntitySectionTitle title="Assessments" />
          <EntitySectionContent>
            <EntityFieldContent>
              <EntityFieldReadonlyList list={order?.assessments?.assessments} />
            </EntityFieldContent>
          </EntitySectionContent>
          <Separator className="mb-1" />
          {order?.basicInformation?.type === 'RX' && (
            <>
              <EntitySectionTitle title="Medications" />
              {!order?.medication ? (
                <EntityFieldReadonlyList list={[]} />
              ) : (
                [order.medication].map((medication) => (
                  <Fragment key={medication.ndcCode}>
                    <EntitySectionTitle title="Medication" />
                    <EntitySectionContent>
                      <EntityFieldContent>
                        <EntityFieldTitle title="Medication Name" />
                        <EntityFieldReadonlyText
                          text={medication.medicationName ?? '--'}
                        />
                      </EntityFieldContent>
                      <EntityFieldContent>
                        <EntityFieldTitle title="NDC code" />
                        <EntityFieldReadonlyText
                          text={medication.ndcCode ?? '--'}
                        />
                      </EntityFieldContent>
                      <EntityFieldContent>
                        <EntityFieldTitle title="Form" />
                        <EntityFieldReadonlyText text={medication.form ?? '--'} />
                      </EntityFieldContent>
                      <EntityFieldContent>
                        <EntityFieldTitle title="Strength" />
                        <EntityFieldReadonlyText text={medication.strength ?? '--'} />
                      </EntityFieldContent>
                      <EntityFieldContent>
                        <EntityFieldTitle title="Quantity value" />
                        <EntityFieldReadonlyText
                          text={medication.quantity?.value?.toString() ?? '--'}
                        />
                      </EntityFieldContent>
                      <EntityFieldContent>
                        <EntityFieldTitle title="Quantity unit" />
                        <EntityFieldReadonlyText text={medication.quantity?.unit ?? '--'} />
                      </EntityFieldContent>
                    </EntitySectionContent>
                  </Fragment>
                ))
              )}
              <Separator className="mb-1" />
            </>
          )}
          {order?.orderingProviderId && (
            <>
              <EntitySectionTitle title="Ordering Provider" />
              <EntitySectionContent>
                <EntityFieldContent>
                  <EntityFieldTitle title="Provider ID" />
                  <EntityFieldReadonlyText text={order.orderingProviderId} />
                </EntityFieldContent>
              </EntitySectionContent>
            </>
          )}
        </>
      )}
    </div>
  );
};
