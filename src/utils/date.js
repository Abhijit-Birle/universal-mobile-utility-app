/**
 * Returns the local date string in YYYY-MM-DD format.
 * Fixes the issue where `new Date().toISOString().split('T')[0]` returns the UTC date,
 * which causes items added in the evening/night in UTC+ timezones to be attributed to the wrong day.
 */
export function getLocalDateString(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().split('T')[0];
}
