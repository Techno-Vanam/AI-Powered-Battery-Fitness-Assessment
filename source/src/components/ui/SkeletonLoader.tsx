import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

interface SkeletonLoaderProps {
  type?: 'card' | 'row' | 'stat';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'row', count = 3 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const renderSkeletonItem = (index: number) => {
    if (type === 'stat') {
      return (
        <Animated.View key={index} style={[styles.statItem, { opacity }]}>
          <View style={styles.numBox} />
          <View style={styles.labelBox} />
        </Animated.View>
      );
    }

    if (type === 'card') {
      return (
        <Animated.View key={index} style={[styles.cardItem, { opacity }]}>
          <View style={styles.titleBox} />
          <View style={styles.subBox} />
        </Animated.View>
      );
    }

    return (
      <Animated.View key={index} style={[styles.rowItem, { opacity }]}>
        <View style={styles.avatarBox} />
        <View style={styles.rowContent}>
          <View style={styles.titleBox} />
          <View style={styles.subBox} />
        </View>
        <View style={styles.badgeBox} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => renderSkeletonItem(i))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  titleBox: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 6,
  },
  subBox: {
    width: '40%',
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  badgeBox: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
  },
  statItem: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  numBox: {
    width: 50,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  labelBox: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  cardItem: {
    backgroundColor: colors.surfaceSecondary,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
});
