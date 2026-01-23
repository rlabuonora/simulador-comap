import { WEIGHTS } from '../../src/utils/constants.js';
import {
  classifyCompany,
  computeIraePct,
  computeIraeYears,
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from '../../src/utils/scoring.js';

const safeCategory = (value) => (value === 'none' ? undefined : value);

export const computeScenario = (scenario) => {
  const investment =
    scenario.project.machineryUi +
    scenario.project.installationsUi +
    scenario.project.civilWorksUi +
    (scenario.project.industrialParkUi ?? 0);

  const employmentInputs = {
    totalPersonnelIncrease: scenario.employment.inc.total ?? 0,
    othersIncrease: scenario.employment.inc.others ?? 0,
    womenIncrease: scenario.employment.inc.women ?? 0,
    youthIncrease: scenario.employment.inc.youth ?? 0,
    disabilityIncrease: scenario.employment.inc.disability ?? 0,
  };

  const exportsInputs = {
    evaluatingMinistry: scenario.project.ministry,
    isNewCompany: scenario.company.isNew ? 'si' : 'no',
    currentExports: scenario.exports.currentExports ?? 0,
    exportIncrease: scenario.exports.exportIncrease ?? 0,
    totalInvestment: investment,
    indirectExports: scenario.exports.indirectExports ?? [],
  };

  const deptAllocations = Object.entries(scenario.decentralization)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }));

  const decentralizationInputs = {
    investment,
    deptAllocations,
  };

  const sustainabilityInputs = {
    investment,
    sustainabilityAmount: scenario.sustainability.amountUi,
    certification: scenario.sustainability.certification,
  };

  const iPlusInputs = {
    investment,
    iPlusPct: scenario.iplus.amountUi,
    iPlusCategory: safeCategory(scenario.iplus.category),
  };

  const strategicInputs = {
    strategicPriorities: scenario.strategic.priorities ?? 0,
    evaluatingMinistry: scenario.project?.ministry ?? '',
    mgapRiegoFlag: scenario.strategic?.mgapRiegoFlag ?? 'no',
    mgapRiegoInvestmentUi: scenario.strategic?.mgapRiegoInvestmentUi ?? 0,
    minturStrategicFlag: scenario.strategic?.minturFlag ?? 'no',
    minturInvestmentZoneUi: scenario.strategic?.minturInvestmentZoneUi ?? 0,
    minturInvestmentOutsideUi: scenario.strategic?.minturInvestmentOutsideUi ?? 0,
  };

  const scores = {
    employment: scoreEmployment(employmentInputs),
    exports: scoreExports(exportsInputs),
    decentralization: scoreDecentralization(decentralizationInputs),
    sustainability: scoreSustainability(sustainabilityInputs),
    iPlus: scoreIPlus(iPlusInputs),
    strategic: scoreStrategic(strategicInputs),
  };

  const total = finalScore(scores);
  const coreScoreSum = Object.entries(scores).reduce((sum, [key, value]) => {
    if (key === 'decentralization') {
      return sum;
    }
    return sum + (value ?? 0) * WEIGHTS[key];
  }, 0);
  const firmSize = classifyCompany(
    scenario.company?.annualBillingUi ?? 0,
    scenario.company?.employees ?? 0
  );
  const irae = computeIraePct(total, {
    scores,
    investmentTotal: investment,
    filedDate: scenario.project.filedDate,
    firmSize,
    coreScoreSum,
    industrialParkUser: scenario.company?.isIndustrialParkUser,
    industrialParkActivity: scenario.company?.industrialParkActivity,
    industrialParkInvestment: scenario.project?.industrialParkUi ?? 0,
    employees: scenario.company?.employees,
  });
  const years = computeIraeYears({
    investmentTotal: investment,
    weightedScore: total,
    coreScoreSum,
    firmSize,
    industrialParkUser: scenario.company?.isIndustrialParkUser,
    industrialParkActivity: scenario.company?.industrialParkActivity,
    industrialParkInvestment: scenario.project?.industrialParkUi ?? 0,
    employees: scenario.company?.employees,
  });

  return {
    scores,
    total,
    irae,
    years,
  };
};

export const computeCoreScoreSum = (scores) => {
  return Object.entries(scores).reduce((sum, [key, value]) => {
    if (key === 'decentralization') {
      return sum;
    }
    return sum + (value ?? 0) * WEIGHTS[key];
  }, 0);
};
