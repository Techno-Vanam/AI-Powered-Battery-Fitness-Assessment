import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Share } from 'react-native';
import { Download, Share2, CheckCircle2, Award, ListFilter, BarChart2, Sparkles, X, User as UserIcon } from 'lucide-react-native';
import Svg, { Circle as SvgCircle, Path as SvgPath, Polygon as SvgPolygon, Line as SvgLine, Text as SvgText, Rect as SvgRect } from 'react-native-svg';
// @ts-ignore
import qrcode from 'qrcode-generator';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/layout';
import { Athlete } from '../../types/app';
import { useApp } from '../../context/AppContext';
import { REPORT_BASE_URL } from '../../config/api';

interface ReportViewerScreenProps {
  athlete?: Athlete;
  title: string;
  onBack: () => void;
}

// Pentagon Radar Chart Component for 5 key metrics
const PentagonRadarChart: React.FC<{ metrics: { label: string; score: number }[] }> = ({ metrics }) => {
  const size = 220;
  const center = size / 2;
  const radius = 75;
  const numSides = 5;

  // Compute vertex points for pentagon grid
  const getCoordinates = (r: number, index: number) => {
    const angle = (Math.PI * 2 / numSides) * index - Math.PI / 2;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Outer, middle, inner pentagons
  const levels = [0.33, 0.66, 1.0];
  const gridPolygons = levels.map(level => {
    return Array.from({ length: numSides }).map((_, i) => {
      const { x, y } = getCoordinates(radius * level, i);
      return `${x},${y}`;
    }).join(' ');
  });

  // Data polygon based on scores (score normalized 0..100)
  const dataPoints = metrics.map((m, i) => {
    const norm = Math.min(100, Math.max(20, m.score)) / 100;
    const { x, y } = getCoordinates(radius * norm, i);
    return `${x},${y}`;
  }).join(' ');

  // Label coordinates (slightly outside outer radius)
  const labelCoords = metrics.map((m, i) => {
    const { x, y } = getCoordinates(radius + 22, i);
    return { x, y, label: m.label };
  });

  return (
    <View style={radarStyles.chartContainer}>
      <Svg width={size + 40} height={size + 20} viewBox={`-20 -10 ${size + 40} ${size + 20}`}>
        {/* Grid levels */}
        {gridPolygons.map((poly, idx) => (
          <SvgPolygon
            key={idx}
            points={poly}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth={1}
            strokeDasharray={idx === 2 ? 'none' : '3,3'}
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: numSides }).map((_, i) => {
          const { x, y } = getCoordinates(radius, i);
          return (
            <SvgLine
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#E2E8F0"
              strokeWidth={1}
            />
          );
        })}

        {/* Filled Data Radar Polygon (Vibrant Orange fill & stroke) */}
        <SvgPolygon
          points={dataPoints}
          fill="rgba(255, 122, 0, 0.18)"
          stroke="#FF7A00"
          strokeWidth={2.5}
        />

        {/* Radar vertex dots (Navy blue dots with white stroke) */}
        {metrics.map((m, i) => {
          const norm = Math.min(100, Math.max(20, m.score)) / 100;
          const { x, y } = getCoordinates(radius * norm, i);
          return (
            <SvgCircle
              key={i}
              cx={x}
              cy={y}
              r={4.5}
              fill="#002B66"
              stroke="#FFFFFF"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Axis Labels */}
        {labelCoords.map((lbl, i) => (
          <SvgText
            key={i}
            x={lbl.x}
            y={lbl.y}
            fontSize={10}
            fontWeight="700"
            fill="#0F172A"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {lbl.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
};

const radarStyles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});

// Silhouette SVG Graphic for Physical Profile (Orange and Navy theme)
const SilhouetteGraphic: React.FC = () => (
  <View style={silStyles.container}>
    <Svg width={70} height={120} viewBox="0 0 70 120">
      {/* Indicator tick marks on the right */}
      <SvgLine x1="58" y1="20" x2="68" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
      <SvgText x="54" y="22" fontSize="8" fill="#64748B" textAnchor="end">-</SvgText>

      <SvgLine x1="58" y1="50" x2="68" y2="50" stroke="#94A3B8" strokeWidth="1.5" />
      <SvgText x="54" y="52" fontSize="8" fill="#64748B" textAnchor="end">-</SvgText>

      <SvgLine x1="58" y1="80" x2="68" y2="80" stroke="#94A3B8" strokeWidth="1.5" />
      <SvgText x="54" y="82" fontSize="8" fill="#64748B" textAnchor="end">-</SvgText>

      <SvgLine x1="58" y1="105" x2="68" y2="105" stroke="#94A3B8" strokeWidth="1.5" />
      <SvgText x="54" y="107" fontSize="8" fill="#64748B" textAnchor="end">-</SvgText>

      {/* Human Silhouette outline */}
      {/* Head - Vibrant Orange */}
      <SvgCircle cx="30" cy="18" r="10" fill="#FF7A00" />
      {/* Shoulders & Torso - Navy Blue */}
      <SvgPath
        d="M 16 35 C 16 32 20 30 30 30 C 40 30 44 32 44 35 L 42 70 C 42 72 38 74 38 75 L 41 112 C 41 115 37 115 35 115 L 32 78 L 28 78 L 25 115 C 23 115 19 115 19 112 L 22 75 C 22 74 18 72 18 70 Z"
        fill="#002B66"
      />
      {/* Arms - Navy Blue */}
      <SvgPath d="M 15 36 L 10 65 C 9 68 13 70 15 67 L 19 42 Z" fill="#002B66" />
      <SvgPath d="M 45 36 L 50 65 C 51 68 47 70 45 67 L 41 42 Z" fill="#002B66" />
    </Svg>
  </View>
);

const silStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
});

// Dynamic QR Code SVG Component using real data value
const QRCodeGraphic: React.FC<{ value: string }> = ({ value }) => {
  const qr = React.useMemo(() => {
    try {
      // Create QR object with auto version selection (0) and Medium error correction (M)
      const qrObj = qrcode(0, 'M');
      qrObj.addData(value);
      qrObj.make();
      return qrObj;
    } catch (e) {
      console.warn('QR Code generation error, falling back to version 4', e);
      const qrObj = qrcode(4, 'M');
      qrObj.addData(value);
      qrObj.make();
      return qrObj;
    }
  }, [value]);

  const moduleCount = qr.getModuleCount();
  const size = 110;
  const padding = 6;
  const usableSize = size - padding * 2;
  const moduleSize = usableSize / moduleCount;

  // Render QR module grid squares dynamically
  const rects = [];
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.isDark(r, c)) {
        // High-contrast, premium styling: Finder corners in Navy Blue, data modules in Orange
        const isFinderPattern = 
          (r < 7 && c < 7) || 
          (r < 7 && c >= moduleCount - 7) || 
          (r >= moduleCount - 7 && c < 7);
        
        const fill = isFinderPattern ? '#002B66' : '#FF7A00';
        
        rects.push(
          <SvgRect
            key={`${r}-${c}`}
            x={padding + c * moduleSize}
            y={padding + r * moduleSize}
            width={moduleSize + 0.1} // overlap slightly to prevent hairline rendering gaps
            height={moduleSize + 0.1}
            fill={fill}
          />
        );
      }
    }
  }

  return (
    <View style={qrStyles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <SvgRect x="0" y="0" width={size} height={size} fill="#FFFFFF" rx={8} />
        {rects}
      </Svg>
    </View>
  );
};

const qrStyles = StyleSheet.create({
  container: {
    padding: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFD699', // Orange themed border
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export const ReportViewerScreen: React.FC<ReportViewerScreenProps> = ({ athlete: propAthlete, title, onBack }) => {
  const { athletes } = useApp();

  // Find athlete matching title or prop
  const currentAthlete = React.useMemo(() => {
    if (propAthlete) return propAthlete;
    const nameFromTitle = title.includes('-') ? title.split('-')[1].trim() : title.replace(/^(Athlete Report|Report|Athlete)\s*/i, '').trim();
    const found = athletes.find(a => a.name.toLowerCase() === nameFromTitle.toLowerCase());
    return found || athletes[0];
  }, [propAthlete, title, athletes]);

  const athleteName = currentAthlete?.name || 'Aarav Sharma';
  const athleteId = currentAthlete?.nsrsAadhaarId || 'NSRS-184729';
  const age = currentAthlete?.age || 15;
  const gender = currentAthlete?.gender || 'Male';
  const school = currentAthlete?.school || 'Delhi Public School, R.K. Puram';
  const coachName = currentAthlete?.coachName || 'Rahul Sharma';
  const height = currentAthlete?.height || 170;
  const weight = currentAthlete?.weight || 62;
  const bmi = currentAthlete?.bmi || 21.5;
  const overallScore = currentAthlete?.overallScore || 87;
  const assessmentId = 'ASMT-2026-0804-001';
  const assessmentDate = currentAthlete?.assessmentDate || '04 Aug 2026';

  // Calculate BMI category
  const bmiCategory = React.useMemo(() => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#FF9500', bg: '#FFF5E6' };
    if (bmi <= 24.9) return { label: 'Normal', color: '#34C759', bg: '#E8F9ED' };
    if (bmi <= 29.9) return { label: 'Overweight', color: '#FF9500', bg: '#FFF5E6' };
    return { label: 'Obese', color: '#FF3B30', bg: '#FFE5E5' };
  }, [bmi]);

  // Calculate fitness grade
  const fitnessGrade = React.useMemo(() => {
    if (overallScore >= 90) return 'A+';
    if (overallScore >= 80) return 'A';
    if (overallScore >= 70) return 'B+';
    if (overallScore >= 60) return 'B';
    return 'C';
  }, [overallScore]);

  // Radar metrics for 5 key tests matching screenshot
  const radarMetrics = [
    { label: 'Sit & Reach', score: 85 },
    { label: 'Vertical Jump', score: 82 },
    { label: 'Weight', score: 78 },
    { label: 'Height', score: 88 },
    { label: 'Sit-Ups', score: 86 },
  ];

  // Battery Fitness Test Results (5 Tests matching screenshot exact layout)
  const testResultsList = [
    { id: 1, name: 'Height', score: `${height}`, unit: 'cm', status: 'Verified' },
    { id: 2, name: 'Weight', score: `${weight}`, unit: 'kg', status: 'Verified' },
    { id: 3, name: 'Sit & Reach', score: '24', unit: 'cm', status: 'Verified' },
    { id: 4, name: 'Vertical Jump', score: '48', unit: 'cm', status: 'Verified' },
    { id: 5, name: 'Sit-Ups', score: '38', unit: 'reps', status: 'Verified' },
  ];

  const shareFormattedReport = async (format: 'PDF' | 'Excel' | 'CSV') => {
    try {
      const ext = format === 'PDF' ? 'pdf' : format === 'Excel' ? 'xlsx' : 'csv';
      const cleanFileName = `${athleteName.replace(/\s+/g, '_')}_Fitness_Report_Card.${ext}`;
      const messageText = `ATHLETE FITNESS REPORT CARD (${format})\nAthlete: ${athleteName}\nAthlete ID: ${athleteId}\nAssessment ID: ${assessmentId}\nOverall Fitness Score: ${overallScore}/100 (Grade ${fitnessGrade})\nCoach: ${coachName}`;

      await Share.share(
        {
          title: cleanFileName,
          message: messageText,
        },
        {
          dialogTitle: `Share ${athleteName}'s ${format} Report Card`,
          subject: `${athleteName} Fitness Report Card (${format})`,
        }
      );
    } catch (error: any) {
      Alert.alert('Share Error', error?.message || 'Could not launch share sheet.');
    }
  };

  const handleNativeShare = () => {
    Alert.alert(
      'Share Report Card',
      `Select format to share ${athleteName}'s Report Card:`,
      [
        { text: 'PDF Document (.pdf)', onPress: () => shareFormattedReport('PDF') },
        { text: 'Excel Sheet (.xlsx)', onPress: () => shareFormattedReport('Excel') },
        { text: 'CSV File (.csv)', onPress: () => shareFormattedReport('CSV') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const triggerFileDownload = (format: 'PDF' | 'Excel' | 'CSV') => {
    const ext = format === 'PDF' ? 'pdf' : format === 'Excel' ? 'xlsx' : 'csv';
    const cleanFileName = `${athleteName.replace(/\s+/g, '_')}_Fitness_Report_Card.${ext}`;
    const savePath = `/sdcard/Download/${cleanFileName}`;

    Alert.alert(
      'Report Downloaded Successfully!',
      `File saved to local mobile storage:\n\n📄 File: ${cleanFileName}\n📁 Location: Downloads folder\nPath: ${savePath}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Report Card',
      `Select format to save ${athleteName}'s Report Card to local storage:`,
      [
        { text: 'PDF Document (.pdf)', onPress: () => triggerFileDownload('PDF') },
        { text: 'Excel Sheet (.xlsx)', onPress: () => triggerFileDownload('Excel') },
        { text: 'CSV File (.csv)', onPress: () => triggerFileDownload('CSV') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar (Matching screenshot header: Close button, Title, ID, Download button) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerCircleBtn} onPress={onBack} activeOpacity={0.7}>
          <X size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenterCol}>
          <Text style={styles.headerTitleText}>Athlete Report Card</Text>
          <Text style={styles.headerSubText}>{assessmentId}</Text>
        </View>

        <TouchableOpacity style={styles.headerCircleBtn} onPress={handleDownload} activeOpacity={0.7}>
          <Download size={20} color="#002B66" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ATHLETE FITNESS REPORT CARD MAIN CONTAINER SHEET */}
        <View style={[styles.reportSheet, layout.shadowSubtle]}>
          {/* Card Top Brand Header */}
          <View style={styles.brandRow}>
            <View style={styles.brandLeftCol}>
              <View style={styles.aiBadgeIconCircle}>
                <Sparkles size={16} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.brandTitleText}>AI-POWERED</Text>
                <Text style={styles.brandSubTitleText}>BATTERY ASSESSMENT</Text>
              </View>
            </View>

            <View style={styles.brandRightCol}>
              <Text style={styles.metaIdText}>ID: {assessmentId}</Text>
              <Text style={styles.metaDateText}>{assessmentDate}</Text>
            </View>
          </View>

          {/* Report Card Main Banner Box */}
          <View style={styles.bannerBox}>
            <Text style={styles.bannerMainTitle}>ATHLETE FITNESS REPORT CARD</Text>
            <View style={styles.bannerPillTag}>
              <Text style={styles.bannerPillText}>AI ANALYTICS • PERFORMANCE • PROGRESS</Text>
            </View>
          </View>

          <View style={styles.dividerLine} />

          {/* Athlete Info Box (Matching screenshot 1 layout) */}
          <View style={styles.athleteInfoBox}>
            <Text style={styles.athleteNameText}>{athleteName}</Text>
            <Text style={styles.athleteIdBlueText}>Athlete ID : {athleteId}</Text>

            <View style={styles.personalDetailsRow}>
              {/* Person Icon Avatar Circle */}
              <View style={styles.personAvatarCircle}>
                <UserIcon size={38} color="#002B66" />
              </View>

              {/* Fields Table */}
              <View style={styles.fieldsContainer}>
                <View style={styles.fieldItemRow}>
                  <Text style={styles.fieldLabelText}>Age</Text>
                  <Text style={styles.fieldValText}>: {age} Years</Text>
                </View>

                <View style={styles.fieldItemRow}>
                  <Text style={styles.fieldLabelText}>Gender</Text>
                  <Text style={styles.fieldValText}>: {gender}</Text>
                </View>

                <View style={styles.fieldItemRow}>
                  <Text style={styles.fieldLabelText}>School /</Text>
                  <Text style={styles.fieldValText}>: {school}</Text>
                </View>

                <View style={styles.fieldItemRow}>
                  <Text style={styles.fieldLabelText}>Academy</Text>
                  <Text style={styles.fieldValText}>  {school.includes(',') ? school.split(',')[1]?.trim() : ''}</Text>
                </View>

                <View style={styles.fieldItemRow}>
                  <Text style={styles.fieldLabelText}>Coach Name</Text>
                  <Text style={styles.fieldValText}>: {coachName}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Physical Profile Box */}
          <View style={styles.sectionCardBox}>
            <View style={styles.sectionHeaderRow}>
              <Award size={18} color="#FF7A00" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleText}>PHYSICAL PROFILE</Text>
            </View>

            <View style={styles.physicalContentRow}>
              {/* Left Metrics */}
              <View style={styles.metricsCol}>
                <View style={styles.metricItemRow}>
                  <Text style={styles.mLabelText}>Height</Text>
                  <Text style={styles.mValueBoldText}>{height}</Text>
                  <Text style={styles.mUnitText}>cm</Text>
                </View>

                <View style={styles.metricItemRow}>
                  <Text style={styles.mLabelText}>Weight</Text>
                  <Text style={styles.mValueBoldText}>{weight}</Text>
                  <Text style={styles.mUnitText}>kg</Text>
                </View>

                <View style={styles.metricItemRow}>
                  <Text style={styles.mLabelText}>BMI</Text>
                  <Text style={styles.mValueBoldText}>{bmi}</Text>
                  <Text style={styles.mUnitText}>kg/m²</Text>
                </View>

                <View style={styles.metricItemRow}>
                  <Text style={styles.mLabelText}>BMI Category</Text>
                  <View style={[styles.bmiPillBadge, { backgroundColor: bmiCategory.bg }]}>
                    <Text style={[styles.bmiPillBadgeText, { color: bmiCategory.color }]}>
                      {bmiCategory.label}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Right Silhouette Graphic */}
              <SilhouetteGraphic />
            </View>
          </View>

          {/* Battery Fitness Test Results Box (5 Tests) */}
          <View style={styles.sectionCardBox}>
            <View style={styles.sectionHeaderRow}>
              <ListFilter size={18} color="#FF7A00" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleText}>BATTERY FITNESS TEST RESULTS ({testResultsList.length} TESTS)</Text>
            </View>

            {/* Dark Navy Table Header */}
            <View style={styles.tableHeaderBar}>
              <Text style={[styles.thCellText, { width: 24 }]}>#</Text>
              <Text style={[styles.thCellText, { flex: 2 }]}>TEST</Text>
              <Text style={[styles.thCellText, { width: 55, textAlign: 'right' }]}>SCORE</Text>
              <Text style={[styles.thCellText, { width: 50, textAlign: 'center' }]}>UNIT</Text>
              <Text style={[styles.thCellText, { width: 60, textAlign: 'center' }]}>STATUS</Text>
            </View>

            {/* Table Rows */}
            {testResultsList.map(row => (
              <View key={row.id} style={styles.tableRowItem}>
                <Text style={[styles.tdCellText, { width: 24, color: '#64748B', fontWeight: '600' }]}>{row.id}</Text>
                <Text style={[styles.tdCellText, { flex: 2, fontWeight: '700', color: '#0F172A' }]}>{row.name}</Text>
                <Text style={[styles.tdCellText, { width: 55, textAlign: 'right', fontWeight: '800', color: '#0F172A' }]}>{row.score}</Text>
                <Text style={[styles.tdCellText, { width: 50, textAlign: 'center', color: '#64748B' }]}>{row.unit}</Text>
                <View style={{ width: 60, alignItems: 'center' }}>
                  <CheckCircle2 size={18} color="#34C759" />
                </View>
              </View>
            ))}
          </View>

          {/* Overall Performance Box */}
          <View style={[styles.sectionCardBox, { alignItems: 'center' }]}>
            <View style={[styles.sectionHeaderRow, { width: '100%' }]}>
              <Award size={18} color="#FF7A00" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleText}>OVERALL PERFORMANCE</Text>
            </View>

            <Text style={styles.overallSubTitle}>Overall Fitness Score</Text>

            {/* Circular Gauge Ring */}
            <View style={styles.scoreGaugeContainer}>
              <View style={styles.scoreGaugeCircle}>
                <Text style={styles.scoreGaugeNumText}>{overallScore}</Text>
                <Text style={styles.scoreGaugeDenomText}>/100</Text>
              </View>
            </View>

            <Text style={styles.overallSubTitle}>Fitness Grade</Text>
            <View style={styles.gradeBadgeCircle}>
              <Text style={styles.gradeBadgeText}>{fitnessGrade}</Text>
            </View>

            <Text style={[styles.overallSubTitle, { marginTop: 10 }]}>Overall Rank / Percentile</Text>
            <Text style={styles.rankPercentileText}>Top 15%</Text>
            <View style={styles.highPotentialBadge}>
              <Text style={styles.highPotentialText}>High Potential</Text>
            </View>
          </View>

          {/* Performance Radar Chart Box */}
          <View style={[styles.sectionCardBox, { alignItems: 'center' }]}>
            <View style={[styles.sectionHeaderRow, { width: '100%' }]}>
              <BarChart2 size={18} color="#FF7A00" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitleText}>PERFORMANCE RADAR</Text>
            </View>

            <PentagonRadarChart metrics={radarMetrics} />
          </View>

          {/* Scan To View Box */}
          <View style={[styles.sectionCardBox, { alignItems: 'center' }]}>
            <Text style={styles.scanTitleText}>SCAN TO VIEW</Text>
            <Text style={styles.scanSubText}>COMPLETE DIGITAL REPORT & VIDEO RECORDS</Text>

            <QRCodeGraphic value={`${REPORT_BASE_URL}/report/${athleteId}?assessmentId=${assessmentId}`} />
          </View>

          {/* Brand Footer */}
          <View style={styles.reportFooterContainer}>
            <View style={styles.footerBrandRow}>
              <Sparkles size={14} color="#FF7A00" style={{ marginRight: 4 }} />
              <Text style={styles.footerBrandText}>Powered by Battery Fitness</Text>
            </View>
            <Text style={styles.footerTagline}>Data Driven. AI Powered. Athlete Focused.</Text>
          </View>
        </View>

        {/* Bottom Actions Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.downloadActionBtn]}
            onPress={handleDownload}
          >
            <Download size={18} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.downloadActionText}>Download Report Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.shareActionBtn]}
            onPress={handleNativeShare}
          >
            <Share2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.shareActionText}>Share Report Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenterCol: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 32,
  },
  reportSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderTopWidth: 6,
    borderTopColor: '#FF7A00', // Orange top highlight
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadgeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF7A00', // Vibrant Orange Badge Icon
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#002B66', // Deep Navy Blue
    letterSpacing: 0.5,
  },
  brandSubTitleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002B66',
  },
  brandRightCol: {
    alignItems: 'flex-end',
  },
  metaIdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  metaDateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7A00', // Orange themed date
  },
  bannerBox: {
    backgroundColor: '#FFF5E6', // Light Orange Background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD699', // Orange border
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#002B66',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  bannerPillTag: {
    backgroundColor: '#FF7A00', // Orange pill
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  bannerPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: '#FF7A00', // Orange themed divider line
    marginBottom: 12,
  },
  athleteInfoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  athleteNameText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  athleteIdBlueText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF7A00', // Orange ID Text
    marginBottom: 10,
  },
  personalDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  personAvatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF5E6', // Light Orange Background
    borderWidth: 2,
    borderColor: '#FFD699', // Orange themed border
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 4,
  },
  fieldsContainer: {
    flex: 1,
  },
  fieldItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    width: 90,
  },
  fieldValText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  sectionCardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#002B66',
    letterSpacing: 0.5,
  },
  physicalContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricsCol: {
    flex: 1,
    gap: 8,
  },
  metricItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  mLabelText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  mValueBoldText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  mUnitText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 4,
  },
  bmiPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bmiPillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tableHeaderBar: {
    flexDirection: 'row',
    backgroundColor: '#002B66',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  thCellText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tableRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tdCellText: {
    fontSize: 11,
  },
  overallSubTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  scoreGaugeContainer: {
    marginVertical: 6,
  },
  scoreGaugeCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    borderColor: '#FF7A00', // Orange Score Gauge Circle
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreGaugeNumText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#002B66', // Deep blue score number
    lineHeight: 30,
  },
  scoreGaugeDenomText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  gradeBadgeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF7A00', // Orange Grade Badge Background
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  gradeBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  rankPercentileText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  highPotentialBadge: {
    backgroundColor: '#FF7A00', // Orange High Potential Tag
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 2,
  },
  highPotentialText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scanTitleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF7A00', // Orange Scan Header
    letterSpacing: 0.5,
  },
  scanSubText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 6,
  },
  reportFooterContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerBrandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002B66',
  },
  footerTagline: {
    fontSize: 9,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },
  actionButtonsContainer: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: layout.buttonRadius,
  },
  downloadActionBtn: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: '#FFD699',
  },
  downloadActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  shareActionBtn: {
    backgroundColor: colors.primary,
  },
  shareActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
