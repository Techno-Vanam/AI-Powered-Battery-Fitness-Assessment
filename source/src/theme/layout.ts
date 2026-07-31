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
  horizontalPadding: moderateScale(24),
  verticalPadding: moderateScale(24),
  contentMaxWidth: Math.min(SCREEN_WIDTH - moderateScale(48), 440),
  sectionGap: moderateScale(32),
  formGap: moderateScale(18),
  fieldGap: moderateScale(8),
  inputHeight: moderateScale(52),
  buttonHeight: moderateScale(56),
  radiusSm: moderateScale(12),
  radiusMd: moderateScale(14),
  radiusLg: moderateScale(16),
  radiusXl: moderateScale(20),
  radiusSheet: moderateScale(24),
  iconSm: moderateScale(18),
  iconMd: moderateScale(24),
  iconLg: moderateScale(32),
} as const;
