
/**
 * @typedef {Object} Model
 * @property {number} age
 * @property {number} spouse
 * @property {number} spouseAge
 * @property {number} projectToAge
 * @property {number} retirementAge
 * @property {number} annualDrawdownUnder75
 * @property {number} annualDrawdown75to89
 * @property {number} annualDrawdown90Plus
 * @property {number} spouseStatePension
 * @property {number} spouseStatePensionAge
 * @property {number} statePension
 * @property {number} statePensionAge
 * @property {boolean} modelDrawdown
 * @property {boolean} historicSimulation
 * @property {number} definedBenefitPension
 * @property {number} definedBenefitPensionAge
 * @property {number} spouseDefinedBenefitPension
 * @property {number} spouseDefinedBenefitPensionAge
 * @property {number} investmentPercentage
 * @property {number} savingsPercentage
 * @property {number} cashTotal
 * @property {number} cashAnnualSavings
 * @property {number} cashAnnualIncrease
 * @property {number} cashYears
 *
 * @property {number} pensionTotal
 * @property {number} pensionAnnualSavings
 * @property {number} pensionAnnualIncrease
 * @property {number} pensionYears
 *
 * @property {number} isaTotal
 * @property {number} isaAnnualSavings
 * @property {number} isaAnnualIncrease
 * @property {number} isaYears
 *
 * @property {number} giaTotal
 * @property {number} giaAnnualSavings
 * @property {number} giaAnnualIncrease
 * @property {number} giaYears
 *
 * @property {number} spouseCashTotal
 * @property {number} spouseCashAnnualSavings
 * @property {number} spouseCashAnnualIncrease
 * @property {number} spouseCashYears
 *
 * @property {number} spousePensionTotal
 * @property {number} spousePensionAnnualSavings
 * @property {number} spousePensionAnnualIncrease
 * @property {number} spousePensionYears
 *
 * @property {number} spouseIsaTotal
 * @property {number} spouseIsaAnnualSavings
 * @property {number} spouseIsaAnnualIncrease
 * @property {number} spouseIsaYears
 *
 * @property {number} spouseGiaTotal
 * @property {number} spouseGiaAnnualSavings
 * @property {number} spouseGiaAnnualIncrease
 * @property {number} spouseGiaYears
 * @property {string} simulationType
 * @property {number} deathAge
 * @property {number} spouseDeathAge
 */


/** @type {Model} */
export const model = {
  age: 0,
  spouse: false,
  spouseAge: 0,
  projectToAge: 0,
  retirementAge: 0,
  annualDrawdownUnder75: 0,
  annualDrawdown75to89: 0,
  annualDrawdown90Plus: 0,
  statePension: 0,
  statePensionAge: 0,
  spouseStatePension: 0,
  spouseStatePensionAge: 0,
  modelDrawdown: false,
  // historicSimulation: false,
  simulationType: 'constant', // 'historic', 'historicUS', or 'flat'
  definedBenefitPension: 0,
  definedBenefitPensionAge: 0,
  spouseDefinedBenefitPension: 0,
  spouseDefinedBenefitPensionAge: 0,  

  investmentPercentage: 0,
  savingsPercentage: 0,

  cashTotal: 0,
  cashAnnualSavings: 0,
  cashAnnualIncrease: 0,
  cashYears: 0,

  pensionTotal: 0,
  pensionAnnualSavings: 0,
  pensionAnnualIncrease: 0,
  pensionYears: 0,
  pensionAccessAge: 0,

  isaTotal: 0,
  isaAnnualSavings: 0,
  isaAnnualIncrease: 0,
  isaYears: 0,

  giaTotal: 0,
  giaAnnualSavings: 0,
  giaAnnualIncrease: 0,
  giaYears: 0,

  spouseCashTotal: 0,
  spouseCashAnnualSavings: 0,
  spouseCashAnnualIncrease: 0,
  spouseCashYears: 0,

  spousePensionTotal: 0,
  spousePensionAnnualSavings: 0,
  spousePensionAnnualIncrease: 0,
  spousePensionYears: 0,
  spousePensionAccessAge: 0,

  spouseIsaTotal: 0,
  spouseIsaAnnualSavings: 0,
  spouseIsaAnnualIncrease: 0,
  spouseIsaYears: 0,

  spouseGiaTotal: 0,
  spouseGiaAnnualSavings: 0,
  spouseGiaAnnualIncrease: 0,
  spouseGiaYears: 0,

  deathAge: 96,
  spouseDeathAge: 96
};


