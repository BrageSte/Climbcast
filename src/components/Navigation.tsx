import { Map as MapIcon, Star, TrendingUp, Plus } from 'lucide-react';

export type TabType = 'map' | 'favorites' | 'best-now';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onAddCrag: () => void;
}

export function Navigation({ activeTab, onTabChange, onAddCrag }: NavigationProps) {
  const tabs = [
    { id: 'map' as TabType, label: 'Map', icon: MapIcon },
    { id: 'favorites' as TabType, label: 'Favorites', icon: Star },
    { id: 'best-now' as TabType, label: 'Best Now', icon: TrendingUp },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[2001] bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center h-16 px-2">
        <div className="flex items-center justify-around flex-1">
          {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors min-w-[76px] ${
                isActive
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gray-900" />
              )}
            </button>
          );
        })}
        </div>
        <button
          onClick={onAddCrag}
          className="flex items-center justify-center px-3 py-2 transition-colors"
          aria-label="Add crag"
        >
          <div className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
            <Plus size={20} className="text-white" strokeWidth={2.5} />
          </div>
        </button>
      </div>
    </nav>
  );
}
