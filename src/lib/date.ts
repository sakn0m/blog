export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}
