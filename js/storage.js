// storage.js
const STORAGE_KEY = "retirementModel";

export function saveModel(model, scenario = '') {
  localStorage.setItem(STORAGE_KEY + scenario, JSON.stringify(model));
}

export function loadModel(scenario = '') {
  const stored = localStorage.getItem(STORAGE_KEY + scenario);
  return stored ? JSON.parse(stored) : null;
}
