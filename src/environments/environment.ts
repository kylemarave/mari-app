function readEnv(key: 'NG_APP_SUPABASE_URL' | 'NG_APP_SUPABASE_ANON_KEY' | 'NG_APP_ENV'): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (key === 'NG_APP_SUPABASE_URL') {
      return import.meta.env.NG_APP_SUPABASE_URL ?? '';
    }
    if (key === 'NG_APP_SUPABASE_ANON_KEY') {
      return import.meta.env.NG_APP_SUPABASE_ANON_KEY ?? '';
    }
    return import.meta.env.NG_APP_ENV ?? '';
  }

  if (typeof _NGX_ENV_ !== 'undefined') {
    return _NGX_ENV_[key] ?? '';
  }

  return '';
}

export const environment = {
  production:
    readEnv('NG_APP_ENV') === 'production' ||
    (typeof ngDevMode !== 'undefined' ? !ngDevMode : false),
  supabaseUrl: readEnv('NG_APP_SUPABASE_URL'),
  supabaseAnonKey: readEnv('NG_APP_SUPABASE_ANON_KEY'),
};
