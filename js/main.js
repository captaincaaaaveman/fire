// --- Show screen function ---
import { getChartDatasets, getSuccessPercentage, getFinalValues, failureAges, successCases, failureCases } from './calculations.js';
import { saveModel, loadModel } from "./storage.js";
import { model } from "./model.js";
import { debounce } from "./utils.js";

// Input fields
const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll("#tabs li");
const menuBtn = document.getElementById("menuBtn");
const tabsList = document.getElementById("tabs");

let currentScenario = "A"; 

// DOM Elements
const ageInput = document.getElementById("ageInput");
const projectToAgeInput = document.getElementById("projectToAgeInput");
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
const historicSimulationCheckbox = document.getElementById("historicSimulationCheckbox");

// Prefill inputs from storage on load
function initFromStorage() {
  const stored = loadModel(currentScenario);
  if (stored) {
    Object.assign(model, stored);
  }
  ageInput.value = model.age || "24";
  projectToAgeInput.value = model.projectToAge || "95";
  retirementAgeInput.value = model.retirementAge || "65";
  investmentAmountInput.value = model.investmentAmount || "0";
  investmentPercentageInput.value = model.investmentPercentage || "4";
  savingsAmountInput.value = model.savingsAmount || "20000";
  savingsPercentageInput.value = model.savingsPercentage || "-1";
  annualInvestmentInput.value = model.investment || "0";
  investmentYearsInput.value = model.investmentYears || "11";
  annualSavingsInput.value = model.savings || "12000";
  savingsYearsInput.value = model.savingsYears || "11";
  annualDrawdownUnder75Input.value = model.annualDrawdownUnder75 || "40000";
  annualDrawdown75orOverInput.value = model.annualDrawdown75orOver || "30000";
  statePensionInput.value = model.statePension || 23946;
  modelDrawdownCheckbox.checked = model.modelDrawdown || false;
  historicSimulationCheckbox.checked = model.historicSimulation || false;
}


// Sync model whenever inputs change
function updateModel() {
  model.age = parseInt(ageInput.value, 10) || 51;
  model.projectToAge = parseInt(projectToAgeInput.value) || 95
  model.retirementAge = parseInt(retirementAgeInput.value) || 0;
  model.investmentAmount = parseInt(investmentAmountInput.value) || 0;
  const val = parseFloat(investmentPercentageInput.value);
  model.investmentPercentage = isNaN(val) ? undefined : val;
  model.savingsPercentage = parseFloat(savingsPercentageInput.value) || 0;
  model.investment = parseInt(annualInvestmentInput.value) || 0;
  model.investmentYears = parseInt(investmentYearsInput.value) || 0;
  model.savings = parseInt(annualSavingsInput.value) || 0;
  model.savingsYears = parseInt(savingsYearsInput.value) || 0;
  model.annualDrawdownUnder75 = parseInt(annualDrawdownUnder75Input.value) || 0;
  model.annualDrawdown75orOver = parseInt(annualDrawdown75orOverInput.value) || 0;
  model.statePension = parseInt(statePensionInput.value) || 0;
  model.modelDrawdown = modelDrawdownCheckbox.checked;
  model.historicSimulation = historicSimulationCheckbox.checked;

  saveModel(model, currentScenario) ; // persist after every update

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

  const { datasets, labels } = getChartDatasets(model);

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

  const finalValue = getFinalValues();


if (Array.isArray(finalValue) && finalValue.length === 5) {
  const [min, p25, median, p75, max] = finalValue;

  // Add thousand separators
  const fmt = v => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

  fvheading.innerHTML = `
    <div class="text-sm text-gray-500 mb-2 text-center">Range of Outcomes</div>

    <!-- Gradient Bar -->
    <div class="h-1 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-full mb-3"></div>

    <!-- Grid of Values + Labels -->
    <div class="grid grid-cols-5 gap-2 text-center">
      <div>
        <div class="font-medium text-gray-800 text-sm md:text-base">£${fmt(min)}</div>
        <div class="text-xs text-gray-400 mt-1">Lowest</div>
      </div>
      <div>
        <div class="font-medium text-gray-800 text-sm md:text-base">£${fmt(p25)}</div>
        <div class="text-xs text-gray-400 mt-1">25th</div>
      </div>
      <div>
        <div class="font-bold text-indigo-600 text-sm md:text-base">£${fmt(median)}</div>
        <div class="text-xs text-gray-400 mt-1">Median</div>
      </div>
      <div>
        <div class="font-medium text-gray-800 text-sm md:text-base">£${fmt(p75)}</div>
        <div class="text-xs text-gray-400 mt-1">75th</div>
      </div>
      <div>
        <div class="font-medium text-gray-800 text-sm md:text-base">£${fmt(max)}</div>
        <div class="text-xs text-gray-400 mt-1">Highest</div>
      </div>
    </div>
  `;
} else {
  fvheading.textContent = "—";
}

  const [min, p25, median, p75, max] = finalValue;
  const fvbar = document.getElementById("fvbar");
  const fvrange = document.getElementById("fvrange");
  const fvmedian = document.getElementById("fvmedian");

  // Normalise values to 0–100% for placement
  const minV = min;
  const maxV = max;
  const scale = x => ((x - minV) / (maxV - minV)) * 100;

  fvrange.style.left = `${scale(p25)}%`;
  fvrange.style.width = `${scale(p75) - scale(p25)}%`;
  fvmedian.style.left = `${scale(median)}%`;


// Calculate stats
const successCount = successCases.length;
const failureCount = failureCases.length;
const totalCount = successCount + failureCount;

// Success percentage (avoid divide-by-zero)
const successPercentage = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

// Failure ages summary
const minFailureAge = failureAges.length ? Math.min(...failureAges) : null;
const maxFailureAge = failureAges.length ? Math.max(...failureAges) : null;

// Format number helpers
const fmt = v => v.toLocaleString(undefined, { maximumFractionDigits: 0 });
const pct = v => v.toFixed(1) + "%";

// Render summary
const statsContainer = document.getElementById("statsContainer");
if (statsContainer) {
  statsContainer.innerHTML = `
    <div class="bg-white rounded-xl shadow p-4 text-center space-y-4">
      <h2 class="text-lg font-semibold text-indigo-600">Simulation Results</h2>
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div>
          <div class="text-2xl font-bold text-green-600">${pct(successPercentage)}</div>
          <div class="text-sm text-gray-500">Success Rate</div>
        </div>
        <div>
          <div class="text-xl font-semibold text-red-600">${fmt(failureCount)}</div>
          <div class="text-sm text-gray-500">Failures</div>
        </div>
        <div>
          <div class="text-xl font-semibold text-green-600">${fmt(successCount)}</div>
          <div class="text-sm text-gray-500">Successes</div>
        </div>
        <div>
          <div class="text-xl font-semibold text-gray-800">${fmt(totalCount)}</div>
          <div class="text-sm text-gray-500">Total Simulations</div>
        </div>
        <div>
          ${
            minFailureAge && maxFailureAge
              ? `<div class="text-xl font-semibold text-amber-600">${fmt(minFailureAge)}–${fmt(maxFailureAge)}</div>
                 <div class="text-sm text-gray-500">Failure Age Range</div>`
              : `<div class="text-xl font-semibold text-gray-400">—</div>
                 <div class="text-sm text-gray-500">Failure Age Range</div>`
          }
        </div>
      </div>
    </div>
  `;
}


}


const debouncedRecalc = debounce(recalcAndUpdate, 250);

// Attach event listeners for auto-update
[ageInput, projectToAgeInput, retirementAgeInput, investmentAmountInput, investmentPercentageInput, annualInvestmentInput, investmentYearsInput, annualDrawdown75orOverInput, annualDrawdownUnder75Input, statePensionInput,
  savingsAmountInput, savingsPercentageInput, modelDrawdownCheckbox, annualSavingsInput, savingsYearsInput, historicSimulationCheckbox
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


// Get all radio buttons
const radios = document.querySelectorAll('input[name="scenario"]');
const display = document.getElementById('currentScenario');

duplicateAtoBBtn.addEventListener("click", () => {
  currentScenario = "A"
  initFromStorage()
  currentScenario = "B"
  saveModel(model, "B")
  currentScenario = "A"
});


radios.forEach(radio => {
  radio.addEventListener('change', (event) => {
    const newScenario = event.target.value;

    // Save current model before switching (optional)
    saveModel(model, currentScenario);

    // Update scenario
    currentScenario = newScenario;
    display.textContent = currentScenario;

    // Load new model for selected scenario
    const newModel = loadModel(currentScenario);
    if (newModel) {
      Object.assign(model, newModel); // <-- mutate properties
    } else {
      // reset model if no saved data
      Object.keys(model).forEach(key => {
        if (typeof model[key] === 'boolean') model[key] = false;
        else model[key] = 0;
      });
    }
    chart.options.animation = { duration: 0 };

    initFromStorage()
    recalcAndUpdate()

    setTimeout(() => {
      chart.options.animation = undefined;
    });
  });
});

