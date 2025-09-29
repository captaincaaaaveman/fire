import { baseData, calculateResults } from './calculations.js';

// --- Restore saved user input ---
const inputEl = document.getElementById("userInput");
const savedValue = localStorage.getItem("multiplier") || 1;
inputEl.value = savedValue;

// --- Initialize chart ---
const ctx = document.getElementById("myChart");
let chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: baseData.map(x => "Item " + x),
    datasets: [{
      label: "Calculated Results",
      data: calculateResults(savedValue),
      backgroundColor: "rgba(54, 162, 235, 0.6)"
    }]
  },
  options: { responsive: true }
});

// --- Save input and update chart ---
document.getElementById("saveBtn").addEventListener("click", () => {
  const multiplier = parseFloat(inputEl.value) || 1;
  localStorage.setItem("multiplier", multiplier);

  chart.data.datasets[0].data = calculateResults(multiplier);
  chart.update();
});
