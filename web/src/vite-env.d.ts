/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENVIRONMENT: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_HOTJAR_ID: string
  readonly VITE_AUTH_PROVIDERS: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GITHUB_CLIENT_ID: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_THEME_COLORS: string
  readonly VITE_CUSTOM_THEME_COLOR: string
  readonly VITE_ENABLE_SERVICE_WORKER: string
  readonly VITE_CACHE_STRATEGY: string
  readonly VITE_PRELOAD_IMAGES: string
  readonly VITE_DEBUG: string
  readonly VITE_MOCK_API: string
  readonly VITE_DEVTOOLS: string
  readonly VITE_FEATURE_REAL_TIME_UPDATES: string
  readonly VITE_FEATURE_DARK_MODE: string
  readonly VITE_FEATURE_ANALYTICS: string
  readonly VITE_FEATURE_NOTIFICATIONS: string
  readonly VITE_FEATURE_FILE_UPLOADS: string
  readonly VITE_FEATURE_OFFLINE_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
