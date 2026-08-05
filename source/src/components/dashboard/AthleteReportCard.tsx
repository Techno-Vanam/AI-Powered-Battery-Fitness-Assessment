import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import AppText from '../ui/AppText';
import SFSymbol from '../ui/SFSymbol';
import { colors } from '../../theme';
import type { AthleteDashboardData } from '../../types/athleteDashboard';

type Props = {
  data?: AthleteDashboardData | null;
  reportId?: string;
  assessmentDate?: string;
};

export default function AthleteReportCard({
  data,
  reportId = 'ASMT-2026-0804-001',
  assessmentDate = '04 Aug 2026',
}: Props) {
  const profile = data?.profile ?? {
    name: 'Arjun Kumar',
    athleteId: 'ATH2026001',
    age: 19,
    gender: 'Male',
    institution: 'National Sports Academy',
    photoUrl: null,
  };

  const tests = [
    { num: 1, test: 'Height', score: '170', unit: 'cm', completed: true },
    { num: 2, test: 'Weight', score: '62', unit: 'kg', completed: true },
    { num: 3, test: 'Sit & Reach', score: '24', unit: 'cm', completed: true },
    { num: 4, test: 'Vertical Jump', score: '48', unit: 'cm', completed: true },
    { num: 5, test: 'Sit-Ups', score: '38', unit: 'reps', completed: true },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <SFSymbol name="sparkles" size={20} color="#FFFFFF" />
            </View>
            <View>
              <AppText style={styles.brandTitle}>AI-POWERED</AppText>
              <AppText style={styles.brandSubtitle}>BATTERY ASSESSMENT</AppText>
            </View>
          </View>

          <View style={styles.headerRight}>
            <AppText style={styles.metaLabel}>ID: {reportId}</AppText>
            <AppText style={styles.metaValueDate}>{assessmentDate}</AppText>
          </View>
        </View>

        <View style={styles.headerBanner}>
          <AppText style={styles.reportTitle}>ATHLETE FITNESS REPORT CARD</AppText>
          <View style={styles.pillBadge}>
            <AppText style={styles.pillBadgeText}>AI ANALYTICS • PERFORMANCE • PROGRESS</AppText>
          </View>
        </View>
      </View>

      {/* TOP PROFILE GRID: ATHLETE PROFILE & PHYSICAL PROFILE */}
      <View style={styles.topProfileGrid}>
        {/* ATHLETE PROFILE CARD */}
        <View style={[styles.card, styles.athleteCard]}>
          <View style={styles.avatarBox}>
            <SFSymbol name="person.crop.circle.fill" size={68} color="#1E3A8A" />
          </View>
          <View style={styles.profileDetails}>
            <AppText style={styles.athleteName}>{profile.name}</AppText>
            <AppText style={styles.athleteIdText}>Athlete ID : {profile.athleteId}</AppText>

            <View style={styles.infoRow}>
              <SFSymbol name="person.crop.circle" size={13} color="#475569" />
              <AppText style={styles.infoKey}>Age</AppText>
              <AppText style={styles.infoVal}>: {profile.age} Years</AppText>
            </View>

            <View style={styles.infoRow}>
              <SFSymbol name="person.crop.circle" size={13} color="#475569" />
              <AppText style={styles.infoKey}>Gender</AppText>
              <AppText style={styles.infoVal}>: {profile.gender}</AppText>
            </View>

            <View style={styles.infoRow}>
              <SFSymbol name="doc.text" size={13} color="#475569" />
              <AppText style={styles.infoKey}>School / Academy</AppText>
              <AppText style={styles.infoVal}>: {profile.institution}</AppText>
            </View>

            <View style={styles.infoRow}>
              <SFSymbol name="shield.checkmark" size={13} color="#475569" />
              <AppText style={styles.infoKey}>Coach Name</AppText>
              <AppText style={styles.infoVal}>: Rahul Sharma</AppText>
            </View>
          </View>
        </View>

        {/* PHYSICAL PROFILE CARD */}
        <View style={[styles.card, styles.physicalCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconCircle}>
              <SFSymbol name="award" size={14} color="#FFFFFF" />
            </View>
            <AppText style={styles.cardTitle}>PHYSICAL PROFILE</AppText>
          </View>

          <View style={styles.physicalBodyRow}>
            <View style={styles.physicalMetricsTable}>
              <View style={styles.metricTableRow}>
                <AppText style={styles.metricKey}>Height</AppText>
                <AppText style={styles.metricVal}>170</AppText>
                <AppText style={styles.metricUnit}>cm</AppText>
              </View>

              <View style={styles.metricTableRow}>
                <AppText style={styles.metricKey}>Weight</AppText>
                <AppText style={styles.metricVal}>62</AppText>
                <AppText style={styles.metricUnit}>kg</AppText>
              </View>

              <View style={styles.metricTableRow}>
                <AppText style={styles.metricKey}>BMI</AppText>
                <AppText style={styles.metricVal}>21.5</AppText>
                <AppText style={styles.metricUnit}>kg/m²</AppText>
              </View>

              <View style={styles.metricTableRow}>
                <AppText style={styles.metricKey}>BMI Category</AppText>
                <View style={styles.normalPill}>
                  <AppText style={styles.normalPillText}>Normal</AppText>
                </View>
              </View>
            </View>

            {/* Human Silhouette & Scale SVG */}
            <View style={styles.silhouetteBox}>
              <Svg width="55" height="110" viewBox="0 0 55 110">
                {/* Height Scale Lines */}
                <Line x1="45" y1="5" x2="52" y2="5" stroke="#94A3B8" strokeWidth="1" />
                <SvgText x="54" y="8" fill="#64748B" fontSize="6" textAnchor="start">200</SvgText>
                <Line x1="45" y1="30" x2="52" y2="30" stroke="#94A3B8" strokeWidth="1" />
                <SvgText x="54" y="33" fill="#64748B" fontSize="6" textAnchor="start">150</SvgText>
                <Line x1="45" y1="55" x2="52" y2="55" stroke="#94A3B8" strokeWidth="1" />
                <SvgText x="54" y="58" fill="#64748B" fontSize="6" textAnchor="start">100</SvgText>
                <Line x1="45" y1="80" x2="52" y2="80" stroke="#94A3B8" strokeWidth="1" />
                <SvgText x="54" y="83" fill="#64748B" fontSize="6" textAnchor="start">50</SvgText>

                {/* Silhouette Path */}
                <Path
                  d="M20,12 C23,12 25,10 25,7 C25,4 23,2 20,2 C17,2 15,4 15,7 C15,10 17,12 20,12 Z M26,14 L14,14 C10,14 8,22 8,32 L11,55 L13,55 L13,38 L16,38 L16,98 L20,98 L20,60 L20,60 L24,98 L28,98 L28,38 L31,38 L31,55 L33,55 L36,32 C36,22 34,14 26,14 Z"
                  fill="#2563EB"
                  opacity="0.8"
                />
              </Svg>
            </View>
          </View>
        </View>
      </View>

      {/* MAIN TWO-COLUMN SECTION */}
      <View style={styles.mainGrid}>
        {/* LEFT COLUMN: TEST RESULTS TABLE */}
        <View style={[styles.card, styles.tableCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconCircle}>
              <SFSymbol name="list.bullet.rectangle" size={14} color="#FFFFFF" />
            </View>
            <AppText style={styles.cardTitle}>BATTERY FITNESS TEST RESULTS ({tests.length} TESTS)</AppText>
          </View>

          {/* TABLE HEADER */}
          <View style={styles.tableHeaderRow}>
            <AppText style={[styles.thText, { flex: 0.4 }]}>#</AppText>
            <AppText style={[styles.thText, { flex: 2.0 }]}>TEST</AppText>
            <AppText style={[styles.thText, { flex: 1.2, textAlign: 'center' }]}>SCORE</AppText>
            <AppText style={[styles.thText, { flex: 1.2, textAlign: 'center' }]}>UNIT</AppText>
            <AppText style={[styles.thText, { flex: 1.5, textAlign: 'center' }]}>STATUS</AppText>
          </View>

          {/* TABLE ROWS */}
          {tests.map((t, idx) => (
            <View key={t.num} style={[styles.tableDataRow, idx % 2 === 1 && styles.tableRowAlt]}>
              <AppText style={[styles.tdTextNum, { flex: 0.4 }]}>{t.num}</AppText>
              <AppText style={[styles.tdTextName, { flex: 2.0 }]}>{t.test}</AppText>
              <AppText style={[styles.tdTextScore, { flex: 1.2, textAlign: 'center' }]}>{t.score}</AppText>
              <AppText style={[styles.tdTextUnit, { flex: 1.2, textAlign: 'center' }]}>{t.unit}</AppText>

              <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                {t.completed ? (
                  <SFSymbol name="checkmark.circle.fill" size={18} color="#16A34A" />
                ) : (
                  <AppText style={{ fontSize: 14, fontWeight: '700', color: '#94A3B8' }}>—</AppText>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* RIGHT COLUMN: OVERALL PERFORMANCE GAUGE */}
        <View style={[styles.card, styles.overallCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconCircle}>
              <SFSymbol name="award" size={14} color="#FFFFFF" />
            </View>
            <AppText style={styles.cardTitle}>OVERALL PERFORMANCE</AppText>
          </View>

          <AppText style={styles.gaugeLabel}>Overall Fitness Score</AppText>

          {/* CIRCULAR GAUGE SVG */}
          <View style={styles.gaugeContainer}>
            <Svg width="120" height="120" viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="48" stroke="#E2E8F0" strokeWidth="10" fill="none" />
              <Circle
                cx="60"
                cy="60"
                r="48"
                stroke="#16A34A"
                strokeWidth="10"
                strokeDasharray="301"
                strokeDashoffset="39"
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 60 60)"
              />
            </Svg>
            <View style={styles.gaugeContent}>
              <AppText style={styles.gaugeScoreText}>87</AppText>
              <AppText style={styles.gaugeSubText}>/100</AppText>
            </View>
          </View>

          {/* GRADE & PERCENTILE */}
          <AppText style={styles.gaugeLabel}>Fitness Grade</AppText>
          <View style={styles.gradeBadge}>
            <AppText style={styles.gradeText}>A+</AppText>
          </View>

          <View style={styles.rankBox}>
            <AppText style={styles.rankLabel}>Overall Rank / Percentile</AppText>
            <AppText style={styles.rankValue}>Top 15%</AppText>
            <View style={styles.bandPill}>
              <AppText style={styles.bandPillText}>High Potential</AppText>
            </View>
          </View>
        </View>
      </View>

      {/* MIDDLE ROW: PERFORMANCE RADAR & QR CODE */}
      <View style={styles.middleGrid}>
        {/* RADAR CHART */}
        <View style={[styles.card, styles.radarCard]}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconCircle}>
              <SFSymbol name="chart.bar.fill" size={14} color="#FFFFFF" />
            </View>
            <AppText style={styles.cardTitle}>PERFORMANCE RADAR</AppText>
          </View>

          <View style={styles.radarBox}>
            <Svg width="180" height="170" viewBox="0 0 180 170">
              {/* Radar Grid Circles */}
              <Polygon points="90,20 150,60 130,135 50,135 30,60" stroke="#CBD5E1" strokeWidth="1" fill="none" />
              <Polygon points="90,40 130,67 117,117 63,117 50,67" stroke="#E2E8F0" strokeWidth="1" fill="none" />
              <Polygon points="90,60 110,73 103,98 77,98 70,73" stroke="#E2E8F0" strokeWidth="1" fill="none" />

              {/* Axis lines */}
              <Line x1="90" y1="85" x2="90" y2="20" stroke="#CBD5E1" strokeWidth="1" />
              <Line x1="90" y1="85" x2="150" y2="60" stroke="#CBD5E1" strokeWidth="1" />
              <Line x1="90" y1="85" x2="130" y2="135" stroke="#CBD5E1" strokeWidth="1" />
              <Line x1="90" y1="85" x2="50" y2="135" stroke="#CBD5E1" strokeWidth="1" />
              <Line x1="90" y1="85" x2="30" y2="60" stroke="#CBD5E1" strokeWidth="1" />

              {/* Score Shape */}
              <Polygon
                points="90,25 142,63 125,128 55,130 35,62"
                fill="rgba(37, 99, 235, 0.25)"
                stroke="#2563EB"
                strokeWidth="2"
              />

              {/* Vertex Labels */}
              <SvgText x="90" y="12" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="middle">Sit & Reach</SvgText>
              <SvgText x="156" y="62" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="start">Vertical Jump</SvgText>
              <SvgText x="134" y="146" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="start">Weight</SvgText>
              <SvgText x="46" y="146" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="end">Height</SvgText>
              <SvgText x="24" y="62" fill="#1E293B" fontSize="8" fontWeight="bold" textAnchor="end">Sit-Ups</SvgText>
            </Svg>
          </View>
        </View>

        {/* QR CODE SCAN BOX */}
        <View style={[styles.card, styles.qrCard]}>
          <AppText style={styles.qrTitle}>SCAN TO VIEW</AppText>
          <AppText style={styles.qrSub}>COMPLETE DIGITAL REPORT & VIDEO RECORDS</AppText>

          <View style={styles.qrCodeMatrix}>
            <Svg width="80" height="80" viewBox="0 0 80 80">
              <Rect x="0" y="0" width="80" height="80" fill="#FFFFFF" />
              {/* QR Corners */}
              <Rect x="5" y="5" width="22" height="22" fill="#0F172A" />
              <Rect x="8" y="8" width="16" height="16" fill="#FFFFFF" />
              <Rect x="11" y="11" width="10" height="10" fill="#0F172A" />

              <Rect x="53" y="5" width="22" height="22" fill="#0F172A" />
              <Rect x="56" y="8" width="16" height="16" fill="#FFFFFF" />
              <Rect x="59" y="11" width="10" height="10" fill="#0F172A" />

              <Rect x="5" y="53" width="22" height="22" fill="#0F172A" />
              <Rect x="8" y="56" width="16" height="16" fill="#FFFFFF" />
              <Rect x="11" y="59" width="10" height="10" fill="#0F172A" />

              {/* Data modules */}
              <Rect x="32" y="10" width="6" height="6" fill="#0F172A" />
              <Rect x="40" y="18" width="6" height="6" fill="#0F172A" />
              <Rect x="30" y="30" width="8" height="8" fill="#0F172A" />
              <Rect x="42" y="32" width="6" height="6" fill="#0F172A" />
              <Rect x="55" y="35" width="8" height="8" fill="#0F172A" />
              <Rect x="35" y="48" width="8" height="8" fill="#0F172A" />
              <Rect x="48" y="55" width="8" height="8" fill="#0F172A" />
              <Rect x="60" y="60" width="10" height="10" fill="#0F172A" />
            </Svg>
          </View>
        </View>
      </View>

      {/* FOOTER BAR */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <SFSymbol name="sparkles" size={12} color="#3B82F6" />
          <AppText style={styles.footerText}>Powered by Battery Fitness</AppText>
        </View>
        <AppText style={styles.footerCenter}>Data Driven. AI Powered. Athlete Focused.</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 12,
  },
  header: {
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#1E3A8A',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerBanner: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  pillBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 3,
  },
  pillBadgeText: {
    fontSize: 7,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 8,
    color: '#64748B',
  },
  metaValueDate: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  topProfileGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  athleteCard: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
    gap: 2,
  },
  athleteName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  athleteIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  infoKey: {
    fontSize: 9,
    color: '#475569',
    width: 78,
  },
  infoVal: {
    flex: 1,
    fontSize: 9,
    fontWeight: '700',
    color: '#0F172A',
  },
  physicalCard: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cardIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 0.5,
  },
  physicalBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  physicalMetricsTable: {
    flex: 1,
    gap: 4,
  },
  metricTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricKey: {
    fontSize: 9,
    color: '#475569',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricUnit: {
    fontSize: 8,
    color: '#64748B',
    marginLeft: 2,
  },
  normalPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  normalPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#16A34A',
  },
  silhouetteBox: {
    width: 55,
    alignItems: 'center',
  },
  mainGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  tableCard: {
    flex: 1.8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#1E3A8A',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  thText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAlt: {
    backgroundColor: '#F1F5F9',
  },
  tdTextNum: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  tdTextName: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F172A',
  },
  tdTextScore: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  tdTextUnit: {
    fontSize: 10,
    color: '#64748B',
  },
  tdTextRange: {
    fontSize: 8,
    color: '#475569',
  },
  statusVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusVerifiedText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#16A34A',
  },
  statusExcellent: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusExcellentText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2563EB',
  },
  statusGood: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  statusGoodText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
  },
  overallCard: {
    flex: 1,
    alignItems: 'center',
  },
  gaugeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    marginTop: 4,
  },
  gaugeContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  gaugeScoreText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
  },
  gaugeSubText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: -4,
  },
  gradeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankBox: {
    alignItems: 'center',
    marginTop: 6,
    gap: 2,
  },
  rankLabel: {
    fontSize: 8,
    color: '#64748B',
  },
  rankValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  bandPill: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  bandPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  middleGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  radarCard: {
    flex: 1,
    alignItems: 'center',
  },
  radarBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthsCard: {
    flex: 1,
  },
  strengthItem: {
    marginBottom: 6,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  strengthName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0F172A',
  },
  strengthScore: {
    fontSize: 8,
    fontWeight: '800',
    color: '#475569',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  aiCard: {
    flex: 1,
    gap: 6,
  },
  aiFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  aiKey: {
    fontSize: 8,
    color: '#475569',
  },
  aiVal: {
    fontSize: 8,
    fontWeight: '700',
    color: '#0F172A',
  },
  aiConfBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  aiConfText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  bottomGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  recommendationCard: {
    flex: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  bulletText: {
    fontSize: 8,
    color: '#334155',
    flex: 1,
  },
  weeklyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  weeklyChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  weeklyDay: {
    fontSize: 7,
    fontWeight: '800',
    color: '#2563EB',
  },
  weeklyPlan: {
    fontSize: 6,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  qrCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  qrSub: {
    fontSize: 6,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 6,
  },
  qrCodeMatrix: {
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  footer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#3B82F6',
  },
  footerCenter: {
    fontSize: 7,
    color: '#64748B',
    fontStyle: 'italic',
  },
  footerRight: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1E3A8A',
  },
});
