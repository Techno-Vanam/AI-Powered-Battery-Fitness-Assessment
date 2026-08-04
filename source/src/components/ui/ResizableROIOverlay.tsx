import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import AppText from './AppText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ROIRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizableROIOverlayProps {
  initialRect?: ROIRect;
  onRectChange: (rect: ROIRect) => void;
  isStable?: boolean;
}

const MIN_WIDTH = 140;
const MIN_HEIGHT = 70;
const MAX_WIDTH = SCREEN_WIDTH * 0.95;
const MAX_HEIGHT = 260;

const DEFAULT_RECT: ROIRect = {
  x: (SCREEN_WIDTH - SCREEN_WIDTH * 0.8) / 2,
  y: SCREEN_HEIGHT / 2 - 110,
  width: SCREEN_WIDTH * 0.8,
  height: 140,
};

export const ResizableROIOverlay: React.FC<ResizableROIOverlayProps> = ({
  initialRect = DEFAULT_RECT,
  onRectChange,
  isStable = false,
}) => {
  const rectRef = useRef<ROIRect>(initialRect);
  const [rect, setRect] = useState<ROIRect>(initialRect);

  // Notify parent whenever rect changes
  const updateRect = useCallback(
    (newRect: ROIRect) => {
      // Clamp to screen bounds
      const clampedX = Math.max(10, Math.min(newRect.x, SCREEN_WIDTH - newRect.width - 10));
      const clampedY = Math.max(60, Math.min(newRect.y, SCREEN_HEIGHT - newRect.height - 200));
      const clampedW = Math.max(MIN_WIDTH, Math.min(newRect.width, MAX_WIDTH));
      const clampedH = Math.max(MIN_HEIGHT, Math.min(newRect.height, MAX_HEIGHT));

      const finalRect = {
        x: clampedX,
        y: clampedY,
        width: clampedW,
        height: clampedH,
      };

      rectRef.current = finalRect;
      setRect(finalRect);
      onRectChange(finalRect);
    },
    [onRectChange]
  );

  // ── Drag Center Responder ──────────────────────────────────────────────────
  const dragStartPos = useRef({ x: 0, y: 0, rectX: 0, rectY: 0 });

  const centerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        dragStartPos.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          rectX: rectRef.current.x,
          rectY: rectRef.current.y,
        };
      },
      onPanResponderMove: (evt) => {
        const dx = evt.nativeEvent.pageX - dragStartPos.current.x;
        const dy = evt.nativeEvent.pageY - dragStartPos.current.y;
        updateRect({
          ...rectRef.current,
          x: dragStartPos.current.rectX + dx,
          y: dragStartPos.current.rectY + dy,
        });
      },
    })
  ).current;

  // ── Corner Resize Responders ───────────────────────────────────────────────
  const resizeStartPos = useRef({ x: 0, y: 0, ...initialRect });

  const createCornerResponder = (corner: 'tl' | 'tr' | 'bl' | 'br') =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        resizeStartPos.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          ...rectRef.current,
        };
      },
      onPanResponderMove: (evt) => {
        const dx = evt.nativeEvent.pageX - resizeStartPos.current.x;
        const dy = evt.nativeEvent.pageY - resizeStartPos.current.y;
        const start = resizeStartPos.current;

        let newX = start.x;
        let newY = start.y;
        let newW = start.width;
        let newH = start.height;

        if (corner === 'br') {
          newW = start.width + dx;
          newH = start.height + dy;
        } else if (corner === 'bl') {
          newX = start.x + dx;
          newW = start.width - dx;
          newH = start.height + dy;
        } else if (corner === 'tr') {
          newY = start.y + dy;
          newW = start.width + dx;
          newH = start.height - dy;
        } else if (corner === 'tl') {
          newX = start.x + dx;
          newY = start.y + dy;
          newW = start.width - dx;
          newH = start.height - dy;
        }

        updateRect({ x: newX, y: newY, width: newW, height: newH });
      },
    });

  const tlResponder = useRef(createCornerResponder('tl')).current;
  const trResponder = useRef(createCornerResponder('tr')).current;
  const blResponder = useRef(createCornerResponder('bl')).current;
  const brResponder = useRef(createCornerResponder('br')).current;

  // ── Scan line animation ────────────────────────────────────────────────────
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isStable) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isStable]);

  const scanTranslateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, Math.max(10, rect.height - 6)],
  });

  const boxColor = isStable ? '#10B981' : '#3B82F6';

  return (
    <>
      {/* Dark Vignette Bands around ROI Box */}
      <View style={[styles.darkBand, { top: 0, height: rect.y, width: SCREEN_WIDTH }]} />
      <View
        style={[
          styles.darkBand,
          { top: rect.y + rect.height, height: SCREEN_HEIGHT - (rect.y + rect.height), width: SCREEN_WIDTH },
        ]}
      />
      <View style={[styles.darkBand, { top: rect.y, height: rect.height, width: rect.x }]} />
      <View
        style={[
          styles.darkBand,
          { top: rect.y, height: rect.height, left: rect.x + rect.width, width: SCREEN_WIDTH - (rect.x + rect.width) },
        ]}
      />

      {/* Main Draggable Box */}
      <View
        style={[
          styles.roiBox,
          {
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height,
            borderColor: boxColor,
          },
        ]}
        {...centerPanResponder.panHandlers}
      >
        {/* Animated Scan Line */}
        {!isStable && (
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanTranslateY }] },
            ]}
          />
        )}

        {/* Top Label */}
        <View style={styles.labelContainer}>
          <AppText variant="caption" style={styles.labelText}>
            {isStable ? '✓ DISPLAY LOCKED' : 'DRAG / RESIZE OVER LCD DISPLAY'}
          </AppText>
        </View>

        {/* Dimension Pill */}
        <View style={styles.dimensionPill}>
          <AppText variant="caption" style={styles.dimensionText}>
            {Math.round(rect.width)} × {Math.round(rect.height)}
          </AppText>
        </View>

        {/* Corner Bracket Visuals */}
        <View style={[styles.cornerBracket, styles.bracketTL, { borderColor: boxColor }]} />
        <View style={[styles.cornerBracket, styles.bracketTR, { borderColor: boxColor }]} />
        <View style={[styles.cornerBracket, styles.bracketBL, { borderColor: boxColor }]} />
        <View style={[styles.cornerBracket, styles.bracketBR, { borderColor: boxColor }]} />

        {/* Interactive Corner Resize Handles */}
        <View style={[styles.handle, styles.handleTL]} {...tlResponder.panHandlers}>
          <View style={[styles.handleDot, { backgroundColor: boxColor }]} />
        </View>
        <View style={[styles.handle, styles.handleTR]} {...trResponder.panHandlers}>
          <View style={[styles.handleDot, { backgroundColor: boxColor }]} />
        </View>
        <View style={[styles.handle, styles.handleBL]} {...blResponder.panHandlers}>
          <View style={[styles.handleDot, { backgroundColor: boxColor }]} />
        </View>
        <View style={[styles.handle, styles.handleBR]} {...brResponder.panHandlers}>
          <View style={[styles.handleDot, { backgroundColor: boxColor }]} />
        </View>
      </View>
    </>
  );
};

const HANDLE_TOUCH_SIZE = 36;
const HANDLE_DOT_SIZE = 14;
const BRACKET_SIZE = 20;

const styles = StyleSheet.create({
  darkBand: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  roiBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  scanLine: {
    position: 'absolute',
    left: 6,
    right: 6,
    height: 2,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  labelContainer: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  labelText: {
    color: '#E0F2FE',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dimensionPill: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dimensionText: {
    color: '#93C5FD',
    fontSize: 9,
    fontWeight: '600',
  },
  cornerBracket: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    borderWidth: 3,
  },
  bracketTL: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  bracketTR: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  bracketBL: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  bracketBR: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },

  // Touch targets for corner handles
  handle: {
    position: 'absolute',
    width: HANDLE_TOUCH_SIZE,
    height: HANDLE_TOUCH_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  handleTL: { top: -HANDLE_TOUCH_SIZE / 2, left: -HANDLE_TOUCH_SIZE / 2 },
  handleTR: { top: -HANDLE_TOUCH_SIZE / 2, right: -HANDLE_TOUCH_SIZE / 2 },
  handleBL: { bottom: -HANDLE_TOUCH_SIZE / 2, left: -HANDLE_TOUCH_SIZE / 2 },
  handleBR: { bottom: -HANDLE_TOUCH_SIZE / 2, right: -HANDLE_TOUCH_SIZE / 2 },
  handleDot: {
    width: HANDLE_DOT_SIZE,
    height: HANDLE_DOT_SIZE,
    borderRadius: HANDLE_DOT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
});

export default ResizableROIOverlay;
