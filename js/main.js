import { baseData, getChartDatasets } from './calculations.js';

// --- Restore saved user input ---
const inputEl = document.getElementById("userInput");
const savedValue = localStorage.getItem("multiplier") || 1;
inputEl.value = savedValue;

const ctx = document.getElementById("myChart");
let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: baseData.map(x => "Item " + x),
    datasets: getChartDatasets(savedValue, 3) // dynamically generate 3 series
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true }
    }
  }
});

// --- Update chart dynamically ---
document.getElementById("saveBtn").addEventListener("click", () => {
  const multiplier = parseFloat(inputEl.value) || 1;
  localStorage.setItem("multiplier", multiplier);

  chart.data.datasets = getChartDatasets(multiplier, 3); // same number of series
  chart.update();
});