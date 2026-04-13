const GLOBAL_STORE_KEY = '__techbuddy_password_otp_store__';

if (!globalThis[GLOBAL_STORE_KEY]) {
  globalThis[GLOBAL_STORE_KEY] = new Map();
}

const passwordOtpStore = globalThis[GLOBAL_STORE_KEY];

export default passwordOtpStore;
