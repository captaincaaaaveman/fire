
/**
 * @typedef {Object} Model
 * @property {number} age
 * @property {number} spouse
 * @property {number} spouseAge
 * @property {number} projectToAge
 * @property {number} retirementAge
 * @property {number} annualDrawdownUnder75
 * @property {number} annualDrawdown75orOver
 * @property {number} spouseStatePensionInput
 * @property {number} spouseStatePensionAgeInput
 * @property {number} statePensionInput
 * @property {number} statePensionAgeInput
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
 */


/** @type {Model} */
export const model = {
  age: 0,
  spouse: false,
  spouseAge: 0,
  projectToAge: 0,
  retirementAge: 0,
  annualDrawdownUnder75: 0,
  annualDrawdown75orOver: 0,
  statePensionInput: 0,
  statePensionAgeInput: 0,
  modelDrawdown: false,
  historicSimulation: false,
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
  spouseGiaYears: 0
};


