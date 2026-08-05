import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { ArrowLeft, Search, X, Calendar } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { AthleteRow } from '../../components/ui/AthleteRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { Athlete } from '../../types/app';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';

interface SearchScreenProps {
  onBack: () => void;
  onSelectAthlete: (athlete: Athlete) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onSelectAthlete }) => {
  const { athletes, sessions } = useApp();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Athletes' | 'Sessions' | 'Tests'>('All');

  const filteredAthletes = athletes.filter(a => {
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.school.toLowerCase().includes(q) ||
      a.sport.toLowerCase().includes(q)
    );
  });

  const filteredSessions = sessions.filter(s => {
    const q = query.toLowerCase();
    return (
      s.sessionName.toLowerCase().includes(q) ||
      s.schoolName.toLowerCase().includes(q) ||
      s.coachName.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>
      {/* Top Search Input Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search athletes, schools, sports, tests, sessions..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['All', 'Athletes', 'Sessions', 'Tests'] as const).map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, categoryFilter === cat && styles.catBtnActive]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={[styles.catText, categoryFilter === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results List */}
      <FlatList
        data={categoryFilter === 'Sessions' ? [] : filteredAthletes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          categoryFilter === 'All' || categoryFilter === 'Sessions' ? (
            <View>
              {filteredSessions.length > 0 && (
                <View style={styles.sectionWrap}>
                  <Text style={styles.sectionTitle}>Matching Assessment Sessions</Text>
                  {filteredSessions.map(sess => (
                    <View key={sess.id} style={[styles.sessionResultCard, layout.shadowSubtle]}>
                      <Calendar size={16} color={colors.primary} style={{ marginRight: 8 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sessionName}>{sess.sessionName}</Text>
                        <Text style={styles.sessionSub}>{sess.schoolName} · Coach {sess.coachName}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
              {categoryFilter === 'All' && filteredAthletes.length > 0 && (
                <Text style={styles.sectionTitle}>Matching Athlete Records</Text>
              )}
            </View>
          ) : null
        }
        ListEmptyComponent={
          query.length > 0 ? (
            <EmptyState
              title="No Results Found"
              message={`No records matched "${query}". Try adjusting your search keywords or category.`}
            />
          ) : (
            <View style={styles.hintBox}>
              <Search size={32} color={colors.textTertiary} style={{ marginBottom: 12 }} />
              <Text style={styles.hintTitle}>App-Wide Global Search</Text>
              <Text style={styles.hintSub}>
                Type to search across athletes, schools, sports, test battery results, and sessions.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <AthleteRow athlete={item} onPress={() => onSelectAthlete(item)} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 8,
  },
  catBtnActive: {
    backgroundColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  sectionWrap: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sessionResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sessionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hintBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  hintSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
