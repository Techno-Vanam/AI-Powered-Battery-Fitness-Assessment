import React from 'react';
import { StyleSheet, View } from 'react-native';
import TestCard from './TestCard';
import SectionTitle from './SectionTitle';
import { layout } from '../../theme';
import { t } from '../../utils/i18n';
import type { DashboardTest } from '../../types/athleteDashboard';
import { DASHBOARD_TEST_KEYS } from '../../navigation/testRoutes';

type Props = {
  tests: DashboardTest[];
  onOpenTest: (test: DashboardTest) => void;
};

export default function TestJourneyList({ tests, onOpenTest }: Props) {
  const filteredTests = (tests || []).filter(
    test => DASHBOARD_TEST_KEYS.has(test.id) || DASHBOARD_TEST_KEYS.has(test.key)
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
