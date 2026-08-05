/**
 * Jump Assessment Offline History Screen
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { jumpHistoryRepo } from '../services/jumpHistoryRepository';
import { JumpAttempt } from '../types/jump';

interface Props {
  navigation: any;
}

export const JumpHistoryScreen: React.FC<Props> = () => {
  const [history, setHistory] = useState<JumpAttempt[]>([]);

  const loadHistory = async () => {
    const list = await jumpHistoryRepo.getHistory();
    setHistory(list);
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handleClear = async () => {
    await jumpHistoryRepo.clearHistory();
    setHistory([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assessment History</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jump assessments logged offline yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemType}>
                {item.testType === 'vertical' ? 'Vertical Jump' : 'Broad Jump'}
              </Text>
              <Text style={styles.itemDate}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {item.verticalMetrics ? (
              <Text style={styles.itemScore}>{item.verticalMetrics.verticalJumpCm} cm</Text>
            ) : null}

            {item.broadMetrics ? (
              <Text style={styles.itemScore}>{item.broadMetrics.broadJumpDistanceCm} cm</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  clearText: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  listContent: {
    gap: 12,
    paddingBottom: 30,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemType: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemDate: {
    color: '#64748B',
    fontSize: 12,
  },
  itemScore: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 15,
  },
});
