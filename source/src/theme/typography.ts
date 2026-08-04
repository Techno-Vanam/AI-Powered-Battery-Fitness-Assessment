import { TextStyle } from 'react-native';
import { fontFamily } from './fonts';
import { moderateScale } from './layout';

export const typography = {
  h1: {
    fontFamily: fontFamily('800'),
    fontSize: moderateScale(28),
    lineHeight: moderateScale(36),
    letterSpacing: -0.5,
  } satisfies TextStyle,
  h2: {
    fontFamily: fontFamily('700'),
    fontSize: moderateScale(24),
    lineHeight: moderateScale(32),
  } satisfies TextStyle,
  h3: {
    fontFamily: fontFamily('700'),
    fontSize: moderateScale(18),
    lineHeight: moderateScale(26),
  } satisfies TextStyle,
  subtitle: {
    fontFamily: fontFamily('500'),
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
  } satisfies TextStyle,
  body: {
    fontFamily: fontFamily('400'),
    fontSize: moderateScale(15),
    lineHeight: moderateScale(22),
  } satisfies TextStyle,
  bodySm: {
    fontFamily: fontFamily('400'),
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  } satisfies TextStyle,
  label: {
    fontFamily: fontFamily('700'),
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    letterSpacing: 0.3,
  } satisfies TextStyle,
  caption: {
    fontFamily: fontFamily('500'),
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  } satisfies TextStyle,
  button: {
    fontFamily: fontFamily('700'),
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
  } satisfies TextStyle,
  pill: {
    fontFamily: fontFamily('700'),
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
  } satisfies TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
