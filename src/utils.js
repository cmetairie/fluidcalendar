import { dayjs } from './dayjs.js'

let debounceId = null
export function debounce(fn, delay = 500) {
  clearTimeout(debounceId)
  const args = arguments
  const that = this
  debounceId = setTimeout(function () {
    fn.apply(that, args)
  }, delay)
}

export function wait(secondes) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(timer)
    }, secondes * 1000)
  })
}

export function generateBookables(num) {
  const entries = []
  for (let i = 1; i <= num; i++) {
    const id = i
    const label = i % 3 === 0 ? 'dolor' : i % 2 === 0 ? 'ipsum' : 'lorem'
    entries.push({ id, label: label + ' - ' + id })
  }
  return entries
}

export function generateEntriesWithDetails(bookables, num = 100) {
  const entriesWithDetails = []

  for (let i = 1; i <= num; i++) {
    const id = i
    const start_at = getRandomDateTime()
    const end_at = dayjs(start_at).add(getRandomNumber(1, 4), 'day').format('iso')
    const label = `Lorem ipsum${i % 2 === 0 ? ' solor' : ''}`
    const bookableId = bookables[i % bookables.length].id

    entriesWithDetails.push({ id, start_at, end_at, label, bookableId })
  }

  return entriesWithDetails
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function padZero(number) {
  return number.toString().padStart(2, '0')
}

export function getRandomDateTime() {
  const year = 2023
  const month = getRandomNumber(6, 12)
  const day = getRandomNumber(1, 28)
  const hours = getRandomNumber(0, 23)
  const minutes = getRandomNumber(0, 59)
  const seconds = getRandomNumber(0, 59)

  const isoString = `${year}-${padZero(month)}-${padZero(day)}T${padZero(
    hours,
  )}:${padZero(minutes)}:${padZero(seconds)}+02:00`

  return dayjs(isoString).format('iso')
}
