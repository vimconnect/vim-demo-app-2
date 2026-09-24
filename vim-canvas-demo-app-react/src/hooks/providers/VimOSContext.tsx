import { createContext } from "react";
import { VimSDK } from "@vimconnect/app-sdk";

export const VimOSContext = createContext<VimSDK>({} as VimSDK);
