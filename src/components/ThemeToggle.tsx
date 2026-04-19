import type { ReactNode } from 'react';
import { useTheme, type ThemePreference } from '../context/ThemeContext';

const options: {
  value: ThemePreference;
  label: string;
  icon: ReactNode;
}[] = [
  {
    value: 'light',
    label: 'Light mode',
    icon: (
      <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark mode',
    icon: (
      <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
  {
    value: 'auto',
    label: 'Match system appearance',
    icon: (
      <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {options.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          className="theme-toggle-btn"
          aria-label={label}
          aria-pressed={preference === value}
          onClick={() => setPreference(value)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
