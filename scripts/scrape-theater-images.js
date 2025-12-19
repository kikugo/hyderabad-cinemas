#!/usr/bin/env node
/**
 * Theater Image Scraper (Free - No API Key Required)
 * 
 * This script uses Puppeteer to fetch theater images from Google Maps.
 * It's a free alternative to the Google Places API.
 * 
 * Prerequisites:
 *   npm install puppeteer
 * 
 * Usage:
 *   node scripts/scrape-theater-images.js
 *   
 * Options:
 *   --headless=false  Show browser (useful for debugging)
 *   --theater=N       Fetch image for specific theater ID only
 *   --output=DIR      Output directory (default: public/theaters)
 *   --delay=MS        Delay between theaters (default: 2000)
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name, defaultValue) => {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : defaultValue;
};

const HEADLESS = getArg('headless', 'true') === 'true';
const OUTPUT_DIR = getArg('output', path.join(__dirname, '..', 'public', 'theaters'));
const SPECIFIC_THEATER = getArg('theater', null);
const DELAY = parseInt(getArg('delay', '2000'));

// Theater data
const theaters = [
  {id:1,name:"AMB Cinemas",location:"Gachibowli"},
  {id:2,name:"Prasads Multiplex",location:"Khairatabad"},
  {id:3,name:"Asian Lakshmikala Cinepride",location:"Moosapet"},
  {id:4,name:"ART CINEMAS",location:"Vanasthalipuram"},
  {id:5,name:"PVR Nexus Mall",location:"Kukatpally"},
  {id:6,name:"AAA Cinemas",location:"Ameerpet"},
  {id:7,name:"Aparna Cinemas",location:"Nallagandla"},
  {id:8,name:"Cinepolis TNR North City",location:"Suchitra"},
  {id:9,name:"Sree Ramulu 70mm",location:"Moosapet"},
  {id:10,name:"Bhramaramba 70MM",location:"Kukatpally"},
  {id:11,name:"INOX GSM Mall",location:"Miyapur"},
  {id:12,name:"Cinepolis Lulu Mall",location:"Kukatpally"},
  {id:13,name:"MovieMax AMR",location:"ECIL"},
  {id:14,name:"GPR Multiplex",location:"Nizampet"},
  {id:15,name:"Sandhya 70MM",location:"RTC X Roads"},
  {id:16,name:"Mallikarjuna 70mm",location:"Kukatpally"},
  {id:17,name:"Miraj Cinemas CineTown",location:"Miyapur"},
  {id:18,name:"Cinepolis DSL Virtue Mall",location:"Uppal"},
  {id:19,name:"PVR Inorbit",location:"Cyberabad"},
  {id:20,name:"Gokul 70MM",location:"Erragadda"},
  {id:21,name:"Cinepolis Mantra Mall",location:"Attapur"},
  {id:22,name:"PVR Next Galleria",location:"Panjagutta"},
  {id:23,name:"INOX Sattva Necklace Mall",location:"Kavadiguda"},
  {id:24,name:"Asian M Cube Mall",location:"Attapur"},
  {id:25,name:"PVR Atrium",location:"Gachibowli"},
  {id:26,name:"Asian Cinemart",location:"RC Puram"},
  {id:27,name:"Arjun 70MM",location:"Kukatpally"},
  {id:28,name:"INOX Ashoka One Mall",location:"Kukatpally"},
  {id:29,name:"PVR Preston",location:"Gachibowli"},
  {id:30,name:"BR Hitech 70mm",location:"Madhapur"},
  {id:31,name:"PVR Irrum Manzil",location:"Khairatabad"},
  {id:32,name:"PVR ICON Hitech",location:"Madhapur"},
  {id:33,name:"Asian CineSquare",location:"Uppal"},
  {id:34,name:"INOX GVK One",location:"Banjara Hills"},
  {id:35,name:"Sri Sai Ram 70mm",location:"Malkajgiri"},
  {id:36,name:"Asian Shiva Ganga",location:"Dilsukhnagar"},
  {id:37,name:"Asian Cineplanet",location:"Kompally"},
  {id:38,name:"Sandhya 35mm",location:"RTC X Roads"},
  {id:39,name:"Cine Town Indra Nagendra",location:"Karmanghat"},
  {id:40,name:"INOX Prism Mall",location:"Gachibowli"},
  {id:41,name:"Sai Ranga 70MM",location:"Miyapur"},
  {id:42,name:"Sudarshan 35MM",location:"RTC X Roads"},
  {id:43,name:"Asian Mukta A2 Sensation",location:"Khairatabad"},
  {id:44,name:"PVR Musarambagh",location:"Malakpet"},
  {id:45,name:"BVK Multiplex",location:"LB Nagar"},
  {id:46,name:"Asian Sha Shahensha",location:"Chintal"},
  {id:47,name:"JP Cinemas",location:"Chandanagar"},
  {id:48,name:"Indra Venkataramana",location:"Kachiguda"},
  {id:49,name:"PVR Central Mall",location:"Panjagutta"},
  {id:50,name:"Asian Jyothi",location:"RC Puram"},
  {id:51,name:"Miraj Cinemas A2A",location:"Balanagar"},
  {id:52,name:"Miraj Cinemas Anand",location:"Narsingi"},
  {id:53,name:"Asian Radhika",location:"ECIL"},
  {id:54,name:"Platinum Movietime",location:"Gachibowli"},
  {id:55,name:"PVR RK Cineplex",location:"Banjara Hills"},
  {id:56,name:"INOX Maheshwari",location:"Kachiguda"},
  {id:57,name:"Devi 70MM",location:"RTC X Roads"},
  {id:58,name:"Asian Rajya Lakshmi",location:"Uppal"},
  {id:59,name:"UK Cineplex",location:"Nacharam"},
  {id:60,name:"Tivoli Cinemas",location:"Secunderabad"},
  {id:61,name:"Cinepolis CCPL Mall",location:"Malkajgiri"},
  {id:62,name:"Miraj Shalini Shivani",location:"Kothapet"},
  {id:63,name:"Asian Tarakarama",location:"Kachiguda"},
  {id:64,name:"INOX SMR Vinay",location:"Miyapur"},
  {id:65,name:"Asian Super Cinema",location:"Balapur"},
  {id:66,name:"Vijetha 70MM",location:"Borabanda"},
  {id:67,name:"Alankar Pratap",location:"Langer House"},
  {id:68,name:"Miraj Cinemas Geeta",location:"Chandanagar"},
  {id:69,name:"Cinepolis Sudha",location:"Bahadurpura"},
  {id:70,name:"Movietime SKY Mall",location:"Erragadda"},
  {id:71,name:"Miraj Raghavendra",location:"Malkajgiri"},
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
  {id:94,name:"ROONGTA CINEMAS NOVUM",location:"Nampally"},
  {id:95,name:"Allu Cinemas",location:"Kokapet"},
  {id:96,name:"PVR INOX Odeon Mall",location:"RTC X Roads"},
  {id:97,name:"PVR INOX Lakeshore Mall",location:"Kukatpally"},
  {id:98,name:"Multiplex Aparna Mall",location:"Shamshabad"}
];

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : require('http');
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function fetchTheaterImage(browser, theater) {
  const page = await browser.newPage();
  
  try {
    // Set viewport larger for better screenshots
    await page.setViewport({ width: 1400, height: 900 });
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Search for the theater on Google Maps
    const searchQuery = encodeURIComponent(`${theater.name} cinema ${theater.location} Hyderabad`);
    const url = `https://www.google.com/maps/search/${searchQuery}`;
    
    console.log(`\n🔍 Searching: ${theater.name}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Wait for page to fully load
    await new Promise(r => setTimeout(r, 3000));
    
    // Try to click on the first search result if there's a list
    try {
      const feedItem = await page.$('div[role="feed"] > div:first-child a');
      if (feedItem) {
        await feedItem.click();
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (e) {
      // Single result or direct match, continue
    }
    
    // Look for the main photo button and click it
    let imageUrl = null;
    const filename = `theater-${theater.id}.jpg`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    try {
      // Try to find and click the main photo
      const photoButton = await page.$('button[aria-label*="Photo"]');
      if (photoButton) {
        await photoButton.click();
        await new Promise(r => setTimeout(r, 2000));
        
        // Get all images in the photo viewer
        const images = await page.$$eval('img[src*="googleusercontent"]', imgs => 
          imgs.map(img => img.src).filter(src => src.includes('googleusercontent') && !src.includes('=s'))
        );
        
        if (images.length > 0) {
          // Get the first large image
          imageUrl = images[0].replace(/=w\d+-h\d+/, '=w800-h600').replace(/=s\d+/, '=s800');
        }
      }
    } catch (e) {
      console.log(`   ⚠️ Photo button not found: ${e.message}`);
    }
    
    // Fallback: Find any googleusercontent image on the page
    if (!imageUrl) {
      try {
        const images = await page.$$eval('img', imgs => 
          imgs.map(img => img.src)
            .filter(src => src && src.includes('googleusercontent') && !src.includes('data:'))
        );
        
        if (images.length > 0) {
          imageUrl = images[0];
          // Try to get higher resolution
          if (imageUrl.includes('=w')) {
            imageUrl = imageUrl.replace(/=w\d+/, '=w800');
          }
        }
      } catch (e) {
        console.log(`   ⚠️ Could not find images: ${e.message}`);
      }
    }
    
    // If we found an image URL, download it
    if (imageUrl && !imageUrl.startsWith('data:')) {
      console.log(`   🔗 Found image URL`);
      try {
        const imgPage = await browser.newPage();
        await imgPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
        const response = await imgPage.goto(imageUrl, { timeout: 15000 });
        const buffer = await response.buffer();
        fs.writeFileSync(filepath, buffer);
        await imgPage.close();
        console.log(`   💾 Downloaded: ${filename}`);
        return { success: true, method: 'download', filepath };
      } catch (e) {
        console.log(`   ⚠️ Download failed: ${e.message}`);
      }
    }
    
    // Final fallback: Take a screenshot of the place photo area
    console.log(`   📸 Taking screenshot as fallback...`);
    const pngPath = filepath.replace('.jpg', '.png');
    
    // Try to find the photo area
    const photoArea = await page.$('button[aria-label*="Photo"]');
    if (photoArea) {
      await photoArea.screenshot({ path: pngPath });
      console.log(`   📸 Screenshot saved: theater-${theater.id}.png`);
      return { success: true, method: 'screenshot', filepath: pngPath };
    }
    
    // Last resort: screenshot the whole place panel
    const placePanel = await page.$('div[role="main"]');
    if (placePanel) {
      await placePanel.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 400, height: 300 } });
      console.log(`   📸 Panel screenshot: theater-${theater.id}.png`);
      return { success: true, method: 'screenshot', filepath: pngPath };
    }
    
    throw new Error('No image found');
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🎬 Theater Image Scraper');
  console.log('========================');
  console.log('⚠️  This script requires Puppeteer. Install with: npm install puppeteer\n');
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log(`📁 Output: ${OUTPUT_DIR}`);
  console.log(`🎭 Headless: ${HEADLESS}`);
  console.log(`⏱️  Delay: ${DELAY}ms\n`);
  
  // Filter theaters if specific ID requested
  const theatersToProcess = SPECIFIC_THEATER
    ? theaters.filter(t => t.id === parseInt(SPECIFIC_THEATER))
    : theaters;
  
  if (theatersToProcess.length === 0) {
    console.error(`❌ Theater with ID ${SPECIFIC_THEATER} not found`);
    process.exit(1);
  }
  
  console.log(`🎯 Processing ${theatersToProcess.length} theaters...\n`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: HEADLESS ? 'new' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const results = [];
    
    for (const theater of theatersToProcess) {
      const result = await fetchTheaterImage(browser, theater);
      results.push({ theater, ...result });
      
      // Delay between requests to avoid rate limiting
      if (theatersToProcess.indexOf(theater) < theatersToProcess.length - 1) {
        await new Promise(r => setTimeout(r, DELAY));
      }
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
    
    // Generate image map
    if (successful > 0) {
      const imageMap = {};
      results.filter(r => r.success).forEach(r => {
        const ext = r.filepath.endsWith('.png') ? 'png' : 'jpg';
        imageMap[r.theater.id] = `/theaters/theater-${r.theater.id}.${ext}`;
      });
      
      const mapPath = path.join(OUTPUT_DIR, 'image-map.json');
      fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2));
      console.log(`\n📄 Image map saved: ${mapPath}`);
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  console.log('\n✨ Done!');
}

// Check if puppeteer is installed
try {
  await import('puppeteer');
  main().catch(console.error);
} catch (e) {
  console.error('❌ Puppeteer is not installed.');
  console.log('\nTo install Puppeteer, run:');
  console.log('  npm install puppeteer');
  console.log('\nThen run this script again.');
  process.exit(1);
}

