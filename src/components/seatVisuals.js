import { Gift, MoveVertical, Star } from 'lucide-react'

/**
 * Shared look-and-feel for seat categories. Used by the seat buttons AND the
 * legend / details modal so a colour is never defined twice.
 * Colour + icon + label together keep the map readable without relying on hue alone.
 */
export const CATEGORY_VISUALS = {
  standard: {
    icon: null,
    seat: 'border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-400 hover:bg-sky-100',
    swatch: 'border-sky-200 bg-sky-50 text-sky-700',
    soft: 'bg-sky-50 text-sky-800 ring-sky-200',
  },
  free: {
    icon: Gift,
    seat: 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100',
    swatch: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    soft: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  extra: {
    icon: MoveVertical,
    seat: 'border-orange-300 bg-orange-50 text-orange-900 hover:border-orange-500 hover:bg-orange-100',
    swatch: 'border-orange-300 bg-orange-100 text-orange-700',
    soft: 'bg-orange-50 text-orange-800 ring-orange-200',
  },
  premium: {
    icon: Star,
    seat: 'border-purple-300 bg-purple-50 text-purple-900 hover:border-purple-500 hover:bg-purple-100',
    swatch: 'border-purple-300 bg-purple-100 text-purple-700',
    soft: 'bg-purple-50 text-purple-800 ring-purple-200',
  },
}

export const STATUS_VISUALS = {
  occupied: {
    seat: 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400',
    swatch: 'border-slate-200 bg-slate-100 text-slate-400',
  },
  mine: {
    seat: 'border-blue-700 bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-200 hover:bg-blue-700',
    swatch: 'border-blue-700 bg-blue-600 text-white',
  },
  taken: {
    seat: 'border-blue-300 bg-blue-100 text-blue-800 hover:border-blue-400',
    swatch: 'border-blue-300 bg-blue-100 text-blue-800',
  },
}

export const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
