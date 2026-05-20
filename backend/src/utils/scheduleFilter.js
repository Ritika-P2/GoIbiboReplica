/**
 * Returns the effective lower-bound Date for a departure-time query so that
 * schedules that have already "expired" are excluded from search results.
 *
 * Logic:
 *   lowerBound = max(startOfSearchDay, now - offsetMinutes)
 *
 * When the search date is in the future, startOfSearchDay is always later than
 * the cutoff, so the full day is returned unchanged.
 * When the search date is today, any slot earlier than (now - offsetMinutes)
 * is hidden.
 *
 * @param {string|Date} searchDate  - The date the user searched (any parseable value)
 * @param {number}      offsetMinutes - How many minutes before now to set the cutoff
 * @returns {{ lowerBound: Date, endOfDay: Date }}
 */
function getScheduleBounds(searchDate, offsetMinutes) {
  const startOfDay = new Date(searchDate)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(searchDate)
  endOfDay.setHours(23, 59, 59, 999)

  // Cutoff: schedules departing at or before this moment are hidden
  const cutoff = new Date(Date.now() - offsetMinutes * 60 * 1000)

  // Use whichever is later: midnight of the search day, or the cutoff time
  const lowerBound = new Date(Math.max(startOfDay.getTime(), cutoff.getTime()))

  return { lowerBound, endOfDay }
}

module.exports = { getScheduleBounds }
