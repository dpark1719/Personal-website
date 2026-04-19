import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import Globe from 'globe.gl';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { cityMarkers, countryTypeByIso, type CityMarker } from '../data/locations';

interface CountryFeature {
  id?: string;
  type: string;
  properties: Record<string, unknown>;
  geometry: { type: string; coordinates: unknown };
}

export interface LandmarkInfo {
  city: string;
  name: string;
  countryIso: string;
  image: string;
}

interface Waypoint {
  lat: number;
  lng: number;
  altitude: number;
  flyMs: number;
  dwellMs: number;
  landmark?: LandmarkInfo;
}

const FAR = 2.5;
const CITY = 0.4;
const REGION = 0.5;
const HIGHLIGHT_COLOR = '#f0943a';

const US = 'https://images.unsplash.com';

const FLYTHROUGH: Waypoint[] = [
  // ── US overview ──
  { lat: 39.8, lng: -98.5, altitude: FAR, flyMs: 0, dwellMs: 600 },

  // ── LA: zoom in, dwell, zoom out ──
  { lat: 34.05, lng: -118.24, altitude: CITY, flyMs: 1800, dwellMs: 1200,
    landmark: { city: 'Los Angeles', name: 'Hollywood Sign', countryIso: '840',
      image: `${US}/photo-1534253893894-10d024888e49?w=640&q=80&auto=format&fit=crop` } },
  { lat: 34.05, lng: -118.24, altitude: FAR, flyMs: 1000, dwellMs: 0 },

  // ── Fly to Tokyo, zoom in, dwell, zoom out ──
  { lat: 35.68, lng: 139.69, altitude: FAR, flyMs: 2200, dwellMs: 0 },
  { lat: 35.68, lng: 139.69, altitude: CITY, flyMs: 1000, dwellMs: 1200,
    landmark: { city: 'Tokyo', name: 'Tokyo Tower', countryIso: '392',
      image: `${US}/photo-1505814360303-5bfcf2a8acb6?w=640&q=80&auto=format&fit=crop` } },
  { lat: 35.68, lng: 139.69, altitude: FAR, flyMs: 1000, dwellMs: 0 },

  // ── Fly to Chicago (elementary school), zoom in, dwell, zoom out ──
  { lat: 41.88, lng: -87.63, altitude: FAR, flyMs: 2200, dwellMs: 0 },
  { lat: 41.88, lng: -87.63, altitude: CITY, flyMs: 1000, dwellMs: 900,
    landmark: { city: 'Chicago', name: 'Cloud Gate', countryIso: '840',
      image: `${US}/photo-1770174079278-030cf8f7cdae?w=640&q=80&auto=format&fit=crop` } },
  { lat: 41.88, lng: -87.63, altitude: FAR, flyMs: 1000, dwellMs: 0 },

  // ── Back to Tokyo, zoom in, dwell, zoom out ──
  { lat: 35.68, lng: 139.69, altitude: FAR, flyMs: 2200, dwellMs: 0 },
  { lat: 35.68, lng: 139.69, altitude: CITY, flyMs: 1000, dwellMs: 900,
    landmark: { city: 'Tokyo', name: 'Shibuya Crossing', countryIso: '392',
      image: `${US}/photo-1764418658791-771bb04efdcd?w=640&q=80&auto=format&fit=crop` } },
  { lat: 35.68, lng: 139.69, altitude: FAR, flyMs: 1000, dwellMs: 0 },

  // ── Back to Chicago (high school / college), zoom in, dwell, zoom out ──
  { lat: 41.88, lng: -87.63, altitude: FAR, flyMs: 2200, dwellMs: 0 },
  { lat: 41.88, lng: -87.63, altitude: CITY, flyMs: 1000, dwellMs: 900,
    landmark: { city: 'Chicago', name: 'Green River on St. Patricks', countryIso: '840',
      image: `${US}/photo-1615831510725-2ab490027cf2?w=640&q=80&auto=format&fit=crop` } },
  { lat: 41.88, lng: -87.63, altitude: FAR, flyMs: 1000, dwellMs: 0 },

  // ── Fly to Seoul, zoom in, dwell ──
  { lat: 37.57, lng: 126.98, altitude: FAR, flyMs: 2200, dwellMs: 0 },
  { lat: 37.57, lng: 126.98, altitude: CITY, flyMs: 1000, dwellMs: 1200,
    landmark: { city: 'Seoul', name: 'N Seoul Tower', countryIso: '410',
      image: `${US}/photo-1745155487876-b7747cce33e1?w=640&q=80&auto=format&fit=crop` } },

  // ── Pull out to regional for SE Asia tour ──
  { lat: 37.57, lng: 126.98, altitude: 1.2, flyMs: 700, dwellMs: 0 },

  // ── SE Asia: pan between stops at regional zoom ──
  { lat: 15.87, lng: 100.99, altitude: REGION, flyMs: 1800, dwellMs: 700,
    landmark: { city: 'Bangkok', name: 'Wat Arun', countryIso: '764',
      image: `${US}/photo-1747235156815-3b39a7097b7b?w=640&q=80&auto=format&fit=crop` } },
  { lat: 19.86, lng: 102.50, altitude: REGION, flyMs: 900, dwellMs: 500,
    landmark: { city: 'Luang Prabang', name: 'Kuang Si Falls', countryIso: '418',
      image: `${US}/photo-1762947891065-e53eb2a21711?w=640&q=80&auto=format&fit=crop` } },
  { lat: 14.06, lng: 108.28, altitude: REGION, flyMs: 1000, dwellMs: 500,
    landmark: { city: 'Vietnam', name: 'Ha Long Bay', countryIso: '704',
      image: `${US}/photo-1772867342647-6e6d87a0b014?w=640&q=80&auto=format&fit=crop` } },
  { lat: 12.57, lng: 104.99, altitude: REGION, flyMs: 900, dwellMs: 600,
    landmark: { city: 'Siem Reap', name: 'Angkor Wat', countryIso: '116',
      image: `${US}/photo-1768882902762-b0c17224c875?w=640&q=80&auto=format&fit=crop` } },

  // ── Zoom out, fly to Madison, zoom in (final) ──
  { lat: 12.57, lng: 104.99, altitude: FAR, flyMs: 1000, dwellMs: 0 },
  { lat: 43.07, lng: -89.40, altitude: FAR, flyMs: 2500, dwellMs: 0 },
  { lat: 43.07, lng: -89.40, altitude: 0.6, flyMs: 1200, dwellMs: 0,
    landmark: { city: 'Madison', name: 'State Capitol', countryIso: '840',
      image: `${US}/photo-1496144300411-8dd31ce145ba?w=640&q=80&auto=format&fit=crop` } },
];

// Shared with Experiences for the timeline UI.
// eslint-disable-next-line react-refresh/only-export-components
export const TIMELINE_STOPS = [
  { wpIndex: 1, city: 'LA' },
  { wpIndex: 4, city: 'Tokyo' },
  { wpIndex: 7, city: 'Chicago' },
  { wpIndex: 10, city: 'Tokyo' },
  { wpIndex: 13, city: 'Chicago' },
  { wpIndex: 16, city: 'Seoul' },
  { wpIndex: 18, city: 'Bangkok' },
  { wpIndex: 19, city: 'Luang Prabang' },
  { wpIndex: 20, city: 'Vietnam' },
  { wpIndex: 21, city: 'Cambodia' },
  { wpIndex: 24, city: 'Madison' },
] as const;

const WP_TO_STOP: Record<number, number> = {};
TIMELINE_STOPS.forEach((s, i) => { WP_TO_STOP[s.wpIndex] = i; });

const labelData = cityMarkers
  .filter((m) => m.hasDot)
  .map((m) => ({
    lat: m.coords[1],
    lng: m.coords[0],
    text: m.label,
    locType: m.type,
    hasDot: m.hasDot,
    country: m.country,
  }));

const FLAG_ISO_MAP: Record<string, string> = {
  '840': 'us', '392': 'jp', '410': 'kr', '764': 'th',
  '418': 'la', '704': 'vn', '116': 'kh', '124': 'ca',
};

const FLAG_VERT = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLAG_FRAG = `
  uniform sampler2D flagTex;
  uniform vec4 bbox;
  uniform vec3 baseColor;
  uniform float flagMix;
  varying vec3 vPos;
  void main() {
    vec3 n = normalize(vPos);
    float lat = asin(clamp(n.y, -1.0, 1.0));
    float lng = atan(n.x, n.z);
    float u = clamp((lng - bbox.x) / (bbox.y - bbox.x), 0.0, 1.0);
    float v = clamp(1.0 - (lat - bbox.z) / (bbox.w - bbox.z), 0.0, 1.0);
    vec4 flag = texture2D(flagTex, vec2(u, v));
    vec3 color = mix(baseColor, flag.rgb, flagMix);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function flattenCoords(c: unknown): number[][] {
  if (Array.isArray(c) && typeof c[0] === 'number') return [c as number[]];
  return (c as unknown[]).flatMap(flattenCoords);
}

function geoBBox(geom: { coordinates: unknown }) {
  const pts = flattenCoords(geom.coordinates);
  let mnLn = Infinity, mxLn = -Infinity, mnLt = Infinity, mxLt = -Infinity;
  for (const [ln, lt] of pts) {
    if (ln < mnLn) mnLn = ln;
    if (ln > mxLn) mxLn = ln;
    if (lt < mnLt) mnLt = lt;
    if (lt > mxLt) mxLt = lt;
  }
  return { minLng: mnLn, maxLng: mxLn, minLat: mnLt, maxLat: mxLt };
}

export interface GlobeMapHandle {
  replay: () => void;
  goToStop: (stopIndex: number, durationMs?: number) => void;
}

interface GlobeMapProps {
  onHover: (marker: CityMarker | null) => void;
  onLandmark?: (landmark: LandmarkInfo | null) => void;
  onStopChange?: (stopIndex: number) => void;
  onAnimationEnd?: () => void;
}

const GlobeMap = forwardRef<GlobeMapHandle, GlobeMapProps>(function GlobeMap(
  { onHover, onLandmark, onStopChange, onAnimationEnd },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onLandmarkRef = useRef(onLandmark);
  onLandmarkRef.current = onLandmark;
  const onStopChangeRef = useRef(onStopChange);
  onStopChangeRef.current = onStopChange;
  const onAnimationEndRef = useRef(onAnimationEnd);
  onAnimationEndRef.current = onAnimationEnd;
  const ctrlRef = useRef<GlobeMapHandle | null>(null);

  const handleLabelHover = useCallback(
    (obj: object | null) => {
      if (!obj) { onHover(null); return; }
      const d = obj as { text: string; hasDot: boolean };
      if (!d.hasDot) { onHover(null); return; }
      onHover(cityMarkers.find((m) => m.label === d.text) ?? null);
    },
    [onHover],
  );

  useImperativeHandle(ref, () => ({
    replay: () => ctrlRef.current?.replay(),
    goToStop: (i: number, ms?: number) => ctrlRef.current?.goToStop(i, ms),
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let activeIso: string | null = null;
    let polygonsReady = false;
    const flagMats: Record<string, THREE.ShaderMaterial> = {};
    const colorMats: Record<string, THREE.MeshLambertMaterial> = {};

    const getColorMat = (hex: string) => {
      if (!colorMats[hex]) colorMats[hex] = new THREE.MeshLambertMaterial({ color: hex });
      return colorMats[hex];
    };

    const BASE_COLORS: Record<string, string> = { lived: '#8fb0d3', visited: '#8fc3a7' };

    const capMaterial = (d: object): THREE.Material => {
      const id = (d as CountryFeature).id;
      if (id && flagMats[id]) return flagMats[id];
      if (id && id === activeIso) return getColorMat(HIGHLIGHT_COLOR);
      const type = id ? countryTypeByIso[id] : undefined;
      if (type) return getColorMat(BASE_COLORS[type]);
      return getColorMat('#e8e4de');
    };

    const capAlt = (d: object) => {
      const id = (d as CountryFeature).id;
      if (id && id === activeIso) return 0.025;
      return id && countryTypeByIso[id] ? 0.01 : 0.003;
    };

    const setHighlight = (iso: string | null) => {
      const prev = activeIso;
      activeIso = iso;
      if (!polygonsReady) return;
      if (prev && flagMats[prev]) {
        const t = countryTypeByIso[prev];
        flagMats[prev].uniforms.baseColor.value.set(BASE_COLORS[t] ?? '#e8e4de');
      }
      if (iso && flagMats[iso]) {
        flagMats[iso].uniforms.baseColor.value.set(HIGHLIGHT_COLOR);
      }
      (globe as unknown as { polygonCapMaterial: (fn: (d: object) => THREE.Material) => void })
        .polygonCapMaterial((obj) => capMaterial(obj));
      globe.polygonAltitude((obj) => capAlt(obj));
    };

    const globe = new Globe(container)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#aecde0')
      .atmosphereAltitude(0.2)
      .showGlobe(true)
      .pointOfView(FLYTHROUGH[0], 0);

    const mat = globe.globeMaterial() as unknown as {
      color: { set: (c: string) => void };
      emissive: { set: (c: string) => void };
      emissiveIntensity: number;
    };
    mat.color.set('#eae6df');
    mat.emissive.set('#eae6df');
    mat.emissiveIntensity = 0.06;

    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((topo: Topology<{ countries: GeometryCollection }>) => {
        const geo = feature(topo, topo.objects.countries);
        const features = geo.features as unknown as CountryFeature[];

        const loader = new THREE.TextureLoader();
        for (const feat of features) {
          const iso = feat.id;
          if (!iso || !FLAG_ISO_MAP[iso]) continue;
          const iso2 = FLAG_ISO_MAP[iso];
          const bbox = geoBBox(feat.geometry as unknown as { coordinates: unknown });
          const type = countryTypeByIso[iso];
          const tex = loader.load(`https://flagcdn.com/w320/${iso2}.png`);
          tex.minFilter = THREE.LinearFilter;

          flagMats[iso] = new THREE.ShaderMaterial({
            uniforms: {
              flagTex: { value: tex },
              bbox: {
                value: new THREE.Vector4(
                  THREE.MathUtils.degToRad(bbox.minLng),
                  THREE.MathUtils.degToRad(bbox.maxLng),
                  THREE.MathUtils.degToRad(bbox.minLat),
                  THREE.MathUtils.degToRad(bbox.maxLat),
                ),
              },
              baseColor: {
                value: new THREE.Color(BASE_COLORS[type] ?? '#e8e4de'),
              },
              flagMix: { value: 0.55 },
            },
            vertexShader: FLAG_VERT,
            fragmentShader: FLAG_FRAG,
          });
        }

        const g = globe as unknown as {
          polygonCapMaterial: (fn: (d: object) => THREE.Material) => typeof globe;
        };
        g.polygonCapMaterial((d) => capMaterial(d));

        globe
          .polygonsData(features as unknown as object[])
          // three-globe's GeoJsonGeometry is narrower than RFC GeoJSON; runtime shapes match
          .polygonGeoJsonGeometry((d) => (d as CountryFeature).geometry as never)
          .polygonSideColor(() => 'rgba(200,195,185,0.15)')
          .polygonStrokeColor(() => '#ccc8c0')
          .polygonAltitude((d) => capAlt(d));

        polygonsReady = true;
      });

    // ── Airplane marker ──
    const planeEl = document.createElement('div');
    planeEl.innerHTML = `<svg viewBox="0 0 24 24" width="26" height="26" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));transition:transform 0.3s ease"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#1565C0" stroke="#fff" stroke-width="0.6"/></svg>`;
    planeEl.style.cssText = 'opacity:0;transition:opacity 0.35s ease;pointer-events:none;';
    const planeSvg = planeEl.querySelector('svg') as SVGSVGElement;

    const planeDatum = { id: 'plane', lat: FLYTHROUGH[0].lat, lng: FLYTHROUGH[0].lng };
    const planeData = [planeDatum];

    globe
      .htmlElementsData(planeData)
      .htmlLat((d: object) => (d as { lat: number }).lat)
      .htmlLng((d: object) => (d as { lng: number }).lng)
      .htmlAltitude(() => 0.06)
      .htmlElement(() => planeEl)
      .htmlTransitionDuration(0);

    const showPlane = () => { planeEl.style.opacity = '1'; };
    const hidePlane = () => { planeEl.style.opacity = '0'; };

    let planeLat = FLYTHROUGH[0].lat;
    let planeLng = FLYTHROUGH[0].lng;
    let planeRaf = 0;

    const movePlane = (toLat: number, toLng: number, ms: number) => {
      cancelAnimationFrame(planeRaf);
      const fromLat = planeLat;
      const fromLng = planeLng;
      let dLng = toLng - fromLng;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;
      planeSvg.style.transform = `rotate(${dLng >= 0 ? 90 : -90}deg)`;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - t0) / ms, 1);
        planeDatum.lat = fromLat + (toLat - fromLat) * t;
        planeDatum.lng = fromLng + dLng * t;
        globe.htmlElementsData(planeData);
        if (t < 1) planeRaf = requestAnimationFrame(step);
      };
      planeRaf = requestAnimationFrame(step);
      planeLat = toLat;
      planeLng = toLng;
    };

    const teleportPlane = (lat: number, lng: number) => {
      cancelAnimationFrame(planeRaf);
      planeDatum.lat = lat;
      planeDatum.lng = lng;
      globe.htmlElementsData(planeData);
      planeLat = lat;
      planeLng = lng;
    };

    globe
      .labelsData(labelData)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('text')
      .labelColor((d) => {
        const m = d as { locType: string; hasDot: boolean };
        if (!m.hasDot) return 'rgba(30,30,30,0.5)';
        return m.locType === 'lived' ? '#1a1a1a' : '#2a6e4e';
      })
      .labelSize((d) => {
        const m = d as { locType: string; hasDot: boolean };
        if (!m.hasDot) return 1.1;
        return m.locType === 'lived' ? 0.7 : 0.45;
      })
      .labelDotRadius((d) =>
        (d as { locType: string; hasDot: boolean }).locType === 'lived' ? 0.35 : 0.18,
      )
      .labelDotOrientation(() => 'top' as const)
      .labelAltitude(0.015)
      .labelResolution(3)
      .labelIncludeDot((d) => (d as { hasDot: boolean }).hasDot)
      .onLabelHover(handleLabelHover);

    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 110;
    controls.maxDistance = 600;
    controls.enablePan = false;
    controls.autoRotate = false;

    // ── Animation controller ──
    let timers: number[] = [];
    let flyId = 0;
    let pointerCancelHandler: (() => void) | null = null;

    const stopAnimation = () => {
      flyId++;
      timers.forEach(clearTimeout);
      timers = [];
      cancelAnimationFrame(planeRaf);
      planeRaf = 0;
      hidePlane();
      controls.autoRotate = false;
    };

    const runFlythrough = () => {
      stopAnimation();
      const myId = flyId;

      setHighlight(null);
      onLandmarkRef.current?.(null);
      planeLat = FLYTHROUGH[0].lat;
      planeLng = FLYTHROUGH[0].lng;
      teleportPlane(planeLat, planeLng);
      globe.pointOfView(FLYTHROUGH[0], 0);

      let delay = FLYTHROUGH[0].dwellMs;
      for (let i = 1; i < FLYTHROUGH.length; i++) {
        const wp = FLYTHROUGH[i];
        const prev = FLYTHROUGH[i - 1];
        const posChanged = wp.lat !== prev.lat || wp.lng !== prev.lng;

        const tid = window.setTimeout(() => {
          if (flyId !== myId) return;

          if (wp.landmark && !posChanged) {
            hidePlane();
          } else if (posChanged) {
            showPlane();
            movePlane(wp.lat, wp.lng, wp.flyMs);
          } else {
            teleportPlane(wp.lat, wp.lng);
            showPlane();
          }

          setHighlight(wp.landmark?.countryIso ?? null);
          onLandmarkRef.current?.(wp.landmark ?? null);
          const stopIdx = WP_TO_STOP[i];
          if (stopIdx !== undefined) onStopChangeRef.current?.(stopIdx);

          globe.pointOfView(
            { lat: wp.lat, lng: wp.lng, altitude: wp.altitude },
            wp.flyMs,
          );
        }, delay);
        timers.push(tid);
        delay += wp.flyMs + wp.dwellMs;
      }

      const endTid = window.setTimeout(() => {
        if (flyId !== myId) return;
        hidePlane();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.12;
        onAnimationEndRef.current?.();
      }, delay);
      timers.push(endTid);

      if (pointerCancelHandler)
        container.removeEventListener('pointerdown', pointerCancelHandler);
      pointerCancelHandler = () => {
        stopAnimation();
        setHighlight(null);
        onLandmarkRef.current?.(null);
        onAnimationEndRef.current?.();
      };
      container.addEventListener('pointerdown', pointerCancelHandler, {
        once: true,
      });
    };

    const goToStop = (index: number, durationMs = 800) => {
      stopAnimation();
      if (pointerCancelHandler) {
        container.removeEventListener('pointerdown', pointerCancelHandler);
        pointerCancelHandler = null;
      }
      const wp = FLYTHROUGH[TIMELINE_STOPS[index].wpIndex];
      teleportPlane(wp.lat, wp.lng);
      setHighlight(wp.landmark?.countryIso ?? null);
      onLandmarkRef.current?.(wp.landmark ?? null);
      onStopChangeRef.current?.(index);
      globe.pointOfView(
        { lat: wp.lat, lng: wp.lng, altitude: wp.altitude },
        durationMs,
      );
    };

    ctrlRef.current = { replay: runFlythrough, goToStop };
    runFlythrough();

    const resize = () => {
      const w = container.clientWidth;
      const h = Math.min(w * 0.65, 560);
      globe.width(w).height(h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    return () => {
      stopAnimation();
      if (pointerCancelHandler)
        container.removeEventListener('pointerdown', pointerCancelHandler);
      ro.disconnect();
      globe._destructor();
    };
  }, [handleLabelHover]);

  return <div ref={containerRef} className="globe-container" />;
});

export default GlobeMap;
