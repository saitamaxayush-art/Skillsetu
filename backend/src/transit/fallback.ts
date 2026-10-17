import { TransitProvider, TransitResult } from './types.js'
import { AREA_COORDS } from '../db/seed.js'

// Distance in km using Haversine formula
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calibrated fallback matrix based on sample data
const KNOWN_PAIRS: Record<string, { mins: number; cost: number; lastBusMin: number }> = {
  'Hadapsar->Magarpatta': { mins: 22, cost: 30, lastBusMin: 1140 }, // 19:00
  'Hadapsar->Kharadi': { mins: 48, cost: 56, lastBusMin: 1110 }, // 18:30
  'Hadapsar->Hadapsar': { mins: 12, cost: 0, lastBusMin: 1200 }, // 20:00
  'Hadapsar->Koregaon': { mins: 40, cost: 52, lastBusMin: 1170 }, // 19:30
  'Hadapsar->Viman': { mins: 35, cost: 40, lastBusMin: 1140 }, // 19:00
  'Hadapsar->Kothrud': { mins: 58, cost: 64, lastBusMin: 1110 }, // 18:30
  'Hadapsar->Hinjewadi': { mins: 95, cost: 90, lastBusMin: 1080 }, // 18:00
  'Hadapsar->Wagholi': { mins: 42, cost: 45, lastBusMin: 1110 }, // 18:30
  'Hadapsar->Swargate': { mins: 30, cost: 35, lastBusMin: 1200 }, // 20:00
  'Hadapsar->Pimpri': { mins: 75, cost: 70, lastBusMin: 1110 }, // 18:30
  'Hadapsar->Katraj': { mins: 45, cost: 50, lastBusMin: 1140 }, // 19:00
  'Hadapsar->Phursungi': { mins: 25, cost: 25, lastBusMin: 1170 }, // 19:30
}

export class FallbackTransitProvider implements TransitProvider {
  name: 'fallback' = 'fallback'

  async getTransit(fromArea: string, toArea: string, departureMin = 540): Promise<TransitResult> {
    const key = `${fromArea}->${toArea}`
    if (KNOWN_PAIRS[key]) {
      const match = KNOWN_PAIRS[key]
      return {
        fromArea,
        toArea,
        mins: match.mins,
        cost: match.cost,
        lastBusMin: match.lastBusMin,
        provider: 'fallback',
        mode: 'PMPML City Bus',
        scheduleDetails: 'Sample calibrated transit table',
      }
    }

    // Dynamic fallback based on Pune area coordinates
    const c1 = AREA_COORDS[fromArea] || { lat: 18.5204, lng: 73.8567 }
    const c2 = AREA_COORDS[toArea] || { lat: 18.5204, lng: 73.8567 }
    const dist = haversineKm(c1.lat, c1.lng, c2.lat, c2.lng)

    // Bus travel time: ~18 km/h avg city speed + 10 mins wait/walk
    const mins = Math.max(10, Math.round((dist / 18) * 60 + 10))
    // PMPML fare stages: ₹5 base + ₹2.5/km round trip
    const cost = dist < 2 ? 0 : Math.round(Math.min(90, Math.max(20, dist * 3.5)))
    // Last bus defaults to 18:30 or earlier for farther routes
    const lastBusMin = dist > 15 ? 1080 : dist > 8 ? 1110 : 1170

    return {
      fromArea,
      toArea,
      mins,
      cost,
      lastBusMin,
      provider: 'fallback',
      mode: 'PMPML City Bus',
      distanceKm: Math.round(dist * 10) / 10,
      scheduleDetails: 'Estimated distance-based transit calculation',
    }
  }
}
