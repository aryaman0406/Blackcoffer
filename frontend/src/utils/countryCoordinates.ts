export interface CountryCoord {
  lat: number;
  lng: number;
  iso?: string;
}

export const COUNTRY_COORDINATES: Record<string, CountryCoord> = {
  'united states of america': { lat: 37.0902, lng: -95.7129, iso: 'USA' },
  'united states': { lat: 37.0902, lng: -95.7129, iso: 'USA' },
  usa: { lat: 37.0902, lng: -95.7129, iso: 'USA' },
  us: { lat: 37.0902, lng: -95.7129, iso: 'USA' },
  'united kingdom': { lat: 55.3781, lng: -3.436, iso: 'GBR' },
  uk: { lat: 55.3781, lng: -3.436, iso: 'GBR' },
  russia: { lat: 61.524, lng: 105.3188, iso: 'RUS' },
  'russian federation': { lat: 61.524, lng: 105.3188, iso: 'RUS' },
  china: { lat: 35.8617, lng: 104.1954, iso: 'CHN' },
  india: { lat: 20.5937, lng: 78.9629, iso: 'IND' },
  germany: { lat: 51.1657, lng: 10.4515, iso: 'DEU' },
  france: { lat: 46.2276, lng: 2.2137, iso: 'FRA' },
  'saudi arabia': { lat: 23.8859, lng: 45.0792, iso: 'SAU' },
  brazil: { lat: -14.235, lng: -51.9253, iso: 'BRA' },
  nigeria: { lat: 9.082, lng: 8.6753, iso: 'NGA' },
  australia: { lat: -25.2744, lng: 133.7751, iso: 'AUS' },
  iran: { lat: 32.4279, lng: 53.688, iso: 'IRN' },
  iraq: { lat: 33.2232, lng: 43.6793, iso: 'IRQ' },
  japan: { lat: 36.2048, lng: 138.2529, iso: 'JPN' },
  canada: { lat: 56.1304, lng: -106.3468, iso: 'CAN' },
  mexico: { lat: 23.6345, lng: -102.5528, iso: 'MEX' },
  indonesia: { lat: -0.7893, lng: 113.9213, iso: 'IDN' },
  egypt: { lat: 26.8206, lng: 30.8025, iso: 'EGY' },
  'south africa': { lat: -30.5595, lng: 22.9375, iso: 'ZAF' },
  turkey: { lat: 38.9637, lng: 35.2433, iso: 'TUR' },
  italy: { lat: 41.8719, lng: 12.5674, iso: 'ITA' },
  spain: { lat: 40.4637, lng: -3.7492, iso: 'ESP' },
  poland: { lat: 51.9194, lng: 19.1451, iso: 'POL' },
  ukraine: { lat: 48.3794, lng: 31.1656, iso: 'UKR' },
  argentina: { lat: -38.4161, lng: -63.6167, iso: 'ARG' },
  colombia: { lat: 4.5709, lng: -74.2973, iso: 'COL' },
  venezuela: { lat: 6.4238, lng: -66.5897, iso: 'VEN' },
  pakistan: { lat: 30.3753, lng: 69.3451, iso: 'PAK' },
  bangladesh: { lat: 23.685, lng: 90.3563, iso: 'BGD' },
  vietnam: { lat: 14.0583, lng: 108.2772, iso: 'VNM' },
  'south korea': { lat: 35.9078, lng: 127.7669, iso: 'KOR' },
  malaysia: { lat: 4.2105, lng: 101.9758, iso: 'MYS' },
  philippines: { lat: 12.8797, lng: 121.774, iso: 'PHL' },
  thailand: { lat: 15.87, lng: 100.9925, iso: 'THA' },
  singapore: { lat: 1.3521, lng: 103.8198, iso: 'SGP' },
  uae: { lat: 23.4241, lng: 53.8478, iso: 'ARE' },
  'united arab emirates': { lat: 23.4241, lng: 53.8478, iso: 'ARE' },
  qatar: { lat: 25.3548, lng: 51.1839, iso: 'QAT' },
  kuwait: { lat: 29.3117, lng: 47.4818, iso: 'KWT' },
  oman: { lat: 21.5126, lng: 55.9233, iso: 'OMN' },
  norway: { lat: 60.472, lng: 8.4689, iso: 'NOR' },
  sweden: { lat: 60.1282, lng: 18.6435, iso: 'SWE' },
  denmark: { lat: 56.2639, lng: 9.5018, iso: 'DNK' },
  netherlands: { lat: 52.1326, lng: 5.2913, iso: 'NLD' },
  belgium: { lat: 50.5039, lng: 4.4699, iso: 'BEL' },
  switzerland: { lat: 46.8182, lng: 8.2275, iso: 'CHE' },
  austria: { lat: 47.5162, lng: 14.5501, iso: 'AUT' },
  greece: { lat: 39.0742, lng: 21.8243, iso: 'GRC' },
  algeria: { lat: 28.0339, lng: 1.6596, iso: 'DZA' },
  libya: { lat: 26.3351, lng: 17.2283, iso: 'LBY' },
  angola: { lat: -11.2027, lng: 17.8739, iso: 'AGO' },
  ghana: { lat: 7.9465, lng: -1.0232, iso: 'GHA' },
  kenya: { lat: -0.0236, lng: 37.9062, iso: 'KEN' },
  ethiopia: { lat: 9.145, lng: 40.4897, iso: 'ETH' },
  morocco: { lat: 31.7917, lng: -7.0926, iso: 'MAR' },
  kazakhstan: { lat: 48.0196, lng: 66.9237, iso: 'KAZ' },
  azerbaijan: { lat: 40.1431, lng: 47.5769, iso: 'AZE' },
  jordan: { lat: 30.5852, lng: 36.2384, iso: 'JOR' },
  lebanon: { lat: 33.8547, lng: 35.8623, iso: 'LBN' },
  syria: { lat: 34.8021, lng: 38.9968, iso: 'SYR' },
  israel: { lat: 31.0461, lng: 34.8516, iso: 'ISR' },
  myanmar: { lat: 21.9162, lng: 95.956, iso: 'MMR' },
  chile: { lat: -35.6751, lng: -71.543, iso: 'CHL' },
  peru: { lat: -9.19, lng: -75.0152, iso: 'PER' },
  bolivia: { lat: -16.2902, lng: -63.5887, iso: 'BOL' },
  ecuador: { lat: -1.8312, lng: -78.1834, iso: 'ECU' },
  belize: { lat: 17.1899, lng: -88.4976, iso: 'BLZ' },
  cuba: { lat: 21.5218, lng: -77.7812, iso: 'CUB' },
  hungary: { lat: 47.1625, lng: 19.5033, iso: 'HUN' },
  romania: { lat: 45.9432, lng: 24.9668, iso: 'ROU' },
  czechia: { lat: 49.8175, lng: 15.473, iso: 'CZE' },
  'czech republic': { lat: 49.8175, lng: 15.473, iso: 'CZE' },
  estonia: { lat: 58.5953, lng: 25.0136, iso: 'EST' },
  latvia: { lat: 56.8796, lng: 24.6032, iso: 'LVA' },
  lithuania: { lat: 55.1694, lng: 23.8813, iso: 'LTU' },
  finland: { lat: 61.9241, lng: 25.7482, iso: 'FIN' },
  cyprus: { lat: 35.1264, lng: 33.4299, iso: 'CYP' },
  tanzania: { lat: -6.369, lng: 34.8888, iso: 'TZA' },
  mali: { lat: 17.5707, lng: -3.9962, iso: 'MLI' },
  niger: { lat: 17.6078, lng: 8.0817, iso: 'NER' },
  liberia: { lat: 6.4281, lng: -9.4295, iso: 'LBR' },
  uganda: { lat: 1.3733, lng: 32.2903, iso: 'UGA' },
  burkina: { lat: 12.2383, lng: -1.5616, iso: 'BFA' },
  'burkina faso': { lat: 12.2383, lng: -1.5616, iso: 'BFA' },
  zambia: { lat: -13.1339, lng: 27.8493, iso: 'ZMB' },
  zimbabwe: { lat: -19.0154, lng: 29.1549, iso: 'ZWE' },
};

/**
 * Converts Latitude and Longitude to 3D Cartesian coordinates on a sphere of radius R
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = 2.0,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

export function getCountryCoordinates(countryName: string): CountryCoord | null {
  if (!countryName) return null;
  const lower = countryName.toLowerCase().trim();
  return COUNTRY_COORDINATES[lower] ?? null;
}
