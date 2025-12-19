import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, Film, Star, Zap, TrendingUp, LayoutGrid, List, 
  Sparkles, Map, Navigation, Heart, X, Users, Volume2, Projector, 
  ChevronRight, Building2, Clapperboard 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Import from local modules
import { locationCoords, HYDERABAD_CENTER, DEFAULT_ZOOM } from './data/locations';
import { 
  getPriceRange, 
  extractHighlights, 
  getFallbackImage, 
  getTheaterImage,
  getDirectionsUrl,
  getGoogleMapsSearchUrl
} from './utils/helpers';
import type { Theater, Filters, ViewMode, MainView } from './types/theater';

// Custom marker icon
const createCustomIcon = (isUpcoming: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background: ${isUpcoming ? '#f59e0b' : '#06b6d4'};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px ${isUpcoming ? 'rgba(245, 158, 11, 0.5)' : 'rgba(6, 182, 212, 0.5)'};
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const TheaterExplorer = () => {
  const [view, setView] = useState('grid');
  const [mainView, setMainView] = useState('theaters');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    sound: 'all',
    projection: 'all',
    location: 'all'
  });
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Handle image error - fall back to stock images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, id: number, type: string) => {
    const target = e.target as HTMLImageElement;
    const fallback = getFallbackImage(id, type);
    if (target.src !== fallback) {
      target.src = fallback;
    }
  };

  // Get theater coordinates
  const getTheaterCoords = (location: string): [number, number] => {
    return locationCoords[location] || HYDERABAD_CENTER;
  };

  // All 98 theaters from the CSV
  const theaters = [
    {id:1,name:"AMB Cinemas",location:"Gachibowli",type:"Multiplex",screens:7,keyScreen:"Screen 1 (Large Format)",sound:"Dolby Atmos (All Screens)",projection:"4K Laser (Barco)",seating:"1,600+",features:"M Lounge: VIP section rivals business class. Co-owned by Mahesh Babu. Best washrooms in the city. Hosted India's first HDR screening trial in 2025. Ultra-premium multiplex with disciplined crowd."},
    {id:2,name:"Prasads Multiplex",location:"Khairatabad",type:"Multiplex",screens:6,keyScreen:"PCX (Screen 6) - 101.6 ft Wide",sound:"Dolby Atmos / Dual Audio",projection:"Dual 4K Laser (PCX)",seating:"2,000+",features:"Largest Screen: Formerly IMAX. The PCX screen is the largest in India. A pilgrimage site for blockbusters. Screens so large they lack generic branding. Hosted a 70mm Oppenheimer revival in 2025. Blockbuster destination."},
    {id:3,name:"Asian Lakshmikala Cinepride",location:"Moosapet",type:"Multiplex",screens:5,keyScreen:"Screen 5 (Largest)",sound:"Dolby 7.1 / Atmos",projection:"2K / 4K Digital",seating:"1,000+",features:"Renovated: Converted from single screen. Parking is tight; users often complain about AC rationing. Fan dances during openings. Popular Asian Cinemas property."},
    {id:4,name:"ART CINEMAS",location:"Vanasthalipuram",type:"Multiplex",screens:6,keyScreen:"EPIQ Premium Large Format",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,200+",features:"EPIQ Screen: 57ft wide screen brought premium PLF to the suburbs. Co-owned by Ravi Teja. Art-themed lobbies. First EPIQ PLF in Hyderabad."},
    {id:5,name:"PVR: Nexus Mall",location:"Kukatpally",type:"Multiplex",screens:9,keyScreen:"PVR Gold Class",sound:"Dolby 7.1 / Atmos",projection:"2K / 4K Digital",seating:"1,800+",features:"Ad-Heavy: Notorious for 25-30 mins of ads. Primary hub for the KPHB IT/Settler crowd. One of Hyderabad's largest PVRs."},
    {id:6,name:"AAA Cinemas",location:"Ameerpet",type:"Multiplex",screens:5,keyScreen:"LED Screen (Screen 2)",sound:"Dolby Atmos",projection:"4K Laser / LED",seating:"1,000+",features:"LED Tech: Screen 2 uses Samsung Onyx LED (no projector). Co-owned by Allu Arjun on the old Satyam site. Neon lounge. First LED cinema in Telangana."},
    {id:7,name:"Aparna Cinemas",location:"Nallagandla",type:"Multiplex",screens:7,keyScreen:"Premium Large Format",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,200+",features:"New Entrant: Located in Aparna Neo Mall. Known for on-time screenings (fewer ads than PVR). Excellent seating comfort; modern build."},
    {id:8,name:"Cinepolis: TNR North City",location:"Suchitra",type:"Multiplex",screens:10,keyScreen:"Macro XE (Large Format)",sound:"Dolby Atmos",projection:"4K Digital",seating:"1,900+",features:"Megaplex: Brought the first Macro XE screen to North Hyderabad. Massive capacity. Comfortable suburban multiplex."},
    {id:9,name:"Sree Ramulu 70mm",location:"Moosapet",type:"Single Screen",screens:1,keyScreen:"70mm Scope Screen",sound:"Dolby 7.1",projection:"4K Laser",seating:"850",features:"Petrol Theft: Infamous user review warning about bike petrol theft. Operator uses purple disco lights for songs. Famous FDFS fan celebrations."},
    {id:10,name:"Bhramaramba 70MM",location:"Kukatpally",type:"Single Screen",screens:1,keyScreen:"70mm Large Format",sound:"Dolby 7.1",projection:"2K Digital",seating:"900+",features:"Record Breaker: Twin to Mallikarjuna. Audio launch hub. If a record breaks in Nizam, it starts here. Part of iconic twin-theatre complex."},
    {id:11,name:"INOX: GSM Mall",location:"Miyapur",type:"Multiplex",screens:5,keyScreen:"Standard INOX Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"950",features:"Local Hub: Serves the dense Miyapur residential belt. Known for decent screens but heavy ad loads. Infamous for 40-min ads. 2024 controversy regarding ads."},
    {id:12,name:"Cinepolis: Lulu Mall",location:"Kukatpally",type:"Multiplex",screens:5,keyScreen:"VIP Screens",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,427",features:"Recliner Heavy: Features planetarium-style recliners. Located in the re-branded Lulu (formerly Manjeera). High footfall mall cinema."},
    {id:13,name:"MovieMax: AMR",location:"ECIL",type:"Multiplex",screens:7,keyScreen:"Standard Screens",sound:"Dolby 7.1",projection:"2K / 4K",seating:"1,500+",features:"Rebranded: Formerly Radhika area mall screens. Now features recliners and a live kitchen. Affordable neighborhood multiplex."},
    {id:14,name:"GPR Multiplex",location:"Nizampet",type:"Multiplex",screens:3,keyScreen:"Screen 1 is large",sound:"Dolby 7.1",projection:"2K Digital",seating:"800+",features:"Budget Plex: Popular with students. Affordable ticket pricing but average maintenance. Popular in Nizampet area."},
    {id:15,name:"Sandhya 70MM",location:"RTC X Roads",type:"Single Screen",screens:1,keyScreen:"70mm Giant Screen",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,100+",features:"Paper Snowstorms: Fans throw confetti in the laser beam. Epicenter of 4 AM benefit shows. Legendary RTC X Roads crowd."},
    {id:16,name:"Mallikarjuna 70mm",location:"Kukatpally",type:"Single Screen",screens:1,keyScreen:"70mm Large Format",sound:"Dolby DTS / 7.1",projection:"2K Digital",seating:"900+",features:"The Twin: Adjacent to Brahmaramba. Often plays the 2nd big release or acts as spillover for blockbusters. Night shows extend for hits. Twin of Brahmaramba."},
    {id:17,name:"Miraj Cinemas: CineTown",location:"Miyapur",type:"Multiplex",screens:3,keyScreen:"Screen 1 (Large)",sound:"Dolby Atmos (Sc 4)",projection:"2K Digital",seating:"900+",features:"Refurbished: Old CineTown renovated by Miraj. Users praise the balanced bass and new interiors. Good maintenance & sound."},
    {id:18,name:"Cinepolis: DSL Virtue Mall",location:"Uppal",type:"Multiplex",screens:6,keyScreen:"Standard Cinepolis",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,300",features:"Tiny AF: User reviews frequently criticize the small screen sizes, calling them home theaters. Preferred for VFX films. Preferred East Hyderabad multiplex."},
    {id:19,name:"PVR: Inorbit",location:"Cyberabad",type:"Multiplex",screens:6,keyScreen:"Standard PVR",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,100",features:"Legacy: One of the oldest multiplexes in IT corridor. Screens are smaller compared to newer malls. Oldest PVR in Hitech City."},
    {id:20,name:"Gokul 70MM",location:"Erragadda",type:"Single Screen",screens:1,keyScreen:"70mm Scope Screen",sound:"Dolby DTS",projection:"4K Projection",seating:"800+",features:"Tech Survivor: Upgraded to 4K to compete. The only major single screen standing in Erragadda. Showroom tie-ins. Strong neighborhood following."},
    {id:21,name:"Cinepolis: Mantra Mall",location:"Attapur",type:"Multiplex",screens:5,keyScreen:"Standard Cinepolis",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,200",features:"Attapur Savior: First major multiplex for the Attapur/Mehdipatnam bridge area. Family crowd. Serves Attapur belt."},
    {id:22,name:"PVR: Next Galleria",location:"Panjagutta",type:"Multiplex",screens:8,keyScreen:"Screen 1 & 8 (Large)",sound:"Dolby Atmos",projection:"4K Digital",seating:"1,500+",features:"Metro Connected: Directly linked to Metro. Screen 1 & 8 are cited as having superior projection. Direct metro access."},
    {id:23,name:"INOX: Sattva Necklace Mall",location:"Kavadiguda",type:"Multiplex",screens:7,keyScreen:"Standard INOX",sound:"Dolby Atmos",projection:"2K/4K",seating:"1,200+",features:"New & Clean: Located near Tank Bund. Praised for fresh interiors and good sound isolation. Blue sofas lobby. One of INOX's best-maintained venues."},
    {id:24,name:"Asian M Cube Mall",location:"Attapur",type:"Multiplex",screens:3,keyScreen:"Screen 1 (Big)",sound:"Dolby Atmos",projection:"2K/4K Laser",seating:"800+",features:"Local Favorite: Competes with Cinepolis Mantra. Known for better mass movie vibes in a multiplex setting. LED lobby displays. First premium multiplex in Attapur."},
    {id:25,name:"PVR: Atrium",location:"Gachibowli",type:"Multiplex",screens:5,keyScreen:"Standard PVR",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,000",features:"Spillover: Often gets the crowd that can't find tickets at AMB Cinemas nearby. Marathon events. IT crowd oriented."},
    {id:26,name:"Asian Cinemart",location:"RC Puram",type:"Multiplex",screens:5,keyScreen:"Standard Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,100",features:"New Opening: Opened Jan 2024. Launched by the Hanuman movie team. Main multiplex for RC Puram."},
    {id:27,name:"Arjun 70MM",location:"Kukatpally",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"2K Digital",seating:"800+",features:"Loud Audio: Known for cranking volume to max for mass songs. Black marketing of tickets reported. Fan cutouts tradition. Classic fan-theatre."},
    {id:28,name:"INOX: Ashoka One Mall",location:"Kukatpally",type:"Multiplex",screens:5,keyScreen:"Screen 1 (Big)",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,000+",features:"Premium Specs: All screens reportedly laser. Located at the busy Y-Junction. Consistent INOX quality."},
    {id:29,name:"PVR: Preston",location:"Gachibowli",type:"Multiplex",screens:5,keyScreen:"Standard PVR",sound:"Dolby 7.1",projection:"2K Digital",seating:"900",features:"Quiet: Located in a quieter mall, often easier to get tickets here than other IT corridor halls. Less crowded premium option."},
    {id:30,name:"BR Hitech 70mm",location:"Madhapur",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"2K Digital",seating:"800",features:"Sold Out Theory: Users suspect they block online tickets to force offline sales/save commission. Hosted a live actor Q&A inside the hall. Old IT-area single screen."},
    {id:31,name:"PVR: Irrum Manzil",location:"Khairatabad",type:"Multiplex",screens:5,keyScreen:"PVR PXL (Large Format)",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,100",features:"PXL Screen: Features a massive curved screen with dual projection. PVR's answer to Prasads. PVR's best large-format screen."},
    {id:32,name:"PVR ICON: Hitech",location:"Madhapur",type:"Multiplex",screens:5,keyScreen:"ICON (Luxury)",sound:"Dolby Atmos",projection:"4K Digital",seating:"900",features:"Controversial: Branded Luxury but users complain screens are very small. Audio calibration is top-tier. Hosted Hyderabad's first Atmos-tuned concert screening. Quiet luxury experience."},
    {id:33,name:"Asian CineSquare",location:"Uppal",type:"Multiplex",screens:4,keyScreen:"Screen 1 (Former Single)",sound:"Dolby Atmos",projection:"4K Digital",seating:"950+",features:"Hybrid: Built on old Rajyalaxmi theater site. Screen 1 retains the massive single-screen size. Revived historic theatre."},
    {id:34,name:"INOX GVK One",location:"Banjara Hills",type:"Multiplex",screens:5,keyScreen:"Boutique Screens",sound:"Dolby Atmos",projection:"2K Digital",seating:"900",features:"Elite Crowd: Salt & pepper crowd. High ticket prices, gourmet food focus. One of the first INOXs. Posh crowd; aging tech."},
    {id:35,name:"Sri Sai Ram 70mm",location:"Malkajgiri",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Atmos",projection:"4K Laser",seating:"800+",features:"Hidden Gem: Locals rate its AV quality higher than many multiplexes. Renovated recently. Key Malkajgiri theatre."},
    {id:36,name:"Asian Shiva Ganga",location:"Dilsukhnagar",type:"Multiplex",screens:2,keyScreen:"Twin Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"800+",features:"Mass Belt: Located in the heart of Dilsukhnagar. Frequent complaints about AC maintenance. Popular in East Hyderabad."},
    {id:37,name:"Asian Cineplanet",location:"Kompally",type:"Multiplex",screens:2,keyScreen:"Screen 1 (Massive)",sound:"Dolby 7.1",projection:"2K/4K",seating:"1,200",features:"800-Seater: Screen 1 has ~801 seats, effectively a single screen inside a multiplex shell. Grand single-screen feel."},
    {id:38,name:"Sandhya 35mm",location:"RTC X Roads",type:"Single Screen",screens:1,keyScreen:"35mm (Name only)",sound:"Dolby Atmos",projection:"4K Digital",seating:"800+",features:"The Sidekick: Smaller than 70mm but shares the same violent fan energy and tech upgrades. Rare Atmos 35mm hall."},
    {id:39,name:"Cine Town Indra Nagendra",location:"Karmanghat",type:"Single Screen",screens:2,keyScreen:"Twin Theaters",sound:"Qube Digital",projection:"2K Digital",seating:"800+",features:"Ghost House: User reviews describe Nagendra as a ghost house due to emptiness/dilapidation. Neighborhood favorite."},
    {id:40,name:"INOX: Prism Mall",location:"Gachibowli",type:"Multiplex",screens:4,keyScreen:"Standard Screens",sound:"Dolby Atmos",projection:"2K/4K",seating:"800",features:"IT Hub: Serves the Financial District. Modern, clean, standard corporate multiplex experience. Convenient IT-hub cinema."},
    {id:41,name:"Sai Ranga 70MM",location:"Miyapur",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"4K Projection",seating:"800",features:"One Week Run: Movies rotate very fast. Tickets are cheap (~₹50-100). Health-themed promos (due to Nursing home tie). Last big hall in Miyapur."},
    {id:42,name:"Sudarshan 35MM",location:"RTC X Roads",type:"Single Screen",screens:1,keyScreen:"35mm (Name only)",sound:"Dolby Atmos",projection:"4K Laser",seating:"1,065",features:"Deceptive Name: It's fully digital 4K. Reduced seats years ago to install couple seats & legroom. Considered best single screen in Hyderabad."},
    {id:43,name:"Asian Mukta A2 Sensation",location:"Khairatabad",type:"Multiplex",screens:2,keyScreen:"Compact Screens",sound:"Dolby Atmos (Sc 2)",projection:"2K Digital",seating:"600",features:"Sound Quality: Users specifically praise the sound in Screen 2. Located near Lakdikapul metro. Excellent sound calibration."},
    {id:44,name:"PVR: Musarambagh",location:"Malakpet",type:"Multiplex",screens:4,keyScreen:"Standard Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"900",features:"Transit Hub: Located next to the MGBS bus station. High footfall from transit passengers. Bus + metro connectivity."},
    {id:45,name:"BVK Multiplex",location:"LB Nagar",type:"Multiplex",screens:3,keyScreen:"Converted Single Screen",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,000+",features:"Cockroaches: Reviews cite poor maintenance despite Multiplex tag. Screen 1 is still very large. Affordable local multiplex."},
    {id:46,name:"Asian Sha & Shahensha",location:"Chintal",type:"Twin Theaters",screens:2,keyScreen:"Standard Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"800+",features:"Industrial Zone: Serves Jeedimetla workers. Users report AC being switched off mid-movie. Community groups. Local cultural hub."},
    {id:47,name:"JP Cinemas",location:"Chandanagar",type:"Multiplex",screens:3,keyScreen:"Standard Screens",sound:"Dolby Atmos",projection:"2K Digital",seating:"800",features:"Neighborhood Plex: Good sound, but often overshadowed by the nearby Asian/Miraj properties. Maruti showroom tie. Comfortable seating."},
    {id:48,name:"Indra Venkataramana",location:"Kachiguda",type:"Multiplex",screens:2,keyScreen:"Padmavati (Large)",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,000+",features:"Heritage: Renamed/Renovated. Combines old-school balcony seating with digital projection. IDBI Bank promos. Very old Kachiguda cinema."},
    {id:49,name:"PVR: Central Mall",location:"Panjagutta",type:"Multiplex",screens:5,keyScreen:"Standard Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,100",features:"Reliable: One of the oldest PVRs. Known as idiot-proof for its consistency over the years. Heavy footfall."},
    {id:50,name:"Asian Jyothi",location:"RC Puram",type:"Multiplex",screens:1,keyScreen:"70mm Converted",sound:"Dolby 7.1",projection:"2K Digital",seating:"700+",features:"AC Issues: Frequent complaints of management turning off AC to save power. Opposite TVS Motors. Main RC Puram fan theatre."},
    {id:51,name:"Miraj Cinemas: A2A",location:"Balanagar",type:"Multiplex",screens:4,keyScreen:"Standard Screens",sound:"Dolby Atmos",projection:"2K Digital",seating:"1,000",features:"Chef Corner: Features live food prep and seat delivery. Luxury island in industrial Balanagar. Well-balanced Miraj property."},
    {id:52,name:"Miraj Cinemas: Anand",location:"Narsingi",type:"Multiplex",screens:4,keyScreen:"Premium Screens",sound:"Dolby Atmos",projection:"4K Digital",seating:"801",features:"Luxury: New opening. Features Beanary Café and gold-themed interiors for the rich suburbs. Opened September 2025. Serves fast-growing suburb."},
    {id:53,name:"Asian Radhika",location:"ECIL",type:"Multiplex",screens:5,keyScreen:"Screen 1 (Large)",sound:"Dolby 7.1",projection:"2K/4K",seating:"1,200+",features:"Traffic Jam: The cultural heart of ECIL. Parking entry often blocks the main road. ECIL landmark theatre."},
    {id:54,name:"Platinum Movietime",location:"Gachibowli",type:"Multiplex",screens:5,keyScreen:"All Recliners",sound:"Dolby 7.1",projection:"2K/4K",seating:"800",features:"Recliner Heavy: Took over old Cinepolis space in SLN Terminus. Markets almost every seat as Recliner. 2024 upgrade added haptic seats. Seat-shaking bass. Quiet IT crowd."},
    {id:55,name:"PVR: RK Cineplex",location:"Banjara Hills",type:"Multiplex",screens:5,keyScreen:"Screen 1 (Large)",sound:"Dolby Atmos",projection:"4K Digital",seating:"1,100",features:"Star Owned: Originally owned by Ramanaidu family. Premium location, quiet crowd. Former Cinemax flagship."},
    {id:56,name:"INOX: Maheshwari",location:"Kachiguda",type:"Multiplex",screens:2,keyScreen:"Mall-in-Theater",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,200+",features:"Unique Build: The mall was built around the old Maheshwari/Parmeshwari theaters. Huge audis. Preserved legacy screens."},
    {id:57,name:"Devi 70MM",location:"RTC X Roads",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Atmos",projection:"4K Laser",seating:"900+",features:"Audiophile: First theater to gross ₹1Cr in AP. Steep balcony for perfect sightlines. Perfect sound. Legendary sound quality."},
    {id:58,name:"Asian Rajya Lakshmi",location:"Uppal",type:"Multiplex",screens:1,keyScreen:"Part of CineSquare",sound:"Dolby 7.1",projection:"2K Digital",seating:"400+",features:"Legacy Name: Often referred to interchangeably with Asian CineSquare or as a specific screen within it. Indane Gas service tie. Strong fan following."},
    {id:59,name:"UK Cineplex",location:"Nacharam",type:"Multiplex",screens:4,keyScreen:"Standard Screens",sound:"Dolby Atmos",projection:"Laser Projection",seating:"900",features:"Modern: Brought laser projection and Atmos to the industrial Nacharam area. Budget-friendly."},
    {id:60,name:"Tivoli Cinemas",location:"Secunderabad",type:"Multiplex",screens:3,keyScreen:"Extreme Screen",sound:"Dolby 7.1 Extreme",projection:"2K Digital",seating:"900",features:"Audio Bleed: Users report sound leaking between screens. Extreme screen is the highlight. Military ties. Busy Secunderabad multiplex."},
    {id:61,name:"Cinepolis: CCPL Mall",location:"Malkajgiri",type:"Multiplex",screens:5,keyScreen:"Standard Cinepolis",sound:"Dolby 7.1",projection:"2K Digital",seating:"1,000",features:"Cleanliness: Praised for hygiene in a dense residential area. Standard Cinepolis quality. Good acoustics."},
    {id:62,name:"Miraj: Shalini Shivani",location:"Kothapet",type:"Multiplex",screens:4,keyScreen:"Twin Conversion",sound:"Dolby Atmos",projection:"2K Digital",seating:"1,000+",features:"Transformation: The legendary Shalini/Shivani twins converted into a modern Miraj multiplex. Revived classic."},
    {id:63,name:"Asian Tarakarama",location:"Kachiguda",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"4K Digital",seating:"800+",features:"Budget Luxury: Cheat Code theater offering recliner seats at single-screen prices. Historic Tarakarama revival."},
    {id:64,name:"INOX: SMR Vinay",location:"Miyapur",type:"Multiplex",screens:4,keyScreen:"Standard INOX",sound:"Dolby Atmos",projection:"2K Digital",seating:"800",features:"New: Located in a new mall. Good sound isolation and modern projection. Direct metro access."},
    {id:65,name:"Asian Super Cinema",location:"Balapur",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"2K Digital",seating:"700+",features:"Loud: Reviews claim sound is so loud it can be heard outside the building."},
    {id:66,name:"Vijetha 70MM",location:"Borabanda",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Atmos",projection:"4K Projection",seating:"800",features:"Surprise Tech: Deep in a residential colony but sports 4K Atmos specs. Rare Atmos single-screen."},
    {id:67,name:"Alankar (Pratap)",location:"Langer House",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"Digital",seating:"722",features:"Student Hub: Renamed from Pratap. Serves the engineering college belt. Steep balcony. Old City icon."},
    {id:68,name:"Miraj Cinemas: Geeta",location:"Chandanagar",type:"Multiplex",screens:3,keyScreen:"Converted Single",sound:"Dolby 7.1",projection:"2K Digital",seating:"800",features:"Hybrid: Retains the local name Geeta but managed by Miraj standards. Modernized legacy cinema."},
    {id:69,name:"Cinepolis: Sudha",location:"Bahadurpura",type:"Multiplex",screens:4,keyScreen:"Converted Single",sound:"Dolby 7.1",projection:"3D / 2K",seating:"900",features:"Old City Entry: Rare global chain presence in the Old City. Taking over the old Sudha theater. Old City favorite."},
    {id:70,name:"Movietime: SKY Mall",location:"Erragadda",type:"Multiplex",screens:3,keyScreen:"Standard Screens",sound:"Dolby 7.1",projection:"2K Digital",seating:"700",features:"Average: Standard mall multiplex. Often less crowded than PVRs. Czech Colony vibes. Balanced AV quality."},
    {id:71,name:"Miraj: Raghavendra",location:"Malkajgiri",type:"Single Screen",screens:1,keyScreen:"Renovated Single",sound:"Dolby 7.1",projection:"2K Digital",seating:"700",features:"Hygiene: Praised for cleanliness after Miraj takeover, a major issue in its previous avatar. Neighborhood staple."},
    {id:72,name:"VLS Sridevi",location:"Chilakalguda",type:"Single Screen",screens:1,keyScreen:"2K Digital",sound:"DTS Sound",projection:"2K Digital",seating:"700",features:"Budget: Serves the railway colony area. Basic digital projection. Secunderabad local crowd."},
    {id:73,name:"Bhujanga 70MM",location:"Jeedimetla",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"Digital",seating:"800",features:"Smell Issues: Users specifically complain about a bad smell upon entry. Mass crowd. Working-class fan culture."},
    {id:74,name:"Vyjayanthi Cinema",location:"Nacharam",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"2K Digital",seating:"800",features:"Student Favorite: Popular with Osmania University students. Praised for fragrance (rare!). Nacharam landmark."},
    {id:75,name:"Talluri Theatres",location:"Kushaiguda",type:"Multiplex",screens:3,keyScreen:"T-Square",sound:"Dolby Atmos",projection:"2K Digital",seating:"900",features:"Hidden Plex: A modern multiplex hidden inside a traditional neighborhood complex. Small loyal audience."},
    {id:76,name:"Ramakrishna Glitterati",location:"Abids",type:"Single Screen",screens:1,keyScreen:"Heritage 70mm",sound:"Dolby 7.1",projection:"Digital",seating:"700+",features:"Rebranded: Glitterati tag attempts to upscale this heritage theater. Operated by Mukta A2. Part of legendary RK group."},
    {id:77,name:"Prashant Cinema",location:"Secunderabad",type:"Single Screen",screens:1,keyScreen:"Renovated",sound:"Dolby 7.1",projection:"Digital",seating:"700",features:"Renovated: Recently upgraded interiors. Located near the Passport office. Recently renovated."},
    {id:78,name:"Asian Mukund",location:"Medchal",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"2K Digital",seating:"600",features:"Highway Hub: Saves Medchal locals from driving 15km to Kompally. Medchal's main cinema."},
    {id:79,name:"Rama Krishna 70mm",location:"Abids",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"Digital",seating:"800+",features:"The Original: The classic screen, distinct from the Glitterati rebrand/renovation. One of Hyderabad's most iconic cinemas."},
    {id:80,name:"Sushma 70MM",location:"Vanasthalipuram",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"2K Digital",seating:"800",features:"Decaying: Needs renovation. Paint vanished. Early adopter of PayTm ticketing. Local favorite."},
    {id:81,name:"Sri Krishna 70MM",location:"Uppal",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"Digital",seating:"800",features:"Mosquitoes: User reviews praise sound but complain heavily about mosquitoes. Major Uppal fan theatre."},
    {id:82,name:"Connplex Cinemas",location:"Banjara Hills",type:"Boutique",screens:3,keyScreen:"Smart Theater",sound:"Dolby Surround",projection:"2K Digital",seating:"170",features:"Private: Ultra-small screens (one has 37 seats). Designed for private parties/rentals. Upscale crowd."},
    {id:83,name:"Laxmi 70MM",location:"Shamshabad",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"DTS Sound",projection:"Laser Projection",seating:"800",features:"Airport Hub: Key entertainment for airport staff. Renovated with Amazon cement tiles. Rare laser upgrade near airport."},
    {id:84,name:"Lakshmi Kala Mandir",location:"Alwal",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"UFO / 2K",seating:"889",features:"Capacity: Massive seating capacity. Competes with Cineplanet on price. Classic Alwal cinema."},
    {id:85,name:"Sree Ramana Gold",location:"Amberpet",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"4K Projection",seating:"800",features:"Gold Upgrade: The 70mm screen is branded Gold to highlight 4K tech. No snacks (only chips). Modernized version."},
    {id:86,name:"Sree Ramana 70MM",location:"Amberpet",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"Digital",seating:"800",features:"Standard: The base version of the theater, often confused with Gold. Fan celebrations hub."},
    {id:87,name:"Anjali Movie Max",location:"Secunderabad",type:"Single Screen",screens:1,keyScreen:"Renovated",sound:"Dolby Digital",projection:"Digital",seating:"600",features:"Interruptions: Users complain about frequent pauses/interruptions during shows. Affordable option."},
    {id:88,name:"Sri Prema 70MM",location:"Tukkuguda",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"Qube Digital",seating:"800",features:"Ad Revenue: High ad engagement. Serves Srisailam highway/Airport corridor. Key Tukkuguda cinema."},
    {id:89,name:"Aradhana Theatre",location:"Tarnaka",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby 7.1",projection:"Digital",seating:"900",features:"Vintage: Classic 70mm that refused to split. Popular with OU students. Residential-area staple."},
    {id:90,name:"Metro Cinema",location:"Bahadurpura",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"Digital (Low End)",seating:"800",features:"Black & White: Projection bulb so dim users say color movies look B&W. Old city vibe. Old City budget cinema."},
    {id:91,name:"Saptagiri 70MM",location:"RTC X Roads",type:"Single Screen",screens:1,keyScreen:"70mm Scope",sound:"Dolby Digital",projection:"4K Projection",seating:"900",features:"The Survivor: Overshadowed by Sandhya/Devi but installed 4K to stay relevant. RTC overflow giant."},
    {id:92,name:"Santosh Theatre",location:"Ibrahimpatnam",type:"Single Screen",screens:1,keyScreen:"Standard",sound:"Dolby Digital",projection:"Digital",seating:"600",features:"Rowdy: Security issues reported (drunken people). Far outskirts. Primary local cinema."},
    {id:93,name:"Venkata Sai AC",location:"Keesara",type:"Single Screen",screens:1,keyScreen:"Newly Renovated",sound:"Dolby Atmos",projection:"Digital",seating:"500",features:"Border Post: Brings AC cinema to the extreme outskirts, replacing touring talkies. Recently upgraded."},
    {id:94,name:"ROONGTA CINEMAS: NOVUM",location:"Nampally",type:"Boutique",screens:2,keyScreen:"Premium",sound:"Dolby Atmos",projection:"2K Barco",seating:"300",features:"Live Kitchen: North Indian chain's debut. Features a live kitchen to gentrify Nampally. Opened December 19, 2025. New-age boutique multiplex."},
    {id:95,name:"Allu Cinemas",location:"Kokapet",type:"Multiplex (Upcoming)",screens:4,keyScreen:"Country's Largest Dolby Cinema",sound:"Dolby Cinema",projection:"Laser",seating:"TBA",features:"Future: 4 screens with country's largest Dolby Cinema. Expected January 2026 (tied to Avatar release)."},
    {id:96,name:"PVR INOX: Odeon Mall",location:"RTC X Roads",type:"Multiplex (Upcoming)",screens:8,keyScreen:"TBA",sound:"TBA",projection:"TBA",seating:"TBA",features:"Future: 8 screens at RTC X Roads (Odeon Mall). Opening by January 2026."},
    {id:97,name:"PVR INOX: Lakeshore Mall",location:"Kukatpally",type:"Multiplex (Upcoming)",screens:9,keyScreen:"Premium Options",sound:"TBA",projection:"TBA",seating:"TBA",features:"Future: 9 screens with premium options at Lakeshore Mall. By January 2026."},
    {id:98,name:"Multiplex: Aparna Mall",location:"Shamshabad",type:"Multiplex (Upcoming)",screens:7,keyScreen:"TBA",sound:"TBA",projection:"TBA",seating:"TBA",features:"Future: 7 screens at Aparna Mall, Shamshabad. March 2026."}
  ].map(t => ({
    ...t,
    highlights: extractHighlights(t.features),
    priceRange: getPriceRange(t.type, t.sound, t.projection),
    image: getTheaterImage(t.id)
  }));

  const locations = [...new Set(theaters.map(t => t.location))].sort();
  const soundSystems = ['Dolby Atmos', 'Dolby 7.1', 'Dolby Digital', 'DTS'];
  const projectionTypes = ['4K Laser', '4K Digital', '4K Projection', '2K Digital', 'LED', 'Laser'];
  const theaterTypes = [...new Set(theaters.map(t => t.type))];

  const filteredTheaters = useMemo(() => {
    return theaters.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.features.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filters.type === 'all' || t.type.includes(filters.type);
      const matchesSound = filters.sound === 'all' || t.sound.includes(filters.sound);
      const matchesProjection = filters.projection === 'all' || t.projection.includes(filters.projection);
      const matchesLocation = filters.location === 'all' || t.location === filters.location;
      
      return matchesSearch && matchesType && matchesSound && matchesProjection && matchesLocation;
    });
  }, [searchTerm, filters]);

  const stats = useMemo(() => {
    const activeTheaters = theaters.filter(t => !t.type.includes('Upcoming'));
    const total = activeTheaters.length;
    const multiplexes = activeTheaters.filter(t => t.type === 'Multiplex').length;
    const singleScreens = activeTheaters.filter(t => t.type === 'Single Screen').length;
    const boutique = activeTheaters.filter(t => t.type === 'Boutique' || t.type === 'Twin Theaters').length;
    const atmosCount = activeTheaters.filter(t => t.sound.includes('Atmos')).length;
    const laserCount = activeTheaters.filter(t => t.projection.includes('Laser')).length;
    const fourKCount = activeTheaters.filter(t => t.projection.includes('4K')).length;
    const totalScreens = activeTheaters.reduce((acc, t) => acc + (t.screens || 0), 0);
    const upcoming = theaters.filter(t => t.type.includes('Upcoming')).length;
    
    return { total, multiplexes, singleScreens, boutique, atmosCount, laserCount, fourKCount, totalScreens, upcoming };
  }, []);

  const toggleFavorite = (theaterId: number) => {
    setFavorites((prev: number[]) => 
      prev.includes(theaterId) 
        ? prev.filter((id: number) => id !== theaterId)
        : [...prev, theaterId]
    );
  };

  const TheaterCard = ({ theater }: { theater: Theater }) => {
    const isUpcoming = theater.type.includes('Upcoming');
    
    return (
      <div 
        className={`group bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${
          isUpcoming 
            ? 'border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/10' 
            : 'border-slate-800 hover:border-cyan-500/50 hover:shadow-cyan-500/10'
        }`}
        onClick={() => setSelectedTheater(theater)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={theater.image} 
          alt={theater.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => handleImageError(e, theater.id, theater.type)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const coords = locationCoords[theater.location] || [17.3850, 78.4867];
                const searchQuery = encodeURIComponent(`${theater.name}, ${theater.location}, Hyderabad`);
                window.open(`https://www.google.com/maps/search/${searchQuery}/@${coords[0]},${coords[1]},17z`, '_blank');
              }}
              className="p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-green-600 transition-colors"
              aria-label="View on Google Maps"
              title="View Photos on Google Maps"
            >
              <Map className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(theater.id);
              }}
              className="p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-cyan-600 transition-colors"
              aria-label={favorites.includes(theater.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${favorites.includes(theater.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          </div>

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className={`px-3 py-1 backdrop-blur text-white rounded-full text-xs font-semibold ${
              isUpcoming ? 'bg-amber-500/90' : 'bg-slate-900/90'
            }`}>
            {theater.type}
          </span>
            {theater.id === 94 && (
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xs font-bold animate-pulse">
                🎉 NEW TODAY
              </span>
            )}
            {isUpcoming && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-xs font-bold">
                🚀 COMING SOON
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{theater.name}</h3>
          <div className="flex items-center gap-2 text-slate-300 text-sm">
              <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{theater.location}</span>
          </div>
        </div>
      </div>

        <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">{theater.screens} Screen{theater.screens > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-yellow-400">{theater.priceRange}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {theater.sound.includes('Atmos') && (
              <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-medium">
              🎵 Atmos
            </span>
          )}
          {theater.projection.includes('Laser') && (
              <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs font-medium">
              ⚡ Laser
            </span>
          )}
          {theater.projection.includes('4K') && (
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg text-xs font-medium">
              📺 4K
            </span>
          )}
          {theater.projection.includes('LED') && (
              <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-300 rounded-lg text-xs font-medium">
              💡 LED
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {theater.highlights.slice(0, 2).map((h: string, i: number) => (
            <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
              {h}
            </span>
          ))}
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{theater.features}</p>

          <button className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            isUpcoming 
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
          }`}>
            {isUpcoming ? 'Coming Soon' : 'View Details'}
            <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
  };

  const TheaterListItem = ({ theater }: { theater: Theater }) => {
    const isUpcoming = theater.type.includes('Upcoming');
    
    return (
      <div 
        className={`group bg-slate-900/80 backdrop-blur-sm rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-xl cursor-pointer ${
          isUpcoming 
            ? 'border-amber-500/30 hover:border-amber-500/60' 
            : 'border-slate-800 hover:border-cyan-500/50'
        }`}
        onClick={() => setSelectedTheater(theater)}
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
            <img 
              src={theater.image} 
              alt={theater.name}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, theater.id, theater.type)}
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const coords = locationCoords[theater.location] || [17.3850, 78.4867];
                  const searchQuery = encodeURIComponent(`${theater.name}, ${theater.location}, Hyderabad`);
                  window.open(`https://www.google.com/maps/search/${searchQuery}/@${coords[0]},${coords[1]},17z`, '_blank');
                }}
                className="p-1.5 bg-slate-900/80 backdrop-blur rounded-full hover:bg-green-600 transition-colors"
                aria-label="View on Google Maps"
                title="View Photos"
              >
                <Map className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(theater.id);
                }}
                className="p-1.5 bg-slate-900/80 backdrop-blur rounded-full hover:bg-cyan-600 transition-colors"
                aria-label={favorites.includes(theater.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(theater.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-lg font-bold text-white">{theater.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{theater.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isUpcoming ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {theater.type}
                </span>
                <span className="text-yellow-400 font-semibold text-sm">{theater.priceRange}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs text-slate-400">
                <Film className="w-3 h-3 inline mr-1" />{theater.screens} Screens
              </span>
              <span className="text-xs text-slate-400">
                <Volume2 className="w-3 h-3 inline mr-1" />{theater.sound}
              </span>
              <span className="text-xs text-slate-400">
                <Projector className="w-3 h-3 inline mr-1" />{theater.projection}
              </span>
            </div>
            
            <p className="text-sm text-slate-400 line-clamp-1">{theater.features}</p>
          </div>
        </div>
      </div>
    );
  };

  const MapView = () => {
    // Center on Hyderabad
    const hyderabadCenter: [number, number] = HYDERABAD_CENTER;
    
    return (
      <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-700">
        <MapContainer 
          center={hyderabadCenter} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          {/* Dark theme map tiles from CartoDB */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {/* Theater markers */}
          {filteredTheaters.map((theater) => {
            const isUpcoming = theater.type.includes('Upcoming');
            const coords = getTheaterCoords(theater.location);
            
            return (
              <Marker 
                key={theater.id}
                position={coords}
                icon={createCustomIcon(isUpcoming)}
                eventHandlers={{
                  click: () => setSelectedTheater(theater),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-white text-sm mb-1">{theater.name}</h3>
                    <div className="flex items-center gap-1 text-slate-300 text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{theater.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isUpcoming 
                          ? 'bg-amber-500/20 text-amber-300' 
                          : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {theater.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-600 text-slate-200">
                        {theater.screens} {theater.screens === 1 ? 'Screen' : 'Screens'}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedTheater(theater)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-1.5 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        
        {/* Legend overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700 z-[1000]">
          <div className="text-xs font-semibold text-slate-300 mb-2">Legend</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-xs text-slate-400">Active Theaters ({filteredTheaters.filter(t => !t.type.includes('Upcoming')).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-400">Coming Soon ({filteredTheaters.filter(t => t.type.includes('Upcoming')).length})</span>
            </div>
          </div>
        </div>
        
        {/* Theater count overlay */}
        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700 z-[1000]">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-cyan-400">{filteredTheaters.length}</span> theaters shown
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color, subtitle }: { icon: any; label: string; value: any; color: string; subtitle?: string }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 shadow-lg transform hover:scale-105 transition-transform cursor-default`}>
      <Icon className="w-7 h-7 text-white mb-2 opacity-80" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
      {subtitle && <div className="text-xs text-white/60 mt-1">{subtitle}</div>}
    </div>
  );

  // Theater Detail Modal
  const TheaterModal = ({ theater, onClose }: { theater: Theater; onClose: () => void }) => {
    if (!theater) return null;
    const isUpcoming = theater.type.includes('Upcoming');
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Image */}
          <div className="relative h-64">
            <img 
              src={theater.image} 
              alt={theater.name}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, theater.id, theater.type)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={() => toggleFavorite(theater.id)}
              className="absolute top-4 left-4 p-2 bg-slate-900/80 backdrop-blur rounded-full hover:bg-cyan-600 transition-colors"
              aria-label={favorites.includes(theater.id) ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-5 h-5 ${favorites.includes(theater.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isUpcoming ? 'bg-amber-500' : 'bg-cyan-600'
                } text-white`}>
                  {theater.type}
                </span>
                {theater.id === 94 && (
                  <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-xs font-bold">
                    🎉 OPENS TODAY
                  </span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">{theater.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4" />
                  <span>{theater.location}</span>
                </div>
                <button
                  onClick={() => {
                    const coords = getTheaterCoords(theater.location);
                    const searchQuery = encodeURIComponent(`${theater.name}, ${theater.location}, Hyderabad`);
                    window.open(`https://www.google.com/maps/search/${searchQuery}/@${coords[0]},${coords[1]},17z`, '_blank');
                  }}
                  className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full text-white text-xs transition-colors"
                >
                  <Map className="w-3 h-3" />
                  View Photos
                </button>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <Film className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{theater.screens}</div>
                <div className="text-xs text-slate-400">Screens</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{theater.seating}</div>
                <div className="text-xs text-slate-400">Seats</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <Volume2 className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-white leading-tight">{theater.sound.split('/')[0]}</div>
                <div className="text-xs text-slate-400">Sound</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <Projector className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                <div className="text-sm font-bold text-white leading-tight">{theater.projection.split('/')[0]}</div>
                <div className="text-xs text-slate-400">Projection</div>
              </div>
            </div>
            
            {/* Key Screen Info */}
            {theater.keyScreen && theater.keyScreen !== 'TBA' && (
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Key Screen</span>
                </div>
                <p className="text-slate-300">{theater.keyScreen}</p>
              </div>
            )}
            
            {/* Highlights */}
            {theater.highlights.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Highlights
                </h3>
                <div className="flex flex-wrap gap-2">
                  {theater.highlights.map((h: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Tech Badges */}
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                Technology
              </h3>
              <div className="flex flex-wrap gap-2">
                {theater.sound.includes('Atmos') && (
                  <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm">
                    🎵 Dolby Atmos
                  </span>
                )}
                {theater.projection.includes('Laser') && (
                  <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                    ⚡ Laser Projection
                  </span>
                )}
                {theater.projection.includes('4K') && (
                  <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm">
                    📺 4K Resolution
                  </span>
                )}
                {theater.projection.includes('LED') && (
                  <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm">
                    💡 LED Screen
                  </span>
                )}
                {theater.sound.includes('7.1') && (
                  <span className="px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm">
                    🔊 7.1 Surround
                  </span>
                )}
              </div>
            </div>
            
            {/* Features/USP */}
            <div className="mb-6">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-cyan-400" />
                About & USP
              </h3>
              <p className="text-slate-300 leading-relaxed">{theater.features}</p>
            </div>
            
            {/* Price Range */}
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <span className="text-slate-400 text-sm">Price Range</span>
                <div className="text-xl font-bold text-yellow-400">{theater.priceRange}</div>
              </div>
              {!isUpcoming && (
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(theater.name + ', ' + theater.location + ', Hyderabad')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              )}
              {isUpcoming && (
                <span className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg text-sm font-medium">
                  Opening Soon
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Ambient background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            🎬 Hyderabad Cinemas
          </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Discover {stats.total} movie theaters across the city of pearls — from iconic single screens to premium multiplexes
            </p>
        </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
            <StatCard icon={Building2} label="Theaters" value={stats.total} color="from-cyan-600 to-cyan-700" />
          <StatCard icon={LayoutGrid} label="Multiplexes" value={stats.multiplexes} color="from-purple-600 to-purple-700" />
          <StatCard icon={Film} label="Single Screens" value={stats.singleScreens} color="from-indigo-600 to-indigo-700" />
          <StatCard icon={Zap} label="Dolby Atmos" value={stats.atmosCount} color="from-pink-600 to-pink-700" />
            <StatCard icon={TrendingUp} label="4K Projection" value={stats.fourKCount} color="from-orange-600 to-orange-700" />
          <StatCard icon={Sparkles} label="Total Screens" value={stats.totalScreens} color="from-emerald-600 to-emerald-700" />
        </div>

          {/* Search & Filters */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-8 border border-slate-800 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by theater name, location, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by theater type"
                >
                  <option value="all">All Types</option>
                  {theaterTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by location"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>

                <select
                  value={filters.sound}
                  onChange={(e) => setFilters({...filters, sound: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by sound system"
                >
                  <option value="all">All Sound Systems</option>
                  {soundSystems.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={filters.projection}
                  onChange={(e) => setFilters({...filters, projection: e.target.value})}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                  aria-label="Filter by projection type"
                >
                  <option value="all">All Projections</option>
                  {projectionTypes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
            </div>
          </div>
        </div>

          {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setMainView('theaters')}
                className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${mainView === 'theaters' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-2" />
              Theaters
            </button>
            <button
              onClick={() => setMainView('map')}
                className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${mainView === 'map' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Map className="w-4 h-4 inline mr-2" />
              Map View
            </button>
              {favorites.length > 0 && (
                <button
                  onClick={() => setMainView('favorites')}
                  className={`px-4 md:px-6 py-2 rounded-xl font-medium transition-all ${mainView === 'favorites' ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  Favorites ({favorites.length})
                </button>
              )}
          </div>

          {mainView === 'theaters' && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">
                <span className="text-cyan-400 font-semibold">{filteredTheaters.length}</span> theaters found
              </span>
              <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    aria-label="List view"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
            </div>
          )}
        </div>

          {/* Main Content */}
        {mainView === 'map' ? (
          <MapView />
          ) : mainView === 'favorites' ? (
            <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {theaters.filter(t => favorites.includes(t.id)).map(theater => (
                view === 'grid' 
                  ? <TheaterCard key={theater.id} theater={theater} />
                  : <TheaterListItem key={theater.id} theater={theater} />
              ))}
              {favorites.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <Heart className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">No favorites yet</h3>
                  <p className="text-slate-400">Click the heart icon on theaters to add them to your favorites</p>
                </div>
              )}
            </div>
        ) : (
          <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
            {filteredTheaters.map(theater => (
                view === 'grid' 
                  ? <TheaterCard key={theater.id} theater={theater} />
                  : <TheaterListItem key={theater.id} theater={theater} />
            ))}
          </div>
        )}

          {/* Empty State */}
        {mainView === 'theaters' && filteredTheaters.length === 0 && (
          <div className="text-center py-20">
            <Film className="w-20 h-20 text-slate-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-300 mb-2">No theaters found</h3>
              <p className="text-slate-400 mb-4">Try adjusting your search or filters</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ type: 'all', sound: 'all', projection: 'all', location: 'all' });
                }}
                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 text-center text-slate-500 text-sm">
            <p>Data includes {stats.total} active theaters and {stats.upcoming} upcoming venues</p>
            <p className="mt-1">Last updated: December 2025</p>
          </div>
        </div>
      </div>

      {/* Theater Detail Modal */}
      {selectedTheater && (
        <TheaterModal theater={selectedTheater} onClose={() => setSelectedTheater(null)} />
      )}
    </div>
  );
};

export default TheaterExplorer;
