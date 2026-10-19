import { createContext } from "react";
import { VimSDK } from "@vimconnect/app-sdk";

export const VimSdkContext = createContext<VimSDK>({} as VimSDK);
