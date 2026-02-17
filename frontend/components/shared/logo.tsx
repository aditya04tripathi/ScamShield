import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "logo" | "text" | "logo-text";
  size?: "sm" | "md" | "lg";
}

export const Logo = ({
  className,
  variant = "logo-text",
  size = "md",
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 text-lg",
    md: "h-8 text-xl",
    lg: "h-12 text-3xl",
  };

  const iconSizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const LogoIcon = () => (
    <div
      className={cn(
        "relative flex items-center justify-center text-primary",
        iconSizes[size],
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <path
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          className="text-primary fill-primary/20"
        />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>
  );

  const LogoText = () => (
    <span className={cn("font-bold tracking-tight", sizeClasses[size])}>
      Scam<span className="text-primary">Shield</span>
    </span>
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {(variant === "logo" || variant === "logo-text") && <LogoIcon />}
      {(variant === "text" || variant === "logo-text") && <LogoText />}
    </div>
  );
};
