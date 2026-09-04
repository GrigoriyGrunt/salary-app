import { profile } from "./profile";

const STORAGE_KEY = "salary-calculator-profile";

export function saveProfile() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(profile)
  );
}

export function loadProfile() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return;

  Object.assign(profile, JSON.parse(data));
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY);
}