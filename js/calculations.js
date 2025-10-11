import { model } from './model.js';


// Hardcoded base data
export const historicGrowthRates = [49.05,
  -6.46,
  -23.02,
  -40.46,
  1.89,
  49.98,
  -4.36,
  45.43,
  30.43,
  -37.68,
  31.36,
  -2.00,
  -25.22,
  -18.28,
  11.23,
  21.27,
  16.04,
  32.78,
  -11.38,
  -1.68,
  0.28,
  15.84,
  26.84,
  8.37,
  6.67,
  1.04,
  40.73,
  20.96,
  1.87,
  -11.92,
  35.67,
  18.91,
  -3.92,
  23.46,
  -11.97,
  20.44,
  12.94,
  7.47,
  -13.32,
  21.00,
  5.82,
  -13.03,
  -5.91,
  2.27,
  10.88,
  -21.87,
  -35.83,
  5.96,
  6.38,
  -17.63,
  -5.77,
  3.36,
  5.55,
  -15.25,
  6.53,
  17.75,
  0.91,
  19.04,
  37.25,
  -1.27,
  17.50,
  18.45,
  -24.31,
  11.81,
  -8.83,
  20.53,
  2.60,
  16.14,
  10.81,
  13.70,
  20.25,
  23.34,
  -13.92,
  -17.80,
  -20.73,
  31.22,
  13.18,
  7.23,
  17.32,
  7.11,
  -42.41,
  27.98,
  8.75,
  -11.22,
  12.63,
  24.18,
  3.38,
  -0.87,
  6.13,
  19.18,
  -10.76,
  25.42,
  14.89,
  19.26,
  -25.68,
];

export const successCases = []
export const failureCases = []
export const failureAges = []
let c1v = 0;
let c25v = 0;
let c50v = 0;
let c75v = 0;
let c100v = 0;

/**
 * Generates a 2D array of calculated datasets
 * Each series is an array corresponding to baseData
 * Example: creates N series where each series multiplies baseData by (multiplier * seriesIndex)
 */
/**
 * @param {import('./model.js').model} m
 */
export function getDatasets(m) {

  const results = [];
  const labels = [];
  failureAges.length = 0;

  let years = model.projectToAge - model.age;

  if (! model.historicSimulation) {
    years = historicGrowthRates.length - 1
  }

  for (let historicYear = 0; historicYear < historicGrowthRates.length - years; historicYear++) {

    let totalIsa = model.isaTotal;
    let totalCash = model.cashTotal;
    let totalPension = model.pensionTotal;
    let totalGia = model.giaTotal;
    const series = [];

    let isaSavings = model.isaAnnualSavings;
    let cashSavings = model.cashAnnualSavings;
    let pensionSavings = model.pensionAnnualSavings;
    let giaSavings = model.giaAnnualSavings;

    let toAge = model.projectToAge
    const age = model.age

    let failedAt = undefined; 

    for (let i = age; i <= toAge; i++) {

      let year = i - age

      // Store in series
      series[i - age] = totalIsa + totalCash + totalPension + totalGia;

      if (series[i - age] <= 0) {
        series[i - age] = 0
        failedAt = i
        break
      }

      // Apply interest / growth
      let pIsa = historicGrowthRates[historicYear + year]
      let pGia = historicGrowthRates[historicYear + year]
      let pPension = historicGrowthRates[historicYear + year]
      let pCash = -1

      if (! model.historicSimulation) {
        pIsa = model.investmentPercentage;
        pGia = model.investmentPercentage;
        pPension = model.investmentPercentage;
        pCash = model.savingsPercentage;
      }

      totalIsa = totalIsa * (1 + (pIsa / 100));
      totalGia = totalGia * (1 + (pGia / 100));
      totalPension = totalPension * (1 + (pPension / 100));
      totalCash = totalCash * (1 + (model.savingsPercentage / 100));

      // Annual Investments
      if (year < model.isaYears) {
        totalIsa = totalIsa + isaSavings;
        isaSavings = isaSavings * (1 + (model.isaAnnualIncrease/100)) 
      }
      if (year < model.cashYears) {
        totalCash = totalCash + cashSavings;
        cashSavings = cashSavings * (1 + (model.cashAnnualIncrease/100)) 
      }
      if (year < model.pensionYears) {
        totalPension = totalPension + pensionSavings;
        pensionSavings = pensionSavings * (1 + (model.pensionAnnualIncrease/100)) 
      }
      if (year < model.giaYears) {
        totalGia = totalGia + giaSavings;
        giaSavings = giaSavings * (1 + (model.giaIncrease/100)) 
      }

      if (model.modelDrawdown) {
        let drawdown = 0;

        if (i >= model.retirementAge) {
          if (i < 75) {
            drawdown = model.annualDrawdownUnder75
          } else {
            drawdown = model.annualDrawdown75orOver
          }
        }

        if (i >= model.statePensionAge) {
          drawdown = drawdown - model.statePension
        }

        if (i >= model.definedBenefitPensionAge) {
          drawdown = drawdown - model.definedBenefitPension
        }

        if ( drawdown < 0 ) {
          drawdown = 0
        }

        // Need to work out whether they can draw from pension at age i
        if (totalPension > drawdown) {
          totalPension = totalPension - drawdown
        } else {
          let remainder = drawdown - totalPension;
          totalPension = 0;
          if (totalCash > remainder) {
            totalCash = totalCash - drawdown
          } else {
            remainder = remainder - totalCash
            totalCash = 0
            if (totalIsa > remainder) {
              totalIsa = totalIsa - remainder
            } else {
              remainder = remainder - totalIsa
              totalIsa = 0
              if (totalGia > remainder) {
                totalGia = totalGia - remainder
              } else {
                remainder = remainder - totalGia
                totalGia = 0
              }
            }
          }
        }
      }

      // Set the label to the right age
      labels[i - age] = i;
    }

    if ( failedAt ) {
      failureAges.push(failedAt)
    }

    results.push(series);
  }

  return { datasets: results, labels };
}

export function getSuccessPercentage() {
  return 100 * successCases.length / (successCases.length + failureCases.length)
}

export function getFinalValues() {
  return [c1v, c25v, c50v, c75v, c100v]
}

export function getChartDatasets(model) {
  const { datasets, labels, colours } = getDatasets(model);

  failureCases.length = 0
  successCases.length = 0

  // Compute final values of each dataset
  const finalValues = datasets.map(d => d[d.length - 1]);

  // Compute median
  const sorted = [...finalValues].sort((a, b) => a - b);
  const n = sorted.length;

  const c1 = 0;
  const c25 = Math.floor(n * 0.25);
  const c50 = Math.min(Math.ceil(n * 0.50), n-1);
  const c75 = Math.floor(n * 0.75);
  const c100 = n - 1;

  c1v = sorted[c1];
  c25v = sorted[c25];
  c50v = sorted[c50];
  c75v = sorted[c75];
  c100v = sorted[c100];

  // Build chart datasets
  const chartDatasets = datasets.map((data, index) => {
    const finalValue = data[data.length - 1];
    let borderColor;
    let borderWidth = 1;

    if (finalValue < c25v) {
      borderColor = "#66666633"; // 25%
    } else if (finalValue > c75v) {
      borderColor = "#66666633"; // 75%
    } else if (finalValue < c50v) {
      borderColor = "#666666AA"; // 25-50
    } else if (finalValue > c50v) {
      borderColor = "#666666AA"; // 25-50
    } else {
      borderColor = "#000000FF"; // 50
      borderWidth = 2
    }

    borderColor = finalValue <= 0 ? "#ff000055" : borderColor;

    if (finalValue <= 0) {
      failureCases.push(data)
    } else {
      successCases.push(data)
    }

    return {
      label: `Series ${index + 1}`,
      data,
      borderColor,
      backgroundColor: borderColor.replace("FF", "11"), // semi-transparent fill
      fill: false,
      borderWidth: borderWidth,
      pointRadius: 0,
      pointHoverRadius: 2,
      tension: 0.2
    };
  });

  return { datasets: chartDatasets, labels };
}

