import { jsPDF } from 'jspdf';
import {
  COURSE_DEFINITIONS,
  COURSE_KEYS,
  TeacherGroup,
  buildOverviewFileName,
  buildOverviewTitle,
  formatDate,
  formatDayNumber,
  formatWeekday,
  getCourseCode,
  getDaySpans,
  getFullName,
  isWeekend,
} from './teacherOverview';

type Rgb = [number, number, number];

const hexToRgb = (hex: string): Rgb => {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

const COLOR_TEXT: Rgb = [32, 28, 26];
const COLOR_MUTED: Rgb = [122, 112, 104];
const COLOR_GRID: Rgb = [214, 206, 196];
const COLOR_HEADER_BG: Rgb = [242, 234, 224];
const COLOR_WEEKEND_BG: Rgb = [246, 242, 236];
const COLOR_GROUP_BG: Rgb = [58, 51, 48];
const COLOR_WHITE: Rgb = [255, 255, 255];

const PAGE_MARGIN = 10;
const ROOM_WIDTH = 16;
const NAME_WIDTH = 66;
const CODE_WIDTH = 14;
const INFO_WIDTH = ROOM_WIDTH + NAME_WIDTH + CODE_WIDTH;
const ROW_HEIGHT = 6.5;
const GROUP_ROW_HEIGHT = 8;
const COLUMN_HEADER_HEIGHT = 9;

/** Text auf die verfügbare Spaltenbreite kürzen. */
const truncate = (doc: jsPDF, text: string, maxWidth: number): string => {
  if (doc.getTextWidth(text) <= maxWidth) return text;

  let truncated = text;
  while (truncated.length > 1 && doc.getTextWidth(`${truncated}…`) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
};

export const buildTeacherOverviewPdf = (groups: TeacherGroup[], days: Date[]): jsPDF => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN * 2;
  const dayAreaX = PAGE_MARGIN + INFO_WIDTH;
  const dayWidth = days.length > 0 ? (contentWidth - INFO_WIDTH) / days.length : 0;
  const bottomLimit = pageHeight - PAGE_MARGIN - 6;

  const drawPageHeader = (): number => {
    doc.setTextColor(...COLOR_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(buildOverviewTitle(days), PAGE_MARGIN, PAGE_MARGIN + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Stand: ${formatDate(new Date())}`, PAGE_MARGIN, PAGE_MARGIN + 10.5);

    // Legende
    let legendX = PAGE_MARGIN;
    const legendY = PAGE_MARGIN + 15;
    COURSE_KEYS.forEach((key) => {
      const definition = COURSE_DEFINITIONS[key];
      doc.setFillColor(...hexToRgb(definition.color));
      doc.roundedRect(legendX, legendY - 2.6, 3.4, 3.4, 0.6, 0.6, 'F');

      const label = `${definition.code} = ${definition.label}`;
      doc.setTextColor(...COLOR_MUTED);
      doc.text(label, legendX + 4.6, legendY);
      legendX += 4.6 + doc.getTextWidth(label) + 8;
    });

    return legendY + 4;
  };

  const drawColumnHeader = (top: number): number => {
    doc.setFillColor(...COLOR_HEADER_BG);
    doc.rect(PAGE_MARGIN, top, contentWidth, COLUMN_HEADER_HEIGHT, 'F');

    doc.setDrawColor(...COLOR_GRID);
    doc.setLineWidth(0.1);
    doc.rect(PAGE_MARGIN, top, contentWidth, COLUMN_HEADER_HEIGHT);

    doc.setTextColor(...COLOR_TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Zi.Nr.', PAGE_MARGIN + ROOM_WIDTH / 2, top + 5.6, { align: 'center' });
    doc.text('Vorname Nachname', PAGE_MARGIN + ROOM_WIDTH + 2, top + 5.6);
    doc.text('GK/R/T', PAGE_MARGIN + ROOM_WIDTH + NAME_WIDTH + CODE_WIDTH / 2, top + 5.6, {
      align: 'center',
    });

    days.forEach((day, index) => {
      const x = dayAreaX + index * dayWidth;
      if (isWeekend(day)) {
        doc.setFillColor(...COLOR_WEEKEND_BG);
        doc.rect(x, top, dayWidth, COLUMN_HEADER_HEIGHT, 'F');
      }

      doc.setDrawColor(...COLOR_GRID);
      doc.line(x, top, x, top + COLUMN_HEADER_HEIGHT);

      doc.setTextColor(...COLOR_MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(formatWeekday(day), x + dayWidth / 2, top + 3.6, { align: 'center' });

      doc.setTextColor(...COLOR_TEXT);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(formatDayNumber(day), x + dayWidth / 2, top + 7.4, { align: 'center' });
    });

    // Trennlinien der Info-Spalten
    doc.setDrawColor(...COLOR_GRID);
    doc.line(PAGE_MARGIN + ROOM_WIDTH, top, PAGE_MARGIN + ROOM_WIDTH, top + COLUMN_HEADER_HEIGHT);
    doc.line(
      PAGE_MARGIN + ROOM_WIDTH + NAME_WIDTH,
      top,
      PAGE_MARGIN + ROOM_WIDTH + NAME_WIDTH,
      top + COLUMN_HEADER_HEIGHT,
    );

    return top + COLUMN_HEADER_HEIGHT;
  };

  let cursorY = drawColumnHeader(drawPageHeader());

  const startNewPage = () => {
    doc.addPage();
    cursorY = drawColumnHeader(drawPageHeader());
  };

  const ensureSpace = (height: number) => {
    if (cursorY + height > bottomLimit) startNewPage();
  };

  const drawDayGrid = (top: number, height: number) => {
    days.forEach((day, index) => {
      const x = dayAreaX + index * dayWidth;
      if (isWeekend(day)) {
        doc.setFillColor(...COLOR_WEEKEND_BG);
        doc.rect(x, top, dayWidth, height, 'F');
      }
      doc.setDrawColor(...COLOR_GRID);
      doc.setLineWidth(0.1);
      doc.line(x, top, x, top + height);
    });
    doc.line(PAGE_MARGIN + contentWidth, top, PAGE_MARGIN + contentWidth, top + height);
  };

  const drawGroupHeader = (group: TeacherGroup) => {
    ensureSpace(GROUP_ROW_HEIGHT + ROW_HEIGHT);

    doc.setFillColor(...COLOR_GROUP_BG);
    doc.rect(PAGE_MARGIN, cursorY, contentWidth, GROUP_ROW_HEIGHT, 'F');

    doc.setTextColor(...COLOR_WHITE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(
      `${group.name} (${group.registrations.length})`,
      PAGE_MARGIN + 2.5,
      cursorY + GROUP_ROW_HEIGHT / 2 + 1.4,
    );

    cursorY += GROUP_ROW_HEIGHT;
  };

  const drawRegistrationRow = (registration: TeacherGroup['registrations'][number]) => {
    ensureSpace(ROW_HEIGHT);

    drawDayGrid(cursorY, ROW_HEIGHT);

    doc.setDrawColor(...COLOR_GRID);
    doc.setLineWidth(0.1);
    doc.line(PAGE_MARGIN, cursorY + ROW_HEIGHT, PAGE_MARGIN + contentWidth, cursorY + ROW_HEIGHT);
    doc.line(PAGE_MARGIN, cursorY, PAGE_MARGIN, cursorY + ROW_HEIGHT);
    doc.line(PAGE_MARGIN + ROOM_WIDTH, cursorY, PAGE_MARGIN + ROOM_WIDTH, cursorY + ROW_HEIGHT);
    doc.line(
      PAGE_MARGIN + ROOM_WIDTH + NAME_WIDTH,
      cursorY,
      PAGE_MARGIN + ROOM_WIDTH + NAME_WIDTH,
      cursorY + ROW_HEIGHT,
    );

    const textY = cursorY + ROW_HEIGHT / 2 + 1.2;
    doc.setTextColor(...COLOR_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(registration.room_number?.trim() || '–', PAGE_MARGIN + ROOM_WIDTH / 2, textY, {
      align: 'center',
    });
    doc.text(
      truncate(doc, getFullName(registration), NAME_WIDTH - 4),
      PAGE_MARGIN + ROOM_WIDTH + 2,
      textY,
    );
    doc.text(
      getCourseCode(registration) || '–',
      PAGE_MARGIN + ROOM_WIDTH + NAME_WIDTH + CODE_WIDTH / 2,
      textY,
      { align: 'center' },
    );

    getDaySpans(registration, days).forEach((span) => {
      const inset = 0.6;
      const left = dayAreaX + span.startIndex * dayWidth + (span.clippedStart ? 0 : inset);
      const right =
        dayAreaX + (span.endIndex + 1) * dayWidth - (span.clippedEnd ? 0 : inset);

      doc.setFillColor(...hexToRgb(COURSE_DEFINITIONS[span.key].color));
      doc.roundedRect(left, cursorY + 1.4, Math.max(right - left, 0.8), ROW_HEIGHT - 2.8, 1, 1, 'F');
    });

    cursorY += ROW_HEIGHT;
  };

  if (groups.length === 0) {
    doc.setTextColor(...COLOR_MUTED);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Keine Anmeldungen im gewählten Filter.', PAGE_MARGIN, cursorY + 8);
  }

  groups.forEach((group) => {
    drawGroupHeader(group);

    if (group.registrations.length === 0) {
      ensureSpace(ROW_HEIGHT);
      doc.setTextColor(...COLOR_MUTED);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text('Keine Schüler zugeordnet', PAGE_MARGIN + 2.5, cursorY + ROW_HEIGHT / 2 + 1.2);
      cursorY += ROW_HEIGHT;
      return;
    }

    group.registrations.forEach(drawRegistrationRow);
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR_MUTED);
    doc.text(`Seite ${page} / ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - PAGE_MARGIN + 2, {
      align: 'right',
    });
  }

  return doc;
};

export const downloadTeacherOverviewPdf = (groups: TeacherGroup[], days: Date[]) => {
  buildTeacherOverviewPdf(groups, days).save(buildOverviewFileName(days, 'pdf'));
};
