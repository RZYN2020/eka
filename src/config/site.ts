// 首页 “Latest writing” 默认只显示这个分类；设为 null 显示全部。
const homeWritingCategory: string | null = 'Tech';

export const site = {
	url: 'https://yongzhen.space',
	title: 'Eka',
	fullTitle: 'Eka',
	description: '江雨霏霏江草齐 六朝如梦鸟空啼',
	home: {
		category: homeWritingCategory,
	},
	nav: [
		{ href: '/', label: 'Home' },
		{ href: '/writing/', label: 'Writing' },
		{ href: '/categories/', label: 'Categories' },
		{ href: '/tags/', label: 'Tags' },
		{ href: '/about/', label: 'About' },
	],
	links: {
		rss: '/rss.xml',
	},
} as const;
