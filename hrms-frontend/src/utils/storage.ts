const KEYS = {
  ACCESS_TOKEN:  'hrms_access_token',
  REFRESH_TOKEN: 'hrms_refresh_token',
  USER:          'hrms_user',
  THEME:         'hrms_theme',
  SIDEBAR:       'hrms_sidebar',
} as const;

export const storage = {
  getAccessToken:  ()      => localStorage.getItem(KEYS.ACCESS_TOKEN),
  setAccessToken:  (t: string) => localStorage.setItem(KEYS.ACCESS_TOKEN, t),
  getRefreshToken: ()      => localStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (t: string) => localStorage.setItem(KEYS.REFRESH_TOKEN, t),

  getUser: <T>(): T | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },
  setUser: <T>(u: T) => localStorage.setItem(KEYS.USER, JSON.stringify(u)),

  getTheme:            ()           => localStorage.getItem(KEYS.THEME) || 'light',
  setTheme:            (t: string)  => localStorage.setItem(KEYS.THEME, t),
  getSidebarCollapsed: ()           => localStorage.getItem(KEYS.SIDEBAR) === 'true',
  setSidebarCollapsed: (v: boolean) => localStorage.setItem(KEYS.SIDEBAR, String(v)),

  clearAuth: () => {
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.USER);
  },
  clearAll: () => localStorage.clear(),
};