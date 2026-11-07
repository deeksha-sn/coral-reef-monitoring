import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-reef-deep text-reef-white flex relative overflow-x-hidden selection:bg-reef-aqua/30 selection:text-reef-aqua">
      {/* Ambient Underwater Lighting Caustics / Radial Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-reef-aqua/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-10 w-[500px] h-[500px] bg-reef-teal/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/3 w-[450px] h-[350px] bg-reef-orange/5 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Persistent Redesigned Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pl-72 transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
