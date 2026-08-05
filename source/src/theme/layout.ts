import { Dimensions, PixelRatio } from 'react-native';

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function scale(size: number): number {
  return PixelRatio.roundToNearestPixel(size * (SCREEN_WIDTH / BASE_WIDTH));
}

export function verticalScale(size: number): number {
  return PixelRatio.roundToNearestPixel(size * (SCREEN_HEIGHT / BASE_HEIGHT));
}

export function moderateScale(size: number, factor = 0.5): number {
  return size + (scale(size) - size) * factor;
}

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  horizontalPadding: 16,
  verticalPadding: 16,
  contentMaxWidth: Math.min(SCREEN_WIDTH - 32, 440),
  sectionGap: 24,
  formGap: 16,
  fieldGap: 8,
  inputHeight: 48,
  buttonHeight: 50,
  cardRadius: 16,
  buttonRadius: 12,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusSheet: 24,
  iconSm: 18,
  iconMd: 24,
  iconLg: 32,
  // Apple subtle shadow token
  shadowSubtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
