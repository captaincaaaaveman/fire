import { model } from './model.js';


// Hardcoded base data
export const historicGlobalGrowthRates = [49.05,
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
18.28,
14.14
];

export const historicUSGrowthRates = [45.49,
-8.83,
-20.01,
-38.07,
1.82,
48.85,
-2.66,
42.49,
30.06,
-37.13,
32.98,
-1.10,
-11.31,
-20.65,
9.30,
21.47,
16.36,
32.84,
-22.48,
-3.34,
2.63,
20.81,
23.48,
16.68,
17.27,
-1.94,
53.71,
32.10,
4.33,
-12.98,
41.23,
10.15,
-1.01,
25.79,
-10.01,
20.63,
15.30,
10.28,
-12.98,
20.15,
5.82,
-13.60,
-1.90,
10.61,
14.84,
-21.17,
-34.04,
28.11,
18.09,
-12.82,
-2.30,
4.61,
17.08,
-12.51,
15.98,
17.87,
2.11,
26.43,
17.21,
1.32,
11.60,
25.64,
-8.64,
26.36,
4.46,
7.03,
-1.31,
33.80,
18.74,
30.88,
26.30,
17.72,
-12.01,
-13.20,
-23.78,
25.99,
7.25,
1.37,
12.75,
1.35,
-36.61,
22.60,
13.13,
-0.84,
13.91,
30.19,
12.67,
0.64,
9.50,
19.09,
-6.02,
28.28,
16.44,
19.95,
-22.96,
22.14,
21.50
];

export const successCases = []
export const failureCases = []
export const failureBeforeRetirementCases = []
export const failureAges = []
let c1v = 0;
let c25v = 0;
let c50v = 0;
let c75v = 0;
let c100v = 0;
let medianIndex = 0;

/**
 * Generates a 2D array of calculated datasets
 * Each series is an array corresponding to baseData
 * Example: creates N series where each series multiplies baseData by (multiplier * seriesIndex)
 */
/**
 * @param {import('./model.js').model} model
 */
export function getDatasets(model) {

  const results = [];
  const withdrawals = [];
  const labels = [];
  failureAges.length = 0;
  failureBeforeRetirementCases.length = 0;

  let freeTaxBand = 12570;
  let twentyPercentBandLimit = 50270;

  let years = model.projectToAge -  Math.min(model.age, model.spouseAge);

  const growthRates =
    model.simulationType === 'historicUSSimulation'
      ? historicUSGrowthRates
      : historicGlobalGrowthRates;

  if ( model.simulationType === 'constant') {
    years = growthRates.length - 1
  }

  for (let historicYear = 0; historicYear < growthRates.length - years; historicYear++) {

    let totalIsa = model.isaTotal;
    let totalCash = model.cashTotal;
    let totalPension = model.pensionTotal;
    let totalGia = model.giaTotal;

    let totalIsa_Spouse = model.spouseIsaTotal;
    let totalCash_Spouse = model.spouseCashTotal;
    let totalPension_Spouse = model.spousePensionTotal;
    let totalGia_Spouse = model.spouseGiaTotal;
    const series = [];
    const withdrawalSeries = [];

    let isaSavings = model.isaAnnualSavings;
    let cashSavings = model.cashAnnualSavings;
    let pensionSavings = model.pensionAnnualSavings;
    let giaSavings = model.giaAnnualSavings;

    let isaSavings_Spouse = model.spouseIsaAnnualSavings;
    let cashSavings_Spouse = model.spouseCashAnnualSavings;
    let pensionSavings_Spouse = model.spousePensionAnnualSavings;
    let giaSavings_Spouse = model.spouseGiaAnnualSavings;

    let toAge = model.projectToAge
    let age = model.age
    let spouseAge = model.spouseAge

    if ( ! model.spouse ) {
      spouseAge = age;
    }

    let minAge = Math.min(age, spouseAge)

    let failedAt = undefined; 

    let year = 0;

    let tax_for_this_series = 0

    for (let i = minAge; i <= toAge; i++) {

      if ( age > model.deathAge && spouseAge > model.spouseDeathAge ) {
        console.log('Both have died')
        break;
      }
      if ( (!model.spouse) && age > model.deathAge ) {
        console.log('Main has died')
        break;
      }

 



      if (series[year] <= 0) {
        series[year] = 0
        failedAt = i
        break
      }

      // Apply interest / growth
      let pIsa = growthRates[historicYear + year]
      let pGia = growthRates[historicYear + year]
      let pPension = growthRates[historicYear + year]
      let pCash = -1

      if ( model.simulationType === 'constant' || age < model.retirementAge ) {
        pIsa = model.investmentPercentage;
        pGia = model.investmentPercentage;
        pPension = model.investmentPercentage;
        pCash = model.savingsPercentage;
      }

      totalIsa = totalIsa * (1 + (pIsa / 100));
      totalGia = totalGia * (1 + (pGia / 100));

      totalPension = totalPension * (1 + (pPension / 100));
      totalCash = totalCash * (1 + (model.savingsPercentage / 100));

      if ( model.spouse ) {
        totalIsa_Spouse = totalIsa_Spouse * (1 + (pIsa / 100));
        totalGia_Spouse = totalGia_Spouse * (1 + (pGia / 100));
        totalPension_Spouse = totalPension_Spouse * (1 + (pPension / 100));
        totalCash_Spouse= totalCash_Spouse * (1 + (model.savingsPercentage / 100));
      }

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

      // Annual Investments Spouse
      if ( model.spouse && year < model.spouseIsaYears) {
        totalIsa_Spouse = totalIsa_Spouse + isaSavings_Spouse;
        isaSavings_Spouse = isaSavings_Spouse * (1 + (model.spouseIsaAnnualIncrease/100)) 
      }
      if (model.spouse && year < model.spouseCashYears) {
        totalCash_Spouse = totalCash_Spouse + cashSavings_Spouse;
        cashSavings_Spouse = cashSavings_Spouse * (1 + (model.spouseCashAnnualIncrease/100)) 
      }
      if (model.spouse && year < model.spousePensionYears) {
        totalPension_Spouse = totalPension_Spouse + pensionSavings_Spouse;
        pensionSavings_Spouse = pensionSavings_Spouse * (1 + (model.spousePensionAnnualIncrease/100)) 
      }
      if (model.spouse && year < model.spouseGiaYears) {
        totalGia_Spouse = totalGia_Spouse + giaSavings_Spouse;
        giaSavings_Spouse = giaSavings_Spouse * (1 + (model.spouseGiaIncrease/100)) 
      }

      if (model.modelDrawdown) {
        let drawdown = 0;

        let withdrawalInfo = {
          drawdown: 0,
          dbPension: 0,
          statePension: 0,
          totalPension: totalPension,
          totalIsa: totalIsa,
          totalGia: totalGia,
          totalCash: totalCash,
          pension: 0,
          isa: 0,
          gia: 0,
          cash: 0,
          tax: 0,
          netDrawdown: 0
        };
        let spouseWithdrawalInfo = {
          drawdown: 0,
          dbPension: 0,
          statePension: 0,
          totalPension: totalPension_Spouse,
          totalIsa: totalIsa_Spouse,
          totalGia: totalGia_Spouse,
          totalCash: totalCash_Spouse,
          pension: 0,
          isa: 0,
          gia: 0,
          cash: 0,
          tax: 0,
          netDrawdown: 0
        };

        if (age >= model.retirementAge) {
          if (i < 75) {
            drawdown = model.annualDrawdownUnder75
          } else if ( i < 90 ) {
            drawdown = model.annualDrawdown75to89
          } else {
            drawdown = model.annualDrawdown90Plus
          }
        }

        let requiredIncome = drawdown

        if (age >= model.statePensionAge && age < model.deathAge ) {
          drawdown = drawdown - model.statePension
          withdrawalInfo['statePension'] = model.statePension;
        }

        if (model.spouse && spouseAge >= model.spouseStatePensionAge && spouseAge < model.spouseDeathAge ) {
          drawdown = drawdown - model.spouseStatePension
          spouseWithdrawalInfo['statePension'] = model.spouseStatePension;
        }

        if (age >= model.definedBenefitPensionAge && age < model.deathAge ) {
          drawdown = drawdown - model.definedBenefitPension;
          withdrawalInfo['dbPension'] = model.definedBenefitPension;
        }

        if (model.spouse && spouseAge >= model.spouseDefinedBenefitPensionAge && spouseAge < model.spouseDeathAge ) {
          drawdown = drawdown - model.spouseDefinedBenefitPension
          spouseWithdrawalInfo['dbPension'] = model.spouseDefinedBenefitPension;
        }


        if ( drawdown < 0 ) {
          drawdown = 0
        }

        let remainder = drawdown
        
        if ( model.pensionAccessAge <= age )  {
          if (totalPension > remainder) {
            totalPension = totalPension - remainder
            withdrawalInfo['pension'] = remainder;
            remainder = 0
          } else {
            withdrawalInfo['pension'] = totalPension;
            remainder = remainder - totalPension;
            totalPension = 0;
          }
        }

        if ( model.spousePensionAccessAge <= age )  {
            if (totalPension_Spouse > remainder) {
              totalPension_Spouse = totalPension_Spouse - remainder
              spouseWithdrawalInfo['pension'] = remainder;
              remainder = 0
            } else {
              remainder = remainder - totalPension_Spouse;
              spouseWithdrawalInfo['pension'] = totalPension_Spouse;
              totalPension_Spouse = 0;
            }
          }



        // ({ remainder, totalCash, totalIsa, totalGia, totalCash_Spouse, totalIsa_Spouse, totalGia_Spouse } = calculateWithdrawals(remainder, totalCash, withdrawalInfo, totalIsa, totalGia, model, totalCash_Spouse, spouseWithdrawalInfo, totalIsa_Spouse, totalGia_Spouse));

        calculateTax(withdrawalInfo)
        calculateTax(spouseWithdrawalInfo)

        if (remainder > 0 ) {
          series[year] = 0
          failedAt = i
          break
        } 

        remainder = withdrawalInfo.tax + spouseWithdrawalInfo.tax;
        let taxToAdd = remainder;

        // console.log(calculateWithdrawals(remainder, totalCash, withdrawalInfo, totalIsa, totalGia, model, totalCash_Spouse, spouseWithdrawalInfo, totalIsa_Spouse, totalGia_Spouse));

        // try to extract the tax from the ISA etc
       (
        { remainder, totalCash, totalIsa, totalGia, totalCash_Spouse, totalIsa_Spouse, totalGia_Spouse } =
        calculateWithdrawals(remainder, totalCash, withdrawalInfo, totalIsa, totalGia, model,
                       totalCash_Spouse, spouseWithdrawalInfo, totalIsa_Spouse, totalGia_Spouse)
        );

        taxToAdd = taxToAdd - remainder;

        if (remainder > 0 && totalPension <= 0 && totalPension_Spouse <= 0 ) {
          series[year] = 0
          failedAt = i
          break
        } 

        withdrawalInfo["totalPension"] = totalPension;
        spouseWithdrawalInfo["totalPension"] = totalPension_Spouse;

        withdrawalInfo["totalIsa"] = totalIsa;
        spouseWithdrawalInfo["totalIsa"] = totalIsa_Spouse;

        withdrawalInfo["totalGia"] = totalGia;
        spouseWithdrawalInfo["totalGia"] = totalGia_Spouse;

        withdrawalInfo["totalCash"] = totalCash;
        spouseWithdrawalInfo["totalCash"] = totalCash_Spouse;

        const totalWithdrawalInfo = Object.keys(withdrawalInfo).reduce((acc, key) => {
          const mainVal = withdrawalInfo[key] || 0;
          const spouseVal = spouseWithdrawalInfo[key] || 0;

          // Only sum numeric fields; copy others if needed
          acc[key] = (typeof mainVal === "number" && typeof spouseVal === "number")
            ? mainVal + spouseVal
            : mainVal; // fallback if non-numeric
          return acc;
        }, {});

        totalWithdrawalInfo["drawdown"] = requiredIncome;
        totalWithdrawalInfo["netDrawdown"] = requiredIncome - totalWithdrawalInfo["tax"] + taxToAdd;

        withdrawalSeries[year] = { totalWithdrawalInfo };

      }
      
     // Store in series
      series[year] = totalIsa + totalCash + totalPension + totalGia;

      if ( model.spouse ) {
        series[year] = series[year] + totalIsa_Spouse + totalCash_Spouse + totalPension_Spouse + totalGia_Spouse;
      }
      
      // Set the label to the right age
      labels[year] = i;
      year++;
      age++; 
      spouseAge++;


    }

    if ( failedAt ) {
      failureAges.push(failedAt)
      if ( failedAt <= model.retirementAge ) {
        failureBeforeRetirementCases.push(series)
      }
    }

    withdrawals.push(withdrawalSeries);

    series['withdrawals'] = withdrawalSeries
    results.push(series);
  }

  // console.log('withdrawals' + withdrawals)

  return { datasets: results, labels, withdrawals };
}

function calculateWithdrawals(remainder, totalCash, withdrawalInfo, totalIsa, totalGia, model, totalCash_Spouse, spouseWithdrawalInfo, totalIsa_Spouse, totalGia_Spouse) {
  if (remainder > 0) {
    if (totalCash > remainder) {
      totalCash = totalCash - remainder;
      withdrawalInfo['cash'] = withdrawalInfo['cash'] + remainder;
      remainder = 0;
    } else {
      withdrawalInfo['cash'] = withdrawalInfo['cash'] + totalCash;
      remainder = remainder - totalCash;
      totalCash = 0;
      if (totalIsa > remainder) {
        withdrawalInfo['isa'] = withdrawalInfo['isa'] + remainder;
        totalIsa = totalIsa - remainder;
        remainder = 0;
      } else {
        remainder = remainder - totalIsa;
        withdrawalInfo['isa'] = withdrawalInfo['isa'] + totalIsa;
        totalIsa = 0;
        if (totalGia > remainder) {
          totalGia = totalGia - remainder;
          withdrawalInfo['gia'] = withdrawalInfo['gia'] + remainder;
          remainder = 0;
        } else {
          withdrawalInfo['gia'] = withdrawalInfo['gia'] + totalGia;
          remainder = remainder - totalGia;
          totalGia = 0;
        }
      }
    }
  }

  if (model.spouse && remainder > 0) {

    if (remainder > 0) {
      if (totalCash_Spouse > remainder) {
        totalCash_Spouse = totalCash_Spouse - remainder;
        spouseWithdrawalInfo['cash'] = spouseWithdrawalInfo['cash'] + remainder;
        remainder = 0;
      } else {
        remainder = remainder - totalCash_Spouse;
        spouseWithdrawalInfo['cash'] = spouseWithdrawalInfo['cash'] + totalCash_Spouse;
        totalCash_Spouse = 0;
        if (totalIsa_Spouse > remainder) {
          totalIsa_Spouse = totalIsa_Spouse - remainder;
          spouseWithdrawalInfo['isa'] = spouseWithdrawalInfo['isa'] + remainder;
          remainder = 0;
        } else {
          remainder = remainder - totalIsa_Spouse;
          spouseWithdrawalInfo['isa'] = spouseWithdrawalInfo['isa'] + totalIsa_Spouse;
          totalIsa_Spouse = 0;
          if (totalGia_Spouse > remainder) {
            totalGia_Spouse = totalGia_Spouse - remainder;
            spouseWithdrawalInfo['gia'] = spouseWithdrawalInfo['gia'] + remainder;
            remainder = 0;
          } else {
            remainder = remainder - totalGia_Spouse;
            spouseWithdrawalInfo['gia'] = spouseWithdrawalInfo['gia'] + totalGia_Spouse;
            totalGia_Spouse = 0;
          }
        }
      }
    }
  }
  return { remainder, totalCash, totalIsa, totalGia, totalCash_Spouse, totalIsa_Spouse, totalGia_Spouse };
}

function calculateTax( withdrawalInfo ) {
  // 25% of each pension withdrawal is tax free
  const pensionTaxable = withdrawalInfo["pension"] * 0.75;
  const pensionTaxfree = withdrawalInfo["pension"] * 0.25;
  // Sum up all taxable sources
  const totalIncome =
    pensionTaxable +
    withdrawalInfo["dbPension"] +
    withdrawalInfo["statePension"] +
    withdrawalInfo["gia"];

  let tax = 0;
  const freeTaxBand = 12570;
  const twentyPercentBandLimit = 50270;

  if (totalIncome <= freeTaxBand) {
    tax = 0;
  } else if (totalIncome <= twentyPercentBandLimit) {
    tax = (totalIncome - freeTaxBand) * 0.2;
  } else {
    tax =
      (twentyPercentBandLimit - freeTaxBand) * 0.2 +
      (totalIncome - twentyPercentBandLimit) * 0.4;
  }
  withdrawalInfo["tax"] = tax;
}

export function getSuccessPercentage() {
  return 100 * successCases.length / (successCases.length + failureCases.length)
}

export function getFinalValues() {
  return [c1v, c25v, c50v, c75v, c100v]
}

export function getMedianIndex() {
  return medianIndex;
}

export function getChartDatasets(model) {
  const { datasets, labels, withdrawals } = getDatasets(model);

  // console.log(datasets);

  failureCases.length = 0
  successCases.length = 0

  // Compute final values of each dataset
  const finalValues = datasets.map(d => d[d.length - 1]);

  // Create array of indices [0, 1, 2, ..., n-1]
  const indices = finalValues.map((_, i) => i);

  // Sort indices by their corresponding final value
  indices.sort((a, b) => finalValues[a] - finalValues[b]);

  // Compute median
  const sorted = [...finalValues].sort((a, b) => a - b);
  const n = sorted.length;

  // const c1 = 0;
  // const c25 = Math.floor(n * 0.25);
  // medianIndex = Math.min(Math.ceil(n * 0.50), n-1);
  // const c75 = Math.floor(n * 0.75);
  // const c100 = n - 1;

  const c1 = indices[0];
  const c25 = indices[Math.floor(n * 0.25)];
  medianIndex = indices[Math.min(Math.ceil(n * 0.5), n - 1)];
  const c75 = indices[Math.floor(n * 0.75)];
  const c100 = indices[n - 1];

  c1v = finalValues[c1];
  c25v = finalValues[c25];
  c50v = finalValues[medianIndex];
  c75v = finalValues[c75];
  c100v = finalValues[c100];

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
    } else if ( finalValue ) {
      borderColor = "#0000FFFF"; // 50
      borderWidth = 2
    } else {
      // console.log('bad data' +data);
      borderColor = "#ffff00FF"; // 50
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
      tension: 0.2,
      withdrawals: data["withdrawals"]
    };
  });

  return { datasets: chartDatasets, labels, withdrawals };
}


