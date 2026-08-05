export const themePreferences = ['auto', 'light', 'dark'] as const;
export const resolvedThemes = ['light', 'dark'] as const;

export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = (typeof resolvedThemes)[number];

export const themeNames: Record<ThemePreference, string> = {
	auto: 'Auto',
	light: 'Light',
	dark: 'Dark',
};

export const themeColors: Record<ResolvedTheme, string> = {
	light: '#fbfbfa',
	dark: '#1e1e1e',
};
