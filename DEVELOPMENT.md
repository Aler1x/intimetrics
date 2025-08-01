# Development Guide

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom component library with Lucide icons
- **Charts**: React Native Gifted Charts
- **Navigation**: Expo Router
- **State Management**: Zustand

## Prerequisites

- Node.js (v23 or higher)
- pnpm package manager
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intimetrics
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

## Available Scripts

> All build command using eas build.

- `pnpm dev` - Start development server with Expo Go
- `pnpm dev:reset` - Start with cache reset
- `pnpm ios` - Run on iOS simulator
- `pnpm android` - Run on Android emulator
- `pnpm build:dev` - Build development version
- `pnpm build:preview` - Build preview version
- `pnpm build:prod` - Build production version
- `pnpm lint` - Run ESLint and Prettier checks
- `pnpm format` - Format code with ESLint and Prettier

## Project Structure

```
intimetrics/
├── app/                    # Expo Router app directory
│   ├── (tabs)/           # Tab-based navigation
│   │   ├── index.tsx     # Home screen with charts
│   │   ├── list.tsx      # Activity list view
│   │   ├── partners.tsx  # Partner management
│   │   ├── achievements.tsx # Achievement system
│   │   └── settings.tsx  # App settings
│   └── _layout.tsx       # Root layout
├── components/            # Reusable UI components
│   ├── ui/              # Base UI components
│   ├── bar-chart.tsx    # Chart components
│   └── heatmap.tsx      # Heatmap visualization
├── store/               # Zustand state management
│   ├── activity-store.ts
│   ├── partners-store.ts
│   └── achievements-store.ts
├── db/                  # Database schema and migrations
├── lib/                 # Utilities and constants
├── hooks/               # Custom React hooks
└── types/               # TypeScript type definitions
```

## Database Schema

The app uses SQLite with three main tables:

- **activities**: Stores user activity entries with type, date, description, and partner
- **partners**: Manages partner information with relationship types
- **achievements**: Tracks unlocked achievements and unlock timestamps

## Features in Detail

### Activity Logging
- Quick add modal with activity type selection
- Date picker for accurate timestamping
- Optional partner association
- Description field for additional notes

### Analytics Dashboard
- Bar charts showing activity frequency over time
- Heatmap visualization for activity patterns
- Filterable by activity type and time period
- Real-time data updates

### Partner System
- Add partners with relationship categorization
- Track activity counts per partner
- View partner-specific statistics
- Safe deletion with confirmation

### Achievement System
- Multiple achievement categories
- Progress tracking for incomplete achievements
- Secret achievements for discovery
- Automatic unlocking based on activity patterns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Code Style

- Use TypeScript throughout
- Follow ESLint and Prettier configurations
- Use meaningful component and variable names
- Add comments for complex logic only
- Keep components focused and reusable

## Testing

```bash
# Run linting
pnpm lint

# Format code
pnpm format
```

## Building

```bash
# Development build
pnpm build:dev

# Preview build
pnpm build:preview

# Production build
pnpm build:prod
```