
import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from "@/components/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default Layout;
