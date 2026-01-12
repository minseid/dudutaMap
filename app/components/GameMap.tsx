'use client'
import { MapContainer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MarkerData, Category } from '../types/map';
import { useEffect, useState } from 'react';

// --- 아이콘 생성 함수 ---
const getCustomIcon = (category: string, iconUrl?: string) => {
  const finalUrl = iconUrl || `/icons/${category}.png`;
  
  return L.icon({
    iconUrl: finalUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'custom-marker-icon'
  });
};

// 1. 수동으로 이미지를 추가하는 컴포넌트
function ManualImageOverlay({ url, bounds }: { url: string, bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!map) return;
    const checkReady = setInterval(() => {
      if (map.getPane('overlayPane')) {
        setIsReady(true);
        clearInterval(checkReady);
      }
    }, 50);
    return () => clearInterval(checkReady);
  }, [map]);

  useEffect(() => {
    if (!map || !isReady) return;
    let overlay: L.ImageOverlay | null = null;
    try {
      overlay = L.imageOverlay(url, bounds).addTo(map);
    } catch (error) {
      console.error('Error adding image overlay:', error);
    }
    return () => {
      if (overlay && map) map.removeLayer(overlay);
    };
  }, [map, url, bounds, isReady]);

  return null;
}

// 2. 내부 요소 관리
function MapContents({ markers, activeFilters, bounds, randomMarker }: { 
  markers: MarkerData[], 
  activeFilters: Category[], 
  bounds: L.LatLngBoundsExpression,
  randomMarker?: any 
}) {
  const map = useMap();
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!map) return;
    const checkReady = setInterval(() => {
      if (map.getPane('markerPane')) {
        setIsMapReady(true);
        clearInterval(checkReady);
      }
    }, 50);
    return () => clearInterval(checkReady);
  }, [map]);

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log(`{ id: ${Date.now()}, group: '과일', category: 'raspberry', position: [${lat.toFixed(2)}, ${lng.toFixed(2)}], name: '라즈베리', iconUrl: '' },`);
    },
  });

  if (!isMapReady) return null;

  return (
    <>
      <ManualImageOverlay url="/duduMap.png" bounds={bounds} />
      
      {markers
        .filter(m => activeFilters.includes(m.category))
        .map((marker) => (
          <Marker 
            key={`${marker.id}-${marker.position[0]}`} 
            position={marker.position}
            icon={getCustomIcon(marker.category, marker.iconUrl)}
          >
          </Marker>
        ))}

      {randomMarker && (
        <Marker 
          position={randomMarker.position}
          icon={L.icon({
            iconUrl: '/icons/random-target.png',
            iconSize: [45, 45],
            iconAnchor: [22, 22]
          })}
        >
          <Tooltip permanent direction="top" offset={[0, -20]}>
            <div style={{ color: 'red', fontWeight: 'bold' }}>📍 {randomMarker.name}</div>
          </Tooltip>
        </Marker>
      )}
    </>
  );
}

// 3. 메인 컴포넌트
export default function GameMap({ markers, activeFilters, randomMarker }: { 
  markers: MarkerData[], 
  activeFilters: Category[],
  randomMarker?: any 
}) {
  const [isMounted, setIsMounted] = useState(false);
  // 전체 맵의 좌표 범위
  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  useEffect(() => {
    setIsMounted(true);
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  if (!isMounted) return <div style={{ height: '100vh', width: '100%', background: '#aad3df' }} />;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer 
        crs={L.CRS.Simple} 
        bounds={bounds} 
        // --- 축소 기능을 위한 추가 설정 ---
        minZoom={-3}         // 더 작게 축소 가능 (-1, -2보다 더 멀리 보임)
        maxZoom={2}          // 확대 한도
        zoom={-1}            // 초기 줌 설정 (음수일수록 멀리 보임)
        maxBounds={bounds}   // 지도 밖으로 나가는 것 방지
        maxBoundsViscosity={1.0} 
        // ------------------------------
        style={{ height: '100vh', width: '100%', background: '#aad3df' }}
        attributionControl={false}
      >
        <MapContents 
          markers={markers} 
          activeFilters={activeFilters} 
          bounds={bounds} 
          randomMarker={randomMarker} 
        />
      </MapContainer>
    </div>
  );
}