/**
 * Return the current UTC time as an ISO 8601 string.
 * Single source of truth for all timestamp writes.
 * @returns {string}
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Return an ISO 8601 string for `minutes` from now.
 * @param {number} minutes
 * @returns {string}
 */
export function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

/**
 * Check whether an ISO timestamp is in the past.
 * @param {string} isoString
 * @returns {boolean}
 */
export function isPast(isoString) {
  return new Date(isoString) < new Date();
}
