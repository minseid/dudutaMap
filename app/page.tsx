'use client'
import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import Draggable from 'react-draggable';
import { Category, MainGroup } from './types/map';
import { DUDU_DATA } from './data/marks';


const GameMap = dynamic(() => import('./components/GameMap'), { ssr: false });

const FILTER_MENU: Record<MainGroup, { id: Category; label: string }[]> = {
  '과일': [
    { id: 'apple', label: '사과' },
    { id: 'orange', label: '오렌지' },
    { id: 'raspberry', label: '라즈베리' },
    { id: 'blueberry', label: '블루베리' },

  ],
  '버섯': [
    { id: 'truffle', label: '트러플' },
    { id: 'tricoloma', label: '양송이' },
    { id: 'net', label: '그물' },
    { id: 'shiitake', label: '표고' },
    { id: 'oyster', label: '느타리' },
  
  ],
  '밥그릇' : [
    {id : 'seaotter', label : '해달'},
    {id : 'dambi', label : '담비'},
    {id : 'fox', label : '여우'},
    {id : 'rebbit', label : '토끼'},
    {id : 'panda', label : '판다'},
    {id : 'formosandeer', label : '꽃사슴'},
    {id : 'copybara', label : '카피바라'},
    {id : 'alpaca', label : '알파카'},
  ],
  '스페셜':[
    {id : 'specialtree' , label : '참나무'},
    {id : 'specialrock', label : '형광석'}
  ]
};

// 모든 카테고리 ID만 추출한 배열 (전체 선택용)
const ALL_CATEGORIES = Object.values(FILTER_MENU).flatMap(items => items.map(i => i.id));

export default function Home() {
  const [activeFilters, setActiveFilters] = useState<Category[]>(ALL_CATEGORIES);
  const [isMinimized, setIsMinimized] = useState(false); // 접힘 상태 추가
  const nodeRef = useRef(null);

  const toggleFilter = (cat: Category) => {
    setActiveFilters(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // --- 추가된 기능 함수들 ---
  
  // 1. 전체 선택 / 전체 해제
  const setAllFilters = (select: boolean) => {
    setActiveFilters(select ? ALL_CATEGORIES : []);
  };

  // 2. 그룹별 선택 (해당 그룹만 켜기/끄기)
  const toggleGroup = (group: MainGroup) => {
    const groupItems = FILTER_MENU[group].map(i => i.id);
    const isAllGroupActive = groupItems.every(id => activeFilters.includes(id));

    if (isAllGroupActive) {
      // 그룹이 다 켜져있으면 해당 그룹만 끔
      setActiveFilters(prev => prev.filter(id => !groupItems.includes(id)));
    } else {
      // 그룹 중 하나라도 꺼져있으면 해당 그룹 모두 켬
      setActiveFilters(prev => Array.from(new Set([...prev, ...groupItems])));
    }
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Draggable 
        nodeRef={nodeRef} 
        bounds="parent"
        handle=".drag-handle" // 헤더 부분을 잡아야만 움직이게 설정 (터치 간섭 방지)
        enableUserSelectHack={false} // 모바일에서 텍스트 선택 방지 해제
        cancel= "button, .filter-list-container" // 리스트 영역에서는 드래그 기능 무효화
      >
        <div ref={nodeRef} style={{
          position: 'absolute', top: '20px', left: '10px', zIndex: 9999, // zIndex를 최상단으로
          background: 'rgba(255, 255, 255, 0.98)', padding: '12px', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', color: '#000', 
          width: isMinimized ? '150px' : '220px',
          maxHeight: '80vh', overflowY: 'auto',
          transition: 'width 0.3s ease',
          touchAction: 'none' // 브라우저 기본 터치 동작 방지 (드래그용)
        }}>
          {/* 드래그 핸들 (모바일에서는 여기를 잡고 끌어야 함) */}
          <div className="drag-handle" style={{ 
            display: 'flex', justifyContent: 'flex-start', alignItems: 'center', 
            marginBottom: isMinimized ? '0' : '15px', cursor: 'move',flexShrink: 0,
            background: '#f0f0f0', padding: '8px', borderRadius: '8px',touchAction: 'none' 
          }}>
            {!isMinimized && <h3 style={{ margin: 0, fontSize: '16px' }}>🔍 필터</h3>}
            <button 
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              style={{
                padding: '6px 10px', cursor: 'pointer', background: '#333', color: '#fff',
                border: 'none', borderRadius: '6px', fontSize: '12px',
                // 터치 영역을 버튼보다 더 넓게 인식하도록 설정
                touchAction: 'manipulation'
              }}
            >
              {isMinimized ? '펼치기' : '접기'}
            </button>
          </div>
          
          {/* 2. 필터 리스트 영역 (여기는 스크롤이 되어야 함) */}
          {!isMinimized && (
            <div 
              className="filter-list-container" // Draggable의 cancel 대상
              onPointerDown={(e) => e.stopPropagation()} // 터치 이벤트가 드래그로 번지는 것 차단
              style={{ 
                padding: '15px', 
                maxHeight: '60vh', // 화면의 60%까지만 차지
                overflowY: 'auto', // 세로 스크롤 활성화
                WebkitOverflowScrolling: 'touch', // iOS 부드러운 스크롤
                touchAction: 'pan-y' // 세로 스크롤만 허용
              }}
            >
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                <button onPointerDown={(e) => { e.stopPropagation(); setAllFilters(true); }} style={btnStyle}>전체 선택</button>
                <button onPointerDown={(e) => { e.stopPropagation(); setAllFilters(false); }} style={btnStyle}>전체 해제</button>
              </div>

              {(Object.keys(FILTER_MENU) as MainGroup[]).map(group => (
                <div key={group} style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>{group}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {FILTER_MENU[group].map(item => (
                      <label key={item.id} style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                        <input 
                          type="checkbox" 
                          style={{ width: '24px', height: '24px', marginRight: '12px' }}
                          checked={activeFilters.includes(item.id)}
                          onChange={() => toggleFilter(item.id)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Draggable>

      <GameMap markers={DUDU_DATA} activeFilters={activeFilters} />
    </main>
  );
}

// 스타일 변수 분리
const btnStyle = { flex: 1, fontSize: '12px', padding: '10px 5px', cursor: 'pointer', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '6px' };
const miniBtnStyle = { fontSize: '11px', padding: '4px 8px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' };