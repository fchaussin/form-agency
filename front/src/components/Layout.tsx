import React from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-dvh min-h-screen bg-gray-100">
      <Sidebar />
      <main className="p-4 flex-1 flex flex-col">{children}</main>
    </div>
  );
};
