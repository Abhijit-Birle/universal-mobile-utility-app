export function generateExpenseCsv(expenses) {
  if (!expenses || expenses.length === 0) return '';
  
  // Headers based on the schema
  const headers = ['ID', 'Date', 'Amount', 'Category', 'Subcategory', 'Note', 'Tags', 'Recurring', 'Interval'];
  
  const escapeCsv = (str) => {
    if (str == null) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = expenses.map(e => [
    e.id,
    e.date,
    e.amount,
    e.category,
    e.subcategory || '',
    e.note || '',
    (e.tags || []).join('; '),
    e.recurring ? 'Yes' : 'No',
    e.recurrenceInterval || 'none'
  ].map(escapeCsv).join(','));

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(csvContent, filename = 'expenses.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
