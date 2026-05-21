export interface Viewport {
  name: 'XS' | 'S' | 'M' | 'L' | 'XL';
  width: number;
  height: number;
}

export const viewports: Record<Viewport['name'], Viewport> = {
  XS: { name: 'XS', width: 360, height: 740 },
  S: { name: 'S', width: 600, height: 800 },
  M: { name: 'M', width: 820, height: 900 },
  L: { name: 'L', width: 1100, height: 900 },
  XL: { name: 'XL', width: 1440, height: 900 },
};
