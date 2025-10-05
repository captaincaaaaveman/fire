// --- Show screen function ---
import { getChartDatasets, getSuccessPercentage, getFinalValue } from './calculations.js';
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

const investmentAmountInput = document.getElementById("investmentAmountInput");
const investmentPercentageInput = document.getElementById("investmentPercentageInput");
const savingsAmountInput = document.getElementById("savingsAmountInput");
const savingsPercentageInput = document.getElementById("savingsPercentageInput");

const annualInvestmentInput = document.getElementById("annualInvestmentInput");
const investmentYearsInput = document.getElementById("investmentYearsInput");
const annualSavingsInput = document.getElementById("annualSavingsInput");
const savingsYearsInput = document.getElementById("savingsYearsInput");

const modelDrawdownCheckbox = document.getElementById("modelDrawdownCheckbox")

const annualDrawdownUnder75Input = document.getElementById("annualDrawdownUnder75Input");
const annualDrawdown75orOverInput = document.getElementById("annualDrawdown75orOverInput");
const statePensionInput = document.getElementById("statePensionInput");

// Prefill inputs from storage on load
function initFromStorage() {
  const stored = loadModel();
  if (stored) {
    Object.assign(model, stored);
  }
    ageInput.value = model.age || "24";
    retirementAgeInput.value = model.retirementAge || "35";
    investmentAmountInput.value = model.investmentAmount || "0";
    investmentPercentageInput.value = model.investmentPercentage || "4";
    savingsAmountInput.value = model.savingsAmount || "20000";
    savingsPercentageInput.value = model.savingsPercentage || "-1";
    annualInvestmentInput.value = model.investment || "0";
    investmentYearsInput.value = model.investmentYears || "11";
    annualSavingsInput.value = model.savings || "12000";
    savingsYearsInput.value = model.savingsYears || "11";
    annualDrawdownUnder75Input.value =  model.annualDrawdownUnder75 || "40000";
    annualDrawdown75orOverInput.value =  model.annualDrawdown75orOver || "30000";
    statePensionInput.value = model.statePension || 23946;
    modelDrawdownCheckbox.checked= model.modelDrawdown || false;
}


// Sync model whenever inputs change
function updateModel() {
  model.age = parseInt(ageInput.value, 10) || 51;
  model.retirementAge = parseInt(retirementAgeInput.value, 10) || 0;
  model.investmentAmount = parseFloat(investmentAmountInput.value) || 0;
  const val = parseFloat(investmentPercentageInput.value);
  model.investmentPercentage = isNaN(val) ? undefined : val;
  model.savingsPercentage = parseFloat(savingsPercentageInput.value) || 0;
  model.investment = parseFloat(annualInvestmentInput.value) || 0;
  model.investmentYears = parseFloat(investmentYearsInput.value) || 0;
  model.savings = parseFloat(annualSavingsInput.value) || 0;
  model.savingsYears = parseFloat(savingsYearsInput.value) || 0;
  model.annualDrawdownUnder75 = parseFloat(annualDrawdownUnder75Input.value) || 0;
  model.annualDrawdown75orOver = parseFloat(annualDrawdown75orOverInput.value) || 0;
  model.statePension = parseFloat(statePensionInput.value) || 0;
  model.modelDrawdown = modelDrawdownCheckbox.checked;

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

  const fvheading = document.getElementById("finalValue");
  if (!fvheading) return;

  const finalValue = getFinalValue();

  if (finalValue !== undefined && !isNaN(success)) {
    fvheading.textContent = `£${finalValue.toFixed(2)}`;
  } else {
    fvheading.textContent = "—";
  }

}


const debouncedRecalc = debounce(recalcAndUpdate, 250);

// Attach event listeners for auto-update
[ageInput, retirementAgeInput, investmentAmountInput, investmentPercentageInput,annualInvestmentInput, investmentYearsInput,annualDrawdown75orOverInput,annualDrawdownUnder75Input,statePensionInput,
savingsAmountInput, savingsPercentageInput, modelDrawdownCheckbox, annualSavingsInput, savingsYearsInput
].forEach(input => {
  input.addEventListener("input", debouncedRecalc);
});

// --- Calculate button ---
calculateBtn.addEventListener("click", () => {
  recalcAndUpdate();
});

initFromStorage();
recalcAndUpdate();

const drawdownGroup = document.getElementById("drawdownGroup");

// Function to show/hide the drawdown section
function toggleDrawdownGroup() {
  if (modelDrawdownCheckbox.checked) {
    drawdownGroup.classList.remove("hidden");
  } else {
    drawdownGroup.classList.add("hidden");
  }
}

// Run once on page load
toggleDrawdownGroup();

// Re-run every time the checkbox changes
modelDrawdownCheckbox.addEventListener("change", toggleDrawdownGroup);




