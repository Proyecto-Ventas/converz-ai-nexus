import React from 'react';

// All icons share same emerald stroke fill; simple SVG placeholders that can be replaced later.
// Using 24x24 viewBox, responsive via props.
interface IconProps extends React.SVGProps<SVGSVGElement> {}

const stroke = 'currentColor';
const className = 'w-5 h-5';

export const DashboardIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

export const TrainingIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const ChallengesIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const KnowledgeIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4h16v13H4z" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export const HistoryIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M3 3v5h5" />
    <path d="M3.05 13a9 9 0 1 0 .5-5.5L3 9" />
    <path d="M12 7v5l4 2" />
  </svg>
);

export const AchievementsIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" />
  </svg>
);

export const ProfileIconCRM = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a10 10 0 0 1 13 0" />
  </svg>
);

export default {
  DashboardIconCRM,
  TrainingIconCRM,
  ChallengesIconCRM,
  KnowledgeIconCRM,
  HistoryIconCRM,
  AchievementsIconCRM,
  ProfileIconCRM,
};
