import { Star, Info, ExternalLink } from 'lucide-react';
import { Card } from './Card';

export function ProfileView() {
  return (
    <div className="h-full overflow-y-auto pb-20 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile</h1>
          <p className="text-sm text-gray-600">
            Manage your settings and preferences
          </p>
        </div>

        <Card>
          <div className="flex items-start gap-3 mb-4">
            <Star size={20} className="text-gray-700 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Favorites</h2>
              <p className="text-sm text-gray-600">
                Manage your favorite crags from the Explore tab
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3 mb-4">
            <Info size={20} className="text-gray-700 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">About Climbcast</h2>
              <p className="text-sm text-gray-600 mb-4">
                Climbcast helps Norwegian climbers find the best crags based on weather conditions,
                rock friction, and wetness predictions.
              </p>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Data Sources</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Weather data from MET Norway
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Geology data from NGU
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    Map data © OpenStreetMap contributors
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900">Links</h2>
            <a
              href="https://github.com/BrageSte/Climbcast"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">GitHub Repository</span>
              <ExternalLink size={16} className="text-gray-500" />
            </a>
            <a
              href="https://www.yr.no"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">MET Norway / Yr.no</span>
              <ExternalLink size={16} className="text-gray-500" />
            </a>
            <a
              href="https://www.ngu.no"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                NGU - Geological Survey of Norway
              </span>
              <ExternalLink size={16} className="text-gray-500" />
            </a>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-500 py-4">
          <p>Climbcast v1.0.0</p>
          <p className="mt-1">Made with care for the climbing community</p>
        </div>
      </div>
    </div>
  );
}
