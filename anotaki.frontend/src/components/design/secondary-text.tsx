import type { ReactNode } from "react";

interface SecondaryTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function SecondaryText({ children, ...props }: SecondaryTextProps) {
  return (
    <p className="text-sm text-gray-600 mb-2" {...props}>
      {children}
    </p>
  );
}
