import { getChartDatasets, getSuccessPercentage, getFinalValues, getMedianIndex } from './calculations.js';

// Simple model stub
export const model = 
{
    "age": 51,
    "spouse": true,
    "spouseAge": 51,
    "projectToAge": 95,
    "retirementAge": 56,
    "annualDrawdownUnder75": 50000,
    "annualDrawdown75to89": 35000,
    "annualDrawdown90Plus": 60000,
    "statePension": 11973,
    "statePensionAge": 67,
    "spouseStatePension": 11973,
    "spouseStatePensionAge": 67,
    "modelDrawdown": true,
    "simulationType": "historicSimulation",
    "definedBenefitPension": 0,
    "definedBenefitPensionAge": 0,
    "spouseDefinedBenefitPension": 500,
    "spouseDefinedBenefitPensionAge": 55,
    "investmentPercentage": 4,
    "savingsPercentage": -1,
    "cashTotal": 37000,
    "cashAnnualSavings": 0,
    "cashAnnualIncrease": 0,
    "cashYears": 5,
    "pensionTotal": 577000,
    "pensionAnnualSavings": 48000,
    "pensionAnnualIncrease": 0,
    "pensionYears": 1,
    "pensionAccessAge": 57,
    "isaTotal": 67000,
    "isaAnnualSavings": 0,
    "isaAnnualIncrease": 0,
    "isaYears": 0,
    "giaTotal": 1000,
    "giaAnnualSavings": 0,
    "giaAnnualIncrease": 0,
    "giaYears": 0,
    "spouseCashTotal": 0,
    "spouseCashAnnualSavings": 0,
    "spouseCashAnnualIncrease": 0,
    "spouseCashYears": 0,
    "spousePensionTotal": 0,
    "spousePensionAnnualSavings": 0,
    "spousePensionAnnualIncrease": 0,
    "spousePensionYears": 0,
    "spousePensionAccessAge": 57,
    "spouseIsaTotal": 0,
    "spouseIsaAnnualSavings": 1,
    "spouseIsaAnnualIncrease": 0,
    "spouseIsaYears": 0,
    "spouseGiaTotal": 0,
    "spouseGiaAnnualSavings": 0,
    "spouseGiaAnnualIncrease": 0,
    "spouseGiaYears": 0,
    "deathAge": 95,
    "spouseDeathAge": 96,
    "statePensionInput": 0,
    "statePensionAgeInput": 0,
    "annualDrawdown75orOver": 40000,
    "historicSimulation": true,
    "historicUSSimulation": false,
    "investmentAmount": 0,
    "savingsAmount": 20000,
    "investment": 0,
    "investmentYears": 11,
    "savings": 12000,
    "savingsYears": 11,
    "defintedBenefitPensionAge": 0,
    "flatRateGrowth": false,
    "deathAgeInput": 96,
    "spouseDeathAgeInput": 96
}

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

const withdrawals = datasets[getMedianIndex()]["withdrawals"];

console.log(getSuccessPercentage());
// console.log(withdrawals);

withdrawals.forEach((withdrawal, i) => { 
    const w = withdrawal.totalWithdrawalInfo
    const age = 51 + i;
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
    // console.log(`
    //   <tr class="border-b hover:bg-gray-50">
    //     <td class="py-2 px-3">${age}</td>
    //     <td class="py-2 px-3 text-right">£${drawdown.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${statePension.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${dbPension.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${pension.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${isa.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${gia.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${cash.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${tax.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right font-semibold">£${net.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${totalpension.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${totalisa.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${totalgia.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right">£${totalcash.toLocaleString()}</td>
    //     <td class="py-2 px-3 text-right font-semibold">£${total.toLocaleString()}</td>
    //   </tr>
    // `);


} )

if ( getSuccessPercentage() == 69.81132075471699 ) {
  console.log("✅ Percentage.");
} else {
  console.warn(`⚠️ ${getSuccessPercentage()} != 69.81132075471699`);
}

if (!nanFound) {
  console.log("✅ No NaNs detected.");
} else {
  console.warn("⚠️ Some datasets contain NaNs — check initial model values.");
}
