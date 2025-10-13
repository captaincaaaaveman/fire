import { getDatasets, getChartDatasets, getSuccessPercentage, getFinalValues } from './calculations.js';

// Simple model stub
export const model = {
  age: 51,
  spouseAge: 51,
  projectToAge: 95,
  retirementAge: 57,
  statePensionAge: 67,
  spouseStatePensionAge: 67,
  definedBenefitPensionAge: 0,
  spouseDefinedBenefitPensionAge: 55,
  pensionAccessAge: 57,
  spousePensionAccessAge: 57,

  isaTotal: 67000,
  cashTotal: 37000,
  pensionTotal: 540000,
  giaTotal: 1000,

  spouseIsaTotal: 0,
  spouseCashTotal: 0,
  spousePensionTotal: 0,
  spouseGiaTotal: 0,

  isaAnnualSavings: 0,
  cashAnnualSavings: 0,
  pensionAnnualSavings: 15000,
  giaAnnualSavings: 0,

  spouseIsaAnnualSavings: 0,
  spouseCashAnnualSavings: 500,
  spousePensionAnnualSavings: 0,
  spouseGiaAnnualSavings: 0,

  isaYears: 0,
  cashYears: 0,
  pensionYears: 5,
  giaYears: 0,

  spouseIsaYears: 0,
  spouseCashYears: 5,
  spousePensionYears: 0,
  spouseGiaYears: 0,

  isaAnnualIncrease: 0,
  cashAnnualIncrease: 0,
  pensionAnnualIncrease: 0,
  giaIncrease: 0,

  isaAnnualIncrease_Spouse: 0,
  cashAnnualIncrease_Spouse: 0,
  pensionAnnualIncrease_Spouse: 0,
  giaIncrease_Spouse: 0,

  modelDrawdown: true,
  annualDrawdownUnder75: 50000,
  annualDrawdown75orOver: 35000,

  statePension: 11950,
  spouseStatePension: 11950,
  definedBenefitPension: 0,
  spouseDefinedBenefitPension: 500,

  investmentPercentage: 4,
  savingsPercentage: -1,
  historicSimulation: true,
};

// Run datasets
console.log("Running simulation test harness...");
const { datasets, labels } = getChartDatasets(model);

console.log(`Generated ${datasets.length} datasets`);
console.log(`Labels range: ${labels[0]}–${labels[labels.length - 1]}`);
console.log(`Success %: ${getSuccessPercentage().toFixed(2)}%`);
console.log("Final values (percentiles):", getFinalValues().map(v => v.toFixed(0)));

// Detect NaNs
let nanFound = false;
for (const [i, d] of datasets.entries()) {
  if (d.data.some(isNaN)) {
    console.error(`❌ NaN found in dataset ${i}`);
    nanFound = true;
  }
}

console.log(getSuccessPercentage());
// console.log(datasets);

if (!nanFound) {
  console.log("✅ No NaNs detected.");
} else {
  console.warn("⚠️ Some datasets contain NaNs — check initial model values.");
}
