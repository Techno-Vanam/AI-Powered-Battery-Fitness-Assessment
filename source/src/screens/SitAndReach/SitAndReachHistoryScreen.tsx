import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAthleteHistory } from '../../services/sitAndReachService';
import { countPending } from '../../db/sitAndReachRepository';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SitAndReachHistory'>;

interface TestRow {
  id: number;
  score: string;
  trial_1: string; trial_2: string; trial_3: string;
  created_at: string;
}

export default function SitAndReachHistoryScreen({ route, navigation }: Props) {
  const { athleteId, athleteName } = route.params;
  const [results, setResults] = useState<TestRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [data, pending] = await Promise.all([getAthleteHistory(athleteId), countPending()]);
      setResults(data);
      setPendingCount(pending);
    } catch {
      // Handle network errors gracefully
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [athleteId]));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{athleteName} — Sit & Reach History</Text>
      {pendingCount > 0 && (
        <Text style={styles.pendingBadge}>{pendingCount} result(s) pending upload</Text>
      )}
      <FlatList
        data={results}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.score}>{Number(item.score).toFixed(1)} cm</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
              <Text style={styles.trials}>
                Trials: {[item.trial_1, item.trial_2, item.trial_3].map(t => Number(t).toFixed(1)).join(', ')} cm
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('SitAndReachCorrect', { test: item, athleteId, athleteName })}>
              <Text style={styles.correctLink}>Correct</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No results recorded yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  pendingBadge: { color: '#a15c00', backgroundColor: '#fff3e0', padding: 8, borderRadius: 6, marginBottom: 12, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  score: { fontSize: 20, fontWeight: '700', color: '#1a4d8f' },
  date: { fontSize: 12, color: '#888', marginTop: 2 },
  trials: { fontSize: 12, color: '#555', marginTop: 2 },
  correctLink: { color: '#c0392b', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' }
});
