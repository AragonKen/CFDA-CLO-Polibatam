export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('App-User'))
  
  return user.is_admin
}

// ========================================================================================= FILE FORMAT

export const formatFileSize = size => {
  if (size >= 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }
  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  
  return `${size} B`
}

// ========================================================================================= DATE TIME FORMAT

import moment from 'moment'

export const formatDate = (date, format = 'DD MMMM YYYY') => {
  return date ? moment(date).format(format) : '-'
}

export const formatCalendar = date => {
  return date ? moment(date).calendar() : '-'
}

// ========================================================================================= STRING FORMAT

export const formatCurrency = (number, prefix = 'Rp') => {
  return `${prefix} ${number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export const formatCapitalize = string => {
  if (!string) return ''
    
  if (string.includes('_')) {
    return string.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  } else {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }
}

// ========================================================================================= DEBOUNCE

import { default as useDebounce } from 'lodash.debounce'

export const debounce = useDebounce

// ========================================================================================= WINDOW

export const openNewTab = url => {
  window.open(url, '_blank')
}

// ========================================================================================= MEDIA QUERY

export const isMobile = () => window.matchMedia('(max-width: 768px)').matches
