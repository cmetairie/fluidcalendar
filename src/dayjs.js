export function dayjs(s) {
  let date
  if (!s) {
    date = new Date()
  } else if (s instanceof Date) {
    date = s
  } else {
    date = new Date(s) // Month is 0-indexed
  }

  // Public methods
  function format(s) {
    // console.log('Format ', date)
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    if (s === 'iso') return date.toISOString()
    return date.toLocaleDateString(undefined, options)
  }

  function add(value, unit) {
    if (unit === 'minute') {
      date.setMinutes(date.getMinutes() + value)
    } else if (unit === 'hour') {
      date.setHours(date.getHours() + value)
    } else if (unit === 'day') {
      date.setDate(date.getDate() + value)
    } else {
      throw new Error(`Unsupported unit: ${unit}`)
    }
    return this // For method chaining
  }

  function isSame(otherDate, unit = 'day') {
    if (unit === 'day') {
      return date.getTime() === otherDate.date.getTime()
    } else if (unit === 'month') {
      return (
        date.getMonth() === otherDate.date.getMonth() &&
        date.getFullYear() === otherDate.date.getFullYear()
      )
    } else if (unit === 'year') {
      return date.getFullYear() === otherDate.date.getFullYear()
    }
    return false // Invalid unit
  }

  function isBefore(otherDate, unit = 'day') {
    if (unit === 'day') {
      return date.getTime() < otherDate.date.getTime()
    } else if (unit === 'month') {
      if (date.getFullYear() < otherDate.date.getFullYear()) return true
      if (
        date.getFullYear() === otherDate.date.getFullYear() &&
        date.getMonth() < otherDate.date.getMonth()
      )
        return true
      return false
    } else if (unit === 'year') {
      return date.getFullYear() < otherDate.date.getFullYear()
    }
    return false // Invalid unit
  }

  function isAfter(otherDate, unit = 'day') {
    if (unit === 'day') {
      return date.getTime() > otherDate.date.getTime()
    } else if (unit === 'month') {
      if (date.getFullYear() > otherDate.date.getFullYear()) return true
      if (
        date.getFullYear() === otherDate.date.getFullYear() &&
        date.getMonth() > otherDate.date.getMonth()
      )
        return true
      return false
    } else if (unit === 'year') {
      return date.getFullYear() > otherDate.date.getFullYear()
    }
    return false // Invalid unit
  }

  function startOf(unit) {
    if (unit === 'day') {
      date.setHours(0, 0, 0, 0)
    } else if (unit === 'month') {
      date.setDate(1)
      date.setHours(0, 0, 0, 0)
    } else if (unit === 'year') {
      date.setMonth(0, 1)
      date.setHours(0, 0, 0, 0)
    }
    return this
  }

  function endOf(unit) {
    if (unit === 'day') {
      date.setHours(23, 59, 59, 999)
    } else if (unit === 'month') {
      date.setMonth(date.getMonth() + 1, 0)
      date.setHours(23, 59, 59, 999)
    } else if (unit === 'year') {
      date.setFullYear(date.getFullYear() + 1, 0, 0)
      date.setHours(23, 59, 59, 999)
    }
    return this
  }

  function diff(otherDate, unit = 'day') {
    const timeDiff = date - otherDate.date
    if (unit === 'day') {
      return Math.round(timeDiff / (1000 * 60 * 60 * 24))
    } else if (unit === 'month') {
      let yearDiff = date.getFullYear() - otherDate.date.getFullYear()
      let monthDiff = date.getMonth() - otherDate.date.getMonth()
      if (monthDiff < 0) {
        yearDiff--
        monthDiff += 12
      }
      if (unit === 'year') {
        return yearDiff
      }
      return yearDiff * 12 + monthDiff
    } else if (unit === 'minute') {
      return Math.round(timeDiff / (1000 * 60))
    }

    return NaN // Invalid unit
  }
  // Return an object with public methods
  return {
    diff,
    isSame,
    isBefore,
    isAfter,
    startOf,
    endOf,
    format,
    add,
    date,
  }
}
