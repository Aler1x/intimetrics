# Intimetrics

A private, personal intimacy tracking app built with React Native and Expo. Track your intimate activities, manage partners, and unlock achievements while maintaining complete privacy with local data storage.

## Features

### 📊 Activity Tracking
- Log different types of intimate activities (sex, cuddle, oral, anal, vaginal, masturbation, other)
- Add descriptions and timestamps to your entries
- Associate activities with partners or keep them private
- View your activity history in a clean, organized list

### 👥 Partner Management
- Add and manage your partners with relationship types (Friend, Partner, Casual, Other)
- Track activity counts per partner
- View partner statistics and achievements
- Delete partners with confirmation

### 📈 Analytics & Insights
- Interactive bar charts showing activity patterns
- Heatmap visualization of your activity frequency
- Filter charts by activity type and time period (week, month, year)
- Visual progress tracking for achievements

### 🏆 Achievement System
- Unlock achievements based on your activity patterns
- Secret achievements for discovery
- Progress tracking for incomplete achievements
- Categories: milestones, streaks, variety, and special events

### 🔒 Privacy & Security
- All data stored locally on your device using SQLite
- No cloud storage or external data transmission
- Encrypted database for sensitive information
- Complete control over your personal data

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Database**: SQLite with Drizzle ORM
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom component library with Lucide icons
- **Charts**: React Native Chart Kit
- **Navigation**: Expo Router

## Getting Started

### Prerequisites

- Node.js (v23 or higher)
- pnpm package manager
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd intimetrics
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up the database**
   ```bash
   pnpm drizzle-kit generate
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

### Available Scripts

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

## Privacy & Data

- **Local Storage**: All data is stored locally on your device
- **No Cloud Sync**: No data is transmitted to external servers
- **Encrypted Database**: SQLite database with encryption for sensitive data
- **User Control**: Complete control over your personal information

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions about the app, please open an issue in the repository.

---

**Note**: This app is designed for personal use and privacy. All data remains on your device and is not shared with any external services. 