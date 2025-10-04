// --- Show screen function ---
import { getChartDatasets, getSuccessPercentage } from './calculations.js';
import { saveModel, loadModel } from "./storage.js";
import { model } from "./model.js";
import { debounce } from "./utils.js";

// Input fields
const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll("#tabs li");
const menuBtn = document.getElementById("menuBtn");
const tabsList = document.getElementById("tabs");


// DOM Elements
const ageInput = document.getElementById("ageInput");
const retirementAgeInput = document.getElementById("retirementAgeInput");
const percentageInput = document.getElementById("percentageInput");
const amountInput = document.getElementById("amountInput");
const investmentInput = document.getElementById("investmentInput");
const investmentYearsInput = document.getElementById("investmentYearsInput");
const annualDrawdownUnder75Input = document.getElementById("annualDrawdownUnder75Input");
const annualDrawdown75orOverInput = document.getElementById("annualDrawdown75orOverInput");
const statePensionInput = document.getElementById("statePensionInput");

// Prefill inputs from storage on load
function initFromStorage() {
  const stored = loadModel();
  if (stored) {
    Object.assign(model, stored);

    ageInput.value = model.age || "51";
    retirementAgeInput.value = model.retirementAge || "58";
    amountInput.value = model.amount || "657000";
    percentageInput.value = model.percentage || "4";
    investmentInput.value = model.investment || "4000";
    investmentYearsInput.value = model.investmentYears || "1";
    annualDrawdownUnder75Input.value =  model.annualDrawdownUnder75 || "40000";
    annualDrawdown75orOverInput.value =  model.annualDrawdown75orOver || "30000";
    statePensionInput.value = model.statePension || 23946;
  }
}


// Sync model whenever inputs change
function updateModel() {
  model.age = parseInt(ageInput.value, 10) || 0;
  model.retirementAge = parseInt(retirementAgeInput.value, 10) || 0;
  model.amount = parseFloat(amountInput.value) || 0;
  const val = parseFloat(percentageInput.value);
  model.percentage = isNaN(val) ? undefined : val;
  model.investment = parseFloat(investmentInput.value) || 0;
  model.investmentYears = parseFloat(investmentYearsInput.value) || 0;
  model.annualDrawdownUnder75 = parseFloat(annualDrawdownUnder75Input.value) || 0;
  model.annualDrawdown75orOver = parseFloat(annualDrawdown75orOverInput.value) || 0;
  model.statePension = parseFloat(statePensionInput.value) || 0;

  saveModel(model); // persist after every update

}

// Initialize chart
const ctx = document.getElementById("myChart");
let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: []
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false } // no legend
    },
    scales: {
      y: { beginAtZero: true }
    },
    elements: {
      line: {
        borderWidth: 1 // thin lines
      },
      point: {
        radius: 0 // hide points
      }
    }
  }
});


// --- Update chart ---
function updateChart() {

  const { datasets, labels } =  getChartDatasets(model);

  chart.data.datasets = datasets;
  chart.data.labels = labels;

  chart.update();
}

function recalcAndUpdate() {
  updateModel();
  const { datasets, labels } = getChartDatasets(model);
  updateChart(datasets, labels);
  updatePercentageHeading()  
}

function updatePercentageHeading() {
  const heading = document.getElementById("percentageSuccess");
  if (!heading) return;

  const success = getSuccessPercentage();

  if (success !== undefined && !isNaN(success)) {
    heading.textContent = `${success.toFixed(2)}% Success rate`;
  } else {
    heading.textContent = "—";
  }
}


const debouncedRecalc = debounce(recalcAndUpdate, 1000);

// Attach event listeners for auto-update
[ageInput, retirementAgeInput, amountInput, percentageInput,investmentInput, investmentYearsInput,annualDrawdown75orOverInput,annualDrawdownUnder75Input,statePensionInput].forEach(input => {
  input.addEventListener("input", debouncedRecalc);
});

// --- Calculate button ---
calculateBtn.addEventListener("click", () => {
  recalcAndUpdate();
});

initFromStorage();
recalcAndUpdate();




