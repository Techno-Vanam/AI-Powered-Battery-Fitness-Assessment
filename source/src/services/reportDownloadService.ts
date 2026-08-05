import { Alert, NativeModules, PermissionsAndroid, Platform, Share } from 'react-native';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib/dist/pdf-lib.min.js';
import type { AthleteDashboardData } from '../types/athleteDashboard';

/**
 * Safely access ReactNativeBlobUtil native module dynamically at call time.
 */
function getBlobUtil(): any {
  try {
    const mod = require('react-native-blob-util');
    return mod.default || mod;
  } catch (e) {
    console.log('BlobUtil load info:', e);
  }
  return null;
}

/**
 * Safely access react-native-share module dynamically ONLY if native module exists.
 */
function getRNShare(): any {
  try {
    if (NativeModules?.RNShare || NativeModules?.RNShareModule) {
      const mod = require('react-native-share');
      return mod.default || mod;
    }
  } catch (e) {
    console.log('RNShare not registered in current binary build:', e);
  }
  return null;
}

/**
 * Generates a clean, professional PDF document in PDF-1.4 format using pdf-lib.
 * Returns base64 string representation of the PDF file.
 */
export async function generateReportPDFBase64(
  data?: AthleteDashboardData | null,
  reportId = 'ASMT-2026-0804-001',
  assessmentDate = '04 Aug 2026'
): Promise<string> {
  const profile = data?.profile ?? {
    name: 'Aarav Sharma',
    athleteId: 'NSRS-184729',
    age: 15,
    gender: 'Male',
    institution: 'Delhi Public School, R.K. Puram',
  };

  const tests = [
    { num: '1', test: 'Height', score: '170', unit: 'cm', status: 'Completed' },
    { num: '2', test: 'Weight', score: '62', unit: 'kg', status: 'Completed' },
    { num: '3', test: 'Sit & Reach', score: '24', unit: 'cm', status: 'Completed' },
    { num: '4', test: 'Vertical Jump', score: '48', unit: 'cm', status: 'Completed' },
    { num: '5', test: 'Sit-Ups', score: '38', unit: 'reps', status: 'Completed' },
  ];

  // Create PDF Document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 Dimensions
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const navy = rgb(0.118, 0.227, 0.541);      // #1E3A8A
  const slateDark = rgb(0.058, 0.09, 0.165);   // #0F172A
  const grayMuted = rgb(0.392, 0.455, 0.545);  // #64748B
  const lightBg = rgb(0.972, 0.98, 0.988);     // #F8FAFC
  const borderGray = rgb(0.886, 0.91, 0.941);  // #E2E8F0
  const greenSuccess = rgb(0.086, 0.639, 0.29); // #16A34A

  let y = height - 40;

  // 1. HEADER BRAND BAR
  page.drawRectangle({
    x: 35,
    y: y - 55,
    width: width - 70,
    height: 55,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('AI-POWERED BATTERY ASSESSMENT', {
    x: 48,
    y: y - 22,
    size: 14,
    font: fontBold,
    color: navy,
  });
  page.drawText('Measure. Analyze. Improve.', {
    x: 48,
    y: y - 38,
    size: 9,
    font: fontRegular,
    color: grayMuted,
  });

  page.drawText(`Assessment ID: ${reportId}`, {
    x: width - 210,
    y: y - 22,
    size: 10,
    font: fontBold,
    color: slateDark,
  });
  page.drawText(`Date: ${assessmentDate}`, {
    x: width - 210,
    y: y - 38,
    size: 9,
    font: fontBold,
    color: navy,
  });

  y -= 75;

  // 2. REPORT CARD BANNER
  page.drawRectangle({
    x: 35,
    y: y - 32,
    width: width - 70,
    height: 32,
    color: navy,
  });
  page.drawText('ATHLETE FITNESS REPORT CARD', {
    x: 48,
    y: y - 21,
    size: 12,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= 48;

  // 3. ATHLETE PROFILE & PHYSICAL PROFILE (TWO BOXES)
  const boxWidth = (width - 82) / 2;

  // Left Box: Athlete Profile
  page.drawRectangle({
    x: 35,
    y: y - 95,
    width: boxWidth,
    height: 95,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page.drawText('ATHLETE PROFILE', {
    x: 45,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: navy,
  });

  const profileRows = [
    { label: 'Name:', val: profile.name },
    { label: 'Athlete ID:', val: profile.athleteId },
    { label: 'Age:', val: `${profile.age} Years` },
    { label: 'Gender:', val: profile.gender },
    { label: 'Institution:', val: profile.institution },
  ];

  let profY = y - 34;
  profileRows.forEach(row => {
    page.drawText(row.label, { x: 45, y: profY, size: 8, font: fontRegular, color: grayMuted });
    page.drawText(row.val, { x: 115, y: profY, size: 8, font: fontBold, color: slateDark });
    profY -= 12;
  });

  // Right Box: Physical Profile
  page.drawRectangle({
    x: 35 + boxWidth + 12,
    y: y - 95,
    width: boxWidth,
    height: 95,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });
  page.drawText('PHYSICAL PROFILE', {
    x: 45 + boxWidth + 12,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: navy,
  });

  const physRows = [
    { label: 'Height:', val: '170 cm' },
    { label: 'Weight:', val: '62 kg' },
    { label: 'BMI:', val: '21.5 kg/m²' },
    { label: 'BMI Category:', val: 'Normal' },
  ];

  let physY = y - 34;
  physRows.forEach(row => {
    page.drawText(row.label, { x: 45 + boxWidth + 12, y: physY, size: 8, font: fontRegular, color: grayMuted });
    page.drawText(row.val, { x: 125 + boxWidth + 12, y: physY, size: 8, font: fontBold, color: row.label.includes('Category') ? greenSuccess : slateDark });
    physY -= 12;
  });

  y -= 112;

  // 4. BATTERY FITNESS TEST RESULTS TABLE (5 TESTS)
  page.drawText('BATTERY FITNESS TEST RESULTS (5 TESTS)', {
    x: 35,
    y: y,
    size: 11,
    font: fontBold,
    color: navy,
  });

  y -= 16;

  // Table Header Row
  page.drawRectangle({
    x: 35,
    y: y - 20,
    width: width - 70,
    height: 20,
    color: navy,
  });

  page.drawText('#', { x: 45, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('TEST', { x: 75, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('SCORE', { x: 260, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('UNIT', { x: 350, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText('STATUS', { x: 450, y: y - 14, size: 9, font: fontBold, color: rgb(1, 1, 1) });

  y -= 20;

  // Table Data Rows
  tests.forEach((t, index) => {
    const rowBg = index % 2 === 1 ? rgb(0.945, 0.961, 0.976) : rgb(1, 1, 1);
    page.drawRectangle({
      x: 35,
      y: y - 22,
      width: width - 70,
      height: 22,
      color: rowBg,
      borderColor: borderGray,
      borderWidth: 0.5,
    });

    page.drawText(t.num, { x: 45, y: y - 15, size: 9, font: fontRegular, color: slateDark });
    page.drawText(t.test, { x: 75, y: y - 15, size: 9, font: fontBold, color: slateDark });
    page.drawText(t.score, { x: 260, y: y - 15, size: 9, font: fontBold, color: slateDark });
    page.drawText(t.unit, { x: 350, y: y - 15, size: 9, font: fontRegular, color: grayMuted });

    // Draw vector green checkmark circle
    const cx = 456;
    const cy = y - 12;
    page.drawCircle({
      x: cx,
      y: cy,
      size: 5,
      color: greenSuccess,
    });
    page.drawLine({
      start: { x: cx - 2.5, y: cy - 0.5 },
      end: { x: cx - 0.5, y: cy - 2.5 },
      thickness: 1.2,
      color: rgb(1, 1, 1),
    });
    page.drawLine({
      start: { x: cx - 0.5, y: cy - 2.5 },
      end: { x: cx + 2.5, y: cy + 2.0 },
      thickness: 1.2,
      color: rgb(1, 1, 1),
    });

    page.drawText('Completed', { x: 467, y: y - 15, size: 9, font: fontBold, color: greenSuccess });

    y -= 22;
  });

  y -= 20;

  // 5. OVERALL PERFORMANCE BOX
  page.drawRectangle({
    x: 35,
    y: y - 75,
    width: width - 70,
    height: 75,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('OVERALL PERFORMANCE', {
    x: 48,
    y: y - 18,
    size: 10,
    font: fontBold,
    color: navy,
  });

  page.drawText('Overall Score: 87 / 100', {
    x: 48,
    y: y - 38,
    size: 14,
    font: fontBold,
    color: slateDark,
  });

  page.drawText('Grade: A+  |  Top 15% - High Potential', {
    x: 48,
    y: y - 56,
    size: 10,
    font: fontBold,
    color: greenSuccess,
  });

  y -= 95;

  // 6. FOOTER BAR
  page.drawLine({
    start: { x: 35, y: y },
    end: { x: width - 35, y: y },
    thickness: 1,
    color: borderGray,
  });

  page.drawText('Powered by Battery Fitness', {
    x: 35,
    y: y - 18,
    size: 9,
    font: fontBold,
    color: navy,
  });

  page.drawText('Data Driven. AI Powered. Athlete Focused.', {
    x: width - 240,
    y: y - 18,
    size: 8,
    font: fontRegular,
    color: grayMuted,
  });

  // Save to PDF base64 string
  return await pdfDoc.saveAsBase64();
}

/**
 * Downloads and saves the report file as a PDF (.pdf) directly into the physical device Downloads directory.
 */
export async function downloadReportFile(
  data?: AthleteDashboardData | null,
  reportId = 'ASMT-2026-0804-001',
  onOpenReport?: () => void
): Promise<boolean> {
  const fileName = `${reportId}-Fitness-Report.pdf`;

  try {
    const pdfBase64 = await generateReportPDFBase64(data, reportId);
    const blobUtil = getBlobUtil();

    if (blobUtil && blobUtil.fs) {
      const { fs } = blobUtil;
      const downloadDir = fs.dirs.DownloadDir || fs.dirs.DocumentDir;
      const targetPath = `${downloadDir}/${fileName}`;

      // Storage Permission check for legacy Android (API < 29)
      if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version < 29) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'Battery Fitness Assessment needs permission to save the report card to your Downloads folder.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Storage permission is required to save PDF files to Downloads.');
          return false;
        }
      }

      // Write Base64 PDF binary stream directly to physical disk
      await fs.writeFile(targetPath, pdfBase64, 'base64');

      // Android MediaStore & File Manager registration
      if (Platform.OS === 'android') {
        try {
          if (fs.scanFile) {
            await fs.scanFile([{ path: targetPath, mime: 'application/pdf' }]);
          }
          if (blobUtil.MediaCollection && blobUtil.MediaCollection.copyToMediaStore) {
            await blobUtil.MediaCollection.copyToMediaStore(
              {
                name: fileName,
                parentFolder: '',
                mimeType: 'application/pdf',
              },
              'Download',
              targetPath
            );
          }
        } catch (mediaErr) {
          console.log('MediaStore copy warning:', mediaErr);
        }
      } else if (Platform.OS === 'ios') {
        if (blobUtil.ios && blobUtil.ios.previewDocument) {
          await blobUtil.ios.previewDocument(targetPath);
        }
      }

      const buttons: any[] = [{ text: 'OK', style: 'default' }];
      if (onOpenReport) {
        buttons.unshift({ text: 'View Report', onPress: onOpenReport });
      }

      Alert.alert(
        '🎉 PDF Report Downloaded',
        `The PDF file (${fileName}) has been successfully saved to your phone's Downloads folder:\n\n${targetPath}`,
        buttons,
        { cancelable: true }
      );
      return true;
    }
  } catch (fsErr) {
    console.error('PDF file write error:', fsErr);
  }

  // Fallback System Share/Save for PDF format
  try {
    const pdfBase64 = await generateReportPDFBase64(data, reportId);
    const pdfDataUri = `data:application/pdf;base64,${pdfBase64}`;

    await Share.share({
      title: `${reportId}-Fitness-Report.pdf`,
      url: pdfDataUri,
    });

    const buttons: any[] = [{ text: 'OK', style: 'default' }];
    if (onOpenReport) {
      buttons.unshift({ text: 'View Report', onPress: onOpenReport });
    }

    Alert.alert(
      '🎉 PDF Download & Save Ready',
      `PDF Report Card (${fileName}) is ready. Select 'Save to Files' to store on your device.`,
      buttons
    );
    return true;
  } catch (shareErr) {
    console.error('PDF Share fallback error:', shareErr);
    Alert.alert('Download Error', 'Could not save PDF report file to device storage.');
    return false;
  }
}

/**
 * Shares the generated PDF report card file (.pdf) directly via native OS Share Sheet.
 * Safely handles binary compilation states to ensure zero crash runtime execution.
 */
export async function shareReportPDF(
  data?: AthleteDashboardData | null,
  reportId = 'ASMT-2026-0804-001'
): Promise<boolean> {
  const fileName = `${reportId}-Fitness-Report.pdf`;

  try {
    const pdfBase64 = await generateReportPDFBase64(data, reportId);
    const blobUtil = getBlobUtil();
    const rnShare = getRNShare();

    // 1. Primary: Use react-native-share if compiled in current native APK build
    if (rnShare && rnShare.open) {
      if (blobUtil && blobUtil.fs) {
        const { fs } = blobUtil;
        const cacheDir = fs.dirs.CacheDir || fs.dirs.DownloadDir;
        const targetPath = `${cacheDir}/${fileName}`;

        // Write PDF binary file to device storage
        await fs.writeFile(targetPath, pdfBase64, 'base64');
        const fileUri = Platform.OS === 'android' ? `file://${targetPath}` : targetPath;

        await rnShare.open({
          title: `Athlete Fitness Report Card - ${reportId}`,
          filename: fileName,
          type: 'application/pdf',
          url: fileUri,
          failOnCancel: false,
        });
        return true;
      }

      // Base64 Data URI sharing via react-native-share
      await rnShare.open({
        title: `Athlete Fitness Report Card - ${reportId}`,
        filename: fileName,
        type: 'application/pdf',
        url: `data:application/pdf;base64,${pdfBase64}`,
        failOnCancel: false,
      });
      return true;
    }
  } catch (err) {
    console.log('RNShare execution notice:', err);
  }

  // 2. Secondary: Auto-save PDF to device storage & open Share sheet with ContentProvider URI
  try {
    const pdfBase64 = await generateReportPDFBase64(data, reportId);
    const blobUtil = getBlobUtil();

    if (blobUtil && blobUtil.fs) {
      const { fs } = blobUtil;
      const downloadDir = fs.dirs.DownloadDir || fs.dirs.DocumentDir;
      const targetPath = `${downloadDir}/${fileName}`;

      await fs.writeFile(targetPath, pdfBase64, 'base64');
      let shareUri = Platform.OS === 'android' ? `file://${targetPath}` : targetPath;

      if (Platform.OS === 'android') {
        try {
          if (fs.scanFile) {
            await fs.scanFile([{ path: targetPath, mime: 'application/pdf' }]);
          }
          if (blobUtil.MediaCollection && blobUtil.MediaCollection.copyToMediaStore) {
            const contentUri = await blobUtil.MediaCollection.copyToMediaStore(
              {
                name: fileName,
                parentFolder: '',
                mimeType: 'application/pdf',
              },
              'Download',
              targetPath
            );
            if (contentUri) {
              shareUri = contentUri;
            }
          }
        } catch {
          // ignore scan error
        }
      }

      const name = data?.profile?.name ?? 'Aarav Sharma';
      const shareMessage = `⚡ ATHLETE FITNESS REPORT CARD (PDF)\nName: ${name}\nAssessment ID: ${reportId}\nOverall Score: 87/100 (Grade A+)\nVerified by Battery Fitness.`;

      await Share.share({
        title: `Athlete Report Card - ${reportId}`,
        message: shareMessage,
        url: shareUri,
      });
      return true;
    }
  } catch (err) {
    console.error('Share PDF error:', err);
  }

  // Fallback PDF sharing with formatted message
  try {
    const name = data?.profile?.name ?? 'Aarav Sharma';
    const shareMessage = `⚡ ATHLETE FITNESS REPORT CARD (PDF)\nName: ${name}\nAssessment ID: ${reportId}\nOverall Score: 87/100 (Grade A+)\nVerified by Battery Fitness.`;

    await Share.share({
      title: `Athlete Report Card - ${reportId}`,
      message: shareMessage,
    });
    return true;
  } catch (shareErr) {
    console.error('PDF Share fallback error:', shareErr);
    Alert.alert('Share Error', 'Could not share PDF report file.');
    return false;
  }
}
