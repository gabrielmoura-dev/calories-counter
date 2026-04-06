/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_NUTRITIONIX_APP_ID: string
  readonly VITE_NUTRITIONIX_APP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
