// Hardcoded base data
export const baseData = [1, 2, 3, 4, 5];

// Function to perform calculation
export function calculateResults(multiplier) {
  return baseData.map(x => x * multiplier);
}
