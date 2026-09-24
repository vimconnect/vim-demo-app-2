import { useVimOsContext } from "@/hooks/useVimOsContext";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useAppConfig } from "../hooks/useAppConfig";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface NavBarProps {
  themeColor?: string;
}

export const Navbar: React.FC<NavBarProps> = ({ themeColor }) => {
  const { setJsonMode } = useAppConfig();
  const vimOs = useVimOsContext();

  const handleAppClose = useCallback(() => {
    vimOs.hub.closeApp();
  }, [vimOs.hub]);

  return (
    <div
      className="px-2 pl-4 py-2 bg-accent flex justify-between items-center space-x-2"
      style={{ backgroundColor: themeColor }}
    >
      <div>
        <h2 className="text-sm">Vim Canvas</h2>
        <h2 className="text-sm font-bold">Demo</h2>
      </div>
      <div className={cn("flex items-center h-full", "space-x-1")}>
        <div className="flex items-center space-x-1">
          <Label className="text-xs" htmlFor="json-mode">
            JSON
          </Label>
          <Switch id="json-mode" onCheckedChange={setJsonMode} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-fit hover:bg-green-100/60"
              >
                <Cross2Icon onClick={handleAppClose} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-primary text-primary-foreground">
              <p>Close app</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
