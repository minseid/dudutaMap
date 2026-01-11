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
      <Draggable nodeRef={nodeRef} bounds="parent">
        <div ref={nodeRef} style={{
          position: 'absolute', top: '20px', left: '70px', zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)', padding: '15px', borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', color: '#000', 
          width: isMinimized ? 'auto' : '220px', // 접혔을 때 너비 조절
          maxHeight: '85vh', overflowY: 'auto', cursor: 'move',
          transition: 'width 0.3s ease' // 부드러운 애니메이션
        }}>
          {/* 헤더 영역: 제목과 접기 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? '0' : '15px' }}>
            {!isMinimized && <h3 style={{ margin: 0, fontSize: '18px' }}>🔍 지도 필터</h3>}
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              style={{
                padding: '5px 10px', cursor: 'pointer', background: '#eee', 
                border: 'none', borderRadius: '6px', fontSize: '12px',
                marginLeft: isMinimized ? '0' : '10px'
              }}
            >
              {isMinimized ? '🔍 필터 열기' : '접기'}
            </button>
          </div>
          
          {/* 접히지 않았을 때만 상세 내용 표시 */}
          {!isMinimized && (
            <>
              {/* 상단 전체 조절 버튼 */}
              <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                <button 
                  onClick={() => setAllFilters(true)}
                  style={{ flex: 1, fontSize: '11px', padding: '5px', cursor: 'pointer', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '4px' }}
                >전체 선택</button>
                <button 
                  onClick={() => setAllFilters(false)}
                  style={{ flex: 1, fontSize: '11px', padding: '5px', cursor: 'pointer', background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: '4px' }}
                >전체 해제</button>
              </div>

              {(Object.keys(FILTER_MENU) as MainGroup[]).map(group => (
                <div key={group} style={{ marginBottom: '15px' }}>
                  <div style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px'
                  }}>
                    <h4 style={{ fontSize: '14px', margin: 0, color: '#333' }}>{group}</h4>
                    <button 
                      onClick={() => toggleGroup(group)}
                      style={{ fontSize: '10px', padding: '2px 6px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '3px' }}
                    >On/Off</button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
                    {FILTER_MENU[group].map(item => (
                      <label key={item.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px' }}>
                        <input 
                          type="checkbox" 
                          style={{ marginRight: '8px' }}
                          checked={activeFilters.includes(item.id)}
                          onChange={() => toggleFilter(item.id)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </Draggable>

      <GameMap markers={DUDU_DATA} activeFilters={activeFilters} />
    </main>
  );
}