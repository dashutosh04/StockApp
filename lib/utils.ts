import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style   : 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}`
}

export function formatChangePct(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000)
    return `${(volume / 1_000_000_000).toFixed(1)}B`
  if (volume >= 1_000_000)
    return `${(volume / 1_000_000).toFixed(1)}M`
  if (volume >= 1_000)
    return `${(volume / 1_000).toFixed(1)}K`
  return volume.toString()
}

export function formatMarketCap(value: number): string {
  if (!value) return 'N/A'
  if (value >= 1_000_000_000_000)
    return `
$$
{(value / 1_000_000_000_000).toFixed(1)}T`
  if (value >= 1_000_000_000)
    return `
$$
{(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000)
    return `
$$
{(value / 1_000_000).toFixed(1)}M`
  return `
$$
{value.toLocaleString()}`
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day  : 'numeric',
    year : 'numeric',
  })
}

export function isPositive(value: number): boolean {
  return value >= 0
}

export function getChangeColor(value: number): string {
  return value >= 0
    ? 'text-green-400'
    : 'text-red-400'
}

export function getChangeBg(value: number): string {
  return value >= 0
    ? 'bg-green-400/10 text-green-400'
    : 'bg-red-400/10 text-red-400'
}