import { getAuth, onIdTokenChanged } from "firebase/auth";

let currentToken: string | null = null;
const auth = getAuth();

// Keep token updated automatically (refreshes ~ every hour)
onIdTokenChanged(auth, async (user) => {
  if (user) {
    currentToken = await user.getIdToken();
  } else {
    currentToken = null;
  }
});

/**
 * Wrapper around fetch() that injects Firebase ID token.
 */
export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }
  return fetch(input, { ...init, headers });
}
