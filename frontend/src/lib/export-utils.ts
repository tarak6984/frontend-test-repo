import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  data: any[];
  columns?: { header: string; key: string; format?: (value: any) => any }[];
}

export function exportToExcel({ filename, sheetName = 'Sheet1', data, columns }: ExportOptions) {
  try {
    // Transform data if columns are specified
    const exportData = columns
      ? data.map((item) =>
          columns.reduce((acc, col) => {
            const value = item[col.key];
            acc[col.header] = col.format ? col.format(value) : value;
            return acc;
          }, {} as any)
        )
      : data;

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || '').length)
      ),
    }));
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with timestamp
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, fullFilename);

    return { success: true, filename: fullFilename };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
  }
}

export function exportToCSV({ filename, data, columns }: ExportOptions) {
  try {
    // Transform data if columns are specified
    const exportData = columns
      ? data.map((item) =>
          columns.reduce((acc, col) => {
            const value = item[col.key];
            acc[col.header] = col.format ? col.format(value) : value;
            return acc;
          }, {} as any)
        )
      : data;

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Convert to CSV
    const csv = XLSX.utils.sheet_to_csv(ws);

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, filename: `${filename}_${timestamp}.csv` };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Export failed' };
  }
}
