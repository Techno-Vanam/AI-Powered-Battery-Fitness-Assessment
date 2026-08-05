/**
 * Utility functions for exporting data to CSV/Excel and print/PDF documents.
 */

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(h => {
          const val = row[h] ?? '';
          const escaped = String(val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printFormattedPDF(title: string, headers: string[], rows: (string | number)[][]): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 20px; font-weight: 700; color: #10b981; margin-bottom: 8px; }
          p { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #f3f4f6; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-weight: 600; }
          td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
          tr:nth-child(even) td { background: #fafafa; }
          .footer { margin-top: 30px; font-size: 10px; color: #9ca3af; text-align: right; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>AI Battery Fitness Assessment Platform • Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <div class="footer">Confidential Report • Official Athletic Assessment Document</div>
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
