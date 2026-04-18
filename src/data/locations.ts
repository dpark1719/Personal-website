export interface Country {
  name: string;
  isoCode: string;
  type: 'lived' | 'visited';
  detail: string;
}

export interface CityMarker {
  label: string;
  coords: [number, number]; // [longitude, latitude]
  type: 'lived' | 'visited';
  country: string;
  hasDot: boolean;
}

export interface Arc {
  from: [number, number];
  to: [number, number];
}

export const countries: Country[] = [
  { name: 'United States', isoCode: '840', type: 'lived', detail: 'Born, elementary school, high school, college — present' },
  { name: 'Japan', isoCode: '392', type: 'lived', detail: 'Early childhood, middle school' },
  { name: 'South Korea', isoCode: '410', type: 'lived', detail: 'After 1st year of college — military service' },
  { name: 'Thailand', isoCode: '764', type: 'visited', detail: 'Bangkok, Chiang Mai, Phuket' },
  { name: 'Laos', isoCode: '418', type: 'visited', detail: 'Vientiane, Luang Prabang' },
  { name: 'Vietnam', isoCode: '704', type: 'visited', detail: 'Hanoi, Da Nang, Ho Chi Minh' },
  { name: 'Cambodia', isoCode: '116', type: 'visited', detail: 'Phnom Penh, Siem Reap' },
  { name: 'Canada', isoCode: '124', type: 'visited', detail: 'Toronto' },
];

export const countryTypeByIso: Record<string, 'lived' | 'visited'> = Object.fromEntries(
  countries.map((c) => [c.isoCode, c.type]),
);

export const cityMarkers: CityMarker[] = [
  // United States — country label (no dot) + city dots
  { label: 'United States', coords: [-98.5, 39.8], type: 'lived', country: 'US', hasDot: false },
  { label: 'Los Angeles', coords: [-118.24, 34.05], type: 'lived', country: 'US', hasDot: true },
  { label: 'Chicago', coords: [-87.63, 41.88], type: 'lived', country: 'US', hasDot: true },
  { label: 'Madison', coords: [-89.40, 43.07], type: 'lived', country: 'US', hasDot: true },

  // Japan — country label only (Tokyo shown via flythrough overlay)
  { label: 'Japan', coords: [138.0, 36.0], type: 'lived', country: 'JP', hasDot: false },

  // South Korea — country label (no dot) + Seoul city dot
  { label: 'South Korea', coords: [128.0, 36.0], type: 'lived', country: 'KR', hasDot: false },
  { label: 'Seoul', coords: [126.98, 37.57], type: 'lived', country: 'KR', hasDot: true },

  // Canada — country label (no dot) + Toronto city dot
  { label: 'Canada', coords: [-96.0, 56.0], type: 'visited', country: 'CA', hasDot: false },
  { label: 'Toronto', coords: [-79.38, 43.65], type: 'visited', country: 'CA', hasDot: true },

  // Thailand
  { label: 'Bangkok', coords: [100.50, 13.76], type: 'visited', country: 'TH', hasDot: true },
  { label: 'Chiang Mai', coords: [98.98, 18.79], type: 'visited', country: 'TH', hasDot: true },
  { label: 'Phuket', coords: [98.39, 7.88], type: 'visited', country: 'TH', hasDot: true },

  // Laos
  { label: 'Vientiane', coords: [102.63, 17.98], type: 'visited', country: 'LA', hasDot: true },
  { label: 'Luang Prabang', coords: [102.13, 19.89], type: 'visited', country: 'LA', hasDot: true },

  // Cambodia
  { label: 'Phnom Penh', coords: [104.93, 11.56], type: 'visited', country: 'KH', hasDot: true },
  { label: 'Siem Reap', coords: [103.86, 13.36], type: 'visited', country: 'KH', hasDot: true },

  // Vietnam
  { label: 'Hanoi', coords: [105.83, 21.03], type: 'visited', country: 'VN', hasDot: true },
  { label: 'Da Nang', coords: [108.20, 16.05], type: 'visited', country: 'VN', hasDot: true },
  { label: 'Ho Chi Minh', coords: [106.63, 10.82], type: 'visited', country: 'VN', hasDot: true },
];

const LA: [number, number] = [-118.24, 34.05];
const TOKYO: [number, number] = [139.69, 35.68];
const CHICAGO: [number, number] = [-87.63, 41.88];
const SEOUL: [number, number] = [126.98, 37.57];

export const arcs: Arc[] = [
  { from: LA, to: TOKYO },
  { from: TOKYO, to: CHICAGO },
  { from: CHICAGO, to: TOKYO },
  { from: CHICAGO, to: SEOUL },
  { from: SEOUL, to: CHICAGO },
];

export const uniqueArcs: Arc[] = (() => {
  const seen = new Set<string>();
  return arcs.filter((a) => {
    const key = `${a.from.join(',')}->${a.to.join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();
