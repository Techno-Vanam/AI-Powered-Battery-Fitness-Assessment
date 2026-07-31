import { useState, useEffect, useCallback } from 'react';
import { HeightTestWithAthlete, DateFilterOption, SyncFilterOption } from '../domain/models/HeightTest';
import { HeightTestUseCases } from '../domain/usecases/HeightTestUseCases';

export function useHistoryViewModel(initialAthleteId?: string) {
  const [history, setHistory] = useState<HeightTestWithAthlete[]>([]);
  const [query, setQuery] = useState(initialAthleteId ?? '');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('ALL');
  const [syncFilter, setSyncFilter] = useState<SyncFilterOption>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HeightTestWithAthlete | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await HeightTestUseCases.getFilteredHistory({
        query,
        dateFilter,
        syncFilter,
      });
      setHistory(records);
    } catch (e) {
      console.warn('Failed to load history:', e);
    } finally {
      setIsLoading(false);
    }
  }, [query, dateFilter, syncFilter]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const deleteRecord = useCallback(
    async (id: string) => {
      await HeightTestUseCases.deleteMeasurement(id);
      if (selectedRecord?.test.id === id) {
        setSelectedRecord(null);
      }
      loadHistory();
    },
    [loadHistory, selectedRecord],
  );

  return {
    history,
    query,
    setQuery,
    dateFilter,
    setDateFilter,
    syncFilter,
    setSyncFilter,
    isLoading,
    selectedRecord,
    setSelectedRecord,
    deleteRecord,
    refresh: loadHistory,
  };
}
