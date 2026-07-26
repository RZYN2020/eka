export const themePreferences = ['auto', 'light', 'sepia', 'dark', 'graphite'] as const;
export const resolvedThemes = ['light', 'sepia', 'dark', 'graphite'] as const;

export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = (typeof resolvedThemes)[number];

export const themeNames: Record<ThemePreference, string> = {
	auto: 'Auto',
	light: 'Paper',
	sepia: 'Sepia',
	dark: 'Night',
	graphite: 'Graphite',
};

export const themeColors: Record<ResolvedTheme, string> = {
	light: '#fbfbfa',
	sepia: '#f7f3e9',
	dark: '#1e1e1e',
	graphite: '#17191c',
};
