import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestCard from './TestCard';
import SectionTitle from './SectionTitle';
import { layout } from '../../theme';
import { t } from '../../utils/i18n';
import type { DashboardTest } from '../../types/athleteDashboard';

type Props = {
  tests: DashboardTest[];
  onOpenTest: (test: DashboardTest) => void;
};

const ALLOWED_TEST_IDS = new Set(['height', 'weight', 'sit_reach', 'vertical_jump', 'sit_ups']);

export default function TestJourneyList({ tests, onOpenTest }: Props) {
  const filteredTests = (tests || []).filter(
    test => ALLOWED_TEST_IDS.has(test.id) || ALLOWED_TEST_IDS.has(test.key)
  );

  return (
    <View>
      <SectionTitle title={t('dashboard.testJourney')} />
      <View style={styles.list}>
        {filteredTests.map(test => (
          <TestCard key={test.id} test={test} onPress={() => onOpenTest(test)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: layout.fieldGap + 4,
  },
});
