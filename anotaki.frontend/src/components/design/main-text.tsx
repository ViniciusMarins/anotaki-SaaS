import type { ReactNode } from "react";

interface MainTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function MainText({ children, className, ...props }: MainTextProps) {
  return (
    <p {...props} className={`text-primary font-bold ${className ?? ""}`}>
      {children}
    </p>
  );
}
