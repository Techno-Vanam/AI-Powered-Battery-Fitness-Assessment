import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors, typography, TypographyVariant } from '../../theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: string;
  weight?: never;
};

export function AppText({
  variant = 'body',
  color = colors.textPrimary,
  style,
  ...props
}: Props) {
  return (
    <RNText
      {...props}
      style={[typography[variant], { color }, style as TextStyle]}
    />
  );
}

export default AppText;
