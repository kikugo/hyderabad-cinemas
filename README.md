# 🎬 Hyderabad Cinemas

An interactive guide to 98 movie theaters across Hyderabad — from iconic single screens to premium multiplexes.

![Hyderabad Cinemas](https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80)

## ✨ Features

- **98 Theaters**: Complete database of cinemas across Hyderabad
- **Real Photos**: Actual theater images from Google Maps
- **Interactive Map**: View all theaters on Leaflet-powered map
- **Advanced Filters**: Filter by type, location, sound system, and projection
- **Detailed Info**: Screens, seating capacity, unique features, and more
- **Google Maps Integration**: Get directions and view photos

## 🏢 Theater Types

| Type | Count | Examples |
|------|-------|----------|
| Multiplex | 53 | AMB Cinemas, Prasads, PVR, INOX |
| Single Screen | 38 | Sandhya 70MM, Devi 70MM, Sudarshan 35MM |
| Twin Theaters | 2 | Asian Sha & Shahensha |
| Boutique | 2 | Connplex, Roongta Novum |
| Upcoming | 4 | Allu Cinemas, PVR INOX Odeon Mall |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   ├── data/
│   │   └── locations.ts     # Hyderabad area coordinates
│   ├── styles/
│   │   └── index.css        # Global styles & Tailwind
│   ├── types/
│   │   └── theater.ts       # TypeScript definitions
│   └── utils/
│       └── helpers.ts       # Utility functions
├── public/
│   └── theaters/            # Scraped theater images
├── scripts/
│   ├── scrape-theater-images.js  # Puppeteer image scraper
│   ├── fetch-theater-images.js   # Google Places API fetcher
│   └── README.md                 # Scripts documentation
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🖼️ Fetching Theater Images

Theater images are scraped from Google Maps. To fetch/update images:

```bash
# Using Puppeteer (free, no API key required)
npm run scrape-images           # Headless mode
npm run scrape-images:debug     # With visible browser (recommended)

# Using Google Places API (requires API key)
GOOGLE_PLACES_API_KEY=your_key npm run fetch-images
```

See [scripts/README.md](scripts/README.md) for detailed documentation.

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **Lucide React** - Icons

## 🌟 Key Theaters

### Premium Multiplexes
- **AMB Cinemas** (Gachibowli) - Co-owned by Mahesh Babu, India's first HDR trial
- **Prasads** (Khairatabad) - Largest screen in India (PCX 101.6ft)
- **AAA Cinemas** (Ameerpet) - First LED cinema in Telangana

### Legendary Single Screens
- **Sandhya 70MM** (RTC X Roads) - Paper snowstorm fan celebrations
- **Devi 70MM** (RTC X Roads) - First theater to gross ₹1Cr in AP
- **Sudarshan 35MM** (RTC X Roads) - Considered best single screen in HYD

## 📊 Data Source

Theater data sourced from a curated CSV containing:
- Theater name and location
- Number of screens and key screen info
- Sound system (Dolby Atmos, 7.1, etc.)
- Projection type (4K Laser, Digital, etc.)
- Seating capacity
- Unique features and user reviews

## 📄 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ for Hyderabad cinema lovers

