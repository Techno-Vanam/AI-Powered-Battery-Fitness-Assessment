import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { openDatabase, closeDatabase } from './database';

interface DatabaseContextValue {
  isReady: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({ isReady: false, error: null });

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    openDatabase()
      .then(() => { if (mounted) setIsReady(true); })
      .catch(e => { if (mounted) setError(String(e?.message ?? 'Database failed to open')); });
    return () => {
      mounted = false;
      closeDatabase().catch(() => {});
    };
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Storage error: {error}</Text>
      </View>
    );
  }

  if (!isReady) return null;

  return (
    <DatabaseContext.Provider value={{ isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseReady(): DatabaseContextValue {
  return useContext(DatabaseContext);
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center', padding: 24 },
});
