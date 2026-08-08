export const DEFAULT_SESSION_TIMEOUT_MINS = 15;

export const getSessionTimeoutMinutes = (): number => {
  try {
    const saved = localStorage.getItem('innovista_session_timeout_mins');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading session timeout settings:', e);
  }
  return DEFAULT_SESSION_TIMEOUT_MINS;
};

export const saveSessionTimeoutMinutes = (mins: number): void => {
  try {
    const validMins = Math.max(1, Math.min(1440, Math.floor(mins)));
    localStorage.setItem('innovista_session_timeout_mins', validMins.toString());
    window.dispatchEvent(
      new CustomEvent('innovista_session_timeout_changed', {
        detail: { mins: validMins }
      })
    );
  } catch (e) {
    console.error('Error saving session timeout settings:', e);
  }
};
