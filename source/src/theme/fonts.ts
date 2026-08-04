export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export type FontWeight = '400' | '500' | '600' | '700' | '800';

export function fontFamily(weight: FontWeight = '400'): string {
  switch (weight) {
    case '800':
    case '700':
      return fonts.bold;
    case '600':
      return fonts.semiBold;
    case '500':
      return fonts.medium;
    default:
      return fonts.regular;
  }
}
