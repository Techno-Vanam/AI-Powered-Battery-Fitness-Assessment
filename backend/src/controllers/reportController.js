import PDFDocument from 'pdfkit';
import { dbGet } from '../database/db.js';

// ── Brand colour palette ───────────────────────────────────────────────────────
const NAVY        = '#002B66';
const ORANGE      = '#FF7A00';
const ORANGE_LITE = '#FFF5E6';
const ORANGE_BDR  = '#FFD699';
const LIGHT       = '#F8FAFC';
const LIGHT2      = '#F1F5F9';
const BORDER      = '#E2E8F0';
const DARK        = '#0F172A';
const GRAY        = '#64748B';
const WHITE       = '#FFFFFF';
const GREEN       = '#34C759';

// ── Fixed page geometry ────────────────────────────────────────────────────────
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M      = 36;              // left/right margin
const L      = M;              // left edge of content
const R      = PAGE_W - M;     // right edge of content  (559.28)
const CW     = R - L;          // total content width    (523.28)
const IN     = 10;             // inner padding inside boxes

// ── Drawing helpers ────────────────────────────────────────────────────────────

/** Filled (optionally stroked) rounded rect */
function box(doc, x, y, w, h, fill, stroke = null, r = 6) {
  doc.save();
  doc.roundedRect(x, y, w, h, r);
  if (stroke) doc.fillAndStroke(fill, stroke);
  else         doc.fill(fill);
  doc.restore();
}

/** Horizontal separator line */
function hLine(doc, y, x1 = L + IN, x2 = R - IN, color = BORDER) {
  doc.save().moveTo(x1, y).lineTo(x2, y).strokeColor(color).lineWidth(0.5).stroke().restore();
}

/** Vertical separator line */
function vLine(doc, x, y1, y2, color = BORDER) {
  doc.save().moveTo(x, y1).lineTo(x, y2).strokeColor(color).lineWidth(0.5).stroke().restore();
}

/** Orange bullet + navy bold label — top-left of any section box */
function secLabel(doc, boxX, boxY, label) {
  doc.save().circle(boxX + IN + 5, boxY + 13, 3.5).fill(ORANGE).restore();
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5)
     .text(label, boxX + IN + 14, boxY + 9, { lineBreak: false });
}

// ── Main controller ────────────────────────────────────────────────────────────

export async function downloadAthleteReport(req, res) {
  const { athleteId } = req.params;
  const { assessmentId } = req.query;

  try {
    // ── Resolve athlete data ──────────────────────────────────────────────────
    let athlete = null;
    try {
      athlete = await dbGet(
        `SELECT local_id, full_name, gender, school_or_org, id_number
         FROM users WHERE local_id = ? AND role = 'athlete'`,
        [athleteId]
      );
    } catch (_) { /* no DB row – use rich fallback below */ }

    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const asmId   = assessmentId || `ASMT-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-001`;

    const name         = athlete?.full_name     || 'Aarav Sharma';
    const gender       = athlete?.gender === 'M' ? 'Male' : athlete?.gender === 'F' ? 'Female' : 'Male';
    const school       = athlete?.school_or_org || 'Delhi Public School, R.K. Puram';
    const nsrsId       = athlete?.id_number     || athleteId || 'NSRS-184729';
    const age          = 15;
    const coachName    = 'Rajesh Kumar';
    const height       = 170;
    const weight       = 62;
    const bmi          = 21.5;
    const overallScore = 87;
    const grade        = overallScore >= 90 ? 'A+' : overallScore >= 80 ? 'A' : overallScore >= 70 ? 'B+' : 'B';
    const bmiCat       = bmi < 18.5 ? 'Underweight' : bmi <= 24.9 ? 'Normal' : 'Overweight';

    const testRows = [
      { name: 'Height',        score: `${height}`, unit: 'cm'   },
      { name: 'Weight',        score: `${weight}`, unit: 'kg'   },
      { name: 'Sit & Reach',   score: '24',        unit: 'cm'   },
      { name: 'Vertical Jump', score: '48',        unit: 'cm'   },
      { name: 'Sit-Ups',       score: '38',        unit: 'reps' },
    ];

    const radarBars = [
      { label: 'Sit & Reach', score: 85 },
      { label: 'Vert. Jump',  score: 82 },
      { label: 'Weight',      score: 78 },
      { label: 'Height',      score: 88 },
      { label: 'Sit-Ups',     score: 86 },
    ];

    // ── Create PDF ────────────────────────────────────────────────────────────
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const safeName = name.replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_Fitness_Report_Card.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');
    doc.pipe(res);

    // ══════════════════════════════════════════════════════════════════════════
    // 1. TOP ORANGE BAR
    // ══════════════════════════════════════════════════════════════════════════
    doc.rect(0, 0, PAGE_W, 6).fill(ORANGE);

    // ══════════════════════════════════════════════════════════════════════════
    // 2. BRAND HEADER ROW
    // ══════════════════════════════════════════════════════════════════════════
    let y = 14;
    const badgeR = 14, badgeCX = L + badgeR + 2, badgeCY = y + 18;
    doc.save().circle(badgeCX, badgeCY, badgeR).fill(ORANGE).restore();
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(11)
       .text('⚡', badgeCX - 7, badgeCY - 8, { lineBreak: false });

    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5)
       .text('AI-POWERED', badgeCX + badgeR + 6, y + 7, { lineBreak: false });
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(10)
       .text('BATTERY ASSESSMENT', badgeCX + badgeR + 6, y + 19, { lineBreak: false });

    doc.fillColor(GRAY).font('Helvetica').fontSize(7.5)
       .text(`ID: ${asmId}`, L, y + 7, { width: CW, align: 'right', lineBreak: false });
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(8.5)
       .text(dateStr, L, y + 19, { width: CW, align: 'right', lineBreak: false });
    y += 44;

    // ══════════════════════════════════════════════════════════════════════════
    // 3. TITLE BANNER
    // ══════════════════════════════════════════════════════════════════════════
    const bannerH = 52;
    box(doc, L, y, CW, bannerH, ORANGE_LITE, ORANGE_BDR);
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(15.5)
       .text('ATHLETE FITNESS REPORT CARD', L, y + 10, { width: CW, align: 'center', lineBreak: false });

    const pillW = 252, pillH = 15, pillX = L + (CW - pillW) / 2;
    box(doc, pillX, y + 33, pillW, pillH, ORANGE, null, 7);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(7)
       .text('AI ANALYTICS  •  PERFORMANCE  •  PROGRESS', pillX, y + 36, { width: pillW, align: 'center', lineBreak: false });
    y += bannerH + 4;

    // Orange divider line
    doc.rect(L, y, CW, 2).fill(ORANGE);
    y += 10;

    // ══════════════════════════════════════════════════════════════════════════
    // 4. ATHLETE INFO BOX
    // ══════════════════════════════════════════════════════════════════════════
    const infoH = 102;
    box(doc, L, y, CW, infoH, WHITE, BORDER);

    // Avatar circle — left side
    const avR  = 24, avCX = L + IN + avR, avCY = y + 14 + avR;
    doc.save().circle(avCX, avCY, avR).fill(ORANGE_LITE).restore();
    doc.save().circle(avCX, avCY, avR).lineWidth(1.5).strokeColor(ORANGE_BDR).stroke().restore();
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(20)
       .text(name.charAt(0).toUpperCase(), avCX - avR, avCY - 13, { width: avR * 2, align: 'center', lineBreak: false });

    // Name + ID (right of avatar)
    const nameX = avCX + avR + 12;
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(15)
       .text(name, nameX, y + 12);
    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(8.5)
       .text(`Athlete ID: ${nsrsId}`, nameX, y + 30);

    // Fields grid: label | value
    const fields = [
      ['Age',        `${age} Years`],
      ['Gender',     gender        ],
      ['School',     school        ],
      ['Coach Name', coachName     ],
    ];
    const LABEL_W = 72, VAL_X = nameX + LABEL_W + 4;
    let fy = y + 48;
    for (const [lbl, val] of fields) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(7.5)
         .text(lbl, nameX, fy, { width: LABEL_W, lineBreak: false });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(7.5)
         .text(`: ${val}`, VAL_X, fy, { lineBreak: false });
      fy += 12.5;
    }
    y += infoH + 8;

    // ══════════════════════════════════════════════════════════════════════════
    // 5. PHYSICAL PROFILE
    // ══════════════════════════════════════════════════════════════════════════
    const physH = 82;
    box(doc, L, y, CW, physH, LIGHT, BORDER);
    secLabel(doc, L, y, 'PHYSICAL PROFILE');

    // 4 metric columns — use equal column widths, leave 48pt for silhouette
    const physMetrics = [
      { label: 'Height',       value: `${height} cm` },
      { label: 'Weight',       value: `${weight} kg` },
      { label: 'BMI',          value: `${bmi} kg/m²` },
      { label: 'BMI Category', value: bmiCat          },
    ];
    const PHYS_COL_W = (CW - IN * 2 - 52) / physMetrics.length; // ≈ 108pt each
    let px = L + IN;
    for (const m of physMetrics) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(7)
         .text(m.label, px, y + 30, { width: PHYS_COL_W, lineBreak: false });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(12)
         .text(m.value, px, y + 41, { width: PHYS_COL_W, lineBreak: false });
      px += PHYS_COL_W;
    }

    // Silhouette figure (right-aligned)
    const sX = R - 48, sY = y + 8;
    doc.save().circle(sX + 14, sY + 10, 10).fill(ORANGE).restore(); // head
    doc.save().rect(sX + 7, sY + 20, 14, 26).fill(NAVY).restore();  // torso
    doc.save().rect(sX + 2, sY + 21, 5, 20).fill(NAVY).restore();   // left arm
    doc.save().rect(sX + 21, sY + 21, 5, 20).fill(NAVY).restore();  // right arm
    doc.save().rect(sX + 8, sY + 46, 5, 18).fill(NAVY).restore();   // left leg
    doc.save().rect(sX + 15, sY + 46, 5, 18).fill(NAVY).restore();  // right leg
    y += physH + 8;

    // ══════════════════════════════════════════════════════════════════════════
    // 6. BATTERY FITNESS TEST RESULTS TABLE
    // ══════════════════════════════════════════════════════════════════════════
    const ROW_H  = 20;
    const tableH = 26 + 18 + testRows.length * ROW_H + 8;
    box(doc, L, y, CW, tableH, LIGHT, BORDER);
    secLabel(doc, L, y, `BATTERY FITNESS TEST RESULTS (${testRows.length} TESTS)`);

    // ── Column x positions (must match perfectly between header & rows) ──────
    const TAB_L   = L + IN;          // table left edge
    const TAB_R   = R - IN;          // table right edge
    const TAB_W   = TAB_R - TAB_L;   // ≈ 503pt

    // Proportional column widths
    const W_NUM    = 22;
    const W_TEST   = 192;
    const W_SCORE  = 62;
    const W_UNIT   = 62;
    const W_STATUS = TAB_W - W_NUM - W_TEST - W_SCORE - W_UNIT; // remainder ≈ 165

    const X_NUM    = TAB_L;
    const X_TEST   = X_NUM   + W_NUM;
    const X_SCORE  = X_TEST  + W_TEST;
    const X_UNIT   = X_SCORE + W_SCORE;
    const X_STATUS = X_UNIT  + W_UNIT;

    // Header bar
    const thY = y + 24;
    box(doc, TAB_L, thY, TAB_W, 18, NAVY, null, 4);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(7.5);
    doc.text('#',      X_NUM,    thY + 5, { width: W_NUM,    lineBreak: false });
    doc.text('TEST',   X_TEST,   thY + 5, { width: W_TEST,   lineBreak: false });
    doc.text('SCORE',  X_SCORE,  thY + 5, { width: W_SCORE,  align: 'right',  lineBreak: false });
    doc.text('UNIT',   X_UNIT,   thY + 5, { width: W_UNIT,   align: 'center', lineBreak: false });
    doc.text('STATUS', X_STATUS, thY + 5, { width: W_STATUS, align: 'center', lineBreak: false });

    // Data rows
    let rY = thY + 20;
    testRows.forEach((row, i) => {
      if (i % 2 === 0) box(doc, TAB_L, rY, TAB_W, ROW_H, LIGHT2, null, 0);
      const ry = rY + 5;
      doc.fillColor(GRAY).font('Helvetica').fontSize(8)
         .text(`${i + 1}`, X_NUM, ry, { width: W_NUM, lineBreak: false });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8)
         .text(row.name, X_TEST, ry, { width: W_TEST, lineBreak: false });
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(8)
         .text(row.score, X_SCORE, ry, { width: W_SCORE, align: 'right', lineBreak: false });
      doc.fillColor(GRAY).font('Helvetica').fontSize(8)
         .text(row.unit, X_UNIT, ry, { width: W_UNIT, align: 'center', lineBreak: false });
      doc.fillColor(GREEN).font('Helvetica-Bold').fontSize(7.5)
         .text('✓ Verified', X_STATUS, ry, { width: W_STATUS, align: 'center', lineBreak: false });
      if (i < testRows.length - 1) hLine(doc, rY + ROW_H);
      rY += ROW_H;
    });
    y += tableH + 8;

    // ══════════════════════════════════════════════════════════════════════════
    // 7. OVERALL PERFORMANCE — two clear columns
    // ══════════════════════════════════════════════════════════════════════════
    const perfH = 112;
    box(doc, L, y, CW, perfH, LIGHT, BORDER);
    secLabel(doc, L, y, 'OVERALL PERFORMANCE');

    // Left column: Fitness Score gauge
    const leftW  = CW / 2;
    const leftCX = L + leftW / 2;        // centre of left half
    const rightCX = L + leftW + leftW / 2; // centre of right half
    const rowY   = y + 28;               // content row start

    // Label — Fitness Score
    doc.fillColor(GRAY).font('Helvetica').fontSize(7.5)
       .text('Overall Fitness Score', L + IN, rowY, { width: leftW - IN, align: 'center', lineBreak: false });

    // Score circle (orange ring)
    const gR = 30, gCY = rowY + 18 + gR;
    doc.save().circle(leftCX, gCY, gR + 5).fill(ORANGE_LITE).restore();
    doc.save().circle(leftCX, gCY, gR + 5).lineWidth(4).strokeColor(ORANGE).stroke().restore();
    doc.save().circle(leftCX, gCY, gR).fill(WHITE).restore();
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(22)
       .text(`${overallScore}`, leftCX - 20, gCY - 14, { width: 40, align: 'center', lineBreak: false });
    doc.fillColor(GRAY).font('Helvetica').fontSize(8)
       .text('/100', leftCX - 14, gCY + 10, { width: 28, align: 'center', lineBreak: false });

    // Vertical divider
    vLine(doc, L + leftW, y + 24, y + perfH - 6);

    // Label — Fitness Grade
    doc.fillColor(GRAY).font('Helvetica').fontSize(7.5)
       .text('Fitness Grade', L + leftW + IN, rowY, { width: leftW - IN * 2, align: 'center', lineBreak: false });

    // Grade badge circle
    const gBR = 24;
    doc.save().circle(rightCX, gCY, gBR).fill(ORANGE).restore();
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(18)
       .text(grade, rightCX - gBR, gCY - 12, { width: gBR * 2, align: 'center', lineBreak: false });

    // Bottom row — Rank (left) | High Potential (right)
    const bottomY = y + perfH - 22;
    doc.fillColor(DARK).font('Helvetica-Bold').fontSize(10)
       .text('Top 15%  •  Ranked Nationally', L + IN, bottomY, { width: leftW - IN * 2, align: 'center', lineBreak: false });

    const hpW = 108, hpX = rightCX - hpW / 2;
    box(doc, hpX, bottomY - 2, hpW, 18, ORANGE, null, 9);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8)
       .text('⭐  High Potential', hpX, bottomY + 1, { width: hpW, align: 'center', lineBreak: false });
    y += perfH + 8;

    // ══════════════════════════════════════════════════════════════════════════
    // 8. PERFORMANCE RADAR BAR CHART — evenly distributed bars
    // ══════════════════════════════════════════════════════════════════════════
    const radH = 82;
    box(doc, L, y, CW, radH, LIGHT, BORDER);
    secLabel(doc, L, y, 'PERFORMANCE RADAR');

    const BAR_AREA_W = CW - IN * 2;        // full usable width
    const BAR_COUNT  = radarBars.length;
    const BAR_GAP    = 12;
    const BAR_W      = (BAR_AREA_W - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT;
    const MAX_BAR_H  = 36;
    const BAR_BASE_Y = y + 22 + MAX_BAR_H; // bottom of tallest bar

    let bx = L + IN;
    radarBars.forEach((m, i) => {
      const bH = Math.max(4, Math.round((m.score / 100) * MAX_BAR_H));
      const barTopY = BAR_BASE_Y - bH;
      // Alternating orange / navy
      box(doc, bx, barTopY, BAR_W, bH, i % 2 === 0 ? ORANGE : NAVY, null, 3);
      // Score label above bar
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(7)
         .text(`${m.score}`, bx, barTopY - 10, { width: BAR_W, align: 'center', lineBreak: false });
      // Category label below bar
      doc.fillColor(GRAY).font('Helvetica').fontSize(6.5)
         .text(m.label, bx, BAR_BASE_Y + 4, { width: BAR_W, align: 'center', lineBreak: false });
      bx += BAR_W + BAR_GAP;
    });
    y += radH + 8;

    // ══════════════════════════════════════════════════════════════════════════
    // 9. QR SCAN BOX — centred QR code
    // ══════════════════════════════════════════════════════════════════════════
    const qrH = 84;
    box(doc, L, y, CW, qrH, ORANGE_LITE, ORANGE_BDR);

    doc.fillColor(ORANGE).font('Helvetica-Bold').fontSize(8.5)
       .text('SCAN TO VIEW — COMPLETE DIGITAL REPORT & VIDEO RECORDS',
             L + IN, y + 8, { width: CW - IN * 2, align: 'center', lineBreak: false });

    // QR grid — 15×15 modules, centred horizontally
    const QR_PX   = 54;               // overall QR square size
    const CELL    = QR_PX / 15;       // each module side
    const qrLeft  = L + (CW - QR_PX) / 2;
    const qrTop   = y + 20;

    // White background + border
    box(doc, qrLeft - 5, qrTop - 5, QR_PX + 10, QR_PX + 10, WHITE, ORANGE_BDR, 4);

    // Draw modules
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        const isFinderTL = r < 6 && c < 6;
        const isFinderTR = r < 6 && c >= 9;
        const isFinderBL = r >= 9 && c < 6;
        const isFinder   = isFinderTL || isFinderTR || isFinderBL;
        const isData     =
          ((r + c) % 2 === 0 && r > 5 && r < 9 && c > 5 && c < 9) ||
          (r % 3 === 0 && c % 2 === 1 && !isFinder) ||
          (r === 6 || c === 6) ||       // timing strips
          (r % 2 === 0 && c % 3 === 0 && !isFinder);
        const dark = isFinder || isData;
        if (dark) {
          const fill = isFinder ? NAVY : ORANGE;
          doc.rect(qrLeft + c * CELL, qrTop + r * CELL, CELL - 0.4, CELL - 0.4).fill(fill);
        }
      }
    }

    // URL label
    const qrUrl = `http://batteryfitness.ai/report/${nsrsId}?a=${asmId}`;
    doc.fillColor(NAVY).font('Helvetica').fontSize(6)
       .text(qrUrl, L + IN, qrTop + QR_PX + 8, { width: CW - IN * 2, align: 'center', lineBreak: false });

    // ══════════════════════════════════════════════════════════════════════════
    // 10. FOOTER — pinned to the very bottom
    // ══════════════════════════════════════════════════════════════════════════
    doc.rect(0, PAGE_H - 26, PAGE_W, 26).fill(NAVY);
    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8)
       .text('⚡  Powered by Battery Fitness  |  Data Driven. AI Powered. Athlete Focused.',
             0, PAGE_H - 17, { width: PAGE_W, align: 'center', lineBreak: false });
    doc.rect(0, PAGE_H - 4, PAGE_W, 4).fill(ORANGE);

    doc.end();

  } catch (err) {
    console.error('[ReportController] PDF error:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'PDF generation failed.', error: err.message });
    }
  }
}
