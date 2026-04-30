import pg from 'pg'
import config from '#constants'

const {
    DB,
    DB_USER,
    DB_HOST,
    DB_PASSWORD,
    DB_PORT,
    DB_MAX_CONN,
    DB_IDLE_TIMEOUT_MS,
    DB_TIMEOUT_MS
} = config
const { Pool } = pg
const pool = new Pool({
    user: DB_USER || 'tekkom_bot',
    host: DB_HOST,
    database: DB || 'tekkom_bot',
    password: DB_PASSWORD,
    port: Number(DB_PORT) || 5432,
    max: Number(DB_MAX_CONN) || 50,
    idleTimeoutMillis: Number(DB_IDLE_TIMEOUT_MS) || 5000,
    connectionTimeoutMillis: Number(DB_TIMEOUT_MS) || 3000,
    keepAlive: true
})

function isRetryableDatabaseError(error: unknown) {
    if (!error || typeof error !== 'object') {
        return false
    }

    const code = 'code' in error ? error.code : undefined
    return typeof code === 'string' && [
        '57P01',
        '57P02',
        '57P03',
        '08000',
        '08001',
        '08003',
        '08004',
        '08006',
        '08007',
        '08P01',
        '53300',
        'ETIMEDOUT',
        'ECONNRESET',
        'ECONNREFUSED',
        'EPIPE',
    ].includes(code)
}

export default async function run(query: string, params?: SQLParamType) {
    while (true) {
        try {
            const client = await pool.connect()
            try {
                return await client.query(query, params ?? [])
            } finally {
                client.release()
            }
        } catch (error) {
            console.error('Postgres connection failed:', error)
            if (!isRetryableDatabaseError(error)) {
                throw error
            }
            console.log(`Pool currently unavailable, retrying in ${config.CACHE_TTL_HOT / 1000}s...`)
            await sleep(config.CACHE_TTL_HOT)
        }
    }
}

export async function runOnce(query: string, params?: SQLParamType) {
    const client = await pool.connect()
    try {
        return await client.query(query, params ?? [])
    } finally {
        client.release()
    }
}

function sleep(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}
