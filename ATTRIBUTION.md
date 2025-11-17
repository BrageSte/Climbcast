# Attribution and Data Sources

Klatrevaer uses data from several open and public sources. This document provides proper attribution and licensing information for all external data sources.

## Weather Data

### Met Norway (Meteorologisk institutt)

**Source**: [MET Norway Weather API](https://api.met.no/)

**License**: [Norwegian License for Open Government Data (NLOD)](https://data.norge.no/nlod/en/2.0)

**Usage**:
- Current weather conditions
- Hourly weather forecasts (7 days)
- Temperature, humidity, wind speed, precipitation data

**Attribution**: Weather data provided by the Norwegian Meteorological Institute

**Terms of Service Compliance**:
- Custom user agent identifying the application
- Proper caching to minimize API requests
- Clear attribution of weather data source
- Compliance with rate limits

**API Documentation**: https://api.met.no/weatherapi/locationforecast/2.0/documentation

## Geological Data

### NGU (Norges geologiske undersøkelse / Geological Survey of Norway)

**Source**: [NGU Berggrunn API](https://geo.ngu.no/)

**License**: [Norwegian License for Open Government Data (NLOD)](https://data.norge.no/nlod/en/2.0)

**Usage**:
- Rock type information for climbing locations
- Bedrock geological data
- Regional geological classifications

**Attribution**: Geological data provided by the Geological Survey of Norway (NGU)

**API Documentation**: https://www.ngu.no/en/topic/datasets-and-online-maps

## Geographic Data

### OpenStreetMap

**Source**: [OpenStreetMap](https://www.openstreetmap.org/)

**License**: [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)

**Usage**:
- Climbing crag locations
- Crag names and basic metadata
- Geographic coordinates
- Climbing type classifications

**Attribution**: © OpenStreetMap contributors

**Data Access**: OpenStreetMap Overpass API

**Contributors**: This application uses data contributed by thousands of OpenStreetMap volunteers

**License Requirements**:
- Share-alike: Any derivative databases must be shared under the same license
- Attribution: Must credit OpenStreetMap contributors
- Keep open: Cannot apply technical restrictions that prevent others from accessing the data

## Astronomical Data

### Sunrise-Sunset API

**Source**: [sunrise-sunset.org](https://sunrise-sunset.org/api)

**License**: Free to use

**Usage**:
- Sunrise and sunset times
- Day length calculations
- Optimal climbing time calculations based on wall aspect

**Attribution**: Sunrise/sunset data provided by sunrise-sunset.org

## Map Tiles

### OpenStreetMap Tiles

**Source**: OpenStreetMap tile servers

**License**: [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/)

**Usage**:
- Base map visualization
- Interactive map interface

**Attribution**: Map tiles © OpenStreetMap contributors

**Tile Usage Policy**: https://operations.osmfoundation.org/policies/tiles/

## Third-Party Libraries

This application uses various open-source libraries, each with their own licenses:

### Frontend Libraries

- **React** - MIT License
- **TypeScript** - Apache License 2.0
- **Vite** - MIT License
- **TailwindCSS** - MIT License
- **Leaflet** - BSD 2-Clause License
- **React Leaflet** - Hippocratic License 2.1
- **Lucide React** - ISC License
- **TanStack Query** - MIT License
- **date-fns** - MIT License

### Backend & Database

- **Supabase** - Apache License 2.0
- **PostgreSQL** - PostgreSQL License

See `package.json` for a complete list of dependencies.

## User-Generated Content

### Community Contributions

Users can contribute to Klatrevaer by:
- Adding new climbing crags
- Suggesting corrections to existing data
- Submitting friction feedback

**License**: User-contributed data is submitted under the same terms as the application and becomes part of the shared database.

## Data Usage and Privacy

### What Data We Collect

- Crag locations and metadata
- User favorites (requires authentication)
- Anonymous friction feedback
- Suggested changes to crag information

### What Data We Don't Collect

- Personal information (beyond what Supabase authentication requires)
- Location tracking
- Usage analytics
- Third-party cookies

### Data Sharing

All crag data, feedback, and contributions are public and shared openly under the same licenses as our source data.

## Compliance and Accuracy

### Weather Data Accuracy

Weather forecasts are provided by Met Norway and are subject to the accuracy and limitations of meteorological modeling. Always check current conditions before climbing.

### Geological Data

Rock type information is sourced from geological surveys and may not reflect recent changes or specific climbing wall characteristics.

### Crag Information

Crag data comes from OpenStreetMap and user contributions. While we strive for accuracy, always verify information with local guidebooks and climbing communities.

## Contact

For data attribution questions, corrections, or removal requests, please open an issue on GitHub.

## Acknowledgments

Special thanks to:
- The Norwegian Meteorological Institute for providing excellent weather data
- The Geological Survey of Norway for geological information
- OpenStreetMap contributors for geographic data
- The open-source community for the tools that made this project possible
- The Norwegian climbing community for inspiration and feedback

## Updates

This attribution document was last updated: 2024-11-17

If you notice any missing attributions or licensing issues, please report them immediately.
