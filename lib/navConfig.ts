/** IDs must match `id` on page sections (`#hero`, IndicatorSection `meta.id`). Order = scroll order. */
export const SIDEBAR_SCROLL_IDS = ['hero', '111attr', '111vuln', '112'] as const;
export type SidebarScrollId = (typeof SIDEBAR_SCROLL_IDS)[number];

export type SidebarNavLink = {
  label: string;
  href: string;
  sectionId: SidebarScrollId;
};

export type SidebarNavGroup =
  | {
      type: 'group';
      /** Shown above nested links (e.g. 1.1.1 Heatwaves) */
      heading: string;
      /** First anchor id for optional “jump to group” behaviour */
      firstSectionId: SidebarScrollId;
      items: SidebarNavLink[];
    }
  | {
      type: 'single';
      item: SidebarNavLink;
    };

export const sidebarNavStructure: SidebarNavGroup[] = [
  {
    type: 'group',
    heading: '1.1.1 Heatwaves',
    firstSectionId: '111attr',
    items: [
      { label: 'Attributable heatwave days', href: '#111attr', sectionId: '111attr' },
      { label: 'Vulnerable population exposure', href: '#111vuln', sectionId: '111vuln' },
    ],
  },
  {
    type: 'single',
    item: {
      label: '1.1.2 Heat & physical activity',
      href: '#112',
      sectionId: '112',
    },
  },
];
