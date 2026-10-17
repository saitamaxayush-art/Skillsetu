import { db } from '../db/connection.js'
import { FallbackTransitProvider } from './fallback.js'
import { GtfsTransitProvider } from './gtfs.js'
import { OpenRouteServiceTransitProvider } from './openrouteservice.js'
import { TransitProvider, TransitResult } from './types.js'

export class TransitService {
  private providers: TransitProvider[]

  constructor() {
    this.providers = [
      new OpenRouteServiceTransitProvider(),
      new GtfsTransitProvider(),
      new FallbackTransitProvider(),
    ]
  }

  async getCommute(fromArea: string, toArea: string, departureMin = 540): Promise<TransitResult> {
    // 1. Check SQLite cache
    try {
      const cached = db
        .prepare(`
          SELECT from_area, to_area, mins, cost, last_bus_min, provider
          FROM commute_cache
          WHERE from_area = ? AND to_area = ? AND departure_min = ?
        `)
        .get(fromArea, toArea, departureMin) as
        | {
            from_area: string
            to_area: string
            mins: number
            cost: number
            last_bus_min: number
            provider: 'gtfs' | 'openrouteservice' | 'fallback'
          }
        | undefined

      if (cached) {
        return {
          fromArea: cached.from_area,
          toArea: cached.to_area,
          mins: cached.mins,
          cost: cached.cost,
          lastBusMin: cached.last_bus_min,
          provider: cached.provider,
          mode: cached.provider === 'gtfs' ? 'PMPML Scheduled GTFS' : 'Cached Transit Estimate',
        }
      }
    } catch {
      // If table query fails, continue to live lookup
    }

    // 2. Query providers in priority order
    let result: TransitResult | null = null
    for (const provider of this.providers) {
      try {
        result = await provider.getTransit(fromArea, toArea, departureMin)
        if (result) break
      } catch (err) {
        console.warn(`[TransitProvider:${provider.name}] Failed:`, err)
      }
    }

    if (!result) {
      // Final hardcoded fallback
      result = await new FallbackTransitProvider().getTransit(fromArea, toArea, departureMin)
    }

    // 3. Cache the result in SQLite
    try {
      db.prepare(`
        INSERT OR REPLACE INTO commute_cache (from_area, to_area, departure_min, mins, cost, last_bus_min, provider)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        fromArea,
        toArea,
        departureMin,
        result.mins,
        result.cost,
        result.lastBusMin,
        result.provider
      )
    } catch (err) {
      console.warn('[TransitService] Cache write error:', err)
    }

    return result
  }
}

export const transitService = new TransitService()
