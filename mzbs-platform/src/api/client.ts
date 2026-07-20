import axios from "axios";

export const STORAGE_KEY = "mzbs_platform_admin_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

// If a request comes back 401 (expired/invalid token), the stored token is
// stale — clear it and send the user back to /login instead of leaving them
// on a screen that just silently fails to load. Skip this for the login
// request itself, since a 401 there just means "wrong password", not "your
// session expired".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const isLoginRequest = url.includes("/platform-admin/login");

    if (status === 401 && !isLoginRequest && typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
