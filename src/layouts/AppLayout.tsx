import { Outlet, NavLink } from 'react-router-dom';
import { Home, Map, BarChart3, User } from 'lucide-react';

export function AppLayout() {
  const tabs = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Map },
    { to: '/analyze', label: 'Analyze', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="h-screen flex flex-col">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <nav className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[72px] relative ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
