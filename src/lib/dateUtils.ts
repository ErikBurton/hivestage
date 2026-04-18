const TIMEZONE = 'America/Denver'

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: TIMEZONE,
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  })
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: TIMEZONE,
  })
}

export function formatMonthShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    timeZone: TIMEZONE,
  })
}

export function formatDayNumber(date: Date): number {
  return parseInt(date.toLocaleDateString('en-US', {
    day: 'numeric',
    timeZone: TIMEZONE,
  }))
}

export function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: TIMEZONE,
  })
}