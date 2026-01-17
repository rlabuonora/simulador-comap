import { WEIGHTS } from '../../src/utils/constants.js';
import {
  classifyCompany,
  computeIraePct,
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from '../../src/utils/scoring.js';

export const baselineFixture = {
  company: {
    annualBillingUi: 22000000,
    employees: 30,
    sector: 'turismo',
    isNew: false,
  },
  project: {
    ministry: 'mintur',
    machineryUi: 2000000,
    installationsUi: 1500000,
    civilWorksUi: 500000,
    industrialParkUi: 0,
  },
  employment: {
    base: {
      noVulnerable: 0,
      women: 0,
      youth: 0,
      disability: 0,
      dinali: 0,
      tus: 0,
    },
    inc: {
      noVulnerable: 0,
      women: 1,
      youth: 1,
      disability: 1,
      dinali: 1,
      tus: 0,
    },
  },
  exports: {
    currentExports: 2000000,
    exportIncrease: 0,
    indirectExports: [{ pct: 100, increase: 100000 }],
  },
  decentralization: {
    rocha: 4000000,
  },
  sustainability: {
    amountUi: 800000,
    certification: 'none',
  },
  iplus: {
    amountUi: 2000000,
    category: 'id',
  },
  strategic: {
    line: 'infraestructura-turistica',
    investmentUi: 160000,
    tourismZone: true,
    priorities: 2,
  },
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const deepMerge = (base, override) => {
  if (override === undefined) {
    return base;
  }
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override;
  }

  const merged = { ...base };
  Object.keys(override).forEach((key) => {
    merged[key] = deepMerge(base[key], override[key]);
  });
  return merged;
};

export const withMutation = (mutation) => deepMerge(baselineFixture, mutation);

export const calculateScores = (fixture) => {
  const totalInvestment =
    fixture.project.machineryUi +
    fixture.project.installationsUi +
    fixture.project.civilWorksUi +
    fixture.project.industrialParkUi;

  const employmentInputs = {
    investmentUi: totalInvestment,
    othersBase: fixture.employment.base.noVulnerable,
    womenBase: fixture.employment.base.women,
    youthBase: fixture.employment.base.youth,
    disabilityBase: fixture.employment.base.disability,
    dinaliBase: fixture.employment.base.dinali,
    tusTransBase: fixture.employment.base.tus,
    protectedProgramBase: fixture.employment.base.protectedProgram ?? 0,
    othersIncrease: fixture.employment.inc.noVulnerable,
    womenIncrease: fixture.employment.inc.women,
    youthIncrease: fixture.employment.inc.youth,
    disabilityIncrease: fixture.employment.inc.disability,
    dinaliIncrease: fixture.employment.inc.dinali,
    tusTransIncrease: fixture.employment.inc.tus,
    protectedProgramIncrease: fixture.employment.inc.protectedProgram ?? 0,
  };

  const exportInputs = {
    evaluatingMinistry: fixture.project.ministry,
    isNewCompany: fixture.company.isNew ? 'si' : 'no',
    currentExports: fixture.exports.currentExports ?? 0,
    exportIncrease: fixture.exports.exportIncrease ?? 0,
    totalInvestment,
    indirectExports: fixture.exports.indirectExports ?? [],
  };

  const deptAllocations = Object.entries(fixture.decentralization)
    .filter(([, amount]) => amount > 0)
    .map(([id, amount]) => ({ id, amount }));

  const decentralizationInputs = {
    investment: totalInvestment,
    deptAllocations,
  };

  const sustainabilityInputs = {
    investment: totalInvestment,
    sustainabilityAmount: fixture.sustainability.amountUi,
    certification: fixture.sustainability.certification,
  };

  const iPlusInputs = {
    investment: totalInvestment,
    iPlusPct: fixture.iplus.amountUi,
    iPlusCategory: fixture.iplus.category,
  };

  const strategicInputs = {
    strategicPriorities: fixture.strategic.priorities,
    evaluatingMinistry: fixture.project?.ministry ?? '',
    minturStrategicFlag: fixture.strategic.minturFlag ?? 'no',
    minturInvestmentZoneUi: fixture.strategic.minturInvestmentZoneUi ?? 0,
    minturInvestmentOutsideUi: fixture.strategic.minturInvestmentOutsideUi ?? 0,
  };

  const scores = {
    employment: scoreEmployment(employmentInputs),
    exports: scoreExports(exportInputs),
    decentralization: scoreDecentralization(decentralizationInputs),
    sustainability: scoreSustainability(sustainabilityInputs),
    iPlus: scoreIPlus(iPlusInputs),
    strategic: scoreStrategic(strategicInputs),
  };

  const totalScore = finalScore(scores);
  const firmSize = classifyCompany(
    fixture.company?.annualBillingUi ?? 0,
    fixture.company?.employees ?? 0
  );
  const coreScoreSum = Object.entries(scores).reduce((sum, [key, value]) => {
    if (key === 'decentralization') {
      return sum;
    }
    return sum + (value ?? 0) * WEIGHTS[key];
  }, 0);
  const irae = computeIraePct(totalScore, {
    scores,
    investmentTotal: totalInvestment,
    filedDate: fixture.project?.filedDate,
    firmSize,
    coreScoreSum,
  });

  return {
    scores,
    totalScore,
    irae,
    totalInvestment,
  };
};

export const assertGlobalInvariants = (expect, scores, totalScore, irae) => {
  Object.values(scores).forEach((value) => {
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(10);
  });

  expect(Number.isFinite(totalScore)).toBe(true);
  expect(totalScore).toBeGreaterThanOrEqual(0);
  expect(totalScore).toBeLessThanOrEqual(10);

  expect(Number.isFinite(irae)).toBe(true);
  expect(irae).toBeGreaterThanOrEqual(0);
  expect(irae).toBeLessThanOrEqual(1);
};
