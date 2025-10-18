import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function Separator({ className }: Props) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}
