// --- Show screen function ---
import { getChartDatasets, getSuccessPercentage, getFinalValues, failureAges, failureBeforeRetirementCases, successCases, failureCases, indices, getMedianIndex, historicGlobalGrowthRates, historicUSGrowthRates, allFinalValues } from './calculations.js';
import { saveModel, loadModel } from "./storage.js";
import { model,exampleModel } from "./model.js";
import { debounce } from "./utils.js";


let withdrawalsChartInstance = null;
let taxChartInstance = null;
let assetsChartInstance = null;

// Input fields
const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll("#tabs li");
const menuBtn = document.getElementById("menuBtn");
const tabsList = document.getElementById("tabs");

let currentScenario = "A"; 
// let mWithdrawals = [];

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
  } else {
    Object.assign(model, exampleModel); // <-- mutate properties
  }
  ageInput.value = model.age ?? 45;
  spouseCheckbox.checked = model.spouse ?? true;
  spouseAgeInput.value = model.spouseAge ?? 45;

  projectToAgeInput.value = model.projectToAge ?? "95";
  retirementAgeInput.value = model.retirementAge ?? "55";
  investmentPercentageInput.value = model.investmentPercentage ?? "4";
  savingsPercentageInput.value = model.savingsPercentage ?? "-1";
  annualDrawdownUnder75Input.value = model.annualDrawdownUnder75 ?? "40000";
  annualDrawdown75to89Input.value = model.annualDrawdown75to89 ?? "30000";
  annualDrawdown90PlusInput.value = model.annualDrawdown90Plus ?? "60000";
  statePensionInput.value = model.statePension ?? 11973;
  statePensionAgeInput.value = model.statePensionAge ?? 67;
  spouseStatePensionInput.value = model.spouseStatePension ?? 11973;
  spouseStatePensionAgeInput.value = model.spouseStatePensionAge ?? 67;
  definedBenefitPensionInput.value = model.definedBenefitPension ?? 0;
  definedBenefitPensionAgeInput.value = model.definedBenefitPensionAge ?? 0;
  spouseDefinedBenefitPensionInput.value = model.spouseDefinedBenefitPension ?? 0;
  spouseDefinedBenefitPensionAgeInput.value = model.spouseDefinedBenefitPensionAge ?? 0;
  modelDrawdownCheckbox.checked = model.modelDrawdown ?? true;

  deathAgeInput.value = model.deathAge ?? 96;
  spouseDeathAgeInput.value = model.spouseDeathAge ?? 96;

  // historicSimulationCheckbox.checked = model.historicSimulation ?? false;
  simulationRadios.forEach(radio => {
    radio.checked = (radio.value === model.simulationType);
  });

  for (const group of investmentGroups) {
    const fields = investmentInputs[group];
    fields.total.value = model[`${group}Total`] ?? 10000;
    fields.annualSavings.value = model[`${group}AnnualSavings`] ?? 4500;
    fields.annualIncrease.value = model[`${group}AnnualIncrease`] ?? 2;
    fields.years.value = model[`${group}Years`] ?? 10;

    if ( group === 'pension' || group === 'spousePension') {
      fields.accessAge.value = model[`${group}AccessAge`] ?? 57;
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

let allDatasets = []

// --- Update chart ---
function updateChart() {

  const { datasets, labels, withdrawals } = getChartDatasets(model);

  allDatasets = datasets;
  
  // withdrawals[getMedianIndex()]
  
  chart.data.datasets = datasets;
  chart.data.labels = labels;

  chart.update();

}

function recalcAndUpdate() {
  updateModel();
  updateChart();
  populateDropdown();
  updatePercentageHeading();

  updateWithdrawalsCharts();
}

function updateWithdrawalsCharts() {

  let a = allDatasets[getSelectedIndex()]

  if ( a == undefined ) {
    a = allDatasets[getMedianIndex()]
  }

  let mWithdrawals = a["withdrawals"]

  showWithdrawalsPage(mWithdrawals);
  renderWithdrawalsCharts(mWithdrawals);
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
    const drawdown = Math.round(w["drawdown"]) || 0;
    const tax = Math.round(w["tax"]) || 0;
    const net = Math.round((w["netDrawdown"]) || 0);
    const pension = Math.round((w["pension"]) || 0);
    const isa = Math.round((w["isa"]) || 0);
    const gia = Math.round((w["gia"]) || 0);
    const cash = Math.round((w["cash"]) || 0);
    const dbPension = Math.round((w["dbPension"]) || 0);
    const statePension = Math.round((w["statePension"]) || 0);

    const totalpension = Math.round((w["totalPension"]) || 0);
    const totalisa = Math.round((w["totalIsa"]) || 0);
    const totalgia = Math.round((w["totalGia"]) || 0);
    const totalcash = Math.round((w["totalCash"]) || 0);

    const total = totalpension + totalisa + totalgia + totalcash
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
        <td class="py-2 px-3 text-right">£${totalpension.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${totalisa.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${totalgia.toLocaleString()}</td>
        <td class="py-2 px-3 text-right">£${totalcash.toLocaleString()}</td>
        <td class="py-2 px-3 text-right font-semibold">£${total.toLocaleString()}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  
  tableContainer.innerHTML = html;

}


export function renderWithdrawalsCharts(withdrawals) {
  if (!model || !withdrawals?.length) return;




  const labels = withdrawals.map((_, i) => (model.age || 0) + i);

  // Extract datasets
  const dbPension = withdrawals.map(w => w.totalWithdrawalInfo?.dbPension || 0);
  const statePension = withdrawals.map(w => w.totalWithdrawalInfo?.statePension || 0);
  const pension = withdrawals.map(w => w.totalWithdrawalInfo?.pension || 0);
  const isa = withdrawals.map(w => w.totalWithdrawalInfo?.isa || 0);
  const gia = withdrawals.map(w => w.totalWithdrawalInfo?.gia || 0);
  const cash = withdrawals.map(w => w.totalWithdrawalInfo?.cash || 0);
  const tax = withdrawals.map(w => w.totalWithdrawalInfo?.tax || 0);
  const netDrawdown = withdrawals.map(w => w.totalWithdrawalInfo?.netDrawdown || 0);
  
  const totalPension = withdrawals.map(w => w.totalWithdrawalInfo?.totalPension || 0);
  const totalIsa = withdrawals.map(w => w.totalWithdrawalInfo?.totalIsa || 0);
  const totalGia = withdrawals.map(w => w.totalWithdrawalInfo?.totalGia || 0);
  const totalCash = withdrawals.map(w => w.totalWithdrawalInfo?.totalCash || 0);
  const totaltotal = withdrawals.map(w =>
    (w.totalWithdrawalInfo?.totalPension || 0) +
    (w.totalWithdrawalInfo?.totalIsa || 0) +
    (w.totalWithdrawalInfo?.totalGia || 0) +
    (w.totalWithdrawalInfo?.totalCash || 0)
  );

  // Destroy previous charts if they exist
  if (withdrawalsChartInstance) withdrawalsChartInstance.destroy();
  if (taxChartInstance) taxChartInstance.destroy();
  if (assetsChartInstance) assetsChartInstance.destroy();

  const ctx1 = document.getElementById('withdrawalsChart').getContext('2d');
  const ctx2 = document.getElementById('assetsChart').getContext('2d');
  const ctx3 = document.getElementById('taxChart').getContext('2d');



  
// --- Chart 1: Withdrawals Breakdown (Stacked Area Chart) ---
withdrawalsChartInstance = new Chart(ctx1, {
  type: "bar",
  data: {
    labels,
    datasets: [
      {
        label: "State Pension",
        data: statePension,
        borderColor: "#777777",
        backgroundColor: "#777777FF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      },
      {
        label: "DB Pension",
        data: dbPension,
        borderColor: "#4F46E5",
        backgroundColor: "#4F46E5FF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      },
      {
        label: "DC Pension Withdrawals",
        data: pension,
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6FF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      },
      {
        label: "ISA Withdrawals",
        data: isa,
        borderColor: "#F59E0B",
        backgroundColor: "#F59E0BFF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      },
      {
        label: "GIA Withdrawals",
        data: gia,
        borderColor: "#22C55E",
        backgroundColor: "#22C55EFF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      },
      {
        label: "Cash Withdrawals",
        data: cash,
        borderColor: "#06B6D4",
        backgroundColor: "#06B6D4FF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      }
    ],
  },
  options: {
    animation: false, // disables all animations
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: £${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
  scales: {
  x: { title: { display: true, text: "Age" }, stacked: true },
  y: { title: { display: true, text: "Withdrawal Amount (£)" }, stacked: true, beginAtZero: true},
  },
  },
});



taxChartInstance = new Chart(ctx3, {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Drawdown",
        data: netDrawdown,
        borderColor: "#4F46E5",
        backgroundColor: "#4F46E5FF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      },
      {
        label: "Tax",
        data: tax,
        borderColor: "#E11D48",
        backgroundColor: "#E11D48FF",
        fill: 'origin',
        tension: 0.3,
        pointRadius: 0,
        stack: 'withdrawals',
      }
    ],
  },
  options: {
    animation: false, // disables all animations
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: £${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
  scales: {
  x: { title: { display: true, text: "Age" }, stacked: true },
  y: { title: { display: true, text: "Withdrawal Amount (£)" }, stacked: true, beginAtZero: true },
  },
  },
});

  // --- Chart 2: Total Assets ---
  assetsChartInstance = new Chart(ctx2, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Pension',
          data: totalPension,
          borderColor: '#4F46E5',
          backgroundColor: '#4F46E533',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Total ISA',
          data: totalIsa,
          borderColor: '#F59E0B',
          backgroundColor: '#F59E0B33',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Total GIA',
          data: totalGia,
          borderColor: '#E11D48',
          backgroundColor: '#E11D4833',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Total Cash',
          data: totalCash,
          borderColor: '#06B6D4',
          backgroundColor: '#06B6D433',
          fill: false,
          tension: 0.3,
        },
        {
          label: 'Grand total',
          data: totaltotal,
          borderColor: '#5b5b5bff',
          backgroundColor: '#06B6D433',
          borderWidth: 0.5,            // thicker line (default is 2)
          borderDash: [6, 3],        // makes it dotted/dashed → [dashLength, gapLength]
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      animation: false, // disables all animations
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: £${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Age' },
        },
        y: {
          title: { display: true, text: 'Total Value (£)' },
          beginAtZero: true,
        },
      },
    },
  });
}


function populateDropdown() {
  const select = document.getElementById('indexSelect');
  select.innerHTML = '';

  const n = indices.length;
  const medianIndex = getMedianIndex();
  

  indices.forEach((value, i) => {
    const position = i + 1; // convert 0-based to 1-based
    const option = document.createElement('option');
    option.value = value;

    // Assign readable text based on position
    if (position === 1) {
      option.textContent = 'worst';
    } else if (position === 2) {
      option.textContent = '2nd worst';
    } else if (position === 3) {
      option.textContent = '3rd worst';
    } else if (position === Math.min(Math.ceil(n * 0.5), n - 1) + 1) {
      option.textContent = 'median';
    } else if (position === n - 2) {
      option.textContent = '3rd best';
    } else if (position === n - 1) {
      option.textContent = '2nd best';
    } else if (position === n) {
      option.textContent = 'best';
    } else {
      option.textContent = position.toString();
    }

    if ( value == 1929-1928 ) {
      option.textContent = '(The Wall Street Crash) ' + option.textContent;
    } else if ( value == 1973-1928) {
      option.textContent = '(The Oil Crisis / Nifty 50 crash) ' + option.textContent;
    } else if ( value == 2000-1928) {
      option.textContent = '(Dot Com Crash) ' + option.textContent;
    } else if ( value == 2000-2008) {
      option.textContent = '(Global Financial Crisis) ' + option.textContent;
    }

    const fmt = v => Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 });

    option.textContent = option.textContent + ' - ' + ( value + 1928) + ' - final value £' + fmt(allFinalValues[i]);

    select.appendChild(option);
  });

  select.value = medianIndex;

  document.querySelectorAll('.simYear').forEach(el => {
    el.textContent = select.options[select.selectedIndex].text;
  });

}

// Handle selection changed
document.getElementById('indexSelect').addEventListener('change', () => {
  const select = document.getElementById('indexSelect');
  const selectedValue = select.value;

document.querySelectorAll('.simYear').forEach(el => {
  el.textContent = select.options[select.selectedIndex].text;
});


  updateWithdrawalsCharts();
});

function getSelectedIndex() {
  return document.getElementById('indexSelect').value;
}

populateDropdown();

  const select = document.getElementById('indexSelect');


document.getElementById('showWithdrawlsTable').addEventListener('click', () => {
  const container = document.getElementById("withdrawalsTableContainer");

  const select = document.getElementById('indexSelect');

  document.querySelectorAll('.simYear').forEach(el => {
    el.textContent = select.options[select.selectedIndex].text;
  });
  
  if (container.classList.contains("hidden")) {
    container.classList.remove("hidden");
  } else {
    container.classList.add("hidden");
  }
});


document.getElementById('example').addEventListener('click', () => {
    Object.assign(model, exampleModel); // <-- mutate properties
    saveModel(model, currentScenario);
    updateAllCharts();    
});

function updateAllCharts() {
   withdrawalsChartInstance.options.animation = { duration: 0 };
   taxChartInstance.options.animation = { duration: 0 };
   assetsChartInstance.options.animation = { duration: 0 };
    initFromStorage()
    recalcAndUpdate()
    setTimeout(() => {
      chart.options.animation = undefined;
   taxChartInstance.options.animation = undefined;
  assetsChartInstance.options.animation = undefined;
    });

}


const floatingSelect = document.getElementById('floatingSelect');
const targetElement = document.getElementById('chartContainer');
floatingSelect.classList.add('hidden');

window.addEventListener('scroll', () => {
  const rect = targetElement.getBoundingClientRect();
  // Check if top of target element is at or above the top of viewport
  if (rect.top <= 0) {
    floatingSelect.classList.remove('hidden');
  } else {
    floatingSelect.classList.add('hidden');
  }
});













const showBtn = document.getElementById('showHistoricRates');
const modal = document.getElementById('historicModal');
const closeBtn = document.getElementById('closeHistoricModal');
const tableBody = document.getElementById('historicTableBody');

// Populate table once
historicGlobalGrowthRates.forEach((rate, index) => {
  const year = 1928 + index;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td class="pr-2 border-b border-gray-200">${year}</td>
    <td class="border-b border-gray-200">${rate.toFixed(2)}%</td>
    <td class="border-b border-gray-200">${historicUSGrowthRates[index].toFixed(2)}%</td>
  `;
  tableBody.appendChild(row);
});

// Open modal
showBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
  modal.classList.add('flex'); // Tailwind flex centering
});

// Close modal
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
});

// Optional: close modal when clicking outside content
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
});