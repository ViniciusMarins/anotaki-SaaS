import type { ReactNode } from "react";

interface TitleTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function TitleText({ children, className, ...props }: TitleTextProps) {
  return (
    <h2
      className={`text-xl font-bold text-gray-900 mb-4 ${className ?? ""}`}
      {...props}
    >
      {children}
    </h2>
  );
}
