import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-paper paper-grain flex flex-col">
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-24 px-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full h-full">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
