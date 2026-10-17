import { TransitProvider, TransitResult } from './types.js'

// Realistic GTFS schedule model for Pune Municipal Public Transit (PMPML & Pune Metro)
interface GtfsRoute {
  routeId: string
  routeShortName: string
  fromArea: string
  toArea: string
  durationMins: number
  returnFareInr: number
  frequencyMins: number
  firstBus: string
  lastBus: string // e.g. "21:45"
  lastBusMin: number // minutes from midnight
  mode: 'PMPML Bus' | 'Pune Metro'
}

const GTFS_PUNE_SCHEDULES: GtfsRoute[] = [
  {
    routeId: 'PMPML-165',
    routeShortName: '165',
    fromArea: 'Hadapsar',
    toArea: 'Magarpatta',
    durationMins: 20,
    returnFareInr: 30,
    frequencyMins: 10,
    firstBus: '05:30',
    lastBus: '22:30',
    lastBusMin: 22 * 60 + 30, // 1350
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-167',
    routeShortName: '167',
    fromArea: 'Hadapsar',
    toArea: 'Kharadi',
    durationMins: 45,
    returnFareInr: 50,
    frequencyMins: 15,
    firstBus: '06:00',
    lastBus: '21:30',
    lastBusMin: 21 * 60 + 30, // 1290
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-INTERNAL',
    routeShortName: 'Local Feeder',
    fromArea: 'Hadapsar',
    toArea: 'Hadapsar',
    durationMins: 12,
    returnFareInr: 0,
    frequencyMins: 8,
    firstBus: '05:00',
    lastBus: '23:00',
    lastBusMin: 23 * 60, // 1380
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-198',
    routeShortName: '198',
    fromArea: 'Hadapsar',
    toArea: 'Koregaon',
    durationMins: 38,
    returnFareInr: 50,
    frequencyMins: 15,
    firstBus: '06:15',
    lastBus: '21:45',
    lastBusMin: 21 * 60 + 45, // 1305
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-312',
    routeShortName: '312',
    fromArea: 'Hadapsar',
    toArea: 'Viman',
    durationMins: 34,
    returnFareInr: 40,
    frequencyMins: 15,
    firstBus: '06:00',
    lastBus: '21:30',
    lastBusMin: 21 * 60 + 30, // 1290
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-204',
    routeShortName: '204',
    fromArea: 'Hadapsar',
    toArea: 'Swargate',
    durationMins: 28,
    returnFareInr: 35,
    frequencyMins: 12,
    firstBus: '05:45',
    lastBus: '22:15',
    lastBusMin: 22 * 60 + 15, // 1335
    mode: 'PMPML Bus',
  },
  {
    routeId: 'METRO-L2-FEEDER',
    routeShortName: 'Aqua Line + Feeder',
    fromArea: 'Hadapsar',
    toArea: 'Kothrud',
    durationMins: 55,
    returnFareInr: 60,
    frequencyMins: 10,
    firstBus: '06:00',
    lastBus: '21:30',
    lastBusMin: 21 * 60 + 30, // 1290
    mode: 'Pune Metro',
  },
  {
    routeId: 'PMPML-348-HINJ',
    routeShortName: '348 Exp',
    fromArea: 'Hadapsar',
    toArea: 'Hinjewadi',
    durationMins: 90,
    returnFareInr: 90,
    frequencyMins: 20,
    firstBus: '06:30',
    lastBus: '20:30',
    lastBusMin: 20 * 60 + 30, // 1230
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-144',
    routeShortName: '144',
    fromArea: 'Hadapsar',
    toArea: 'Wagholi',
    durationMins: 40,
    returnFareInr: 45,
    frequencyMins: 20,
    firstBus: '06:00',
    lastBus: '21:15',
    lastBusMin: 21 * 60 + 15, // 1275
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-111',
    routeShortName: '111',
    fromArea: 'Hadapsar',
    toArea: 'Katraj',
    durationMins: 42,
    returnFareInr: 45,
    frequencyMins: 15,
    firstBus: '05:45',
    lastBus: '22:00',
    lastBusMin: 22 * 60, // 1320
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-178',
    routeShortName: '178',
    fromArea: 'Hadapsar',
    toArea: 'Phursungi',
    durationMins: 22,
    returnFareInr: 25,
    frequencyMins: 15,
    firstBus: '06:00',
    lastBus: '22:00',
    lastBusMin: 22 * 60, // 1320
    mode: 'PMPML Bus',
  },
  {
    routeId: 'PMPML-PCMC-311',
    routeShortName: '311',
    fromArea: 'Hadapsar',
    toArea: 'Pimpri',
    durationMins: 72,
    returnFareInr: 70,
    frequencyMins: 20,
    firstBus: '06:00',
    lastBus: '21:00',
    lastBusMin: 21 * 60, // 1260
    mode: 'PMPML Bus',
  },
]

export class GtfsTransitProvider implements TransitProvider {
  name: 'gtfs' = 'gtfs'

  async getTransit(fromArea: string, toArea: string, departureMin = 540): Promise<TransitResult | null> {
    const direct = GTFS_PUNE_SCHEDULES.find(
      (r) =>
        (r.fromArea.toLowerCase() === fromArea.toLowerCase() && r.toArea.toLowerCase() === toArea.toLowerCase()) ||
        (r.fromArea.toLowerCase() === toArea.toLowerCase() && r.toArea.toLowerCase() === fromArea.toLowerCase())
    )

    if (direct) {
      return {
        fromArea,
        toArea,
        mins: direct.durationMins,
        cost: direct.returnFareInr,
        lastBusMin: direct.lastBusMin,
        provider: 'gtfs',
        mode: direct.mode,
        scheduleDetails: `Route ${direct.routeShortName} (${direct.mode}), every ${direct.frequencyMins}m, last departure ${direct.lastBus}`,
      }
    }

    return null
  }
}
