// storage.js
const STORAGE_KEY = "retirementModel";

export function saveModel(model) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
}

export function loadModel() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}
