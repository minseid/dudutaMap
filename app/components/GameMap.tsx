'use client'
import { MapContainer, ImageOverlay, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MarkerData, Category } from '../types/map';
import { useEffect, useState } from 'react';

// 기본 아이콘 설정
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapContents({ markers, activeFilters, bounds }: { markers: MarkerData[], activeFilters: Category[], bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!map) return;

    // 지도가 완전히 로드되었는지 확인하는 Leaflet 내부 함수
    map.whenReady(() => {
      // 브라우저가 다음 그림을 그릴 때까지 한 번 더 기다림
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    });
  }, [map]);

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      // 노가다용 로그 (ID 중복 방지를 위해 Date.now() 사용)
      console.log(`{ id: ${Date.now()}, group: '과일', category: 'raspberry', position: [${lat.toFixed(2)}, ${lng.toFixed(2)}], name: '라즈베리', detailImage: '' },`);
    },
  });

  // 지도가 준비 안 됐으면 자식 요소(ImageOverlay)를 아예 생성조차 안 함
  if (!isReady) return null;

  return (
    <>
      <ImageOverlay url="/duduMap.png" bounds={bounds} />
      {markers
        .filter(m => activeFilters.includes(m.category))
        .map((marker) => (
          // key 중복 에러 방지를 위해 ID와 좌표를 조합
          <Marker key={`${marker.id}-${marker.position[0]}`} position={marker.position}>
  
          </Marker>
        ))}
    </>
  );
}

export default function GameMap({ markers, activeFilters }: { markers: MarkerData[], activeFilters: Category[] }) {
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
        bounds={bounds} 
        style={{ height: '100vh', width: '100%', background: '#aad3df' }}
        attributionControl={false}
      >
        <MapContents markers={markers} activeFilters={activeFilters} bounds={bounds} />
      </MapContainer>
    </div>
  );
}