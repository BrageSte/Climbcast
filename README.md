# Klatrevaer

A beautiful Norwegian climbing weather application that helps climbers find the best crags based on current and forecasted weather conditions.

## Features

- **Interactive Crag Map** - Browse climbing locations across Norway on an interactive map
- **Real-time Weather** - Current weather conditions and friction scores for each crag
- **7-Day Forecast** - Detailed hourly forecasts with climbing-specific metrics
- **Best Now** - Smart recommendations for the best crags to climb right now based on weather, wetness, and friction
- **Favorites** - Save and track your favorite climbing spots
- **Crag Database** - Comprehensive database with rock type, aspect, and geological information
- **User Contributions** - Add new crags and suggest changes to existing ones

## Tech Stack

- **Frontend**: React 18 with TypeScript 5
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS with custom design system
- **Maps**: Leaflet with React Leaflet
- **State Management**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **APIs**:
  - Met Norway (weather data)
  - NGU (Norwegian geological survey)
  - OpenStreetMap Overpass (crag data)
  - Sunrise-Sunset API

## Prerequisites

- Node.js 18 or higher
- npm or pnpm
- A Supabase account (free tier works)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd klatrevaer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

   See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed database setup instructions.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run import-osm` - Import climbing crags from OpenStreetMap
- `npm run calculate-aspects` - Calculate wall aspects for crags

## Project Structure

```
src/
├── api/              # External API integrations
│   ├── aspectCalculator.ts
│   ├── metNorway.ts
│   ├── ngu.ts
│   ├── osmOverpass.ts
│   └── sunriseSunset.ts
├── components/       # React components
├── hooks/           # Custom React hooks
├── services/        # Business logic services
├── utils/           # Utility functions
│   ├── aspectAutoCalculator.ts
│   ├── dayAggregator.ts
│   ├── frictionCalculator.ts
│   ├── regionalInference.ts
│   ├── rockTypeNormalizer.ts
│   └── wetnessCalculator.ts
├── lib/             # Third-party library setup
└── types.ts         # TypeScript type definitions

supabase/
├── migrations/      # Database migrations
└── functions/       # Supabase Edge Functions
    ├── aspect-calculator/
    └── weather-proxy/
```

## Database Setup

The application uses Supabase for data persistence. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete setup instructions including:

- Creating a Supabase project
- Running migrations
- Setting up Row Level Security policies
- Deploying Edge Functions
- Importing initial data

## Data Sources & Attribution

This application uses data from several sources. See [ATTRIBUTION.md](./ATTRIBUTION.md) for complete attribution information.

- **Weather Data**: Met Norway (MET Norway Weather API)
- **Geological Data**: Norges geologiske undersøkelse (NGU)
- **Crag Data**: OpenStreetMap contributors
- **Astronomical Data**: Sunrise-Sunset API

## Met Norway API Compliance

This application complies with Met Norway's terms of service by:
- Using a custom user agent (`VITE_APP_USER_AGENT`)
- Respecting rate limits
- Properly attributing weather data

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style and conventions
- TypeScript types are properly defined
- ESLint passes without errors
- Changes are tested locally

## License

See [LICENSE](./LICENSE) for details.

## Troubleshooting

### Environment Variables Not Loading
Make sure your `.env` file is in the project root and variables start with `VITE_`.

### Supabase Connection Issues
Verify your Supabase URL and anon key are correct. Check that RLS policies are properly configured.

### Weather Data Not Loading
Ensure your user agent is properly configured in `.env`. Met Norway requires a valid user agent string.

### Build Errors
Run `npm run typecheck` to identify TypeScript errors before building.

## Development Notes

- The app follows Apple design guidelines for UI/UX
- Weather data is cached to minimize API calls
- Friction scores are calculated based on temperature, humidity, and rock type
- Wetness indicators track precipitation history over 7 days
- Aspect calculations determine optimal climbing times based on sun position
