export interface TransitResult {
  fromArea: string
  toArea: string
  mins: number
  cost: number
  lastBusMin: number // in minutes from midnight (e.g. 18 * 60 = 1080)
  provider: 'gtfs' | 'openrouteservice' | 'fallback'
  mode: string
  distanceKm?: number
  scheduleDetails?: string
}

export interface TransitProvider {
  name: 'gtfs' | 'openrouteservice' | 'fallback'
  getTransit(fromArea: string, toArea: string, departureMin?: number): Promise<TransitResult | null>
}
