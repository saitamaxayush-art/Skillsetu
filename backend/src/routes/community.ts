import { Router } from 'express'
import { db } from '../db/connection.js'
import { communityStats } from '../engine/matching.js'

export const communityRouter = Router()

// GET /api/community?area=
communityRouter.get('/', (req, res) => {
  const filterArea = req.query.area as string | undefined

  let query = 'SELECT area, skill, supply, demand FROM community_supply_demand'
  const params: any[] = []

  if (filterArea) {
    query += ' WHERE LOWER(area) = LOWER(?)'
    params.push(filterArea)
  }

  const records = db.prepare(query).all(...params) as Array<{
    area: string
    skill: string
    supply: number
    demand: number
  }>

  if (!records.length) {
    return res.status(404).json({ error: 'No community records found' })
  }

  const stats = communityStats(records)
  return res.json({
    filterArea: filterArea || null,
    ...stats,
  })
})
