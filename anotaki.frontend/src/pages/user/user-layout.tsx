import { BottomNavigation } from "@/components/bottom-navigation";
import type { ReactNode } from "react";

interface UserLayoutProps {
  children: ReactNode;
}

export function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {children}

      <div id="nav-wrapper" className="pb-24">
        <BottomNavigation />
      </div>
    </div>
  );
}
