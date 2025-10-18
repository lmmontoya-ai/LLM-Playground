import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const OPEN_DELAY = 120;
const CLOSE_DELAY = 80;

export function Tooltip({ children, content, side = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

  const clearExistingTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const showTooltip = () => {
    clearExistingTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, OPEN_DELAY);
  };

  const hideTooltip = () => {
    clearExistingTimeout();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, CLOSE_DELAY);
  };

  React.useEffect(() => {
    return () => clearExistingTimeout();
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
  };

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <div
        className={cn(
          "pointer-events-none absolute z-[100] min-w-max rounded-xl border border-white/10 bg-background/92 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg shadow-black/20 ring-1 ring-black/25 backdrop-blur-md transition-all duration-150 ease-out",
          isVisible
            ? "opacity-100"
            : "pointer-events-none translate-y-1 opacity-0",
          positionClasses[side],
        )}
        role="tooltip"
        aria-hidden={!isVisible}
      >
        {content}
      </div>
    </div>
  );
}
