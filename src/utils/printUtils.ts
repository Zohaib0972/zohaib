import { TherapistSchedule, DAYS_LIST } from '../types';

export const generateSchedulePrintHtml = (
  schedules: TherapistSchedule[],
  options: {
    hideEmptyCells?: boolean;
    todayDateFormatted?: string;
  } = {}
): string => {
  const dateStr =
    options.todayDateFormatted ||
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Therapy Hub - Clinical Schedule</title>
  <style>
    @page {
      size: landscape;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      color: #0f172a;
      margin: 0;
      padding: 16px;
      font-size: 11px;
    }
    .print-controls {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .print-btn {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 9px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .print-btn:hover {
      background: #0369a1;
    }
    .close-btn {
      background: #64748b;
      color: #ffffff;
      border: none;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    .page-sheet {
      page-break-after: always;
      break-after: page;
      margin-bottom: 36px;
      background: #ffffff;
    }
    .page-sheet:last-child {
      page-break-after: avoid;
      break-after: avoid;
      margin-bottom: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .title {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin: 0 0 4px 0;
      color: #0f172a;
    }
    .therapist-name {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin: 2px 0;
    }
    .department {
      font-size: 11px;
      color: #475569;
      font-weight: 500;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #1e293b;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #1e293b;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
      font-size: 11px;
    }
    th {
      background-color: #f1f5f9 !important;
      color: #0f172a;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .time-slot-col {
      width: 150px;
      background-color: #f8fafc !important;
      font-weight: 800;
      color: #0f172a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .break-row {
      background-color: #fef3c7 !important;
      font-weight: 700;
      text-align: center;
      color: #92400e;
    }
    .break-cell {
      text-align: center;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1.5px solid #cbd5e1;
    }
    .sig-block {
      width: 220px;
      text-align: center;
    }
    .sig-line {
      border-bottom: 1.5px solid #0f172a;
      height: 38px;
      margin-bottom: 6px;
    }
    .sig-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
    }
    .sig-sub {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    @media print {
      .print-controls {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
    }
  </style>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      // Automatically trigger print on load if requested
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autoprint') !== 'false') {
        setTimeout(function() {
          window.focus();
          window.print();
        }, 300);
      }
    });
  </script>
</head>
<body>
  <div class="print-controls">
    <div>
      <strong style="font-size:14px;color:#0f172a;">Therapy Hub PECHS - Clinical Print Sheet</strong>
      <div style="font-size:11px;color:#64748b;">Review paper layout below or click Print Now to send to printer / save PDF</div>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="print-btn" onclick="window.print()">
        🖨️ Print Now (Ctrl + P)
      </button>
      <button class="close-btn" onclick="window.close()">
        ✕ Close
      </button>
    </div>
  </div>

  ${schedules
    .map(
      (sched) => `
    <div class="page-sheet">
      <div class="header">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="/therapy-hub-logo.jpg" alt="Therapy Hub Logo" style="height:46px;width:auto;object-fit:contain;border-radius:6px;border:1px solid #cbd5e1;padding:2px;background:#fff;" onerror="this.style.display='none'" />
          <div>
            <div class="title">THERAPY HUB - CLINICAL SCHEDULE</div>
            <div class="therapist-name">Therapist: ${sched.title}</div>
            <div class="department">Department: ${sched.department || 'Clinical Rehabilitation'}</div>
          </div>
        </div>
        <div class="meta-box">
          <div><strong>BRANCH:</strong> ${sched.branch || 'MAIN PECHS BRANCH'}</div>
          <div><strong>SHIFT:</strong> ${sched.shift}</div>
          <div><strong>PRINTED:</strong> ${dateStr}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="time-slot-col">TIME SLOT</th>
            <th>MONDAY</th>
            <th>TUESDAY</th>
            <th>WEDNESDAY</th>
            <th>THURSDAY</th>
            <th>FRIDAY</th>
            <th>SATURDAY</th>
          </tr>
        </thead>
        <tbody>
          ${sched.slots
            .map((slot) => {
              if (slot.isBreak) {
                return `
              <tr class="break-row">
                <td class="time-slot-col">${slot.time}</td>
                <td colspan="6" class="break-cell">☕ ${slot.mon || 'BREAK / LUNCH'}</td>
              </tr>`;
              }

              const mon = slot.mon || '';
              const tue = slot.tue || '';
              const wed = slot.wed || '';
              const thu = slot.thu || '';
              const fri = slot.fri || '';
              const sat = slot.sat || '';

              return `
              <tr>
                <td class="time-slot-col">${slot.time}</td>
                <td>${mon}</td>
                <td>${tue}</td>
                <td>${wed}</td>
                <td>${thu}</td>
                <td>${fri}</td>
                <td>${sat}</td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>

      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-title">Therapist Signature</div>
          <div class="sig-sub">${sched.title}</div>
        </div>
        <div class="sig-block" style="width:240px;">
          <div class="sig-line"></div>
          <div class="sig-title">Zohaib Ali</div>
          <div style="font-size:11px;font-weight:600;color:#0f172a;">Branch Manager</div>
          <div class="sig-sub">Therapy Hub ${sched.branch || 'PECHS Campus'}</div>
        </div>
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
};

/**
 * Universal print handler that works reliably in:
 * 1. Sandboxed / cross-origin iframes (AI Studio live preview)
 * 2. Regular browser windows
 * 3. Mobile browsers
 */
export const executePrintSchedule = (
  schedules: TherapistSchedule[],
  options: {
    hideEmptyCells?: boolean;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
  } = {}
) => {
  const html = generateSchedulePrintHtml(schedules, {
    hideEmptyCells: options.hideEmptyCells,
  });

  // Strategy 1: Create a Blob URL and open a new window with auto-print
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      if (options.onSuccess) options.onSuccess();
      return { method: 'window', url: blobUrl };
    }
  } catch (e) {
    console.warn('Window.open print popup blocked or failed:', e);
  }

  // Strategy 2: If window.open was blocked, use a dedicated hidden iframe
  try {
    let iframe = document.getElementById('therapy-hub-print-frame') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'therapy-hub-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '10px';
      iframe.style.height = '10px';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          if (options.onSuccess) options.onSuccess();
        } catch (err) {
          console.warn('Iframe print failed:', err);
          // Fallback to top-level window.print()
          window.print();
        }
      }, 300);
      return { method: 'iframe' };
    }
  } catch (err) {
    console.warn('Iframe printing error:', err);
  }

  // Final fallback: Native window.print()
  try {
    window.print();
    if (options.onSuccess) options.onSuccess();
    return { method: 'native' };
  } catch (finalErr) {
    console.error('All print methods failed:', finalErr);
    if (options.onError) options.onError(finalErr as Error);
    return { method: 'failed' };
  }
};
