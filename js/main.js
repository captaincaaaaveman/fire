// --- Show screen function ---
import { getChartDatasets, getSuccessPercentage, getFinalValues, failureAges, failureBeforeRetirementCases, successCases, failureCases, getMedianIndex } from './calculations.js';
import { saveModel, loadModel } from "./storage.js";
import { model } from "./model.js";
import { debounce } from "./utils.js";

// Input fields
const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll("#tabs li");
const menuBtn = document.getElementById("menuBtn");
const tabsList = document.getElementById("tabs");

let currentScenario = "A"; 
let mWithdrawals = [];

// DOM Elements
const ageInput = document.getElementById("ageInput");
const projectToAgeInput = document.getElementById("projectToAgeInput");
const retirementAgeInput = document.getElementById("retirementAgeInput");

const spouseCheckbox = document.getElementById("spouseCheckbox");
const spouseAgeInput = document.getElementById("spouseAgeInput");

// const investmentAmountInput = document.getElementById("investmentAmountInput");
const investmentPercentageInput = document.getElementById("investmentPercentageInput");
// const savingsAmountInput = document.getElementById("savingsAmountInput");
const savingsPercentageInput = document.getElementById("savingsPercentageInput");

// const annualInvestmentInput = document.getElementById("annualInvestmentInput");
// const investmentYearsInput = document.getElementById("investmentYearsInput");
// const annualSavingsInput = document.getElementById("annualSavingsInput");
// const savingsYearsInput = document.getElementById("savingsYearsInput");

const modelDrawdownCheckbox = document.getElementById("modelDrawdownCheckbox")

const annualDrawdownUnder75Input = document.getElementById("annualDrawdownUnder75Input");
const annualDrawdown75to89Input = document.getElementById("annualDrawdown75to89Input");
const annualDrawdown90PlusInput = document.getElementById("annualDrawdown90PlusInput");

const statePensionInput = document.getElementById("statePensionInput");
const statePensionAgeInput = document.getElementById("statePensionAgeInput");
const spouseStatePensionInput = document.getElementById("spouseStatePensionInput");
const spouseStatePensionAgeInput = document.getElementById("spouseStatePensionAgeInput");

const definedBenefitPensionInput = document.getElementById("definedBenefitPensionInput");
const definedBenefitPensionAgeInput = document.getElementById("definedBenefitPensionAgeInput");

const spouseDefinedBenefitPensionInput = document.getElementById("spouseDefinedBenefitPensionInput");
const spouseDefinedBenefitPensionAgeInput = document.getElementById("spouseDefinedBenefitPensionAgeInput");

const deathAgeInput = document.getElementById("deathAgeInput");
const spouseDeathAgeInput = document.getElementById("spouseDeathAgeInput");

// const historicSimulationCheckbox = document.getElementById("historicSimulationCheckbox");

const investmentGroups = ["cash", "pension", "isa", "gia", 
  "spouseCash", "spousePension", "spouseIsa", "spouseGia"];

  const investmentInputs = {};

for (const group of investmentGroups) {
  investmentInputs[group] = {
    total: document.getElementById(`${group}Total`),
    annualSavings: document.getElementById(`${group}AnnualSavings`),
    annualIncrease: document.getElementById(`${group}AnnualIncrease`),
    years: document.getElementById(`${group}Years`)
  };
  if (group === 'pension' || group === 'spousePension' ) {
    investmentInputs[group].accessAge = document.getElementById(`${group}AccessAge`);
  }
}

// Prefill inputs from storage on load
function initFromStorage() {
  const stored = loadModel(currentScenario);
  if (stored) {
    Object.assign(model, stored);
  }
  ageInput.value = model.age || "24";
  spouseCheckbox.checked = model.spouse || false;
  spouseAgeInput.value = model.spouseAge || 51;

  projectToAgeInput.value = model.projectToAge || "95";
  retirementAgeInput.value = model.retirementAge || "65";
  investmentPercentageInput.value = model.investmentPercentage || "4";
  savingsPercentageInput.value = model.savingsPercentage || "-1";
  annualDrawdownUnder75Input.value = model.annualDrawdownUnder75 || "40000";
  annualDrawdown75to89Input.value = model.annualDrawdown75to89 || "30000";
  annualDrawdown90PlusInput.value = model.annualDrawdown90Plus || "60000";
  statePensionInput.value = model.statePension || 11973;
  statePensionAgeInput.value = model.statePensionAge || 67;
  spouseStatePensionInput.value = model.spouseStatePension || 11973;
  spouseStatePensionAgeInput.value = model.spouseStatePensionAge || 67;
  definedBenefitPensionInput.value = model.definedBenefitPension || 0;
  definedBenefitPensionAgeInput.value = model.definedBenefitPensionAge || 0;
  spouseDefinedBenefitPensionInput.value = model.spouseDefinedBenefitPension || 0;
  spouseDefinedBenefitPensionAgeInput.value = model.spouseDefinedBenefitPensionAge || 0;
  modelDrawdownCheckbox.checked = model.modelDrawdown || false;

  deathAgeInput.value = model.deathAge || 96;
  spouseDeathAgeInput.value = model.spouseDeathAge || 96;

  // historicSimulationCheckbox.checked = model.historicSimulation || false;
  simulationRadios.forEach(radio => {
    radio.checked = (radio.value === model.simulationType);
  });

  for (const group of investmentGroups) {
    const fields = investmentInputs[group];
    fields.total.value = model[`${group}Total`] || 0;
    fields.annualSavings.value = model[`${group}AnnualSavings`] || 0;
    fields.annualIncrease.value = model[`${group}AnnualIncrease`] || 0;
    fields.years.value = model[`${group}Years`] || 0;

    if ( group === 'pension' || group === 'spousePension') {
      fields.accessAge.value = model[`${group}AccessAge`] || 0;
    }

  }

  showHideSpouse();
  showHideDrawdown();

}


// Sync model whenever inputs change
function updateModel() {
  model.age = parseInt(ageInput.value) || 51;
  model.spouse = spouseCheckbox.checked;
  model.spouseAge = parseInt(spouseAgeInput.value) || 51;


  model.projectToAge = parseInt(projectToAgeInput.value) || 95
  model.retirementAge = parseInt(retirementAgeInput.value) || 0;
  const val = parseFloat(investmentPercentageInput.value);
  model.investmentPercentage = isNaN(val) ? undefined : val;
  model.savingsPercentage = parseFloat(savingsPercentageInput.value) || 0;
  model.annualDrawdownUnder75 = parseInt(annualDrawdownUnder75Input.value) || 0;
  model.annualDrawdown75to89 = parseInt(annualDrawdown75to89Input.value) || 0;
  model.annualDrawdown90Plus = parseInt(annualDrawdown90PlusInput.value) || 0;
  model.statePension = parseInt(statePensionInput.value) || 0;
  model.statePensionAge = parseInt(statePensionAgeInput.value) || 0;
  model.spouseStatePension = parseInt(spouseStatePensionInput.value) || 0;
  model.spouseStatePensionAge = parseInt(spouseStatePensionAgeInput.value) || 0;
  model.definedBenefitPension = parseInt(definedBenefitPensionInput.value) || 0;
  model.definedBenefitPensionAge = parseInt(definedBenefitPensionAgeInput.value) || 0;
  model.spouseDefinedBenefitPension = parseInt(spouseDefinedBenefitPensionInput.value) || 0;
  model.spouseDefinedBenefitPensionAge = parseInt(spouseDefinedBenefitPensionAgeInput.value) || 0;
  model.modelDrawdown = modelDrawdownCheckbox.checked;
  // model.historicSimulation = historicSimulationCheckbox.checked;
  model.simulationType = document.querySelector('input[name="simulationType"]:checked')?.value || 'constant';

  model.deathAge = parseInt(deathAgeInput.value) || 96;
  model.spouseDeathAge = parseInt(spouseDeathAgeInput.value) || 96;

  for (const group of investmentGroups) {
    const fields = investmentInputs[group];
    model[`${group}Total`] = parseFloat(fields.total.value) || 0;
    model[`${group}AnnualSavings`] = parseFloat(fields.annualSavings.value) || 0;
    model[`${group}AnnualIncrease`] = parseFloat(fields.annualIncrease.value) || 0;
    model[`${group}Years`] = parseInt(fields.years.value, 10) || 0;
    if ( group === 'pension' || group === 'spousePension') {
      model[`${group}AccessAge`] = parseInt(fields.accessAge.value, 10) || 0;
    }
  }

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

  const { datasets, labels, withdrawals } = getChartDatasets(model);

  mWithdrawals = withdrawals[getMedianIndex()]
  
  chart.data.datasets = datasets;
  chart.data.labels = labels;

  chart.update();

}

document.getElementById("showWithdrawalsButton").addEventListener("click", () => {
  showWithdrawalsPage( mWithdrawals);
});

function recalcAndUpdate() {
  updateModel();
  updateChart();
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

  const fv = document.getElementById("medianFinalValue");
  if (fv) {
        fv.textContent = `Median Final Value = £${fmt(median)}`;
  }

  fvheading.innerHTML = `

<div id="rangeOfOutcomes" class="bg-white rounded-xl shadow p-4 w-full space-y-4  mb-6">

  <!-- Title centered -->
  <div class="font-medium text-gray-800 text-base text-center">Range of Outcomes</div>

  <!-- Gradient Bar -->
  <div class="h-2 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-full"></div>

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
const failureBeforeRetirementCount = failureBeforeRetirementCases.length;
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
      
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <div>
          <div class="text-2xl font-bold text-green-600">${pct(successPercentage)}</div>
          <div class="text-sm text-gray-500">Success Rate</div>
        </div>
        <div>
          <div class="text-xl font-semibold text-red-600">${fmt(failureCount)}</div>
          <div class="text-sm text-gray-500">Failures</div>
        </div>
        <div>
          <div class="text-xl font-semibold text-red-600">${fmt(failureBeforeRetirementCount)}</div>
          <div class="text-sm text-gray-500">Failures Before Retirement</div>
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
const simulationRadios = document.querySelectorAll('input[name="simulationType"]');

// Attach event listeners for auto-update
[ageInput, projectToAgeInput, retirementAgeInput, 
  annualDrawdownUnder75Input, annualDrawdown75to89Input, annualDrawdown90PlusInput, 
  statePensionInput,
  statePensionAgeInput,
  spouseStatePensionInput,
  spouseStatePensionAgeInput,
  definedBenefitPensionInput,definedBenefitPensionAgeInput,
  spouseDefinedBenefitPensionInput,spouseDefinedBenefitPensionAgeInput,
  modelDrawdownCheckbox, 
  spouseCheckbox, spouseAgeInput,
  investmentPercentageInput, savingsPercentageInput,
  deathAgeInput, spouseDeathAgeInput,
  ...simulationRadios
].forEach(input => {
  input.addEventListener("input", debouncedRecalc);
});

for (const group of investmentGroups) {
  const fields = investmentInputs[group];
  Object.values(fields).forEach(input => {
    if (input) {
      input.addEventListener("input", debouncedRecalc);
    }
  });
}

const drawdownGroup = document.getElementById("drawdownGroup");
const statsGroup = document.getElementById("statsGroup");

spouseCheckbox.addEventListener("click", () => {
  showHideSpouse()
});

modelDrawdownCheckbox.addEventListener("click", () => {
  showHideDrawdown()
});

function showHideDrawdown() {
  if (modelDrawdownCheckbox.checked) {
    drawdownGroup.classList.remove("hidden");
  } else {
    drawdownGroup.classList.add("hidden");
  }
}


function showHideSpouse() {
  const spouseElements = document.querySelectorAll(".spouse");

  spouseElements.forEach(el => {
    if (spouseCheckbox.checked) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  const spouseOptionDivs = document.querySelectorAll('.spouse-option');

  spouseOptionDivs.forEach(div => {
    if (model.spouse) {
      div.classList.remove('md:grid-cols-2');
      div.classList.add('md:grid-cols-1');
    } else {
      div.classList.remove('md:grid-cols-1');
      div.classList.add('md:grid-cols-2');
    }
  });

}

initFromStorage();
recalcAndUpdate();
showHideStats();
showHideSpouse();




// Get all radio buttons
const radios = document.querySelectorAll('input[name="scenario"]');

duplicateAtoBBtn.addEventListener("click", () => {
  currentScenario = "A"
  initFromStorage()
  currentScenario = "B"
  saveModel(model, "B")
  currentScenario = "A"
});


simulationRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    // model.historicSimulation = (radio.value === 'historicSimulation');
    // model.historicUSSimulation = (radio.value === 'historicUSSimulation');
    // model.flatRateGrowth = (radio.value === 'flatRateGrowth');
    showHideStats();
  });
});

function showHideStats() {
  // find the selected simulation type
  const selected = document.querySelector('input[name="simulationType"]:checked').value;

  if (selected !== 'constantRateGrowth') {
    statsGroup.classList.remove("hidden");
  } else {
    statsGroup.classList.add("hidden");
  }
}


radios.forEach(radio => {
  radio.addEventListener('change', (event) => {
    const newScenario = event.target.value;

    // Save current model before switching (optional)
    saveModel(model, currentScenario);

    // Update scenario
    currentScenario = newScenario;

    for (const display of document.getElementsByClassName('currentScenario')) {
      display.textContent = currentScenario;
    }

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


function showWithdrawalsPage(withdrawals) {
  const container = document.getElementById("withdrawalsPage");
  const tableContainer = document.getElementById("withdrawalsTableContainer");

  // Clear old content
  tableContainer.innerHTML = "";

  if (!model || !withdrawals || withdrawals.length === 0) {
    tableContainer.innerHTML = "<p>No data available.</p>";
    return;
  }

  const startAge = model.age || 0;

  // Build table HTML
  let html = `
    <table class="w-full border-collapse text-sm shadow-sm rounded-lg overflow-hidden">
      <thead class="bg-gray-100 border-b">
        <tr>
          <th class="text-left py-2 px-3">Age</th>
          <th class="text-right py-2 px-3">Required Drawdown (£)</th>
          <th class="text-right py-2 px-3">State Pension (£)</th>
          <th class="text-right py-2 px-3">DB Pension Withdrawal (£)</th>
          <th class="text-right py-2 px-3">DC Pension Withdrawal (£)</th>
          <th class="text-right py-2 px-3">ISA Withdrawal (£)</th>
          <th class="text-right py-2 px-3">GIA Withdrawal (£)</th>
          <th class="text-right py-2 px-3">Cash Withdrawal (£)</th>
          <th class="text-right py-2 px-3">Tax (£)</th>
          <th class="text-right py-2 px-3">Net (£)</th>
        </tr>
      </thead>
      <tbody>
  `;

  withdrawals.forEach((withdrawal, i) => {
    const w = withdrawal.totalWithdrawalInfo
    const age = startAge + i;
    const drawdown = Math.round(w["drawdown"]) || 0;
    const tax = Math.round(w["tax"]) || 0;
    const net = Math.round((w["netDrawdown"]) || 0);
    const pension = Math.round((w["pension"]) || 0);
    const isa = Math.round((w["isa"]) || 0);
    const gia = Math.round((w["gia"]) || 0);
    const cash = Math.round((w["cash"]) || 0);
    const dbPension = Math.round((w["dbPension"]) || 0);
    const statePension = Math.round((w["statePension"]) || 0);

    html += `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-2 px-3">${age}</td>
        <td class="py-2 px-3 text-right">£${drawdown.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${statePension.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${dbPension.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${pension.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${isa.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${gia.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${cash.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${tax.toLocaleString()}</td>
        <td class="py-2 px-3 text-right font-semibold">£${net.toLocaleString()}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  html += getInvestmentsTable(withdrawals);
  
  tableContainer.innerHTML = html;

  // Show this page (and optionally hide others)
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  container.classList.remove("hidden");
}

function getInvestmentsTable(withdrawals) {
  const startAge = model.age || 0;

  // Build table HTML
  let html = `
    <table class="w-full border-collapse text-sm shadow-sm rounded-lg overflow-hidden">
      <thead class="bg-gray-100 border-b">
        <tr>
          <th class="text-left py-2 px-3">Age</th>
          <th class="text-right py-2 px-3">DC Pension Value (£)</th>
          <th class="text-right py-2 px-3">ISA Value (£)</th>
          <th class="text-right py-2 px-3">GIA Value (£)</th>
          <th class="text-right py-2 px-3">Cash Vash (£)</th>
          <th class="text-right py-2 px-3">Total Value (£)</th>
        </tr>
      </thead>
      <tbody>
  `;

  withdrawals.forEach((withdrawal, i) => {
    const w = withdrawal.totalWithdrawalInfo
    const age = startAge + i;
    const pension = Math.round((w["totalPension"]) || 0);
    const isa = Math.round((w["totalIsa"]) || 0);
    const gia = Math.round((w["totalGia"]) || 0);
    const cash = Math.round((w["totalCash"]) || 0);
    const total = pension + isa + gia + cash

    html += `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-2 px-3">${age}</td>
        <td class="py-2 px-3 text-right">£${pension.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${isa.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${gia.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${cash.toLocaleString()}</td>
        <td class="py-2 px-3 text-right font-semibold">£${total.toLocaleString()}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  return html;
}



