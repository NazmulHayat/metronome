import { Platform } from 'react-native'

export const COLORS = {
  bg: '#FFF3DF',
  bgSky: '#CDEDF6',
  card: '#FFFDF7',
  cardBorder: '#F1D9AE',
  ink: '#4A3728',
  inkSoft: '#8A7461',
  accent: '#F0662E',
  glow: '#FFC93C',
  glowDeep: '#F0932B',
  btnBase: '#FFE9CB',
  btnBorder: '#E8BD86',
  teal: '#2BA79A',
  good: '#43B75D',
  star: '#FFB300',
}

// Hiragino Maru Gothic is the rounded Japanese face pre-installed on iOS.
export const FONT = Platform.select({
  ios: 'Hiragino Maru Gothic ProN',
  default: undefined,
})
