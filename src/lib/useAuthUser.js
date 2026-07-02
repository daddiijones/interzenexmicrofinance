"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "apex_user";
const UPDATE_EVENT = "apex_user_updated";

let cachedRaw = null;
let cachedUser = null;

function readSnapshot() {
  const raw =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(STORAGE_KEY);

  if (raw === cachedRaw) return cachedUser;

  cachedRaw = raw;
  try {
    cachedUser = raw ? JSON.parse(raw) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

function getServerSnapshot() {
  return null;
}

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(UPDATE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(UPDATE_EVENT, callback);
  };
}

// Reads the locally-persisted session user. Stays in sync across tabs
// (storage event) and within the same tab via setAuthUser/clearAuthUser.
export function useAuthUser() {
  return useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);
}

export function setAuthUser(user) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function clearAuthUser() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
}
