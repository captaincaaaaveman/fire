// Hardcoded base data
export const baseData = [1, 2, 3, 4, 5];

/**
 * Generates a 2D array of calculated datasets
 * Each series is an array corresponding to baseData
 * Example: creates N series where each series multiplies baseData by (multiplier * seriesIndex)
 */
export function getDatasets(age, retirementAge, amount, percentage) { 
  const results = [];
  const series = [];
  const labels = [];

  let total = amount; 
  for (let i = age; i <= retirementAge; i++) {

    // Store in series
    series[i - age] = total;

    // Apply interest / growth
    total = total * (1 + (percentage / 100));

    // Set the label to the right age
    labels[i - age] = i;
  }

  results.push(series);

  return { datasets: results, labels };
}


/**
 * Optional helper: returns dataset objects formatted for Chart.js
 */
export function getChartDatasets(age, retirementAge, amount, percentage) {
  const colors = [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 206, 86, 1)"
  ];

  const { datasets, labels } = getDatasets(age, retirementAge, amount, percentage);

  const chartDatasets = datasets.map((data, index) => ({
    label: `Series ${index + 1}`,
    data,
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
    fill: false
  }));

console.log( chartDatasets)
console.log( labels)

  // Return both datasets and labels
  return { datasets: chartDatasets, labels };
}
