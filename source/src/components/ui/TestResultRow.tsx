import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TestResult } from '../../types/app';
import { colors } from '../../theme/colors';

interface TestResultRowProps {
  test: TestResult;
}

export const TestResultRow: React.FC<TestResultRowProps> = ({ test }) => {
  const isCompleted = test.isCompleted;

  return (
    <View style={styles.row}>
      <View style={styles.leftCol}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isCompleted ? colors.success : colors.border },
          ]}
        />
        <View>
          <Text style={styles.testName}>{test.testName}</Text>
          <Text style={styles.category}>{test.category}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.valueText,
            !isCompleted && styles.pendingText,
          ]}
        >
          {isCompleted ? test.value : 'Pending'}
        </Text>
        {isCompleted && (
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{test.score}/10</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  category: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  pendingText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scorePill: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
});
