'use client'
import { MapContainer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MarkerData, Category } from '../types/map';
import { useEffect, useState } from 'react';

// --- 추가: 아이콘 생성 함수 ---
const getCustomIcon = (category: string, iconUrl?: string) => {
  // 특정 iconUrl이 있으면 그것을 사용, 없으면 카테고리 이름으로 public 폴더에서 찾음
  const finalUrl = iconUrl || `/icons/${category}.png`;
  
  return L.icon({
    iconUrl: finalUrl,
    iconSize: [32, 32], // 아이콘 크기
    iconAnchor: [16, 16], // 아이콘의 중심점
    popupAnchor: [0, -16],
    // 이미지 로드 실패 시 기본 마커로 대체하기 위한 설정 (선택사항)
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
// randomMarker 프롭스를 추가했습니다.
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
      
      {/* 일반 마커들: 커스텀 아이콘 적용 */}
      {markers
        .filter(m => activeFilters.includes(m.category))
        .map((marker) => (
          <Marker 
            key={`${marker.id}-${marker.position[0]}`} 
            position={marker.position}
            icon={getCustomIcon(marker.category, marker.iconUrl)} // 커스텀 아이콘 적용
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>

            </Tooltip>
          </Marker>
        ))}

      {/* 랜덤 마커: 강조된 전용 아이콘 적용 */}
      {randomMarker && (
        <Marker 
          position={randomMarker.position}
          icon={L.icon({
            iconUrl: '/icons/random-target.png', // 랜덤 지점용 전용 아이콘
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
    // 기본 아이콘 (커스텀 아이콘 로드 실패 시 대비)
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
        style={{ height: '100vh', width: '100%', background: '#aad3df' }}
        attributionControl={false}
      >
        <MapContents 
          markers={markers} 
          activeFilters={activeFilters} 
          bounds={bounds} 
          randomMarker={randomMarker} // 랜덤 마커 전달
        />
      </MapContainer>
    </div>
  );
}