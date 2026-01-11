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
      >
        <div ref={nodeRef} style={{
          position: 'absolute', top: '20px', left: '10px', zIndex: 9999, // zIndex를 최상단으로
          background: 'rgba(255, 255, 255, 0.98)', padding: '12px', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', color: '#000', 
          width: isMinimized ? '140px' : '220px',
          maxHeight: '80vh', overflowY: 'auto',
          transition: 'width 0.3s ease',
          touchAction: 'none' // 브라우저 기본 터치 동작 방지 (드래그용)
        }}>
          {/* 드래그 핸들 (모바일에서는 여기를 잡고 끌어야 함) */}
          <div className="drag-handle" style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            marginBottom: isMinimized ? '0' : '15px', cursor: 'move',
            background: '#f0f0f0', padding: '8px', borderRadius: '8px'
          }}>
            {!isMinimized && <h3 style={{ margin: 0, fontSize: '16px' }}>🔍 필터</h3>}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // 드래그 이벤트 전파 방지
                setIsMinimized(!isMinimized);
              }}
              style={{
                padding: '8px 12px', cursor: 'pointer', background: '#333', color: '#fff',
                border: 'none', borderRadius: '6px', fontSize: '14px',zIndex: 10001,
              }}
            >
              {isMinimized ? '펼치기' : '접기'}
            </button>
          </div>
          
          {!isMinimized && (
            <div style={{ touchAction: 'auto' }}> {/* 내부 체크박스는 터치 가능하게 */}
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <button onClick={() => setAllFilters(true)} style={btnStyle}>전체 선택</button>
                <button onClick={() => setAllFilters(false)} style={btnStyle}>전체 해제</button>
              </div>

              {(Object.keys(FILTER_MENU) as MainGroup[]).map(group => (
                <div key={group} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', margin: 0 }}>{group}</h4>
                    <button onClick={() => toggleGroup(group)} style={miniBtnStyle}>On/Off</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {FILTER_MENU[group].map(item => (
                      <label key={item.id} style={{ 
                        display: 'flex', alignItems: 'center', cursor: 'pointer', 
                        fontSize: '15px', padding: '5px 0' // 모바일 클릭 영역 확보
                      }}>
                        <input 
                          type="checkbox" 
                          style={{ width: '20px', height: '20px', marginRight: '10px' }} // 체크박스 키우기
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