// Direct Unsplash CDN photo IDs — no API key required.
// URL format: https://images.unsplash.com/photo-{ID}?w=800&h=500&fit=crop&q=80&auto=format

function u(id, w = 800, h = 500) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`
}

// ── City / location photos shown on the card thumbnail + detail hero ──────────
export const CITY_HOTEL_PHOTOS = {
  Goa: [
    u('1512343879784-a960bf40e7f2'), // Goa beach aerial
    u('1507525428034-b723cf961d3e'), // tropical beach
    u('1559494007-9f5847c49d94'),    // palm shore
    u('1519046904884-53103b34b206'), // beach from above
    u('1503756234508-e180b02012f6'), // turquoise sea
    u('1596436873906-f8e91aec7961'), // beach sunset
  ],
  Mumbai: [
    u('1529253355930-ddbe423a2ac7'), // Marine Drive
    u('1567157577867-05d21c2b3b8b'), // Mumbai skyline
    u('1595658658481-d53d3f999875'), // Gateway of India
    u('1570168007204-dfb528c6958f'), // Mumbai cityscape
    u('1506905925346-21bda4d32df4'), // waterfront
    u('1445019980597-93fa8acb246c'), // hotel exterior
  ],
  Delhi: [
    u('1548013146-72479768bada'),    // India Gate
    u('1524492412937-b28074a5d7da'), // heritage monument
    u('1477587458883-47145ed6979e'), // fort
    u('1611262588024-d12430b98920'), // ornate architecture
    u('1585468274952-66591eb14165'), // sandstone
    u('1445019980597-93fa8acb246c'), // hotel exterior
  ],
  Bangalore: [
    u('1501854140801-50d01698950b'), // green city aerial
    u('1527631120902-378417754324'), // park & garden
    u('1476514525535-07fb3b4ae5f1'), // city lake
    u('1464822759023-fed622ff2c3b'), // urban greenery
    u('1445019980597-93fa8acb246c'), // hotel exterior
    u('1618773928121-c32242e63f39'), // hotel lobby
  ],
  Chennai: [
    u('1507525428034-b723cf961d3e'), // beach
    u('1559494007-9f5847c49d94'),    // coastal
    u('1524492412937-b28074a5d7da'), // heritage temple
    u('1519046904884-53103b34b206'), // beach aerial
    u('1445019980597-93fa8acb246c'), // hotel
    u('1618773928121-c32242e63f39'), // lobby
  ],
  Hyderabad: [
    u('1611262588024-d12430b98920'), // Charminar
    u('1524492412937-b28074a5d7da'), // Golconda fort
    u('1585468274952-66591eb14165'), // old city
    u('1477587458883-47145ed6979e'), // heritage
    u('1445019980597-93fa8acb246c'), // hotel
    u('1618773928121-c32242e63f39'), // lobby
  ],
  Jaipur: [
    u('1477587458883-47145ed6979e'), // Amber Fort
    u('1524492412937-b28074a5d7da'), // palace
    u('1611262588024-d12430b98920'), // ornate architecture
    u('1585468274952-66591eb14165'), // fort walls
    u('1493770348161-369560ae357d'), // desert dunes
    u('1526080652727-5b77f74e9b31'), // Rajasthan
  ],
  Kolkata: [
    u('1527631120902-378417754324'), // Hooghly river
    u('1524492412937-b28074a5d7da'), // Victoria Memorial
    u('1611262588024-d12430b98920'), // colonial architecture
    u('1476514525535-07fb3b4ae5f1'), // lake
    u('1445019980597-93fa8acb246c'), // hotel
    u('1618773928121-c32242e63f39'), // lobby
  ],
  Udaipur: [
    u('1524492412937-b28074a5d7da'), // City Palace
    u('1477587458883-47145ed6979e'), // fort/palace
    u('1476514525535-07fb3b4ae5f1'), // lake reflection
    u('1611262588024-d12430b98920'), // ornate arches
    u('1585468274952-66591eb14165'), // stone architecture
    u('1493770348161-369560ae357d'), // scenic
  ],
  Kochi: [
    u('1527631120902-378417754324'), // backwaters
    u('1501854140801-50d01698950b'), // coastal aerial
    u('1507525428034-b723cf961d3e'), // beach
    u('1524492412937-b28074a5d7da'), // heritage church
    u('1476514525535-07fb3b4ae5f1'), // waterway
    u('1519046904884-53103b34b206'), // aerial
  ],
  Manali: [
    u('1605649487212-47bdab064df7'), // snow mountains
    u('1506905925346-21bda4d32df4'), // mountain peaks
    u('1464822759023-fed622ff2c3b'), // mountain valley
    u('1476514525535-07fb3b4ae5f1'), // mountain lake
    u('1519681393784-d120267933ba'), // snowy night
    u('1491555103944-7c647fd857e6'), // alpine meadow
  ],
  Shimla: [
    u('1597069580476-e4e7b9e4e897'), // hillside town
    u('1506905925346-21bda4d32df4'), // mountain ridge
    u('1476514525535-07fb3b4ae5f1'), // mountain lake
    u('1464822759023-fed622ff2c3b'), // scenic valley
    u('1519681393784-d120267933ba'), // mountain night
    u('1605649487212-47bdab064df7'), // snow
  ],
  Darjeeling: [
    u('1501854140801-50d01698950b'), // tea estate hills
    u('1464822759023-fed622ff2c3b'), // misty mountains
    u('1506905925346-21bda4d32df4'), // Himalayan view
    u('1527631120902-378417754324'), // lush river valley
    u('1476514525535-07fb3b4ae5f1'), // hill lake
    u('1491555103944-7c647fd857e6'), // rolling hills
  ],
  Amritsar: [
    u('1611262588024-d12430b98920'), // Golden Temple
    u('1524492412937-b28074a5d7da'), // sacred site
    u('1585468274952-66591eb14165'), // stone temple
    u('1477587458883-47145ed6979e'), // heritage
    u('1527631120902-378417754324'), // sarovar
    u('1493770348161-369560ae357d'), // landscape
  ],
  Varanasi: [
    u('1561361058-c24cecae35ca'),    // Ganges ghats
    u('1593693397690-362cb9666fc2'), // aarti ceremony
    u('1524492412937-b28074a5d7da'), // temple
    u('1611262588024-d12430b98920'), // old architecture
    u('1527631120902-378417754324'), // river
    u('1585468274952-66591eb14165'), // stone steps
  ],
  Pune: [
    u('1524492412937-b28074a5d7da'), // heritage fort
    u('1477587458883-47145ed6979e'), // Sinhagad
    u('1501854140801-50d01698950b'), // aerial city
    u('1527631120902-378417754324'), // river
    u('1445019980597-93fa8acb246c'), // hotel exterior
    u('1618773928121-c32242e63f39'), // hotel lobby
  ],
  Ahmedabad: [
    u('1611262588024-d12430b98920'), // heritage step well
    u('1524492412937-b28074a5d7da'), // architecture
    u('1585468274952-66591eb14165'), // stone carving
    u('1477587458883-47145ed6979e'), // fort
    u('1445019980597-93fa8acb246c'), // hotel
    u('1618773928121-c32242e63f39'), // lobby
  ],
  Rishikesh: [
    u('1527631120902-378417754324'), // Ganges rapids
    u('1476514525535-07fb3b4ae5f1'), // river & hills
    u('1501854140801-50d01698950b'), // green valley
    u('1464822759023-fed622ff2c3b'), // hillside
    u('1491555103944-7c647fd857e6'), // meadow
    u('1506905925346-21bda4d32df4'), // mountain
  ],
  Nainital: [
    u('1476514525535-07fb3b4ae5f1'), // Naini Lake
    u('1506905925346-21bda4d32df4'), // hill mountains
    u('1501854140801-50d01698950b'), // aerial hills
    u('1464822759023-fed622ff2c3b'), // mist valley
    u('1491555103944-7c647fd857e6'), // meadow
    u('1519681393784-d120267933ba'), // night hills
  ],
  Chandigarh: [
    u('1501854140801-50d01698950b'), // garden city aerial
    u('1476514525535-07fb3b4ae5f1'), // Sukhna Lake
    u('1464822759023-fed622ff2c3b'), // rose garden
    u('1491555103944-7c647fd857e6'), // park
    u('1445019980597-93fa8acb246c'), // hotel
    u('1618773928121-c32242e63f39'), // lobby
  ],
  Jodhpur: [
    u('1477587458883-47145ed6979e'), // Mehrangarh Fort
    u('1585468274952-66591eb14165'), // blue city architecture
    u('1611262588024-d12430b98920'), // ornate carving
    u('1493770348161-369560ae357d'), // desert view
    u('1526080652727-5b77f74e9b31'), // Rajasthan landscape
    u('1524492412937-b28074a5d7da'), // palace
  ],
  Mysore: [
    u('1524492412937-b28074a5d7da'), // Mysore Palace
    u('1611262588024-d12430b98920'), // illuminated palace
    u('1585468274952-66591eb14165'), // heritage arches
    u('1477587458883-47145ed6979e'), // fort
    u('1501854140801-50d01698950b'), // aerial garden
    u('1491555103944-7c647fd857e6'), // landscape
  ],
  Leh: [
    u('1605649487212-47bdab064df7'), // high altitude mountains
    u('1519681393784-d120267933ba'), // starry sky mountains
    u('1476514525535-07fb3b4ae5f1'), // mountain lake
    u('1464822759023-fed622ff2c3b'), // barren valley
    u('1506905925346-21bda4d32df4'), // snow peaks
    u('1491555103944-7c647fd857e6'), // plateau
  ],
}

// ── Room photos by room type keyword ──────────────────────────────────────────
const ROOM_PHOTOS = {
  Standard: [
    u('1631049307264-da0ec9d70304', 600, 400), // standard hotel room
    u('1560185007-cde436f6a4d0', 600, 400),    // king bed room
    u('1584132967334-10e028bd69f7', 600, 400), // room interior
  ],
  Deluxe: [
    u('1590490360182-c33d57733427', 600, 400), // deluxe room
    u('1631049307264-da0ec9d70304', 600, 400), // room
    u('1568495248636-5d4a0e8b7b11', 600, 400), // bright room
  ],
  Suite: [
    u('1582719508461-ac21cf9cdb04', 600, 400), // luxury suite living area
    u('1590490360182-c33d57733427', 600, 400), // suite
    u('1631049307264-da0ec9d70304', 600, 400), // suite room
  ],
  Premium: [
    u('1590490360182-c33d57733427', 600, 400), // premium room
    u('1582719508461-ac21cf9cdb04', 600, 400), // premium suite
    u('1560185007-cde436f6a4d0', 600, 400),    // king bed
  ],
}

// ── Amenity photos keyed by amenity name ──────────────────────────────────────
export const AMENITY_PHOTOS = {
  Pool:             u('1566073771259-470de1bed1f7', 600, 400),
  'Swimming Pool':  u('1563911302-7aca31502937', 600, 400),
  Spa:              u('1544161515-4be31d52cef5', 600, 400),
  Gym:              u('1534438327276-14e5300c3a48', 600, 400),
  Fitness:          u('1571019614242-c5c5dee9f50b', 600, 400),
  Restaurant:       u('1414235077428-338989a2e8c0', 600, 400),
  'Fine Dining':    u('1517248135467-4c7edcad34c4', 600, 400),
  Bar:              u('1470337458703-70ad56d6a4c3', 600, 400),
  'Rooftop Bar':    u('1470337458703-70ad56d6a4c3', 600, 400),
  Beach:            u('1507525428034-b723cf961d3e', 600, 400),
  'Beach Access':   u('1519046904884-53103b34b206', 600, 400),
  Garden:           u('1501854140801-50d01698950b', 600, 400),
  'Business Centre':u('1497366216548-37526070297c', 600, 400),
  WiFi:             u('1497366216548-37526070297c', 600, 400),
  Concierge:        u('1618773928121-c32242e63f39', 600, 400),
  'Airport Shuttle':u('1570168007204-dfb528c6958f', 600, 400),
  'Valet Parking':  u('1570168007204-dfb528c6958f', 600, 400),
  Butler:           u('1618773928121-c32242e63f39', 600, 400),
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the thumbnail URL for a hotel card (first city photo). */
export function getHotelCardImage(hotel) {
  if (hotel.images?.[0]) return hotel.images[0]
  const cityPhotos = CITY_HOTEL_PHOTOS[hotel.city]
  if (cityPhotos) return cityPhotos[0]
  return `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/400/300`
}

/** Returns 6 hero/exterior photos for the hotel detail page. */
export function getHotelHeroPhotos(hotel) {
  const cityPhotos = CITY_HOTEL_PHOTOS[hotel.city]
  if (hotel.images?.length >= 3) return hotel.images.slice(0, 6)
  const base = cityPhotos || [
    u('1445019980597-93fa8acb246c'),
    u('1618773928121-c32242e63f39'),
    u('1566073771259-470de1bed1f7'),
    u('1631049307264-da0ec9d70304'),
    u('1497366216548-37526070297c'),
    u('1414235077428-338989a2e8c0'),
  ]
  return base.slice(0, 6)
}

/** Returns room photos for a given room type label. */
export function getRoomPhotos(roomType) {
  const key = Object.keys(ROOM_PHOTOS).find(k => roomType?.toLowerCase().includes(k.toLowerCase()))
  return ROOM_PHOTOS[key] || ROOM_PHOTOS.Standard
}

/** Returns an amenity photo URL or null if not mapped. */
export function getAmenityPhoto(amenityName) {
  const key = Object.keys(AMENITY_PHOTOS).find(k =>
    amenityName?.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(amenityName?.toLowerCase())
  )
  return key ? AMENITY_PHOTOS[key] : null
}
