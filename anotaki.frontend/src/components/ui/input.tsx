import * as React from "react";

import { cn } from "@/lib/utils";

type InputExtraProps = {
  Icon?: React.ElementType;
  iconOnClick?: () => void;
  iconPosition?: "left" | "right";
  iconClassname?: string;
};

function Input({
  className,
  type,
  Icon,
  iconPosition = "right",
  iconOnClick,
  iconClassname,
  ...props
}: React.ComponentProps<"input"> & InputExtraProps) {
  const IconStyled = () => {
    if (!Icon) {
      return null;
    }

    return (
      <Icon
        onClick={iconOnClick}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 size-5 cursor-pointer hover:scale-110 transition duration-200",
          iconPosition == "right"
            ? "right-2"
            : iconPosition == "left" && "left-2",
          iconClassname
        )}
      />
    );
  };

  return (
    <div className="relative">
      {Icon && iconPosition === "left" && IconStyled()}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:text-gray-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-sm",
          "focus-visible:border-primary-200 focus-visible:ring-primary-200/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          `${
            Icon && iconPosition === "left"
              ? "pl-10"
              : Icon && iconPosition === "right"
              ? "pr-10"
              : ""
          }`,
          className
        )}
        {...props}
      />
      {Icon && iconPosition === "right" && IconStyled()}
    </div>
  );
}

export { Input };
