import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, AlertCircle } from 'lucide-react-native';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);

export const calcAge = (day: string, month: string, year: string): number | null => {
  if (!day || !month || !year) return null;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10) - 1;
  const y = parseInt(year, 10);
  const dob = new Date(y, m, d);
  const today = new Date();
  if (isNaN(dob.getTime()) || dob > today) return null;
  if (dob.getDate() !== d || dob.getMonth() !== m || dob.getFullYear() !== y) return null;
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
};

export interface DobPickerBoxProps {
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  onSelectDate: (day: string, month: string, year: string) => void;
  error?: string;
  label?: string;
  showAgePill?: boolean;
}

export const DobPickerBox: React.FC<DobPickerBoxProps> = ({
  dobDay,
  dobMonth,
  dobYear,
  onSelectDate,
  error,
  label = 'Date of Birth',
  showAgePill = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'calendar' | 'month' | 'year'>('calendar');

  const initialYear = dobYear ? parseInt(dobYear, 10) : currentYear - 15;
  const initialMonth = dobMonth ? parseInt(dobMonth, 10) - 1 : 0;

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  const openCalendar = () => {
    if (dobYear && dobMonth) {
      setViewYear(parseInt(dobYear, 10));
      setViewMonth(parseInt(dobMonth, 10) - 1);
    } else {
      setViewYear(currentYear - 15);
      setViewMonth(0);
    }
    setMode('calendar');
    setModalVisible(true);
  };

  const handlePrevYear = () => setViewYear(y => y - 1);
  const handleNextYear = () => {
    if (viewYear < currentYear) setViewYear(y => y + 1);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < currentYear) {
        setViewMonth(0);
        setViewYear(y => y + 1);
      }
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const buildCalendarDays = () => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const slots: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
    }> = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
      slots.push({ day: d, month: prevM, year: prevY, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      slots.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }

    const totalNeeded = slots.length <= 35 ? 35 : 42;
    const remaining = totalNeeded - slots.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
      slots.push({ day: d, month: nextM, year: nextY, isCurrentMonth: false });
    }

    return slots;
  };

  const handleDaySelect = (day: number, month: number, year: number) => {
    const selectedDate = new Date(year, month, day);
    if (selectedDate > new Date()) return;

    const dayStr = String(day).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const yearStr = String(year);

    onSelectDate(dayStr, monthStr, yearStr);
    setModalVisible(false);
  };

  const formattedDisplayDate =
    dobDay && dobMonth && dobYear
      ? `${dobDay}/${dobMonth}/${dobYear}`
      : '';

  const age = calcAge(dobDay, dobMonth, dobYear);
  const isMinor = age !== null && age < 18;
  const calendarSlots = buildCalendarDays();

  const selectedD = dobDay ? parseInt(dobDay, 10) : null;
  const selectedM = dobMonth ? parseInt(dobMonth, 10) - 1 : null;
  const selectedY = dobYear ? parseInt(dobYear, 10) : null;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Main Box Input */}
      <TouchableOpacity
        style={[styles.inputBox, error ? styles.inputBoxError : null]}
        onPress={openCalendar}
        activeOpacity={0.8}
      >
        <Calendar size={20} color="#4F46E5" style={{ marginRight: 10 }} />
        <Text style={[styles.inputText, !formattedDisplayDate && styles.placeholderText]}>
          {formattedDisplayDate || 'DoB (DD/MM/YYYY)'}
        </Text>
      </TouchableOpacity>

      {/* Age Pill Badge */}
      {showAgePill && age !== null && (
        <View style={styles.agePill}>
          <Text style={styles.ageText}>
            Age: {age} years {isMinor ? '(Minor)' : ''}
          </Text>
        </View>
      )}

      {/* Field Error */}
      {error ? (
        <View style={styles.errorRow}>
          <AlertCircle size={12} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Calendar Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.calendarCard} onPress={e => e.stopPropagation()}>
            <View style={styles.pointerNotch} />

            {/* Header Navigation with SEPARATE Month & Year Buttons */}
            <View style={styles.calendarHeader}>
              <View style={styles.navGroup}>
                <TouchableOpacity style={styles.navBtn} onPress={handlePrevYear}>
                  <ChevronsLeft size={18} color="#334155" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={handlePrevMonth}>
                  <ChevronLeft size={18} color="#334155" />
                </TouchableOpacity>
              </View>

              {/* SEPARATE MONTH & YEAR BUTTONS */}
              <View style={styles.headerTitleContainer}>
                {/* Click Month -> Opens Month Selector */}
                <TouchableOpacity
                  style={[styles.headerPill, mode === 'month' && styles.headerPillActive]}
                  onPress={() => setMode(m => (m === 'month' ? 'calendar' : 'month'))}
                >
                  <Text style={[styles.headerPillText, mode === 'month' && styles.headerPillTextActive]}>
                    {MONTH_NAMES[viewMonth].substring(0, 3)}
                  </Text>
                  <ChevronDown size={12} color={mode === 'month' ? '#4F46E5' : '#64748B'} />
                </TouchableOpacity>

                {/* Click Year -> Opens Year Selector */}
                <TouchableOpacity
                  style={[styles.headerPill, mode === 'year' && styles.headerPillActive]}
                  onPress={() => setMode(m => (m === 'year' ? 'calendar' : 'year'))}
                >
                  <Text style={[styles.headerPillText, mode === 'year' && styles.headerPillTextActive]}>
                    {viewYear}
                  </Text>
                  <ChevronDown size={12} color={mode === 'year' ? '#4F46E5' : '#64748B'} />
                </TouchableOpacity>
              </View>

              <View style={styles.navGroup}>
                <TouchableOpacity style={styles.navBtn} onPress={handleNextMonth}>
                  <ChevronRight size={18} color="#334155" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={handleNextYear}>
                  <ChevronsRight size={18} color="#334155" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Render based on Mode */}
            {mode === 'calendar' && (
              <>
                <View style={styles.weekdayRow}>
                  {WEEKDAYS.map(day => (
                    <Text key={day} style={styles.weekdayText}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={styles.daysGrid}>
                  {calendarSlots.map((item, idx) => {
                    const isSelected =
                      item.day === selectedD &&
                      item.month === selectedM &&
                      item.year === selectedY;

                    const isFuture = new Date(item.year, item.month, item.day) > new Date();

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.dayCell}
                        disabled={isFuture}
                        onPress={() => handleDaySelect(item.day, item.month, item.year)}
                      >
                        <View style={[styles.dayPill, isSelected && styles.dayPillSelected]}>
                          <Text
                            style={[
                              styles.dayText,
                              !item.isCurrentMonth && styles.dayTextFaded,
                              isSelected && styles.dayTextSelected,
                              isFuture && styles.dayTextDisabled,
                            ]}
                          >
                            {item.day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* DEDICATED SELECT MONTH VIEW */}
            {mode === 'month' && (
              <View style={styles.pickerView}>
                <Text style={styles.pickerSubtitle}>Select Month</Text>
                <View style={styles.gridWrap}>
                  {MONTH_NAMES.map((m, idx) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerChip, viewMonth === idx && styles.pickerChipActive]}
                      onPress={() => {
                        setViewMonth(idx);
                        setMode('calendar'); // Return to calendar view after month selected
                      }}
                    >
                      <Text style={[styles.pickerChipText, viewMonth === idx && styles.pickerChipTextActive]}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* DEDICATED SELECT YEAR VIEW */}
            {mode === 'year' && (
              <View style={styles.pickerView}>
                <Text style={styles.pickerSubtitle}>Select Year</Text>
                <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={styles.gridWrap}>
                  {YEARS.map(y => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.pickerChip, viewYear === y && styles.pickerChipActive]}
                      onPress={() => {
                        setViewYear(y);
                        setMode('calendar'); // Return to calendar view after year selected
                      }}
                    >
                      <Text style={[styles.pickerChipText, viewYear === y && styles.pickerChipTextActive]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', letterSpacing: 0.3 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  agePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  ageText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pointerNotch: {
    position: 'absolute',
    top: -8,
    left: 28,
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#CBD5E1',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  navBtn: {
    padding: 4,
    borderRadius: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#818CF8',
  },
  headerPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerPillTextActive: {
    color: '#4F46E5',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillSelected: {
    backgroundColor: '#FDE047',
    shadowColor: '#CA8A04',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  dayTextFaded: {
    color: '#CBD5E1',
  },
  dayTextSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
  dayTextDisabled: {
    color: '#E2E8F0',
  },
  pickerView: {
    paddingVertical: 12,
  },
  pickerSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 10,
    textAlign: 'center',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    minWidth: 70,
    alignItems: 'center',
  },
  pickerChipActive: {
    backgroundColor: '#4F46E5',
  },
  pickerChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  pickerChipTextActive: {
    color: '#FFFFFF',
  },
});

export default DobPickerBox;
