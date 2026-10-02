// Minimal lucide-style icon set - ported from Figma Make export 0003.js
import type { CSSProperties, ReactNode, SVGProps } from 'react';

type IProps = Omit<SVGProps<SVGSVGElement>, 'd'> & {
  d: string | ReactNode;
  size?: number;
  sw?: number;
  style?: CSSProperties;
  className?: string;
};

const I = ({ d, size = 18, sw = 1.8, ...rest }: IProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
       strokeLinejoin="round" {...rest}>
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

type P = Omit<IProps, 'd'>;

export const Icon = {
  Dashboard: (p: P) => <I {...p} d={<>
    <rect x="3" y="3" width="7" height="9" rx="1.5"/>
    <rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/>
    <rect x="3" y="16" width="7" height="5" rx="1.5"/>
  </>} />,
  Cart: (p: P) => <I {...p} d={<>
    <path d="M3 4h2l2.5 12h11l2-8H6"/>
    <circle cx="9" cy="20" r="1.4"/>
    <circle cx="17" cy="20" r="1.4"/>
  </>} />,
  Menu: (p: P) => <I {...p} d={<>
    <path d="M4 6h16M4 12h16M4 18h10"/>
  </>} />,
  Box: (p: P) => <I {...p} d={<>
    <path d="M3 7l9-4 9 4-9 4-9-4z"/>
    <path d="M3 7v10l9 4 9-4V7"/>
    <path d="M12 11v10"/>
  </>} />,
  Truck: (p: P) => <I {...p} d={<>
    <path d="M3 7h11v9H3z"/>
    <path d="M14 10h4l3 3v3h-7"/>
    <circle cx="7" cy="18" r="1.6"/>
    <circle cx="17" cy="18" r="1.6"/>
  </>} />,
  Card: (p: P) => <I {...p} d={<>
    <rect x="3" y="6" width="18" height="13" rx="2.5"/>
    <path d="M3 11h18"/>
  </>} />,
  Chart: (p: P) => <I {...p} d={<>
    <path d="M4 20V10"/>
    <path d="M10 20V4"/>
    <path d="M16 20v-7"/>
    <path d="M22 20H2"/>
  </>} />,
  Star: (p: P) => <I {...p} d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17.6 6.6 20.4l1-6.1-4.4-4.3 6.1-.9z" />,
  Headset: (p: P) => <I {...p} d={<>
    <path d="M3 14v-2a9 9 0 0 1 18 0v2"/>
    <path d="M21 14v3a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 1z"/>
    <path d="M3 14v3a2 2 0 0 0 2 2h2v-6H5a2 2 0 0 0-2 1z"/>
  </>} />,
  Bell: (p: P) => <I {...p} d={<>
    <path d="M6 16V10a6 6 0 0 1 12 0v6l1.5 2H4.5z"/>
    <path d="M10 20a2 2 0 0 0 4 0"/>
  </>} />,
  Search: (p: P) => <I {...p} d={<>
    <circle cx="11" cy="11" r="7"/>
    <path d="m20 20-3.5-3.5"/>
  </>} />,
  Plus: (p: P) => <I {...p} d="M12 5v14M5 12h14" />,
  Check: (p: P) => <I {...p} d="M5 12l5 5 9-11" />,
  X: (p: P) => <I {...p} d="M6 6l12 12M18 6 6 18" />,
  Chevron: (p: P) => <I {...p} d="M9 6l6 6-6 6" />,
  ChevronDown: (p: P) => <I {...p} d="M6 9l6 6 6-6" />,
  Filter: (p: P) => <I {...p} d="M3 5h18l-7 9v6l-4-2v-4z" />,
  Download: (p: P) => <I {...p} d={<><path d="M12 4v12"/><path d="m6 12 6 6 6-6"/><path d="M4 20h16"/></>} />,
  Arrow: (p: P) => <I {...p} d="M5 12h14M13 5l7 7-7 7" />,
  ArrowUp: (p: P) => <I {...p} d="M7 14l5-5 5 5" />,
  ArrowDown: (p: P) => <I {...p} d="M7 10l5 5 5-5" />,
  Dots: (p: P) => <I {...p} d={<>
    <circle cx="12" cy="6" r="1.2"/>
    <circle cx="12" cy="12" r="1.2"/>
    <circle cx="12" cy="18" r="1.2"/>
  </>} />,
  Users: (p: P) => <I {...p} d={<>
    <circle cx="9" cy="8" r="3.5"/>
    <path d="M2 20a7 7 0 0 1 14 0"/>
    <circle cx="17" cy="9" r="2.5"/>
    <path d="M16 14h.5a5.5 5.5 0 0 1 5.5 5.5"/>
  </>} />,
  Receipt: (p: P) => <I {...p} d={<>
    <path d="M5 3h14v18l-3-2-3 2-3-2-3 2z"/>
    <path d="M8 8h8M8 12h8M8 16h4"/>
  </>} />,
  Sparkle: (p: P) => <I {...p} d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />,
};
