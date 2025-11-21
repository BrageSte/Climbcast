export type CragTabType = 'live' | 'forecast' | 'analysis';

interface TabNavigationProps {
  activeTab: CragTabType;
  onTabChange: (tab: CragTabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: CragTabType; label: string }[] = [
    { id: 'live', label: 'Live' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'analysis', label: 'Analysis' },
  ];

  return (
    <nav className="sticky top-[73px] bg-white z-10 border-b border-gray-100">
      <div className="flex items-center px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
