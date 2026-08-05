import { StyleSheet } from 'react-native';
import { colors, layout, moderateScale, roleColors, Role } from '../theme';
import { fontFamily } from '../theme/fonts';

export function createAuthStyles(role: Role) {
  const accent = roleColors(role);

  return StyleSheet.create({
    form: { gap: layout.formGap },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: layout.fieldGap + 2,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: layout.radiusMd,
      paddingHorizontal: layout.fieldGap + 6,
      height: layout.inputHeight,
    },
    inputError: {
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorBg,
    },
    input: {
      flex: 1,
      fontFamily: fontFamily('400'),
      fontSize: layout.inputHeight * 0.29,
      color: colors.textPrimary,
      paddingVertical: 0,
    },
    inputBold: {
      fontFamily: fontFamily('600'),
      color: colors.textPrimary,
    },
    forgotRow: { alignItems: 'flex-end', marginTop: -4 },
    forgotText: {
      fontFamily: fontFamily('700'),
      fontSize: layout.inputHeight * 0.25,
      color: accent.primary,
    },
    otpBox: {
      width: layout.inputHeight,
      height: layout.inputHeight + 4,
      borderRadius: layout.radiusMd,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      textAlign: 'center',
      fontFamily: fontFamily('700'),
      fontSize: layout.inputHeight * 0.38,
      color: colors.textPrimary,
    },
    otpBoxFocused: {
      borderColor: accent.primary,
      backgroundColor: accent.light,
    },
    otpBoxError: {
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorBg,
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: layout.fieldGap,
      backgroundColor: role === 'athlete' ? colors.successBg : accent.light,
      borderWidth: 1,
      borderColor: role === 'athlete' ? colors.successBorder : accent.primary + '40',
      borderRadius: layout.radiusMd,
      padding: layout.fieldGap + 4,
      marginBottom: layout.formGap,
    },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: layout.radiusLg,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: layout.horizontalPadding - 4,
      gap: layout.fieldGap + 2,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    link: {
      fontFamily: fontFamily('700'),
      color: accent.primary,
    },
    picker: {
      flex: 1,
      color: colors.textPrimary,
    },
    dobPickerNative: {
      flex: 1,
      justifyContent: 'center',
    },
  });
}

export function createScreenStyles() {
  return StyleSheet.create({
    roleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: layout.radiusLg,
      padding: layout.horizontalPadding - 4,
      shadowColor: colors.textSecondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    iconBox: {
      width: moderateScaleIcon(60),
      height: moderateScaleIcon(60),
      borderRadius: layout.radiusLg,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: layout.fieldGap + 8,
    },
    cardsStack: { gap: layout.fieldGap + 8 },
    avatar: {
      width: moderateScaleIcon(80),
      height: moderateScaleIcon(80),
      borderRadius: moderateScaleIcon(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    centeredContent: {
      flexGrow: 1,
      alignItems: 'center',
      gap: layout.sectionGap - 8,
      paddingTop: layout.sectionGap + layout.fieldGap,
    },
    termsBody: {
      gap: layout.fieldGap + 4,
    },
    termsSection: {
      gap: layout.fieldGap - 2,
      marginBottom: layout.fieldGap,
    },
  });
}

function moderateScaleIcon(size: number) {
  return layout.inputHeight + (size - 52) * 0.5;
}

export function createRegisterStyles(role: Role) {
  const accent = roleColors(role);
  const base = createAuthStyles(role);

  return {
    ...base,
    ...StyleSheet.create({
      safeArea: { flex: 1, backgroundColor: colors.background },
      flex: { flex: 1 },
      scrollContent: {
        flexGrow: 1,
        paddingHorizontal: layout.horizontalPadding,
        paddingBottom: layout.verticalPadding + layout.sectionGap / 2,
        paddingTop: layout.verticalPadding,
      },
      header: { marginBottom: layout.sectionGap - 4 },
      title: {
        fontFamily: fontFamily('800'),
        fontSize: moderateScale(28),
        color: colors.textPrimary,
        marginBottom: 6,
      },
      subtitle: {
        fontFamily: fontFamily('500'),
        fontSize: moderateScale(15),
        color: colors.textSecondary,
        lineHeight: moderateScale(22),
      },
      optional: {
        fontFamily: fontFamily('400'),
        color: colors.textMuted,
      },
      prefix: {
        fontFamily: fontFamily('600'),
        fontSize: moderateScale(15),
        color: colors.textPrimary,
      },
      dobRow: { flexDirection: 'row', gap: layout.fieldGap },
      dobPicker: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        backgroundColor: colors.surface,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: layout.radiusMd,
        paddingHorizontal: layout.fieldGap + 2,
        height: layout.inputHeight,
      },
      dobText: {
        fontFamily: fontFamily('500'),
        fontSize: moderateScale(15),
        color: colors.textPrimary,
        flex: 1,
        textAlign: 'center',
      },
      placeholder: { color: colors.textMuted },
      agePill: {
        alignSelf: 'flex-start',
        backgroundColor: accent.light,
        borderRadius: layout.radiusXl,
        paddingHorizontal: layout.fieldGap + 2,
        paddingVertical: 4,
        marginTop: 2,
      },
      ageText: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(12),
        color: accent.primary,
      },
      guardianBlock: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FDBA74',
        borderRadius: layout.radiusMd,
        padding: layout.fieldGap + 8,
        gap: layout.fieldGap + 6,
      },
      guardianTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.fieldGap - 2,
      },
      guardianTitle: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(13),
        color: '#9A3412',
      },
      segmented: {
        flexDirection: 'row',
        backgroundColor: colors.borderLight,
        borderRadius: layout.radiusSm,
        padding: 4,
        gap: 4,
      },
      segment: {
        flex: 1,
        paddingVertical: layout.fieldGap + 2,
        borderRadius: layout.fieldGap + 2,
        alignItems: 'center',
      },
      segmentActive: { backgroundColor: accent.primary },
      segmentText: {
        fontFamily: fontFamily('600'),
        fontSize: moderateScale(13),
        color: colors.textSecondary,
      },
      segmentTextActive: {
        fontFamily: fontFamily('600'),
        color: colors.surface,
      },
      consentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.fieldGap + 2,
      },
      consentText: {
        flex: 1,
        fontFamily: fontFamily('400'),
        fontSize: moderateScale(14),
        color: colors.textSecondary,
        lineHeight: moderateScale(20),
      },
      consentLink: {
        fontFamily: fontFamily('700'),
        color: accent.primary,
        textDecorationLine: 'underline',
      },
      buttonText: {
        fontFamily: fontFamily('700'),
        color: colors.surface,
        fontSize: moderateScale(16),
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: layout.fieldGap + 8,
        paddingBottom: layout.fieldGap,
      },
      footerText: {
        fontFamily: fontFamily('400'),
        fontSize: moderateScale(14),
        color: colors.textSecondary,
      },
      footerLink: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(14),
        color: accent.primary,
      },
      backRow: { alignItems: 'center', marginTop: layout.fieldGap },
      backText: {
        fontFamily: fontFamily('500'),
        fontSize: moderateScale(14),
        color: colors.textSecondary,
      },
      infoBox: {
        flexDirection: 'row',
        gap: layout.fieldGap + 2,
        alignItems: 'flex-start',
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderRadius: layout.radiusMd,
        padding: layout.fieldGap + 6,
        marginBottom: layout.sectionGap - 8,
      },
      infoText: {
        flex: 1,
        fontFamily: fontFamily('400'),
        fontSize: moderateScale(13),
        color: '#1D4ED8',
        lineHeight: moderateScale(20),
      },
      iconCircle: {
        width: moderateScale(68),
        height: moderateScale(68),
        borderRadius: moderateScale(34),
        backgroundColor: accent.light,
        alignItems: 'center',
        justifyContent: 'center',
      },
      headerCentered: {
        alignItems: 'center',
        marginBottom: layout.sectionGap - 8,
        gap: layout.fieldGap + 4,
      },
      ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
      ruleText: {
        fontFamily: fontFamily('400'),
        fontSize: moderateScale(13),
        color: colors.textSecondary,
      },
      successCircle: {
        width: moderateScale(88),
        height: moderateScale(88),
        borderRadius: moderateScale(44),
        backgroundColor: colors.successBg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: layout.sectionGap,
        gap: layout.formGap,
      },
      successIcon: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        backgroundColor: colors.successBg,
        alignItems: 'center',
        justifyContent: 'center',
      },
      successTitle: {
        fontFamily: fontFamily('800'),
        fontSize: moderateScale(26),
        color: colors.textPrimary,
        textAlign: 'center',
      },
      successSubtitle: {
        fontFamily: fontFamily('400'),
        fontSize: moderateScale(15),
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: moderateScale(24),
      },
      strengthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.fieldGap + 2,
        marginTop: 4,
      },
      strengthBar: { flex: 1, flexDirection: 'row', gap: 4 },
      strengthSegment: {
        flex: 1,
        height: 5,
        borderRadius: 4,
        backgroundColor: colors.border,
      },
      strengthLabel: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(12),
        width: 48,
        textAlign: 'right',
      },
      rules: {
        gap: layout.fieldGap,
        backgroundColor: colors.background,
        borderRadius: layout.radiusSm,
        padding: layout.fieldGap + 6,
      },
      rulePass: {
        fontFamily: fontFamily('600'),
        color: '#22C55E',
      },
      group: { gap: layout.fieldGap - 2 },
      label: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(13),
        color: colors.textLabel,
        letterSpacing: 0.3,
      },
      button: {
        backgroundColor: accent.primary,
        borderRadius: layout.radiusMd,
        height: layout.buttonHeight,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: layout.fieldGap,
        shadowColor: accent.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
      },
      buttonDisabled: { opacity: 0.6 },
      errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
      errorText: {
        fontFamily: fontFamily('500'),
        fontSize: moderateScale(12),
        color: colors.error,
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
      },
      modalSheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: layout.radiusSheet,
        borderTopRightRadius: layout.radiusSheet,
        maxHeight: '60%',
        paddingBottom: layout.verticalPadding,
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: layout.horizontalPadding - 6,
        borderBottomWidth: 1,
        borderColor: colors.border,
      },
      modalTitle: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(16),
        color: colors.textPrimary,
      },
      modalClose: {
        fontFamily: fontFamily('700'),
        fontSize: moderateScale(15),
        color: accent.primary,
      },
      modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: layout.fieldGap + 6,
        paddingHorizontal: layout.horizontalPadding,
        borderBottomWidth: 1,
        borderColor: colors.borderLight,
      },
      modalItemText: {
        fontFamily: fontFamily('400'),
        fontSize: moderateScale(15),
        color: colors.textLabel,
      },
      modalItemSelected: {
        fontFamily: fontFamily('700'),
        color: accent.primary,
      },
      designationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.fieldGap,
      },
      designationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.fieldGap - 2,
        paddingHorizontal: layout.fieldGap + 6,
        paddingVertical: layout.fieldGap + 2,
        borderRadius: layout.radiusSm,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      },
      designationBtnActive: {
        backgroundColor: accent.primary,
        borderColor: accent.primary,
      },
      designationText: {
        fontFamily: fontFamily('600'),
        fontSize: moderateScale(13),
        color: colors.textSecondary,
      },
      designationTextActive: {
        fontFamily: fontFamily('600'),
        color: colors.surface,
      },
      stepIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: layout.fieldGap,
        gap: 8,
      },
      stepBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: layout.radiusSm,
        backgroundColor: colors.borderLight,
      },
      stepBadgeActive: {
        backgroundColor: accent.primary,
      },
      stepBadgeText: {
        fontFamily: fontFamily('600'),
        fontSize: moderateScale(13),
        color: colors.textSecondary,
      },
      stepBadgeTextActive: {
        color: colors.surface,
      },
      stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.borderLight,
      },
      btnRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      },
      backStepBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
      },
      backStepText: {
        fontFamily: fontFamily('600'),
        fontSize: moderateScale(14),
        color: colors.textSecondary,
      },
    }),
  };
}

export function createOtpStyles(role: Role) {
  const accent = roleColors(role);

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: layout.sectionGap - 8,
    },
    header: {
      alignItems: 'center',
      gap: layout.fieldGap + 4,
    },
    iconCircle: {
      width: moderateScale(72),
      height: moderateScale(72),
      borderRadius: moderateScale(36),
      backgroundColor: accent.light,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpBanner: {
      width: '100%',
      backgroundColor: role === 'athlete' ? colors.successBg : accent.light,
      borderWidth: 1.5,
      borderColor: role === 'athlete' ? colors.successBorder : accent.primary + '55',
      borderRadius: layout.radiusLg,
      padding: layout.horizontalPadding - 6,
      alignItems: 'center',
      gap: layout.fieldGap + 2,
      borderStyle: 'dashed',
    },
    otpDisplay: { flexDirection: 'row', gap: layout.fieldGap - 2 },
    otpDisplayBox: {
      width: moderateScale(36),
      height: moderateScale(44),
      borderRadius: layout.radiusSm - 2,
      backgroundColor: role === 'athlete' ? '#DCFCE7' : accent.light,
      borderWidth: 1,
      borderColor: role === 'athlete' ? colors.successBorder : accent.primary + '44',
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpDisplayDigit: {
      fontFamily: fontFamily('800'),
      fontSize: moderateScale(22),
      color: role === 'athlete' ? colors.success : accent.primary,
    },
    inputRow: {
      flexDirection: 'row',
      gap: layout.fieldGap + 2,
      justifyContent: 'center',
    },
    otpBoxFilled: {
      borderColor: accent.primary,
      backgroundColor: accent.light,
    },
    timerRow: { alignItems: 'center' },
    resendBtn: {
      flexDirection: 'row',
      gap: layout.fieldGap - 2,
      alignItems: 'center',
      padding: layout.fieldGap,
    },
    centered: { textAlign: 'center' as const },
  });
}
