/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD?: string;
  readonly VITE_CLOUDINARY_PRESET?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
