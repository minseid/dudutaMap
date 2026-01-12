'use client'
import { MapContainer, Marker, Tooltip, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
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
  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height: '100vh', width: '100%', background: '#aad3df' }} />;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer 
        crs={L.CRS.Simple} 
        center={[500, 500]}
        zoom={-1}
        minZoom={-3}         
        maxZoom={3}
        maxBounds={[[-2000, -2000], [3000, 3000]]} 
        maxBoundsViscosity={0} 
        style={{ height: '100vh', width: '100%', background: '#aad3df' }}
        
        // --- 여기를 수정합니다 ---
        zoomControl={false} // 1. 기본 왼쪽 버튼을 끕니다.
        attributionControl={false}
      >
        {/* 2. 오른쪽에 버튼을 새로 추가합니다. (topright, bottomright 중 선택 가능) */}
        <ZoomControl position="topright" /> 

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