import { useContext } from "react";
import { VimSdkOrdersContext } from "./providers";

export const useOrders = () => {
  return useContext(VimSdkOrdersContext);
};
