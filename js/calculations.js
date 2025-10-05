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

const successCases = []
const failureCases = []

/**
 * Generates a 2D array of calculated datasets
 * Each series is an array corresponding to baseData
 * Example: creates N series where each series multiplies baseData by (multiplier * seriesIndex)
 */
export function getDatasets(model) { 

  const {   age,
  retirementAge,
  investmentAmount,
  savingsAmount,
  investmentPercentage,
  savingsPercentage,
  investment,
  investmentYears,
  savings,
  savingsYears,
  annualDrawdownUnder75,
  annualDrawdown75orOver,
  statePensionInput,
  modelDrawdown } = model;

  const results = [];
  const labels = [];

  let years = 95-age;

  if (investmentPercentage>= 0) {
    years = historicGrowthRates.length-1
  }

  for (let historicYear = 0; historicYear < historicGrowthRates.length-years; historicYear++ ) {

    let totalInvestments = investmentAmount;
    let totalSavings = savingsAmount;
    const series = [];

    let toAge = retirementAge

    if ( modelDrawdown ) {
      toAge = 95
    }

    for (let i = age; i <= toAge; i++) {

      let year = i - age

      // Store in series
      series[i - age] = totalInvestments+totalSavings;

      if ( series[i - age] < 0 )
        break

      // Apply interest / growth
      let p = historicGrowthRates[historicYear+year]

      if ( investmentPercentage >= 0 ) {
        p = investmentPercentage;
      }

      totalInvestments = totalInvestments * (1 + (p / 100));
      totalSavings = totalSavings * (1 + (savingsPercentage / 100));
      
      // Add investment
      if ( year < investmentYears ) {
        totalInvestments = totalInvestments + investment
      }
      // Add savings
      if ( year < savingsYears ) {
        totalSavings = totalSavings + savings
      }

      
      let drawdown = 0;

      if ( i >= retirementAge ) {
        if ( i < 75 ) {
          drawdown = model.annualDrawdownUnder75
        } else {
          drawdown = model.annualDrawdown75orOver
        }
      }

      if ( i >= 67 ) {
        drawdown = drawdown - model.statePension
      }

      totalInvestments = totalInvestments - drawdown
      
      // Set the label to the right age
      labels[i - age] = i;
    }

    results.push(series);
  }

  return { datasets: results, labels };
}

export function getSuccessPercentage() {
  return 100 * successCases.length / (successCases.length+failureCases.length) 
}

export function getChartDatasets(age, retirementAge, amount, percentage) {
  const { datasets, labels, colours } = getDatasets(age, retirementAge, amount, percentage);

  failureCases.length = 0
  successCases.length = 0

  // Compute final values of each dataset
  const finalValues = datasets.map(d => d[d.length - 1]);

  // Compute median
  const sorted = [...finalValues].sort((a, b) => a - b);
  const n = sorted.length;

  const c25 = Math.floor(n * 0.25);
  const c50 = Math.ceil(n * 0.50);
  const c75 = Math.floor(n * 0.75);

  const c25v = sorted[c25];
  const c50v = sorted[c50];
  const c75v = sorted[c75];

  // Build chart datasets
  const chartDatasets = datasets.map((data, index) => {
    const finalValue = data[data.length - 1];
    let borderColor;
    let borderWidth = 1;

    if (finalValue < c25v ) {
      borderColor = "#66666633"; // 25%
    } else if ( finalValue > c75v ) {
      borderColor = "#66666633"; // 75%
    } else if ( finalValue < c50v ) {
      borderColor = "#666666AA"; // 25-50
    } else if ( finalValue > c50v ) {
      borderColor = "#666666AA"; // 25-50
    } else {
      borderColor = "#000000FF"; // 50
      borderWidth = 2
    }

   borderColor = finalValue < 0 ? "#ff0000aa" : borderColor;

   if ( finalValue < 0 ) {
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

