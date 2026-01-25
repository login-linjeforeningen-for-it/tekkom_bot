import { envLoad } from 'utilbee'

export const channels = [] as Channel[]
export const roles = [] as Role[]

envLoad({ path: ['.env', '../.env'] })

const requiredEnvironmentVariables = [
    'AUTHENTIK_API_URL',
    'CLIENT_ID',
    'REDIRECT_URI',
    'CLIENT_SECRET',
    'QUEENBEE_URL',
    'DB_PASSWORD',
    'DB_HOST',
    'TEKKOM_BOT_API_TOKEN',
    'TEKKOM_BOT_BTG_TOKEN',
    'QUEENBEE_BTG_TOKEN',
    'CRITICAL_ROLE',
    'WEBHOOK_URL',
    'WEBHOOK_URL_ISSUE',
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',
    'GITHUB_TOKEN',
    'GITHUB_WEBHOOK_SECRET',
    'ZAMMAD_TOKEN'
]

const missingVariables = requiredEnvironmentVariables.filter(
    (key) => !process.env[key]
)

if (missingVariables.length > 0) {
    throw new Error(
        'Missing essential environment variables:\n' +
        missingVariables
            .map((key) => `${key}: ${process.env[key] || 'undefined'}`)
            .join('\n')
    )
}

const env = Object.fromEntries(
    requiredEnvironmentVariables.map((key) => [key, process.env[key]])
)

const AUTH_URL = `${env.AUTHENTIK_API_URL}/application/o/authorize/`
const TOKEN_URL = `${env.AUTHENTIK_API_URL}/application/o/token/`

const config = {
    USERINFO_URL: `${env.AUTHENTIK_API_URL}/application/o/userinfo/`,
    DB_PORT: env.DB_PORT,
    DB_MAX_CONN: env.DB_MAX_CONN,
    DB_IDLE_TIMEOUT_MS: env.DB_IDLE_TIMEOUT_MS,
    DB_TIMEOUT_MS: env.DB_TIMEOUT_MS,
    DB: env.DB,
    DB_HOST: env.DB_HOST,
    DB_USER: env.DB_USER,
    DB_PASSWORD: env.DB_PASSWORD,
    CLIENT_ID: env.CLIENT_ID,
    REDIRECT_URI: env.REDIRECT_URI,
    TOKEN_URL,
    CLIENT_SECRET: env.CLIENT_SECRET,
    QUEENBEE_URL: env.QUEENBEE_URL,
    AUTH_URL,
    DEFAULT_RESULTS_PER_PAGE: Number(env.DEFAULT_RESULTS_PER_PAGE) || 50,
    TEKKOM_BOT_API_TOKEN: env.TEKKOM_BOT_API_TOKEN,
    TEKKOM_BOT_BTG_TOKEN: env.TEKKOM_BOT_BTG_TOKEN,
    QUEENBEE_BTG_TOKEN: env.QUEENBEE_BTG_TOKEN,
    CRITICAL_ROLE: env.CRITICAL_ROLE,
    WEBHOOK_URL: env.WEBHOOK_URL,
    WEBHOOK_URL_ISSUE: env.WEBHOOK_URL_ISSUE,
    GITHUB_API: 'https://api.github.com/',
    GITHUB_ORGANIZATION: 'Login-Linjeforening-for-IT',
    GITHUB_TOKEN: env.GITHUB_TOKEN,
    GITHUB_WEBHOOK_SECRET: env.GITHUB_WEBHOOK_SECRET,
    CACHE_TTL: 5000,
    SPOTIFY_API_TRACK_URL: 'https://api.spotify.com/v1/tracks',
    SPOTIFY_API_EPISODE_URL: 'https://api.spotify.com/v1/episodes',
    SPOTIFY_API_TOKEN_URL: 'https://accounts.spotify.com/api/token',
    SPOTIFY_API_TOKEN: btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
    ZAMMAD_TOKEN: env.ZAMMAD_TOKEN,
    ZAMMAD_API: 'https://zammad.login.no/api/v1'
}

export default config
