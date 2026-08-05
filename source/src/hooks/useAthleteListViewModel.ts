import { useState, useEffect, useCallback } from 'react';
import { Athlete } from '../database/repositories/AthleteRepository';
import { AthleteUseCases } from '../domain/usecases/AthleteUseCases';

export function useAthleteListViewModel() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAthletes = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await AthleteUseCases.getAthletes(query);
      setAthletes(list);
    } catch (e) {
      console.warn('Failed to load athletes:', e);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadAthletes();
  }, [loadAthletes]);

  return {
    athletes,
    query,
    setQuery,
    isLoading,
    refresh: loadAthletes,
  };
}
