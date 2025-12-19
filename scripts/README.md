# Theater Image Scripts

These scripts help you fetch real images of Hyderabad cinema theaters from Google Maps.

## Available Scripts

### 1. `fetch-theater-images.js` (Google Places API)
Uses the official Google Places API to fetch high-quality theater photos.

**Pros:**
- High-quality, official images
- Reliable and fast
- Includes place ratings and metadata

**Cons:**
- Requires Google Cloud API key
- Has usage costs (free tier: ~$200/month credit)

**Usage:**
```bash
# Set API key and run
GOOGLE_PLACES_API_KEY=your_key node scripts/fetch-theater-images.js

# Or create .env file
echo "GOOGLE_PLACES_API_KEY=your_key" > .env
node scripts/fetch-theater-images.js

# Options
node scripts/fetch-theater-images.js --dry-run          # Preview without downloading
node scripts/fetch-theater-images.js --theater=1       # Specific theater only
node scripts/fetch-theater-images.js --output=./images # Custom output directory
```

### 2. `scrape-theater-images.js` (Free - Puppeteer)
Uses Puppeteer to scrape images from Google Maps. No API key needed!

**Pros:**
- Free (no API costs)
- No API key required

**Cons:**
- Slower (opens browser for each theater)
- May break if Google changes their UI
- May get blocked if run too frequently

**Usage:**
```bash
# First install puppeteer
npm install puppeteer

# Run the scraper
node scripts/scrape-theater-images.js

# Options
node scripts/scrape-theater-images.js --headless=false  # Show browser (debugging)
node scripts/scrape-theater-images.js --theater=1       # Specific theater only
node scripts/scrape-theater-images.js --delay=3000      # 3 second delay between theaters
node scripts/scrape-theater-images.js --output=./images # Custom output directory
```

## Output

Both scripts save images to `public/theaters/` with the naming convention:
- `theater-1.jpg` (AMB Cinemas)
- `theater-2.jpg` (Prasads Multiplex)
- etc.

They also generate:
- `src/theater-images.ts` - TypeScript mapping file
- `public/theaters/image-map.json` - JSON mapping file

## Using Downloaded Images

After running the scripts, update `hyderabad-theaters.tsx`:

```tsx
// Import the mapping
import { theaterImages, getTheaterImage } from './theater-images';

// Use in getImage function
const getImage = (id: number, location: string) => {
  // Check if we have a downloaded image
  if (theaterImages[id]) {
    return theaterImages[id];
  }
  // Fall back to Unsplash images
  return cinemaImages[id % cinemaImages.length];
};
```

## Scheduling Automatic Updates

To keep images fresh, you can set up a cron job:

```bash
# Weekly update (Sundays at 2 AM)
0 2 * * 0 cd /path/to/project && node scripts/fetch-theater-images.js >> logs/images.log 2>&1
```

Or use GitHub Actions:

```yaml
# .github/workflows/update-images.yml
name: Update Theater Images
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/fetch-theater-images.js
        env:
          GOOGLE_PLACES_API_KEY: ${{ secrets.GOOGLE_PLACES_API_KEY }}
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'chore: update theater images'
```

## Getting a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable these APIs:
   - Places API
   - Places API (New)
4. Go to Credentials > Create Credentials > API Key
5. (Optional) Restrict the key to Places API only
6. Copy the key and use it with the script

**Cost:** Google provides $200/month free credit. Each photo costs ~$0.007, so you can fetch ~28,500 images/month for free.

