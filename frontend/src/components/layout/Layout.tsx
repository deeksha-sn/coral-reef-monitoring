import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-reef-deep text-reef-white flex relative overflow-x-hidden selection:bg-reef-coralBay/30 selection:text-reef-coralBay">
      {/* Ambient Underwater Lighting Caustics / Radial Glows */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[450px] bg-reef-coralBay/8 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-10 w-[550px] h-[550px] bg-reef-deepSea/15 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-1/3 w-[450px] h-[350px] bg-reef-sunset/6 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Persistent Redesigned Sidebar */}
      <Sidebar />

      {/* Main Content Area - Maximized Horizontal Usable Width */}
      <div className="flex-1 flex flex-col min-w-0 pl-72 transition-all duration-300">
        <Header />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 max-w-[1800px] w-full mx-auto relative z-10 transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
