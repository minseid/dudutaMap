'use client'
import { MapContainer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MarkerData, Category } from '../types/map';
import { useEffect, useState } from 'react';

// 1. 수동으로 이미지를 추가하는 컴포넌트
function ManualImageOverlay({ url, bounds }: { url: string, bounds: L.LatLngBoundsExpression }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // React 컴포넌트 대신 Leaflet 명령어로 이미지를 직접 지도에 추가
    const overlay = L.imageOverlay(url, bounds).addTo(map);

    // 컴포넌트가 사라질 때 이미지도 삭제 (메모리 관리)
    return () => {
      map.removeLayer(overlay);
    };
  }, [map, url, bounds]);

  return null; // 화면에 직접 렌더링하지 않음
}

// 2. 내부 요소 관리
function MapContents({ markers, activeFilters, bounds }: { markers: MarkerData[], activeFilters: Category[], bounds: L.LatLngBoundsExpression }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log(`{ id: ${Date.now()}, group: '과일', category: 'raspberry', position: [${lat.toFixed(2)}, ${lng.toFixed(2)}], name: '라즈베리', detailImage: '' },`);
    },
  });

  return (
    <>
      {/* 이제 여기서 에러가 나지 않습니다 */}
      <ManualImageOverlay url="/duduMap.png" bounds={bounds} />
      
      {markers
        .filter(m => activeFilters.includes(m.category))
        .map((marker) => (
          <Marker key={`${marker.id}-${marker.position[0]}`} position={marker.position}>

          </Marker>
        ))}
    </>
  );
}

// 3. 메인 컴포넌트
export default function GameMap({ markers, activeFilters }: { markers: MarkerData[], activeFilters: Category[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  useEffect(() => {
    setIsMounted(true);
    // 기본 아이콘 설정
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
        <MapContents markers={markers} activeFilters={activeFilters} bounds={bounds} />
      </MapContainer>
    </div>
  );
}