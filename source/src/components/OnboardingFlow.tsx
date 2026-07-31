import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { fontFamily } from '../theme/fonts';
import { colors, layout, moderateScale } from '../theme';

/* --- Pure React Native Vector Lucide Icons --- */

// Lucide Trophy Icon
const TrophyIcon = ({ size = 16, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.7, height: size * 0.55, backgroundColor: color, borderBottomLeftRadius: size * 0.35, borderBottomRightRadius: size * 0.35, borderTopLeftRadius: size * 0.1, borderTopRightRadius: size * 0.1 }} />
    <View style={{ width: size * 0.25, height: size * 0.2, backgroundColor: color }} />
    <View style={{ width: size * 0.75, height: size * 0.15, backgroundColor: color, borderRadius: size * 0.05 }} />
  </View>
);

// Lucide Shield / Users Icon
const ShieldIcon = ({ size = 16, color = '#10B981' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.75, height: size * 0.85, backgroundColor: color, borderBottomLeftRadius: size * 0.4, borderBottomRightRadius: size * 0.4, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2 }} />
  </View>
);

// Lucide Zap / Lightning Icon
const ZapIcon = ({ size = 16, color = '#EF4444' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.4, height: size * 0.5, backgroundColor: color, transform: [{ skewX: '-20deg' }], borderTopLeftRadius: 2 }} />
    <View style={{ width: size * 0.4, height: size * 0.5, backgroundColor: color, transform: [{ skewX: '-20deg' }], marginTop: -size * 0.2, borderBottomRightRadius: 2 }} />
  </View>
);

// Lucide Flame Icon
const FlameIcon = ({ size = 14, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.65, height: size * 0.85, backgroundColor: color, borderRadius: size * 0.3, borderTopLeftRadius: size * 0.5, transform: [{ rotate: '45deg' }] }} />
  </View>
);

// Lucide Activity / Run Icon
const ActivityIcon = ({ size = 14, color = '#38BDF8' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 1 }}>
    <View style={{ width: 2, height: size * 0.4, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 2, height: size * 0.9, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 2, height: size * 0.5, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

// Lucide Clipboard Icon
const ClipboardIcon = ({ size = 14, color = '#10B981' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.7, height: size * 0.85, borderRadius: 3, borderWidth: 1.5, borderColor: color, alignItems: 'center' }}>
      <View style={{ width: size * 0.35, height: 3, backgroundColor: color, marginTop: -2, borderRadius: 1 }} />
    </View>
  </View>
);

// Lucide Bell Icon
const BellIcon = ({ size = 16, color = '#EF4444' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.65, height: size * 0.65, backgroundColor: color, borderTopLeftRadius: size * 0.35, borderTopRightRadius: size * 0.35, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />
    <View style={{ width: size * 0.85, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: size * 0.25, height: 2.5, backgroundColor: color, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginTop: 1 }} />
  </View>
);

// Lucide Arrow Right Icon
const ArrowRightIcon = ({ size = 16, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
    <View style={{ width: size * 0.5, height: 2.5, backgroundColor: color }} />
    <View style={{ width: size * 0.3, height: size * 0.3, borderTopWidth: 2.5, borderRightWidth: 2.5, borderColor: color, transform: [{ rotate: '45deg' }], marginLeft: -3 }} />
  </View>
);

// Lucide Star Icon
const StarIcon = ({ size = 14, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.6, height: size * 0.6, backgroundColor: color, transform: [{ rotate: '45deg' }], borderRadius: 2 }} />
  </View>
);

/* --- Slide Configuration Data --- */
const SLIDES = [
  {
    id: '1',
    badgeType: 'trophy',
    badgeText: 'PERFORMANCE TRACKER',
    stepLabel: 'STEP 1 OF 3',
    title: 'Track your sports\nand get the result',
    description: 'Keep precise track of your athletic accomplishments, daily workouts, match statistics, and fitness progress.',
    subTextStats: [
      { icon: 'flame', label: '850 kcal' },
      { icon: 'activity', label: '5.2 km today' },
    ],
    accentColor: '#F59E0B',
    bgColor: '#FAF8F5',
    activeDot: 0,
    type: 'track',
    buttonText: 'NEXT',
    showSkip: true,
  },
  {
    id: '2',
    badgeType: 'shield',
    badgeText: 'TEAM & STRATEGY',
    stepLabel: 'STEP 2 OF 3',
    title: 'Stay organized\nwith team',
    description: 'Understand team strategies, coordinate match lineups, analyze playbooks, and collaborate seamlessly with teammates.',
    subTextStats: [
      { icon: 'clipboard', label: '4-3-3 Lineup' },
      { icon: 'shield', label: '11 Active Players' },
    ],
    accentColor: '#10B981',
    bgColor: '#F4FBF7',
    activeDot: 1,
    type: 'team',
    buttonText: 'NEXT',
    showSkip: true,
  },
  {
    id: '3',
    badgeType: 'zap',
    badgeText: 'LIVE MATCH ALERTS',
    stepLabel: 'STEP 3 OF 3',
    title: 'Get notified when\ngames happen',
    description: 'Take control of live match notifications, stay updated with instant score alerts, and sync your team schedule.',
    subTextStats: [
      { icon: 'bell', label: '3 Live Match Alerts Active' },
    ],
    accentColor: '#EF4444',
    bgColor: '#FEF2F2',
    activeDot: 2,
    type: 'notify',
    buttonText: 'START EXPERIENCE',
    showSkip: false,
  },
];

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Responsive device ratio calculations (Adapts fit for Small Phones, Large Phones, and Tablets)
  const isTablet = width >= 600 || height >= 1000;
  const isSmallPhone = height < 680 || width < 360;

  const usableHeight = height - (insets.top || 20) - (insets.bottom || 20);
  const maxCircleSize = isTablet ? 300 : isSmallPhone ? 210 : 250;
  const circleSize = Math.min(width * (isTablet ? 0.45 : 0.64), usableHeight * 0.32, maxCircleSize);
  
  const titleFontSize = isTablet ? 28 : isSmallPhone ? 20 : 24;
  const cardMaxWidth = isTablet ? 560 : 420;

  const paddingTop = Math.max(insets.top, 16);
  const paddingBottom = Math.max(insets.bottom, 20);

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      onComplete?.();
    }
  };

  const handleSkip = () => {
    onComplete?.();
  };

  // Helper to render Lucide badge icons
  const renderBadgeIcon = (badgeType: string, color: string) => {
    if (badgeType === 'trophy') return <TrophyIcon size={14} color={color} />;
    if (badgeType === 'shield') return <ShieldIcon size={14} color={color} />;
    return <ZapIcon size={14} color={color} />;
  };

  // Pure React Native Sports-themed vector illustrations per slide
  const renderIllustration = (slide: typeof SLIDES[0]) => {
    const type = slide.type;

    if (type === 'track') {
      return (
        <View style={[styles.illustrationCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: slide.bgColor }]}>
          {/* Running Track background curves */}
          <View style={styles.trackCurveOuter} />
          <View style={styles.trackCurveInner} />

          {/* Stopwatch graphic (Top Left) */}
          <View style={styles.stopwatchBody}>
            <View style={styles.stopwatchTopBtn} />
            <Text style={styles.stopwatchText}>00:42.5</Text>
          </View>

          {/* Gold Sports Trophy (Center) */}
          <View style={styles.trophyContainer}>
            {/* Stars above trophy */}
            <View style={styles.starsRow}>
              <StarIcon size={12} color="#F59E0B" />
              <StarIcon size={18} color="#F59E0B" />
              <StarIcon size={12} color="#F59E0B" />
            </View>

            {/* Trophy Cup */}
            <View style={styles.trophyCup}>
              <View style={styles.trophyHandleLeft} />
              <View style={styles.trophyHandleRight} />
              <View style={styles.trophyShine} />
            </View>
            <View style={styles.trophyStem} />
            <View style={styles.trophyBase} />
          </View>

          {/* Sports Ball Accent (Bottom Right) */}
          <View style={styles.sportsBall}>
            <View style={styles.ballSeam1} />
            <View style={styles.ballSeam2} />
          </View>

          {/* Floating Stats Tag with Lucide Flame Icon */}
          <View style={styles.floatingStatsTag}>
            <FlameIcon size={12} color="#EA580C" />
            <Text style={styles.floatingStatsText}>850 kcal</Text>
          </View>
        </View>
      );
    }

    if (type === 'team') {
      return (
        <View style={[styles.illustrationCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: slide.bgColor }]}>
          {/* Sports Field Tactic Board */}
          <View style={styles.tacticsBoard}>
            {/* Field lines */}
            <View style={styles.fieldCenterLine} />
            <View style={styles.fieldCenterCircle} />
            
            {/* Player positions (X and O tactics) */}
            <View style={[styles.playerMarker, styles.playerX1]}>
              <Text style={styles.markerTextX}>✕</Text>
            </View>
            <View style={[styles.playerMarker, styles.playerX2]}>
              <Text style={styles.markerTextX}>✕</Text>
            </View>
            <View style={[styles.playerMarker, styles.playerO1]}>
              <Text style={styles.markerTextO}>◯</Text>
            </View>

            {/* Tactical Arrow */}
            <View style={styles.tacticalArrowLine} />
          </View>

          {/* Team Jersey Badge (Right) */}
          <View style={styles.jerseyCard}>
            <View style={styles.jerseyCollar} />
            <Text style={styles.jerseyNumber}>10</Text>
          </View>

          {/* Referee Whistle (Bottom Left) */}
          <View style={styles.whistleBody}>
            <View style={styles.whistleMouth} />
            <View style={styles.whistleRing} />
          </View>

          {/* Floating Lineup Tag with Lucide Clipboard Icon */}
          <View style={styles.floatingLineupTag}>
            <ClipboardIcon size={12} color="#10B981" />
            <Text style={styles.floatingLineupText}>4-3-3</Text>
          </View>
        </View>
      );
    }

    // Live Game Notification (type === 'notify')
    return (
      <View style={[styles.illustrationCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2, backgroundColor: slide.bgColor }]}>
        {/* Stadium Spotlight Rays */}
        <View style={styles.spotlightLeft} />
        <View style={styles.spotlightRight} />

        {/* Scoreboard Card (Center) */}
        <View style={styles.scoreboardCard}>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.teamCol}>
              <Text style={styles.teamCode}>FCB</Text>
              <Text style={styles.teamScore}>2</Text>
            </View>
            <Text style={styles.vsDivider}>-</Text>
            <View style={styles.teamCol}>
              <Text style={styles.teamScore}>1</Text>
              <Text style={styles.teamCode}>RMA</Text>
            </View>
          </View>
          <Text style={styles.matchTimer}>84' GOAL</Text>
        </View>

        {/* Bell Notification Badge (Top Right) */}
        <View style={styles.notificationBellBadge}>
          <BellIcon size={18} color="#EF4444" />
          <View style={styles.bellRedDot} />
        </View>

        {/* Floating Live Alert Tag */}
        <View style={styles.floatingLiveTag}>
          <ZapIcon size={12} color="#EF4444" />
          <Text style={styles.floatingLiveText}>Live Score Update</Text>
        </View>
      </View>
    );
  };

  const slide = SLIDES[activeSlide];

  return (
    <SafeAreaView style={styles.rootSafeArea} edges={['top', 'bottom', 'left', 'right']}>
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: paddingTop,
            paddingBottom: paddingBottom,
          },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentWrapper, { maxWidth: cardMaxWidth }]}>
          {/* Top Step Progress Bar */}
          <View style={styles.topProgressTrack}>
            <View
              style={[
                styles.topProgressFill,
                {
                  width: `${((activeSlide + 1) / SLIDES.length) * 100}%`,
                  backgroundColor: slide.accentColor,
                },
              ]}
            />
          </View>

          {/* Header Bar with Lucide Category Badge & Step Label */}
          <View style={styles.headerBar}>
            <View style={styles.badgeContainer}>
              {renderBadgeIcon(slide.badgeType, slide.accentColor)}
              <Text style={[styles.badgeText, { color: slide.accentColor }]}>{slide.badgeText}</Text>
            </View>
            <Text style={styles.stepLabelText}>{slide.stepLabel}</Text>
          </View>

          {/* Main Sports Graphic Illustration */}
          <View style={[styles.illustrationContainer, { marginVertical: isSmallPhone ? 6 : 14 }]}>
            {renderIllustration(slide)}
          </View>

          {/* Animated Dots Indicator */}
          <View style={styles.paginationRow}>
            {SLIDES.map((s, idx) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setActiveSlide(idx)}
                activeOpacity={0.7}
                style={[
                  styles.dot,
                  idx === activeSlide
                    ? [styles.dotActive, { backgroundColor: slide.accentColor }]
                    : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          {/* Title, Description & Lucide SubText Stats */}
          <View style={styles.textSection}>
            <Text style={[styles.titleText, { fontSize: titleFontSize }]}>{slide.title}</Text>
            <Text style={[styles.descriptionText, isTablet && { fontSize: 16, lineHeight: 24 }]}>
              {slide.description}
            </Text>
            
            {/* Sub-text Highlight Pill with Lucide Icons */}
            <View style={styles.subTextPill}>
              {slide.subTextStats.map((stat, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text style={styles.subTextDot}>•</Text>}
                  <View style={styles.statItemRow}>
                    {stat.icon === 'flame' && <FlameIcon size={13} color="#F59E0B" />}
                    {stat.icon === 'activity' && <ActivityIcon size={13} color="#38BDF8" />}
                    {stat.icon === 'clipboard' && <ClipboardIcon size={13} color="#10B981" />}
                    {stat.icon === 'shield' && <ShieldIcon size={13} color="#10B981" />}
                    {stat.icon === 'bell' && <BellIcon size={13} color="#EF4444" />}
                    <Text style={styles.subTextContent}>{stat.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Action Footer */}
        <View style={[styles.footerSection, { maxWidth: cardMaxWidth }]}>
          {slide.showSkip ? (
            <View style={styles.bottomNavRow}>
              <TouchableOpacity onPress={handleSkip} activeOpacity={0.7} style={styles.skipTouchArea}>
                <Text style={styles.skipText}>SKIP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                style={[styles.nextPillButton, { backgroundColor: '#0F172A' }]}
              >
                <Text style={styles.nextPillText}>NEXT</Text>
                <ArrowRightIcon size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bottomSingleNavRow}>
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.85}
                style={[styles.startFullPillButton, { backgroundColor: '#0F172A' }]}
              >
                <Text style={styles.startFullPillText}>START EXPERIENCE</Text>
                <ArrowRightIcon size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },

  /* Top Step Progress Bar */
  topProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  topProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* Header & Category Badge */
  headerBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontFamily: fontFamily('800'),
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  stepLabelText: {
    fontFamily: fontFamily('800'),
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },

  /* Illustration Circle / Backdrop */
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustrationCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  /* Slide 1 - Sports Tracking Styles */
  trackCurveOuter: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    top: -20,
    left: -20,
    borderStyle: 'dashed',
  },
  trackCurveInner: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    bottom: -15,
    right: -15,
  },
  stopwatchBody: {
    position: 'absolute',
    top: 22,
    left: 20,
    backgroundColor: '#1E293B',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  stopwatchTopBtn: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 4,
    backgroundColor: '#64748B',
    borderRadius: 2,
  },
  stopwatchText: {
    fontFamily: fontFamily('800'),
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },

  trophyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  trophyCup: {
    width: 66,
    height: 58,
    backgroundColor: '#F59E0B',
    borderBottomLeftRadius: 33,
    borderBottomRightRadius: 33,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyHandleLeft: {
    position: 'absolute',
    left: -14,
    top: 8,
    width: 14,
    height: 26,
    borderWidth: 3.5,
    borderColor: '#D97706',
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  trophyHandleRight: {
    position: 'absolute',
    right: -14,
    top: 8,
    width: 14,
    height: 26,
    borderWidth: 3.5,
    borderColor: '#D97706',
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
  },
  trophyShine: {
    width: 12,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    position: 'absolute',
    left: 10,
    transform: [{ rotate: '15deg' }],
  },
  trophyStem: {
    width: 18,
    height: 16,
    backgroundColor: '#D97706',
  },
  trophyBase: {
    width: 62,
    height: 14,
    backgroundColor: '#1E293B',
    borderRadius: 4,
  },

  sportsBall: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EA580C',
    borderWidth: 2,
    borderColor: '#C2410C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ballSeam1: {
    position: 'absolute',
    width: 42,
    height: 2,
    backgroundColor: '#431407',
  },
  ballSeam2: {
    position: 'absolute',
    width: 2,
    height: 42,
    backgroundColor: '#431407',
  },

  floatingStatsTag: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingStatsText: {
    fontFamily: fontFamily('800'),
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Slide 2 - Team Strategy Styles */
  tacticsBoard: {
    width: 136,
    height: 136,
    backgroundColor: '#10B981',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#047857',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  fieldCenterLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  fieldCenterCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  playerMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerX1: {
    top: 16,
    left: 22,
    backgroundColor: '#EF4444',
  },
  playerX2: {
    bottom: 18,
    right: 22,
    backgroundColor: '#EF4444',
  },
  playerO1: {
    top: 22,
    right: 26,
    backgroundColor: '#3B82F6',
  },
  markerTextX: {
    fontFamily: fontFamily('800'),
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  markerTextO: {
    fontFamily: fontFamily('800'),
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  tacticalArrowLine: {
    position: 'absolute',
    width: 44,
    height: 3,
    backgroundColor: '#FBBF24',
    transform: [{ rotate: '-35deg' }],
    top: 46,
    left: 38,
  },

  jerseyCard: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 46,
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  jerseyCollar: {
    position: 'absolute',
    top: 0,
    width: 18,
    height: 8,
    backgroundColor: '#FAF8F5',
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
  },
  jerseyNumber: {
    fontFamily: fontFamily('800'),
    color: '#FBBF24',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },

  whistleBody: {
    position: 'absolute',
    bottom: 18,
    left: 22,
    width: 34,
    height: 22,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
  },
  whistleMouth: {
    position: 'absolute',
    left: -8,
    width: 10,
    height: 10,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
  whistleRing: {
    position: 'absolute',
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#64748B',
  },

  floatingLineupTag: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingLineupText: {
    fontFamily: fontFamily('800'),
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },

  /* Slide 3 - Live Alerts Styles */
  spotlightLeft: {
    position: 'absolute',
    top: -20,
    left: 10,
    width: 60,
    height: 160,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    transform: [{ rotate: '-25deg' }],
  },
  spotlightRight: {
    position: 'absolute',
    top: -20,
    right: 10,
    width: 60,
    height: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    transform: [{ rotate: '25deg' }],
  },
  scoreboardCard: {
    width: 176,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 4,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  liveText: {
    fontFamily: fontFamily('800'),
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  teamCol: {
    alignItems: 'center',
  },
  teamCode: {
    fontFamily: fontFamily('800'),
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  teamScore: {
    fontFamily: fontFamily('800'),
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  vsDivider: {
    fontFamily: fontFamily('800'),
    color: '#64748B',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  matchTimer: {
    fontFamily: fontFamily('800'),
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },

  notificationBellBadge: {
    position: 'absolute',
    top: 18,
    right: 22,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bellRedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },

  floatingLiveTag: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingLiveText: {
    fontFamily: fontFamily('800'),
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },

  /* Pagination Dots */
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },

  /* Text Section */
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    maxWidth: 360,
  },
  titleText: {
    fontFamily: fontFamily('800'),
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 33,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontFamily: fontFamily('800'),
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },

  subTextPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  subTextDot: {
    fontFamily: fontFamily('800'),
    color: '#94A3B8',
    fontSize: 12,
  },
  subTextContent: {
    fontFamily: fontFamily('800'),
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* Bottom Controls Footer */
  footerSection: {
    width: '100%',
    marginTop: 12,
  },
  bottomNavRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  skipTouchArea: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  skipText: {
    fontFamily: fontFamily('800'),
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
  },
  nextPillButton: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 26,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextPillText: {
    fontFamily: fontFamily('800'),
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  bottomSingleNavRow: {
    width: '100%',
    alignItems: 'center',
  },
  startFullPillButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    gap: 8,
  },
  startFullPillText: {
    fontFamily: fontFamily('800'),
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});

export default OnboardingFlow;
