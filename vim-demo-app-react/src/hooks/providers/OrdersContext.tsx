import { createContext, useEffect, useState } from "react";
import { Order } from "@vimconnect/app-sdk";
import { useVimSdkContext } from "../useVimSdkContext";
import { useAppConfig } from "../useAppConfig";

interface OrderContext {
  orders: Partial<Order>[];
}

export const VimSdkOrdersContext = createContext<OrderContext>({
  orders: [],
});

/**
 * Orders have no context key. They arrive one at a time on these events, both
 * of which require the order to already be on screen, so this list is what the
 * provider has looked at this session — not every order on the chart.
 */
const ORDER_EVENTS = ["order_select", "order_sign"] as const;

const orderKey = (order: Partial<Order>, fallback: number) =>
  order.identifiers?.ehrOrderId ?? String(fallback);

export const VimSdkOrdersProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { updateNotification } = useAppConfig();
  const vimSdk = useVimSdkContext();
  const [orders, setOrders] = useState<Partial<Order>[]>([]);

  useEffect(() => {
    return vimSdk.ehr.workflow.on([...ORDER_EVENTS], (event) => {
      const order = event.entities?.order;
      if (!order) return;

      setOrders((previous) => {
        const incomingKey = orderKey(order, previous.length);
        const existing = previous.findIndex(
          (candidate, index) => orderKey(candidate, index) === incomingKey
        );
        if (existing === -1) return [order, ...previous];

        const next = [...previous];
        next[existing] = order;
        return next;
      });
    });
  }, [vimSdk]);

  useEffect(() => {
    updateNotification("orders", orders.length ? 1 : 0);
  }, [orders, updateNotification]);

  return (
    <VimSdkOrdersContext.Provider
      value={{
        orders,
      }}
    >
      {children}
    </VimSdkOrdersContext.Provider>
  );
};
