# 🎬 Hyderabad Cinemas

An interactive guide to movie theaters in Hyderabad, India. Explore 98 cinemas from iconic single screens to premium multiplexes.

![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## ✨ Features

- **98 Theaters**: Complete database of Hyderabad's cinema halls
- **Interactive Map**: View theaters on an interactive map with Leaflet
- **Smart Filtering**: Filter by type, location, sound system, and projection
- **Search**: Full-text search across names, locations, and features
- **Favorites**: Save your favorite theaters
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Beautiful dark UI with gradient accents

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── TheaterCard.tsx   # Grid view card
│   ├── TheaterListItem.tsx  # List view item
│   ├── TheaterModal.tsx  # Detail modal
│   ├── MapView.tsx       # Interactive map
│   ├── StatCard.tsx      # Statistics card
│   └── index.ts          # Barrel export
├── data/
│   ├── theaters.ts       # Theater data (98 entries)
│   ├── locations.ts      # Location coordinates
│   └── index.ts          # Barrel export
├── types/
│   ├── theater.ts        # TypeScript interfaces
│   └── index.ts          # Barrel export
├── utils/
│   ├── helpers.ts        # Utility functions
│   └── index.ts          # Barrel export
├── styles/
│   └── index.css         # Global styles + Tailwind
├── App.tsx               # Main application
└── main.tsx              # Entry point
```

## 🖼️ Theater Images

Theater images can be fetched using the included scraper:

```bash
# Scrape images from Google Maps (free, no API key)
npm run scrape-images

# Debug mode (visible browser)
npm run scrape-images:debug
```

Images are saved to `public/theaters/` and automatically used by the app.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet / React-Leaflet** - Maps
- **Lucide React** - Icons
- **Puppeteer** - Image scraping (optional)

## 📊 Theater Categories

| Type | Count | Description |
|------|-------|-------------|
| Multiplex | 45+ | Multi-screen complexes |
| Single Screen | 40+ | Classic 70mm theaters |
| Boutique | 2 | Premium small venues |
| Upcoming | 4 | Opening in 2026 |

## 🗺️ Coverage Areas

The app covers theaters across Hyderabad including:
- IT Corridor (Gachibowli, Madhapur, Kukatpally)
- Old City (RTC X Roads, Abids, Kachiguda)
- Secunderabad (Malkajgiri, ECIL, Kompally)
- Suburbs (Miyapur, Attapur, LB Nagar)

## 📝 Data Source

Theater data includes:
- Name and location
- Screen count and seating capacity
- Sound system (Dolby Atmos, 7.1, etc.)
- Projection (4K Laser, LED, Digital)
- Key features and highlights
- Approximate coordinates

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report inaccuracies in theater data
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - feel free to use this for your own projects.

---

Made with ❤️ for Hyderabad cinema lovers
