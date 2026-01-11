// types/map.ts
export type MainGroup = '과일' | '버섯' | '밥그릇' | '스페셜' ;

export type Category = 
  | 'apple' | 'orange' | 'raspberry'| 'blueberry' // 과일류
  | 'truffle' | 'tricoloma' | 'net' | 'shiitake' | 'oyster'   // 버섯류
  | 'seaotter' | 'dambi' | 'fox' | 'rebbit' | 'panda' | 'formosandeer' | 'copybara' | 'alpaca' 
  | 'specialtree'
  | 'specialrock'

export interface MarkerData {
  id: number;
  group: MainGroup;      // 대분류
  category: Category;    // 소분류
  position: [number, number];
  detailImage?: string;
}