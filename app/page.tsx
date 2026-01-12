'use client'
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Category, MainGroup } from './types/map';
import { DUDU_DATA } from './data/marks';
import { Analytics } from "@vercel/analytics/next"

const GameMap = dynamic(() => import('./components/GameMap'), { ssr: false });

const FILTER_MENU: Record<MainGroup, { id: Category; label: string }[]> = {
  '과일': [
    { id: 'apple', label: '사과' }, { id: 'orange', label: '오렌지' },
    { id: 'raspberry', label: '라즈베리' }, { id: 'blueberry', label: '블루베리' },
  ],
  '버섯': [
    { id: 'truffle', label: '트러플' }, { id: 'tricoloma', label: '양송이' },
    { id: 'net', label: '그물' }, { id: 'shiitake', label: '표고' },
    { id: 'oyster', label: '느타리' },
  ],
  '밥그릇' : [
    {id : 'seaotter', label : '해달'}, {id : 'dambi', label : '담비'},
    {id : 'fox', label : '여우'}, {id : 'rebbit', label : '토끼'},
    {id : 'panda', label : '판다'}, {id : 'formosandeer', label : '꽃사슴'},
    {id : 'copybara', label : '카피바라'}, {id : 'alpaca', label : '알파카'},
  ],
  '스페셜':[
    {id : 'specialtree' , label : '참나무'}, {id : 'specialrock', label : '형광석'}
  ],
  '희귀' : [
    {id : 'bigtree' , label : '희귀목재'}
  ]
};

const ALL_CATEGORIES = Object.values(FILTER_MENU).flatMap(items => items.map(i => i.id));

export default function Home() {
  const [activeFilters, setActiveFilters] = useState<Category[]>(ALL_CATEGORIES);
  const [isOpen, setIsOpen] = useState(true);

  const toggleFilter = (cat: Category) => {
    setActiveFilters(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const setAllFilters = (select: boolean) => {
    setActiveFilters(select ? ALL_CATEGORIES : []);
  };

  const toggleGroup = (group: MainGroup) => {
    const groupItems = FILTER_MENU[group].map(i => i.id);
    const isAllGroupActive = groupItems.every(id => activeFilters.includes(id));
    if (isAllGroupActive) {
      setActiveFilters(prev => prev.filter(id => !groupItems.includes(id)));
    } else {
      setActiveFilters(prev => Array.from(new Set([...prev, ...groupItems])));
    }
  };

  return (
    <main style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', color: '#000' }}>
      <aside style={{
        width: isOpen ? '280px' : '0px',
        height: '100%',
        background: '#fff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        color: '#000' // 패널 전체 글씨 검정
      }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute', right: '-40px', top: '20px', width: '40px', height: '40px',
            background: '#fff', border: 'none', borderRadius: '0 8px 8px 0',
            boxShadow: '2px 0 5px rgba(0,0,0,0.1)', cursor: 'pointer', color: '#000'
          }}
        >
          {isOpen ? '◀' : '▶'}
        </button>

        {isOpen && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#000' }}>🔍 필터 목록</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
              <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '15px 0', zIndex: 5 }}>
                <button 
                  onClick={() => setAllFilters(activeFilters.length < ALL_CATEGORIES.length)} 
                  style={{ 
                    ...btnStyle, 
                    background: activeFilters.length < ALL_CATEGORIES.length ? '#4A90E2' : '#f44336', 
                    color: '#fff' 
                  }}
                >
                  {activeFilters.length < ALL_CATEGORIES.length ? '전체 선택' : '전체 해제'}
                </button>
              </div>

              {(Object.keys(FILTER_MENU) as MainGroup[]).map(group => {
                const groupIds = FILTER_MENU[group].map(i => i.id);
                const isAllGroupActive = groupIds.every(id => activeFilters.includes(id));
                return (
                  <div key={group} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f0f0f0', paddingBottom: '8px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#000' }}>{group}</span>
                      <button onClick={() => toggleGroup(group)} style={{ ...miniBtnStyle, color: '#000' }}>
                        {isAllGroupActive ? '그룹 해제' : '그룹 전체'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {FILTER_MENU[group].map(item => (
                        <label key={item.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#000' }}>
                          <input type="checkbox" style={{ width: '18px', height: '18px', marginRight: '10px' }} checked={activeFilters.includes(item.id)} onChange={() => toggleFilter(item.id)} />
                          <img src={`/icons/${item.id}.png`} alt="" style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                          <span>{item.label}</span>
                          <Analytics />
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>
      <section style={{ flex: 1, position: 'relative' }}>
        <GameMap markers={DUDU_DATA} activeFilters={activeFilters} />
      </section>
    </main>
  );
}

const btnStyle = { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' as const };
const miniBtnStyle = { fontSize: '11px', padding: '4px 8px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' };