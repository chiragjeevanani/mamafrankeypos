/**
 * Safely exports any nested array of rows/cells to a CSV file with proper escaping,
 * UTF-8 BOM encoding, and CRLF line endings.
 * @param {Array<Array<any>>} rows - 2D array of rows and cells.
 * @param {string} filename - The name of the downloaded file.
 */
export const exportToCSV = (rows, filename) => {
  if (!Array.isArray(rows)) return;

  const escapeCSVField = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    // Double quotes must be escaped by doubling them
    str = str.replaceAll('"', '""');
    // If the field contains comma, quotes, or newlines, it must be enclosed in double quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str}"`;
    }
    return str;
  };

  const csvContent = rows
    .map(row => row.map(escapeCSVField).join(","))
    .join("\r\n");

  // Prepend UTF-8 Byte Order Mark (BOM) to support Unicode symbols (e.g. ₹)
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
