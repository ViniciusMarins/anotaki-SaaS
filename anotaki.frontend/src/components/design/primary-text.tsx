import type { ReactNode } from "react";

interface PrimaryTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function PrimaryText({
  children,
  className,
  ...props
}: PrimaryTextProps) {
  return (
    <h3
      className={`font-medium text-gray-900 mb-1 ${className ?? ""}`}
      {...props}
    >
      {children}
    </h3>
  );
}
