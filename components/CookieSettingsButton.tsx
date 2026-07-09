'use client'

const STORAGE_KEY = 'vaxai-cookie-consent'

export default function CookieSettingsButton() {
  function openPreferences() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage unavailable */
    }
    window.location.reload()
  }

  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-left transition-colors duration-200 hover:text-paper"
    >
      Cookie settings
    </button>
  )
}
