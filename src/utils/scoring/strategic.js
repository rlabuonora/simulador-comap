import { clamp } from './helpers.js';

const roundTo2 = (value) => Math.round(value * 100) / 100;

const scoreNationalComponent = ({
  machineryUi = 0,
  nationalGoodsTotalUi = 0,
  nationalGoodsUi = 0,
  civilWorksMaterialsUi = 0,
  nationalCivilWorksUi = 0,
}) => {
  const myeTotalRaw = Math.max(nationalGoodsTotalUi, 0);
  const myeTotal = myeTotalRaw > 0 ? myeTotalRaw : Math.max(machineryUi, 0);
  const mocTotal = Math.max(civilWorksMaterialsUi, 0);
  const myeNational = Math.min(Math.max(nationalGoodsUi, 0), myeTotal);
  const mocNational = Math.min(Math.max(nationalCivilWorksUi, 0), mocTotal);

  if (
    myeTotal < 0 ||
    mocTotal < 0 ||
    myeNational < 0 ||
    mocNational < 0 ||
    myeNational > myeTotal ||
    mocNational > mocTotal
  ) {
    return 0;
  }

  if (myeTotal + mocTotal === 0) {
    return 0;
  }

  let ime = 0;
  if (myeTotal > 0) {
    const share = myeNational / myeTotal;
    if (share > 0.12) {
      ime = 10;
    } else if (share > 0.08) {
      ime = 7;
    } else if (share > 0.025) {
      ime = 5;
    }
  }

  let imoc = 0;
  if (mocTotal > 0) {
    const share = mocNational / mocTotal;
    if (share > 0.55) {
      imoc = 10;
    } else if (share > 0.35) {
      imoc = 7;
    } else if (share > 0.15) {
      imoc = 5;
    }
  }

  if (myeTotal === 0) {
    return imoc;
  }
  if (mocTotal === 0) {
    return ime;
  }

  const total = myeTotal + mocTotal;
  return ime * (myeTotal / total) + imoc * (mocTotal / total);
};

const scoreVan = ({ level, investmentTotal, invVan }) => {
  if (investmentTotal <= 0) {
    return 0;
  }
  if (invVan < 0 || invVan > investmentTotal) {
    return 0;
  }

  const maxPointsByLevel = {
    minima: 3,
    intermedia: 5,
    maxima: 10,
  };
  const maxPoints = maxPointsByLevel[level];
  if (!maxPoints) {
    return 0;
  }

  const share = invVan / investmentTotal;
  const factor = Math.min(share / 0.5, 1);
  return maxPoints * factor;
};

const MIEM_INDICATOR_KEYS = [
  { flag: 'miemEnergyFlag', amount: 'miemEnergyInvestmentUi' },
  { flag: 'miemHydrogenFlag', amount: 'miemHydrogenInvestmentUi' },
  { flag: 'miemBioFlag', amount: 'miemBioInvestmentUi' },
  { flag: 'miemPharmaFlag', amount: 'miemPharmaInvestmentUi' },
  { flag: 'miemAerospaceFlag', amount: 'miemAerospaceInvestmentUi' },
  { flag: 'miemSatellitesFlag', amount: 'miemSatellitesInvestmentUi' },
];

const scoreTransformInvestments = ({
  investmentTotal,
  minUi = 0,
  medUi = 0,
  maxUi = 0,
}) => {
  if (investmentTotal <= 0) {
    return 0;
  }

  const calc = (amount, maxPoints) => {
    const investment = Math.max(amount ?? 0, 0);
    const share = investment / investmentTotal;
    const factor = Math.min(share / 0.5, 1);
    return factor * maxPoints;
  };

  const total = calc(minUi, 3) + calc(medUi, 5) + calc(maxUi, 10);
  return Math.min(total, 10);
};

const scoreMiemIndicators = ({ investmentTotal, values }) => {
  if (investmentTotal <= 0) {
    return 0;
  }

  const sum = MIEM_INDICATOR_KEYS.reduce((acc, { flag, amount }) => {
    if (values[flag] !== 'si') {
      return acc;
    }
    const investment = Math.max(values[amount] ?? 0, 0);
    const share = investment / investmentTotal;
    const factor = Math.min(share / 0.5, 1);
    return acc + factor * 10;
  }, 0);

  return Math.min(sum, 10);
};

const scoreMinturStrategic = ({
  investmentTotal,
  enabled,
  investmentZoneUi = 0,
  investmentOutsideUi = 0,
}) => {
  if (!enabled) {
    return 0;
  }
  if (investmentTotal <= 0) {
    return 0;
  }

  const invTurismo = 1.2 * Math.max(investmentZoneUi, 0) + Math.max(investmentOutsideUi, 0);
  if (invTurismo < 0 || invTurismo > investmentTotal) {
    return 0;
  }

  const share = invTurismo / investmentTotal;
  const factor = Math.min(share / 0.5, 1);
  return factor * 10;
};

const scoreMgapInvestment = ({ investmentTotal, enabled, investmentUi = 0 }) => {
  if (!enabled) {
    return 0;
  }
  if (investmentTotal <= 0) {
    return 0;
  }
  if (investmentUi < 0 || investmentUi > investmentTotal) {
    return 0;
  }

  const share = investmentUi / investmentTotal;
  const factor = Math.min(share / 0.5, 1);
  return factor * 10;
};

export function scoreStrategic({
  strategicPriorities = 0,
  investment = 0,
  evaluatingMinistry = '',
  machineryUi = 0,
  nationalGoodsTotalUi = 0,
  nationalGoodsUi = 0,
  civilWorksMaterialsUi = 0,
  nationalCivilWorksUi = 0,
  mineralProcessingLevel = '',
  mineralEligibleInvestmentUi = 0,
  mineralTransformFlag = 'no',
  mineralTransformMinUi = 0,
  mineralTransformMedUi = 0,
  mineralTransformMaxUi = 0,
  mgapRiegoFlag = 'no',
  mgapRiegoInvestmentUi = 0,
  mgapNaturalFieldFlag = 'no',
  mgapPescaFlag = 'no',
  mgapPescaInvestmentUi = 0,
  minturStrategicFlag = 'no',
  minturInvestmentZoneUi = 0,
  minturInvestmentOutsideUi = 0,
  miemEnergyFlag = 'no',
  miemEnergyInvestmentUi = 0,
  miemHydrogenFlag = 'no',
  miemHydrogenInvestmentUi = 0,
  miemWasteFlag = 'no',
  miemWasteTransformMinUi = 0,
  miemWasteTransformMedUi = 0,
  miemWasteTransformMaxUi = 0,
  miemBioFlag = 'no',
  miemBioInvestmentUi = 0,
  miemPharmaFlag = 'no',
  miemPharmaInvestmentUi = 0,
  miemAerospaceFlag = 'no',
  miemAerospaceInvestmentUi = 0,
  miemSatellitesFlag = 'no',
  miemSatellitesInvestmentUi = 0,
}) {
  if (evaluatingMinistry === 'miem') {
    const miemScore = scoreMiemIndicators({
      investmentTotal: investment,
      values: {
        miemEnergyFlag,
        miemEnergyInvestmentUi,
        miemHydrogenFlag,
        miemHydrogenInvestmentUi,
        miemBioFlag,
        miemBioInvestmentUi,
        miemPharmaFlag,
        miemPharmaInvestmentUi,
        miemAerospaceFlag,
        miemAerospaceInvestmentUi,
        miemSatellitesFlag,
        miemSatellitesInvestmentUi,
      },
    });
    const miemWasteScore =
      miemWasteFlag === 'si'
        ? scoreTransformInvestments({
            investmentTotal: investment,
            minUi: miemWasteTransformMinUi,
            medUi: miemWasteTransformMedUi,
            maxUi: miemWasteTransformMaxUi,
          })
        : 0;
    return roundTo2(Math.min(miemScore + miemWasteScore, 10));
  }

  if (evaluatingMinistry === 'mgap') {
    const riegoScore = scoreMgapInvestment({
      investmentTotal: investment,
      enabled: mgapRiegoFlag === 'si',
      investmentUi: mgapRiegoInvestmentUi,
    });
    const pescaScore = scoreMgapInvestment({
      investmentTotal: investment,
      enabled: mgapPescaFlag === 'si',
      investmentUi: mgapPescaInvestmentUi,
    });
    const naturalFieldBonus = mgapNaturalFieldFlag === 'si' ? 1 : 0;
    return roundTo2(Math.min(riegoScore + pescaScore + naturalFieldBonus, 10));
  }

  if (evaluatingMinistry === 'mintur') {
    const minturScore = scoreMinturStrategic({
      investmentTotal: investment,
      enabled: minturStrategicFlag === 'si',
      investmentZoneUi: minturInvestmentZoneUi,
      investmentOutsideUi: minturInvestmentOutsideUi,
    });
    return roundTo2(minturScore);
  }

  const baseScore = clamp(strategicPriorities * 3.5);
  const cinScore = scoreNationalComponent({
    machineryUi,
    nationalGoodsTotalUi,
    nationalGoodsUi,
    civilWorksMaterialsUi,
    nationalCivilWorksUi,
  });
  const mineralTransformScore =
    mineralTransformFlag === 'si'
      ? scoreTransformInvestments({
          investmentTotal: investment,
          minUi: mineralTransformMinUi,
          medUi: mineralTransformMedUi,
          maxUi: mineralTransformMaxUi,
        })
      : scoreVan({
          level: mineralProcessingLevel,
          investmentTotal: investment,
          invVan: mineralEligibleInvestmentUi,
        });
  const total = Math.min(baseScore + cinScore + mineralTransformScore, 10);
  return roundTo2(total);
}
