
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn("animate-spin rounded-full border-t-transparent border-4 border-blue-600", className)} />
  );
};
