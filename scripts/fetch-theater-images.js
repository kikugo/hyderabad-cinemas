#!/usr/bin/env node
/**
 * Theater Image Fetcher
 * 
 * This script fetches images for Hyderabad cinema theaters from Google Places API.
 * 
 * Prerequisites:
 * 1. Get a Google Places API key from https://console.cloud.google.com/
 * 2. Enable the Places API and Places Photos API
 * 3. Set your API key as an environment variable or in .env file
 * 
 * Usage:
 *   GOOGLE_PLACES_API_KEY=your_key node scripts/fetch-theater-images.js
 *   
 *   Or create a .env file with:
 *   GOOGLE_PLACES_API_KEY=your_key
 *   Then run: node scripts/fetch-theater-images.js
 * 
 * Options:
 *   --dry-run     Show what would be fetched without downloading
 *   --theater=N   Fetch image for specific theater ID only
 *   --output=DIR  Output directory (default: public/theaters)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file if exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const OUTPUT_DIR = process.argv.includes('--output=') 
  ? process.argv.find(a => a.startsWith('--output=')).split('=')[1]
  : path.join(__dirname, '..', 'public', 'theaters');

const DRY_RUN = process.argv.includes('--dry-run');
const SPECIFIC_THEATER = process.argv.find(a => a.startsWith('--theater='))?.split('=')[1];

// Theater data from the main app
const theaters = [
  {id:1,name:"AMB Cinemas",location:"Gachibowli"},
  {id:2,name:"Prasads Multiplex",location:"Khairatabad"},
  {id:3,name:"Asian Lakshmikala Cinepride",location:"Moosapet"},
  {id:4,name:"ART CINEMAS",location:"Vanasthalipuram"},
  {id:5,name:"PVR: Nexus Mall",location:"Kukatpally"},
  {id:6,name:"AAA Cinemas",location:"Ameerpet"},
  {id:7,name:"Aparna Cinemas",location:"Nallagandla"},
  {id:8,name:"Cinepolis: TNR North City",location:"Suchitra"},
  {id:9,name:"Sree Ramulu 70mm",location:"Moosapet"},
  {id:10,name:"Bhramaramba 70MM",location:"Kukatpally"},
  {id:11,name:"INOX: GSM Mall",location:"Miyapur"},
  {id:12,name:"Cinepolis: Lulu Mall",location:"Kukatpally"},
  {id:13,name:"MovieMax: AMR",location:"ECIL"},
  {id:14,name:"GPR Multiplex",location:"Nizampet"},
  {id:15,name:"Sandhya 70MM",location:"RTC X Roads"},
  {id:16,name:"Mallikarjuna 70mm",location:"Kukatpally"},
  {id:17,name:"Miraj Cinemas: CineTown",location:"Miyapur"},
  {id:18,name:"Cinepolis: DSL Virtue Mall",location:"Uppal"},
  {id:19,name:"PVR: Inorbit",location:"Cyberabad"},
  {id:20,name:"Gokul 70MM",location:"Erragadda"},
  {id:21,name:"Cinepolis: Mantra Mall",location:"Attapur"},
  {id:22,name:"PVR: Next Galleria",location:"Panjagutta"},
  {id:23,name:"INOX: Sattva Necklace Mall",location:"Kavadiguda"},
  {id:24,name:"Asian M Cube Mall",location:"Attapur"},
  {id:25,name:"PVR: Atrium",location:"Gachibowli"},
  {id:26,name:"Asian Cinemart",location:"RC Puram"},
  {id:27,name:"Arjun 70MM",location:"Kukatpally"},
  {id:28,name:"INOX: Ashoka One Mall",location:"Kukatpally"},
  {id:29,name:"PVR: Preston",location:"Gachibowli"},
  {id:30,name:"BR Hitech 70mm",location:"Madhapur"},
  {id:31,name:"PVR: Irrum Manzil",location:"Khairatabad"},
  {id:32,name:"PVR ICON: Hitech",location:"Madhapur"},
  {id:33,name:"Asian CineSquare",location:"Uppal"},
  {id:34,name:"INOX GVK One",location:"Banjara Hills"},
  {id:35,name:"Sri Sai Ram 70mm",location:"Malkajgiri"},
  {id:36,name:"Asian Shiva Ganga",location:"Dilsukhnagar"},
  {id:37,name:"Asian Cineplanet",location:"Kompally"},
  {id:38,name:"Sandhya 35mm",location:"RTC X Roads"},
  {id:39,name:"Cine Town Indra Nagendra",location:"Karmanghat"},
  {id:40,name:"INOX: Prism Mall",location:"Gachibowli"},
  {id:41,name:"Sai Ranga 70MM",location:"Miyapur"},
  {id:42,name:"Sudarshan 35MM",location:"RTC X Roads"},
  {id:43,name:"Asian Mukta A2 Sensation",location:"Khairatabad"},
  {id:44,name:"PVR: Musarambagh",location:"Malakpet"},
  {id:45,name:"BVK Multiplex",location:"LB Nagar"},
  {id:46,name:"Asian Sha & Shahensha",location:"Chintal"},
  {id:47,name:"JP Cinemas",location:"Chandanagar"},
  {id:48,name:"Indra Venkataramana",location:"Kachiguda"},
  {id:49,name:"PVR: Central Mall",location:"Panjagutta"},
  {id:50,name:"Asian Jyothi",location:"RC Puram"},
  {id:51,name:"Miraj Cinemas: A2A",location:"Balanagar"},
  {id:52,name:"Miraj Cinemas: Anand",location:"Narsingi"},
  {id:53,name:"Asian Radhika",location:"ECIL"},
  {id:54,name:"Platinum Movietime",location:"Gachibowli"},
  {id:55,name:"PVR: RK Cineplex",location:"Banjara Hills"},
  {id:56,name:"INOX: Maheshwari",location:"Kachiguda"},
  {id:57,name:"Devi 70MM",location:"RTC X Roads"},
  {id:58,name:"Asian Rajya Lakshmi",location:"Uppal"},
  {id:59,name:"UK Cineplex",location:"Nacharam"},
  {id:60,name:"Tivoli Cinemas",location:"Secunderabad"},
  {id:61,name:"Cinepolis: CCPL Mall",location:"Malkajgiri"},
  {id:62,name:"Miraj: Shalini Shivani",location:"Kothapet"},
  {id:63,name:"Asian Tarakarama",location:"Kachiguda"},
  {id:64,name:"INOX: SMR Vinay",location:"Miyapur"},
  {id:65,name:"Asian Super Cinema",location:"Balapur"},
  {id:66,name:"Vijetha 70MM",location:"Borabanda"},
  {id:67,name:"Alankar (Pratap)",location:"Langer House"},
  {id:68,name:"Miraj Cinemas: Geeta",location:"Chandanagar"},
  {id:69,name:"Cinepolis: Sudha",location:"Bahadurpura"},
  {id:70,name:"Movietime: SKY Mall",location:"Erragadda"},
  {id:71,name:"Miraj: Raghavendra",location:"Malkajgiri"},
  {id:72,name:"VLS Sridevi",location:"Chilakalguda"},
  {id:73,name:"Bhujanga 70MM",location:"Jeedimetla"},
  {id:74,name:"Vyjayanthi Cinema",location:"Nacharam"},
  {id:75,name:"Talluri Theatres",location:"Kushaiguda"},
  {id:76,name:"Ramakrishna Glitterati",location:"Abids"},
  {id:77,name:"Prashant Cinema",location:"Secunderabad"},
  {id:78,name:"Asian Mukund",location:"Medchal"},
  {id:79,name:"Rama Krishna 70mm",location:"Abids"},
  {id:80,name:"Sushma 70MM",location:"Vanasthalipuram"},
  {id:81,name:"Sri Krishna 70MM",location:"Uppal"},
  {id:82,name:"Connplex Cinemas",location:"Banjara Hills"},
  {id:83,name:"Laxmi 70MM",location:"Shamshabad"},
  {id:84,name:"Lakshmi Kala Mandir",location:"Alwal"},
  {id:85,name:"Sree Ramana Gold",location:"Amberpet"},
  {id:86,name:"Sree Ramana 70MM",location:"Amberpet"},
  {id:87,name:"Anjali Movie Max",location:"Secunderabad"},
  {id:88,name:"Sri Prema 70MM",location:"Tukkuguda"},
  {id:89,name:"Aradhana Theatre",location:"Tarnaka"},
  {id:90,name:"Metro Cinema",location:"Bahadurpura"},
  {id:91,name:"Saptagiri 70MM",location:"RTC X Roads"},
  {id:92,name:"Santosh Theatre",location:"Ibrahimpatnam"},
  {id:93,name:"Venkata Sai AC",location:"Keesara"},
  {id:94,name:"ROONGTA CINEMAS: NOVUM",location:"Nampally"},
  {id:95,name:"Allu Cinemas",location:"Kokapet"},
  {id:96,name:"PVR INOX: Odeon Mall",location:"RTC X Roads"},
  {id:97,name:"PVR INOX: Lakeshore Mall",location:"Kukatpally"},
  {id:98,name:"Multiplex: Aparna Mall",location:"Shamshabad"}
];

// Helper to make HTTP requests
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Download image to file
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

// Search for a place and get photo reference
async function searchPlace(query) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodedQuery}&key=${API_KEY}`;
  
  const response = await httpRequest(url);
  const data = JSON.parse(response.data);
  
  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error(`No results found for: ${query}`);
  }
  
  const place = data.results[0];
  if (!place.photos || place.photos.length === 0) {
    throw new Error(`No photos available for: ${query}`);
  }
  
  return {
    name: place.name,
    placeId: place.place_id,
    photoReference: place.photos[0].photo_reference,
    rating: place.rating,
    totalRatings: place.user_ratings_total
  };
}

// Get photo URL from photo reference
function getPhotoUrl(photoReference, maxWidth = 800) {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

// Process a single theater
async function processTheater(theater) {
  const query = `${theater.name} cinema theater ${theater.location} Hyderabad`;
  console.log(`\n🔍 Searching: ${theater.name} (${theater.location})`);
  
  try {
    const placeInfo = await searchPlace(query);
    console.log(`   ✓ Found: ${placeInfo.name}`);
    if (placeInfo.rating) {
      console.log(`   ⭐ Rating: ${placeInfo.rating} (${placeInfo.totalRatings} reviews)`);
    }
    
    if (DRY_RUN) {
      console.log(`   📷 Would download photo for theater ID: ${theater.id}`);
      return { success: true, theater, placeInfo };
    }
    
    // Create output directory if needed
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Download the photo
    const photoUrl = getPhotoUrl(placeInfo.photoReference);
    const filename = `theater-${theater.id}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await downloadImage(photoUrl, filepath);
    console.log(`   💾 Saved: ${filename}`);
    
    return { success: true, theater, placeInfo, filepath };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, theater, error: error.message };
  }
}

// Generate TypeScript mapping file
function generateMappingFile(results) {
  const successful = results.filter(r => r.success);
  
  const mapping = successful.reduce((acc, r) => {
    acc[r.theater.id] = `/theaters/theater-${r.theater.id}.jpg`;
    return acc;
  }, {});
  
  const content = `// Auto-generated theater image mappings
// Generated: ${new Date().toISOString()}
// Total theaters with images: ${successful.length}

export const theaterImages: Record<number, string> = ${JSON.stringify(mapping, null, 2)};

export const getTheaterImage = (id: number): string => {
  return theaterImages[id] || '/theaters/default.jpg';
};
`;
  
  const mappingPath = path.join(__dirname, '..', 'src', 'theater-images.ts');
  fs.writeFileSync(mappingPath, content);
  console.log(`\n📄 Generated mapping file: src/theater-images.ts`);
}

// Main execution
async function main() {
  console.log('🎬 Theater Image Fetcher');
  console.log('========================\n');
  
  if (!API_KEY) {
    console.error('❌ Error: GOOGLE_PLACES_API_KEY environment variable is required.');
    console.log('\nTo get an API key:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a project and enable Places API');
    console.log('3. Create an API key');
    console.log('4. Run: GOOGLE_PLACES_API_KEY=your_key node scripts/fetch-theater-images.js');
    console.log('\nOr create a .env file with:');
    console.log('GOOGLE_PLACES_API_KEY=your_key');
    process.exit(1);
  }
  
  if (DRY_RUN) {
    console.log('🔸 DRY RUN MODE - No files will be downloaded\n');
  }
  
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`🎯 Theaters to process: ${SPECIFIC_THEATER ? 1 : theaters.length}\n`);
  
  const theatersToProcess = SPECIFIC_THEATER 
    ? theaters.filter(t => t.id === parseInt(SPECIFIC_THEATER))
    : theaters;
  
  if (theatersToProcess.length === 0) {
    console.error(`❌ Theater with ID ${SPECIFIC_THEATER} not found`);
    process.exit(1);
  }
  
  const results = [];
  
  for (const theater of theatersToProcess) {
    const result = await processTheater(theater);
    results.push(result);
    
    // Rate limiting - wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Summary
  console.log('\n\n📊 Summary');
  console.log('==========');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed theaters:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.theater.name}: ${r.error}`);
    });
  }
  
  // Generate mapping file if not dry run
  if (!DRY_RUN && successful > 0) {
    generateMappingFile(results);
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);

