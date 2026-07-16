// Client-side session storage. The JWT lives in localStorage and is
// attached as a Bearer token by the api-client. (Route protection is
// done client-side in the dashboard layout, since the token is not a cookie.)

const TOKEN_KEY = "sila_token";
const PHONE_KEY = "sila_phone";

export function setSession(token: string, phoneNumber: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PHONE_KEY, phoneNumber);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getPhone(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PHONE_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PHONE_KEY);
}
