/** IDs must match `id` on page sections (`#hero`, IndicatorSection `meta.id`). Order = scroll order. */
export const SIDEBAR_SCROLL_IDS = ['hero', '111attr', '111vuln', '112'] as const;
export type SidebarScrollId = (typeof SIDEBAR_SCROLL_IDS)[number];

export const sidebarSubItems: { label: string; href: string; sectionId: SidebarScrollId }[] = [
  { label: '1.1.1 Heatwave Days (Attr.)', href: '#111attr', sectionId: '111attr' },
  { label: '1.1.1 Heatwave Exposure (Vuln.)', href: '#111vuln', sectionId: '111vuln' },
  { label: '1.1.2 Heat & Physical Activity', href: '#112', sectionId: '112' },
];
