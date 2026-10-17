import { DatabaseSync } from 'node:sqlite'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const dbPath = process.env.DB_PATH || path.resolve(process.cwd(), 'skillsetu.db')

// Create underlying Node native SQLite database
const rawDb = new DatabaseSync(dbPath)

// Enable WAL mode and foreign keys
try {
  rawDb.exec('PRAGMA journal_mode = WAL;')
  rawDb.exec('PRAGMA foreign_keys = ON;')
} catch (err) {
  console.warn('[DB] Warning setting pragmas:', err)
}

function normalizeParam(p: any): any {
  if (typeof p === 'boolean') return p ? 1 : 0
  if (p === undefined) return null
  return p
}

export interface StatementAdapter {
  all(...params: any[]): any[]
  get(...params: any[]): any
  run(...params: any[]): { changes: number; lastInsertRowid: number | bigint }
}

export class DatabaseAdapter {
  private raw: DatabaseSync

  constructor(raw: DatabaseSync) {
    this.raw = raw
  }

  exec(sql: string): void {
    this.raw.exec(sql)
  }

  pragma(pragmaStr: string): any {
    try {
      return this.raw.exec(`PRAGMA ${pragmaStr};`)
    } catch (err) {
      return null
    }
  }

  prepare(sql: string): StatementAdapter {
    const rawStmt = this.raw.prepare(sql)
    return {
      all: (...params: any[]) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
        const norm = flatParams.map(normalizeParam)
        return rawStmt.all(...norm) as any[]
      },
      get: (...params: any[]) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
        const norm = flatParams.map(normalizeParam)
        return rawStmt.get(...norm)
      },
      run: (...params: any[]) => {
        const flatParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params
        const norm = flatParams.map(normalizeParam)
        const res = rawStmt.run(...norm)
        return {
          changes: Number(res.changes),
          lastInsertRowid: Number(res.lastInsertRowid),
        }
      },
    }
  }

  transaction<T extends (...args: any[]) => any>(fn: T): T {
    const raw = this.raw
    return ((...args: any[]) => {
      raw.exec('BEGIN TRANSACTION;')
      try {
        const result = fn(...args)
        raw.exec('COMMIT;')
        return result
      } catch (err) {
        try {
          raw.exec('ROLLBACK;')
        } catch (_) {}
        throw err
      }
    }) as T
  }
}

export const db = new DatabaseAdapter(rawDb)
export default db
