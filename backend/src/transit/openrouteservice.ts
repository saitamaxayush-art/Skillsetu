import { TransitProvider, TransitResult } from './types.js'
import { AREA_COORDS } from '../db/seed.js'

export class OpenRouteServiceTransitProvider implements TransitProvider {
  name: 'openrouteservice' = 'openrouteservice'
  private apiKey: string | undefined

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTESERVICE_API_KEY
  }

  async getTransit(fromArea: string, toArea: string, departureMin = 540): Promise<TransitResult | null> {
    if (!this.apiKey) {
      return null // No API key configured; cascade to next provider
    }

    const c1 = AREA_COORDS[fromArea]
    const c2 = AREA_COORDS[toArea]
    if (!c1 || !c2) return null

    try {
      // Calling OpenRouteService driving-car / directions API
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${this.apiKey}&start=${c1.lng},${c1.lat}&end=${c2.lng},${c2.lat}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) {
        console.warn(`[OpenRouteService] Error response: ${res.statusText}`)
        return null
      }

      const data = (await res.json()) as any
      const summary = data?.features?.[0]?.properties?.summary
      if (!summary) return null

      const durationSecs = summary.duration || 0
      const distanceMeters = summary.distance || 0

      // In Pune city traffic, bus transit is typically ~1.6x driving duration plus 10 min stop headway
      const drivingMins = Math.round(durationSecs / 60)
      const transitMins = Math.max(10, Math.round(drivingMins * 1.5 + 8))
      const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10
      const cost = distanceKm < 2 ? 0 : Math.round(Math.min(90, Math.max(20, distanceKm * 3.5)))

      // Last bus estimate: 22:00 for short, 21:00 for long distance
      const lastBusMin = distanceKm > 15 ? 1260 : 1320

      return {
        fromArea,
        toArea,
        mins: transitMins,
        cost,
        lastBusMin,
        provider: 'openrouteservice',
        mode: 'ORS Road Transit',
        distanceKm,
        scheduleDetails: `Live ORS routing: ${distanceKm} km, ~${drivingMins}m road duration`,
      }
    } catch (err) {
      console.warn('[OpenRouteService] Request failed:', err)
      return null
    }
  }
}
