import { useLocale } from './LocaleContext'
import type { LocaleCode } from './LocaleContext'

const OPTIONS: { code: LocaleCode; label: string }[] = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale()

  return (
    <div
      className="al-lang-switch"
      role="group"
      aria-label={t.langSwitcherAria}
    >
      {OPTIONS.map(opt => (
        <button
          key={opt.code}
          type="button"
          className={`al-lang-switch__btn${locale === opt.code ? ' is-active' : ''}`}
          aria-pressed={locale === opt.code}
          onClick={() => setLocale(opt.code)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
