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
    investmentUi: investment,
    othersBase: scenario.employment.base.noVulnerable,
    womenBase: scenario.employment.base.women,
    youthBase: scenario.employment.base.youth,
    disabilityBase: scenario.employment.base.disability,
    dinaliBase: scenario.employment.base.dinali,
    tusTransBase: scenario.employment.base.tus,
    othersIncrease: scenario.employment.inc.noVulnerable,
    womenIncrease: scenario.employment.inc.women,
    youthIncrease: scenario.employment.inc.youth,
    disabilityIncrease: scenario.employment.inc.disability,
    dinaliIncrease: scenario.employment.inc.dinali,
    tusTransIncrease: scenario.employment.inc.tus,
  };

  const exportsInputs = {
    evaluatingMinistry: scenario.project.ministry,
    isNewCompany: scenario.company.isNew ? 'si' : 'no',
    currentExports: scenario.exports.miemInitial ?? scenario.exports.mgapInitial ?? 0,
    exportIncrease: scenario.exports.miemIncrease ?? scenario.exports.mgapIncrease ?? 0,
    totalInvestment: investment,
    mgapExportItems: scenario.exports.mgapItems ?? [],
    minturInitial: scenario.exports.minturInitial ?? 0,
    minturIncrease: scenario.exports.minturIncrease ?? 0,
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
  });
  const years = computeIraeYears({
    investmentTotal: investment,
    weightedScore: total,
    coreScoreSum,
    firmSize,
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
