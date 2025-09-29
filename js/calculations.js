// Hardcoded base data
export const baseData = [1, 2, 3, 4, 5];

/**
 * Generates a 2D array of calculated datasets
 * Each series is an array corresponding to baseData
 * Example: creates N series where each series multiplies baseData by (multiplier * seriesIndex)
 */
export function getDatasets(multiplier, seriesCount = 2) {
  const results = [];

  for (let i = 1; i <= seriesCount; i++) {
    const series = baseData.map(x => x * multiplier * i);
    results.push(series);
  }

  return results; // 2D array: [ [series1], [series2], ... ]
}

/**
 * Optional helper: returns dataset objects formatted for Chart.js
 */
export function getChartDatasets(multiplier, seriesCount = 2) {
  const colors = [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(255, 206, 86, 1)"
  ];

  const seriesArray = getDatasets(multiplier, seriesCount);

  return seriesArray.map((data, index) => ({
    label: `Series ${index + 1}`,
    data,
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length].replace("1)", "0.2)"),
    fill: true
  }));
}
