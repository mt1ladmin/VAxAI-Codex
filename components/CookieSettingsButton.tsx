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
      className="text-left hover:text-gray-900"
    >
      Cookie settings
    </button>
  )
}