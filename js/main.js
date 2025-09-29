// --- Show screen function ---
import { baseData, getChartDatasets } from './calculations.js';

// DOM Elements
const input_age = document.getElementById("input_age");
const input_retirementAge = document.getElementById("input_retirementAge");
const input_percentage = document.getElementById("input_percentage");
const input_amount = document.getElementById("input_amount");

const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll("#tabs li");
const menuBtn = document.getElementById("menuBtn");
const tabsList = document.getElementById("tabs");

// Restore saved input
input_age.value = localStorage.getItem("age") || 51;
input_retirementAge.value = localStorage.getItem("retirementAge") || 57;
input_amount.value = localStorage.getItem("amount") || 675000;
input_percentage.value = localStorage.getItem("percentage") || 4;

// Initialize chart
const ctx = document.getElementById("myChart");
let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: baseData.map(x => "Item " + x),
    datasets: []
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  }
});

// --- Update chart ---
function updateChart() {
  const age = parseFloat(input_age.value);
  const amount = parseFloat(input_amount.value);
  const percentage = parseFloat(input_percentage.value);
  const retirementAge = parseFloat(input_retirementAge.value);

  localStorage.setItem("age", age);
  localStorage.setItem("amount", amount);
  localStorage.setItem("percentage", percentage);
  localStorage.setItem("retirementAge", retirementAge);

  chart.data

  const { datasets, labels } =  getChartDatasets(age, retirementAge, amount, percentage);

  console.log("Results from getDatasets:", datasets);
  console.log("Chart datasets before update:", chart.data.datasets);

  chart.data.datasets = datasets;
  chart.data.labels = labels;


  console.log("Chart datasets after update:", chart.data.datasets);

  chart.update();
}

// --- Calculate button ---
calculateBtn.addEventListener("click", () => {
  updateChart();
  // Switch to results screen
  showScreen("resultsScreen");
});

// --- Tabs click ---
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.target;
    showScreen(target);
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
  });
});

// --- Menu button toggle for mobile ---
menuBtn.addEventListener("click", () => {
  tabsList.style.display = tabsList.style.display === "flex" ? "none" : "flex";
});

// --- Show screen function ---
function showScreen(screenId) {
  // Activate the screen
  screens.forEach(s => s.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");

  // Highlight the corresponding tab
  tabs.forEach(t => {
    if (t.dataset.target === screenId) {
      t.classList.add("active");
    } else {
      t.classList.remove("active");
    }
  });

  // Optional: close mobile menu after selection
  if (window.innerWidth <= 600) {
    tabsList.style.display = "none";
  }
}


