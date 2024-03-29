function parseTime(timeString) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  return hours + minutes / 60 + (seconds || 0) / 3600
}

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
    let options = {
      weekday: 'short', // full name of the weekday
      // year: 'numeric',
      month: 'short', // full name of the month
      day: 'numeric',
    }
    if (s === 'iso') return date.toISOString()

    if (s === 'time') {
      options = {
        ...options,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    }

    return date.toLocaleDateString(undefined, options)
  }

  function formatTime() {
    // console.log('Format ', date)
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      // second: 'numeric',
    }
    // if (s === 'iso') return date.toISOString()

    return date.toLocaleTimeString(undefined, options)
  }

  function get(value, unit = 'day') {
    const d = value || this.date
    switch (unit) {
      case 'year':
        return d.getFullYear()
      case 'month':
        return d.getMonth() + 1 // getMonth() returns 0-11, so add 1 for a 1-12 range
      case 'day':
        return d.getDate() // Returns the day of the month
      case 'hour':
        return d.getHours() // Returns the hour
      case 'minute':
        return d.getMinutes() // Returns the minutes
      case 'second':
        return d.getSeconds() // Returns the seconds
      default:
        throw new Error(
          'Invalid unit: must be "year", "month", "day", "hour", "minute", or "second"',
        )
    }
  }

  function gptAdd(
    value,
    unit = 'hour',
    startDay = '00:00:00',
    endDay = '23:59:59',
  ) {
    // console.log('ADD ', value, startDay, endDay)
    const startTime = parseTime(startDay)
    const endTime = parseTime(endDay)
    const workingHours = endTime - startTime
    const workingMinutes = (endTime - startTime) * 60

    if (unit === 'minute') {
      let remainingMinutes = Math.abs(value)
      let isNegative = value < 0

      while (remainingMinutes > 0) {
        let currentHour = date.getHours() + date.getMinutes() / 60
        if (isNegative) {
          // Handle negative values (moving time backwards)
          if (currentHour >= endTime) {
            // If current time is after the end of the day, move to the end
            let minutesUntilEnd = (endTime - currentHour) * 60
            date.setMinutes(date.getMinutes() + minutesUntilEnd)
            remainingMinutes -= minutesUntilEnd
          }

          let availableMinutesToday = Math.max(
            0,
            (date.getHours() - startTime) * 60 + date.getMinutes(),
          )

          if (remainingMinutes > availableMinutesToday) {
            // Move to the end of the previous day
            date.setHours(endTime, 0, 0, 0)
            date.setDate(date.getDate() - 1)
            remainingMinutes -= availableMinutesToday
          } else {
            // Subtract remaining minutes from the current day
            date.setMinutes(date.getMinutes() - remainingMinutes)
            break
          }
        } else {
          // If the current time is before the start of the day, move to the start
          if (currentHour < startTime) {
            let minutesUntilStart = (startTime - currentHour) * 60
            date.setMinutes(date.getMinutes() + minutesUntilStart)
            remainingMinutes -= minutesUntilStart
          }

          // Calculate available minutes in the current day
          let availableMinutesToday = Math.max(
            0,
            workingMinutes -
              (date.getHours() - startTime) * 60 -
              date.getMinutes(),
          )

          if (remainingMinutes > availableMinutesToday) {
            // Move to the start of the next day
            date.setHours(startTime, 0, 0, 0)
            date.setDate(date.getDate() + 1)
            remainingMinutes -= availableMinutesToday
          } else {
            // Add remaining minutes to the current day
            date.setMinutes(date.getMinutes() + remainingMinutes)
            break
          }
        }
      }
      // addTime(value * 60000) // Convert minutes to milliseconds
    } else if (unit === 'hour') {
      addTime(value * 3600000) // Convert hours to milliseconds
    } else if (unit === 'day') {
      for (let i = 0; i < value; i++) {
        addTime(workingHours) // Add one working day at a time
      }
    } else {
      throw new Error(`Unsupported unit: ${unit}`)
    }
    return this

    function addTime(milliseconds) {
      let newDate = new Date(date.getTime() + milliseconds)
      // console.log('Add time => ', milliseconds)
      if (newDate.getHours() >= endTime || newDate.getHours() < startTime) {
        // If outside working hours, adjust to next working day
        newDate = new Date(newDate.setHours(startTime, 0, 0, 0))
        newDate.setDate(newDate.getDate() + 1)
      }
      date.setTime(newDate.getTime())
    }
  }

  function setTime(time = '00:00:00') {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    date.setHours(hours, minutes, seconds, 0)
    return date
  }

  function add(value, unit = 'hour') {
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

  function isSame(d, unit = 'day') {
    if (unit === 'day') {
      return (
        date.getDate() === d.date.getDate() &&
        date.getMonth() === d.date.getMonth() &&
        date.getFullYear() === d.date.getFullYear()
      )
    } else if (unit === 'month') {
      return (
        date.getMonth() === d.date.getMonth() &&
        date.getFullYear() === d.date.getFullYear()
      )
    } else if (unit === 'year') {
      return date.getFullYear() === d.date.getFullYear()
    } else if (unit === 'minute') {
      return (
        date.getDate() === d.date.getDate() &&
        date.getMonth() === d.date.getMonth() &&
        date.getFullYear() === d.date.getFullYear() &&
        date.getMinutes() === d.date.getMinutes() &&
        date.getHours() === d.date.getHours()
      )
    }
    return false // Invalid unit
  }

  function isBefore(d, unit = 'day') {
    if (unit === 'day') {
      return date.getTime() < d.date.getTime()
    } else if (unit === 'month') {
      if (date.getFullYear() < d.date.getFullYear()) return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() < d.date.getMonth()
      )
        return true
      return false
    } else if (unit === 'year') {
      return date.getFullYear() < d.date.getFullYear()
    } else if (unit === 'minute') {
      if (date.getFullYear() < d.date.getFullYear()) return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() < d.date.getMonth()
      )
        return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() === d.date.getMonth() &&
        date.getDate() < d.date.getDate()
      )
        return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() === d.date.getMonth() &&
        date.getDate() === d.date.getDate() &&
        date.getHours() < d.date.getHours()
      )
        return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() === d.date.getMonth() &&
        date.getDate() === d.date.getDate() &&
        date.getHours() === d.date.getHours() &&
        date.getMinutes() < d.date.getMinutes()
      )
        return true
      return false
    }
    return false // Invalid unit
  }

  function isAfter(d, unit = 'day') {
    if (unit === 'day') {
      return date.getTime() > d.date.getTime()
    } else if (unit === 'month') {
      if (date.getFullYear() > d.date.getFullYear()) return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() > d.date.getMonth()
      )
        return true
      return false
    } else if (unit === 'year') {
      return date.getFullYear() > d.date.getFullYear()
    } else if (unit === 'minute') {
      if (date.getFullYear() > d.date.getFullYear()) return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() > d.date.getMonth()
      )
        return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() === d.date.getMonth() &&
        date.getDate() > d.date.getDate()
      )
        return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() === d.date.getMonth() &&
        date.getDate() === d.date.getDate() &&
        date.getHours() > d.date.getHours()
      )
        return true
      if (
        date.getFullYear() === d.date.getFullYear() &&
        date.getMonth() === d.date.getMonth() &&
        date.getDate() === d.date.getDate() &&
        date.getHours() === d.date.getHours() &&
        date.getMinutes() > d.date.getMinutes()
      )
        return true
      return false
    }
    return false // Invalid unit
  }

  function startOf(unit, time = '00:00:00') {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    if (unit === 'day') {
      date.setHours(hours, minutes, seconds, 0)
    } else if (unit === 'month') {
      date.setDate(1)
      date.setHours(hours, minutes, seconds, 0)
    } else if (unit === 'year') {
      date.setMonth(0, 1)
      date.setHours(hours, minutes, seconds, 0)
    }
    return this
  }

  function endOf(unit, time = '23:59:59') {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    if (unit === 'day') {
      date.setHours(hours, minutes, seconds, 999)
    } else if (unit === 'month') {
      date.setMonth(date.getMonth() + 1, 0) // Sets the date to the last day of the current month
      date.setHours(hours, minutes, seconds, 999)
    } else if (unit === 'year') {
      date.setFullYear(date.getFullYear() + 1, 0, 0) // Sets the date to the last day of the current year
      date.setHours(hours, minutes, seconds, 999)
    }
    return this
  }

  function duration(start_time, end_time, unit = 'minutes') {
    // Parse the start and end times into hours, minutes, and seconds
    const [startHours, startMinutes, startSeconds] = start_time
      .split(':')
      .map(Number)
    const [endHours, endMinutes, endSeconds] = end_time.split(':').map(Number)

    // Convert start and end times to seconds
    const startTimeInSeconds =
      startHours * 3600 + startMinutes * 60 + startSeconds
    const endTimeInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds

    // Calculate the duration in seconds
    let durationInSeconds = endTimeInSeconds - startTimeInSeconds

    // Check for negative duration (end time before start time)
    if (durationInSeconds < 0) {
      durationInSeconds += 24 * 3600 // Add a full day (24 hours) if end time is on the next day
    }

    // Convert the duration into the requested unit
    switch (unit) {
      case 'hours':
        return durationInSeconds / 3600
      case 'minutes':
        return durationInSeconds / 60
      case 'seconds':
        return durationInSeconds
      default:
        throw new Error(
          'Invalid unit: must be "hours", "minutes", or "seconds"',
        )
    }
  }

  function snapToTime(startTime, duration, roundUp, endTime) {
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [durationHours, durationMinutes] = duration.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    const startTotalMinutes = startHours * 60 + startMinutes
    const durationTotalMinutes = durationHours * 60 + durationMinutes
    const endTotalMinutes = endHours * 60 + endMinutes

    const currentMinutes = date.getHours() * 60 + date.getMinutes()
    const elapsedSinceStart = currentMinutes - startTotalMinutes

    let intervalsSinceStart = Math.floor(
      elapsedSinceStart / durationTotalMinutes,
    )
    if (roundUp && elapsedSinceStart % durationTotalMinutes !== 0) {
      intervalsSinceStart++
    }

    let roundedIntervalStart =
      startTotalMinutes + intervalsSinceStart * durationTotalMinutes

    // Check if the rounded interval start is after the end time
    if (roundedIntervalStart > endTotalMinutes) {
      roundedIntervalStart = endTotalMinutes
    }

    const roundedHours = Math.floor(roundedIntervalStart / 60)
    const roundedMinutes = roundedIntervalStart % 60

    // Set the rounded hours and minutes to the date
    date = new Date(date)
    date.setHours(roundedHours, roundedMinutes, 0, 0)
    return this
  }

  function diffHours(time1, time2) {
    const timeToSeconds = (time) => {
      const [hours, minutes, seconds] = time.split(':').map(Number)
      return hours * 3600 + minutes * 60 + seconds
    }
    const seconds1 = timeToSeconds(time1)
    const seconds2 = timeToSeconds(time2)
    return Math.abs(seconds1 - seconds2)
  }

  function diff(
    otherDate,
    unit = 'day',
    startDay = '00:00:00',
    endDay = '23:59:59',
  ) {
    const timeDiff = date - otherDate.date
    // console.log('TIME DIFF ', date, otherDate, timeDiff)
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
    } else if (unit === 'hour') {
      return Math.round(timeDiff / (1000 * 60 * 60))
    } else if (unit === 'minute') {
      return Math.round(timeDiff / (1000 * 60))
    }

    return NaN // Invalid unit
  }

  function getDuration(duration) {
    const [hours, minutes] = duration.split(':').map(Number)
    return hours * 60 + minutes
  }

  function addDuration(time, minutesToAdd) {
    const [hours, minutes, seconds] = time.split(':').map(Number)
    const timeDate = new Date(0, 0, 0, hours, minutes, seconds)
    timeDate.setMinutes(timeDate.getMinutes() + minutesToAdd)

    const resultHours = timeDate.getHours().toString().padStart(2, '0')
    const resultMinutes = timeDate.getMinutes().toString().padStart(2, '0')

    return `${resultHours}:${resultMinutes}`
  }

  function removeDuration(duration, minutesToSubtract) {
    const parts = duration.split(':')
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    const seconds = parseInt(parts[2], 10)

    // Convert the duration to total minutes
    let totalMinutes = hours * 60 + minutes

    // Subtract the specified minutes
    totalMinutes -= minutesToSubtract

    // Ensure totalMinutes is not negative
    if (totalMinutes < 0) {
      throw new Error('Subtracted duration exceeds the original duration')
    }

    // Convert total minutes back to HH:MM:SS
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60

    // Format the new duration string
    const newDuration = [newHours, newMinutes, seconds]
      .map((part) => part.toString().padStart(2, '0'))
      .join(':')

    return newDuration
  }

  function minutesToHHMMSS(minutes) {
    // Ensure that the input is a number and not negative
    if (typeof minutes !== 'number' || minutes < 0) {
      throw new Error('Input must be a non-negative number')
    }

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    const seconds = 0 // Since the input is in minutes, seconds will always be 0

    // Format each part to ensure two digits
    const formattedHours = String(hours).padStart(2, '0')
    const formattedMinutes = String(remainingMinutes).padStart(2, '0')
    const formattedSeconds = String(seconds).padStart(2, '0')

    // Combine into a single string
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
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
    formatTime,
    add,
    date,
    duration,
    get,
    gptAdd,
    snapToTime,
    setTime,
    diffHours,
    getDuration,
    addDuration,
    removeDuration,
    minutesToHHMMSS,
  }
}
