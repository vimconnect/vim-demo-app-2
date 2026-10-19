import orderDiSvg from "@/assets/order-di.svg";
import orderLabSvg from "@/assets/order-lab.svg";
import orderProcedureSvg from "@/assets/order-procedure.svg";
import orderRxSvg from "@/assets/order-rx.svg";
import orderSvg from "@/assets/order.svg";
import React from "react";
import { Order } from "@vimconnect/app-sdk";
import {
  CollapsibleEntity,
  CollapsibleEntityContent,
} from "../ui/collapsibleEntity";
import { OrderContent } from "./OrderContent";

/** The order type enum lost REFERRAL; it is LAB | DI | PROCEDURE | RX. */
type OrderType = NonNullable<NonNullable<Order["basicInformation"]>["type"]>;

const orderIcons: Record<OrderType, string> = {
  DI: orderDiSvg,
  LAB: orderLabSvg,
  RX: orderRxSvg,
  PROCEDURE: orderProcedureSvg,
};

export const OrdersWrapper: React.FC<{
  orders: Partial<Order>[];
  themeColor?: string;
}> = ({ orders, themeColor }) => {
  return (
    <>
      {orders?.map((order, index) => {
        const orderType = order.basicInformation?.type;
        const orderKey = order.identifiers?.ehrOrderId ?? index;
        return (
          <CollapsibleEntity
            entityTitle={"Order"}
            titleSuffix={orderType ? `- ${orderType?.toUpperCase()}` : "DI"}
            entityIconUrl={(orderType && orderIcons[orderType]) ?? orderSvg}
            themeColor={themeColor}
            badge="State"
            key={orderKey}
          >
            <CollapsibleEntityContent>
              <OrderContent order={order} />
            </CollapsibleEntityContent>
          </CollapsibleEntity>
        );
      })}
    </>
  );
};
