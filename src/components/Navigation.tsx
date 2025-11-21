import { Map as MapIcon, Star, TrendingUp, Plus } from 'lucide-react';

export type TabType = 'map' | 'favorites' | 'best-now';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddCrag: () => void;
}

export function Navigation({ activeTab, onTabChange, onAddCrag }: NavigationProps) {
  const tabs = [
    { id: 'map' as TabType, label: 'Kart', icon: MapIcon },
    { id: 'favorites' as TabType, label: 'Favoritter', icon: Star },
    { id: 'best-now' as TabType, label: 'Best nå', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2001] bg-white/90 backdrop-blur-md border-t border-gray-200/50 safe-area-bottom">
      <div className="flex items-center justify-between h-16 px-2">
        <div className="flex items-center justify-around flex-1">
          {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all min-w-[72px] ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
        </div>
        <button
          onClick={onAddCrag}
          className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          aria-label="Legg til felt"
        >
          <div className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </nav>
  );
}
