import { useTheme, type ThemePreference } from '../context/ThemeContext';

const options: { value: ThemePreference; label: string; title: string }[] = [
  { value: 'light', label: 'Light', title: 'Light mode' },
  { value: 'dark', label: 'Dark', title: 'Dark mode' },
  { value: 'auto', label: 'Auto', title: 'Match system appearance' },
];

export default function ThemeToggle() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {options.map(({ value, label, title }) => (
        <button
          key={value}
          type="button"
          className="theme-toggle-btn"
          title={title}
          aria-pressed={preference === value}
          onClick={() => setPreference(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
