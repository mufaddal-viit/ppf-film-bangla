/** One CSV column: its header and how to read the cell from a row. `phone` keeps a leading +. */
export type CsvColumn<T> = { header: string; value: (row: T) => string | number | undefined; phone?: boolean };

/**
 * People type these values, so a cell starting with = + - @ could run as a formula when
 * the file is opened in Excel. Such cells get a leading apostrophe; phone numbers keep their +.
 */
function csvCell(value: string | number | undefined, isPhone = false): string {
  let text = value === undefined ? '' : String(value);
  if (!isPhone && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv<T>(columns: Array<CsvColumn<T>>, rows: T[]): string {
  const lines = [
    columns.map((column) => column.header).join(','),
    ...rows.map((row) => columns.map((column) => csvCell(column.value(row), column.phone)).join(',')),
  ];
  // The BOM makes Excel read the file as UTF-8, which Arabic names need.
  return `﻿${lines.join('\r\n')}\r\n`;
}

/** Response headers for a CSV download named `{name}-YYYY-MM-DD.csv`. */
export function csvHeaders(name: string): HeadersInit {
  return {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
    'Cache-Control': 'no-store',
  };
}
