import { useState, useCallback, useRef } from 'react';
import { countries, type CityMarker } from '../data/locations';
import { useReveal } from '../hooks/useReveal';
import GlobeMap, {
  type LandmarkInfo,
  type GlobeMapHandle,
  TIMELINE_STOPS,
} from './GlobeMap';

const livedCountries = countries.filter((c) => c.type === 'lived');
const visitedCountries = countries.filter((c) => c.type === 'visited');

const U = 'https://images.unsplash.com';
const CITY_LANDMARKS: Record<string, string> = {
  'Los Angeles': `${U}/photo-1534253893894-10d024888e49?w=400&q=80&auto=format&fit=crop`,
  'Tokyo':       `${U}/photo-1505814360303-5bfcf2a8acb6?w=400&q=80&auto=format&fit=crop`,
  'Chicago':     `${U}/photo-1770174079278-030cf8f7cdae?w=400&q=80&auto=format&fit=crop`,
  'Seoul':       `${U}/photo-1745155487876-b7747cce33e1?w=400&q=80&auto=format&fit=crop`,
  'Bangkok':     `${U}/photo-1747235156815-3b39a7097b7b?w=400&q=80&auto=format&fit=crop`,
  'Luang Prabang': `${U}/photo-1762947891065-e53eb2a21711?w=400&q=80&auto=format&fit=crop`,
  'Siem Reap':   `${U}/photo-1768882902762-b0c17224c875?w=400&q=80&auto=format&fit=crop`,
  'Madison':     `${U}/photo-1496144300411-8dd31ce145ba?w=400&q=80&auto=format&fit=crop`,
  'Toronto':     `${U}/photo-1437326516294-01d0da392e11?w=400&q=80&auto=format&fit=crop`,
  'Chiang Mai':  `${U}/photo-1512553840337-276c0d80a43a?w=400&q=80&auto=format&fit=crop`,
  'Phuket':      `${U}/photo-1653409918364-7491fa4c12fe?w=400&q=80&auto=format&fit=crop`,
  'Vientiane':   `${U}/photo-1704212685546-3086abc1e6a1?w=400&q=80&auto=format&fit=crop`,
  'Phnom Penh':  `${U}/photo-1762091486050-5be11ee3c8d7?w=400&q=80&auto=format&fit=crop`,
  'Hanoi':       `${U}/photo-1753380226922-06a65b17ddf2?w=400&q=80&auto=format&fit=crop`,
  'Da Nang':     `${U}/photo-1748674278237-00d4bc40fe2c?w=400&q=80&auto=format&fit=crop`,
  'Ho Chi Minh': `${U}/photo-1578031894526-2e165e29f9d2?w=400&q=80&auto=format&fit=crop`,
};

const LAST_STOP = TIMELINE_STOPS.length - 1;
const stopPct = (i: number) => (i / LAST_STOP) * 100;

const PERIODS = [
  { label: 'Birth', start: 0, end: 0 },
  { label: 'Growing Up', start: 1, end: 4 },
  { label: 'Military', start: 5, end: 5 },
  { label: 'Backpacking', start: 6, end: 9 },
  { label: 'Present', start: 10, end: 10 },
] as const;

const SEPARATORS = [0.5, 4.5, 5.5, 9.5];

export default function Experiences() {
  const ref = useReveal<HTMLElement>();
  const [hovered, setHovered] = useState<CityMarker | null>(null);
  const [landmark, setLandmark] = useState<LandmarkInfo | null>(null);
  const [landmarkKey, setLandmarkKey] = useState(0);
  const [currentStop, setCurrentStop] = useState(-1);
  const [, setIsPlaying] = useState(true);

  const globeRef = useRef<GlobeMapHandle>(null);
  const prevSnapRef = useRef(-1);

  const handleHover = useCallback((m: CityMarker | null) => setHovered(m), []);
  const handleLandmark = useCallback((lm: LandmarkInfo | null) => {
    setLandmark(lm);
    if (lm) setLandmarkKey((k) => k + 1);
  }, []);
  const handleStopChange = useCallback((i: number) => setCurrentStop(i), []);
  const handleAnimationEnd = useCallback(() => setIsPlaying(false), []);

  const handleReplay = useCallback(() => {
    setIsPlaying(true);
    setCurrentStop(-1);
    prevSnapRef.current = -1;
    globeRef.current?.replay();
  }, []);

  const handleTrackPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);

      const snap = (clientX: number, dur: number) => {
        const rect = el.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const stop = Math.round(pct * LAST_STOP);
        if (stop === prevSnapRef.current) return;
        prevSnapRef.current = stop;
        setIsPlaying(false);
        setCurrentStop(stop);
        globeRef.current?.goToStop(stop, dur);
      };

      snap(e.clientX, 600);

      const onMove = (ev: PointerEvent) => snap(ev.clientX, 0);
      const onUp = () => {
        el.removeEventListener('pointermove', onMove);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp, { once: true });
      el.addEventListener('pointercancel', onUp, { once: true });
    },
    [],
  );

  const fillPct = currentStop >= 0 ? stopPct(currentStop) : 0;

  return (
    <section className="section section-alt" id="experiences" ref={ref}>
      <div className="container-wide">
        <h2 className="section-title reveal">Life Experiences</h2>
        <div className="section-narrative reveal">
          <p>Los Angeles was my beginning. Tokyo shaped my foundation. Chicago built my identity.</p>
          <p>I walked away from comfort — returning alone to carve my own path.</p>
          <p>I chose adversity on purpose, stepping into the Korean Marines to test my limits and grow beyond them.</p>
          <p>Now in Madison, I&#39;m in the process — refining my skills and preparing for what&#39;s next.</p>
        </div>

        <div className="globe-layout reveal">
          <div className="globe-wrapper">
            <GlobeMap
              ref={globeRef}
              onHover={handleHover}
              onLandmark={handleLandmark}
              onStopChange={handleStopChange}
              onAnimationEnd={handleAnimationEnd}
            />

            {hovered && (
              <div className="globe-info-card">
                {CITY_LANDMARKS[hovered.label] && (
                  <img
                    className="info-card-img"
                    src={CITY_LANDMARKS[hovered.label]}
                    alt={hovered.label}
                  />
                )}
                <div className="info-card-text">
                  <span className={`map-tooltip-badge ${hovered.type}`}>
                    {hovered.type === 'lived' ? 'Lived In' : 'Visited'}
                  </span>
                  <h4>{hovered.label}</h4>
                </div>
              </div>
            )}

            {landmark && (
              <div className="city-overlay" key={landmarkKey}>
                <div className="city-overlay-card">
                  <img
                    className="city-overlay-img"
                    src={landmark.image}
                    alt={landmark.name}
                  />
                  <h3 className="city-overlay-name">{landmark.city}</h3>
                </div>
              </div>
            )}

            <button
              className="replay-btn"
              onClick={handleReplay}
              title="Replay animation"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
              </svg>
            </button>
          </div>

          <div className="globe-legend-panel">
            <div className="legend-section">
              <div className="legend-section-header">
                <span className="map-legend-swatch lived" />
                <span className="legend-section-title">Lived In</span>
              </div>
              <ul className="legend-country-list">
                {livedCountries.map((c) => (
                  <li key={c.isoCode} className="legend-country-item">
                    <span className="legend-country-name">{c.name}</span>
                    <span className="legend-country-detail">{c.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="legend-section">
              <div className="legend-section-header">
                <span className="map-legend-swatch visited" />
                <span className="legend-section-title">Visited</span>
              </div>
              <ul className="legend-country-list">
                {visitedCountries.map((c) => (
                  <li key={c.isoCode} className="legend-country-item">
                    <span className="legend-country-name">{c.name}</span>
                    <span className="legend-country-detail">{c.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Life timeline ── */}
        <div className="life-timeline reveal">
          <div className="tl-labels">
            {PERIODS.map((p) => (
              <span
                key={p.label}
                className={`tl-label ${
                  currentStop >= p.start && currentStop <= p.end ? 'active' : ''
                }`}
                style={{ left: `${stopPct((p.start + p.end) / 2)}%` }}
              >
                {p.label}
              </span>
            ))}
          </div>

          <div className="tl-track-area" onPointerDown={handleTrackPointer}>
            <div className="tl-track">
              <div className="tl-fill" style={{ width: `${fillPct}%` }} />
            </div>

            {SEPARATORS.map((pos) => (
              <div
                key={pos}
                className="tl-separator"
                style={{ left: `${stopPct(pos)}%` }}
              />
            ))}

            {TIMELINE_STOPS.map((stop, i) => (
              <button
                key={i}
                className={`tl-stop${i <= currentStop ? ' past' : ''}${
                  i === currentStop ? ' active' : ''
                }`}
                style={{ left: `${stopPct(i)}%` }}
                title={stop.city}
                tabIndex={-1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
