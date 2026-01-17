import { useEffect, useMemo, useRef, useState } from 'react';
import SummaryChart from './components/SummaryChart.jsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
} from './utils/scoring.js';
import { DEPARTMENT_SCORES } from './utils/scoring.js';
import { INDICATORS, WEIGHTS } from './utils/constants.js';

const departments = [
  { id: 'artigas', label: 'Artigas' },
  { id: 'canelones', label: 'Canelones' },
  { id: 'cerroLargo', label: 'Cerro Largo' },
  { id: 'colonia', label: 'Colonia' },
  { id: 'durazno', label: 'Durazno' },
  { id: 'flores', label: 'Flores' },
  { id: 'florida', label: 'Florida' },
  { id: 'lavalleja', label: 'Lavalleja' },
  { id: 'maldonado', label: 'Maldonado' },
  { id: 'montevideo', label: 'Montevideo' },
  { id: 'paysandu', label: 'Paysandu' },
  { id: 'rioNegro', label: 'Rio Negro' },
  { id: 'rivera', label: 'Rivera' },
  { id: 'rocha', label: 'Rocha' },
  { id: 'salto', label: 'Salto' },
  { id: 'sanJose', label: 'San Jose' },
  { id: 'soriano', label: 'Soriano' },
  { id: 'tacuarembo', label: 'Tacuarembo' },
  { id: 'treintaYTres', label: 'Treinta y Tres' },
];

const MGAP_EXPORT_OPTIONS = [
  { id: 'semillas', label: 'Semillas', pct: 75 },
  { id: 'agricultura', label: 'Agricultura (cultivos de invierno y verano; no arroz)', pct: 92 },
  { id: 'arroz', label: 'Arroz', pct: 91 },
  {
    id: 'legumbres-raices',
    label:
      'Legumbres; raíces y tubérculos comestibles ricos en almidón o inulina, vegetales leguminosos secos',
    pct: 0,
  },
  { id: 'frutas-nueces', label: 'Frutas y nueces', pct: 20 },
  { id: 'azucar', label: 'Cosecha de azúcar', pct: 0 },
  {
    id: 'forraje-fibras',
    label:
      'Productos de forraje, fibras, plantas vivas, flores y capullos de flores, tabaco en rama, y caucho natural',
    pct: 2,
  },
  { id: 'ganaderia', label: 'Ganadería vacuna o ovina', pct: 75 },
  {
    id: 'porcino-aves',
    label: 'Ganado Porcino, aves de corral; huevos frescos de gallina o de otras aves con cáscara',
    pct: 0,
  },
  { id: 'cueros', label: 'Cueros, pieles, pieles finas, sin curtir', pct: 14 },
  {
    id: 'pescado',
    label: 'Pescado, crustáceos, moluscos u otros invertebrados acuáticos',
    pct: 86,
  },
  {
    id: 'vegetales-preparados',
    label:
      'Vegetales, legumbres y papas preparados o conservados; frutas y nueces preparadas o en conserva',
    pct: 7,
  },
  { id: 'lacteos', label: 'Productos lácteos', pct: 63 },
  {
    id: 'madera',
    label: 'Productos de madera, corcho, paja y materiales tranzables',
    pct: 92,
  },
];

const MIEM_STRATEGIC_INDICATORS = [
  {
    id: 'miemEnergy',
    label: 'Eficiencia energética y desfosilización',
  },
  {
    id: 'miemHydrogen',
    label: 'Cadena de valor del hidrógeno verde y derivados',
  },
  {
    id: 'miemWaste',
    label: 'Valorización de residuos y reciclaje',
  },
  {
    id: 'miemBio',
    label: 'Producción de bioinsumos',
  },
  {
    id: 'miemPharma',
    label: 'Industria farmacéutica y ciencias de la vida',
  },
  {
    id: 'miemAerospace',
    label: 'Cadena industrial aeroespacial',
  },
  {
    id: 'miemSatellites',
    label: 'Plataformas satelitales',
  },
].map((item) => ({
  ...item,
  flagKey: `${item.id}Flag`,
  amountKey: `${item.id}InvestmentUi`,
}));

const defaultInputs = {
  investment: 0,
  employees: 0,
  annualBillingUi: 0,
  usdRate: 38.5,
  uiRate: 6.5,
  machineryUi: 0,
  civilWorksUi: 0,
  industrialParkInvestmentUi: 0,
    mefRenewableInvestmentUi: 0,
    occupiedPersonnel: 0,
    mineralEligibleInvestmentUi: 0,
  deptAllocations: [],
  exportPct: 35,
  sustainabilityAmount: 0,
  iPlusType: 'b',
  iPlusPct: 0,
  strategicPriorities: 0,
  regionTier: 'interior',
  sector: '',
  womenBase: 0,
  womenIncrease: 0,
  youthBase: 0,
  youthIncrease: 0,
  disabilityBase: 0,
  disabilityIncrease: 0,
  dinaliBase: 0,
  dinaliIncrease: 0,
  tusTransBase: 0,
  tusTransIncrease: 0,
  protectedProgramBase: 0,
  protectedProgramIncrease: 0,
  othersBase: 0,
  othersIncrease: 0,
  currentExports: 0,
  exportIncrease: 0,
  certification: 'none',
  iPlusCategory: 'at',
  ministry: '',
  evaluatingMinistry: '',
  filedDate: new Date().toISOString().slice(0, 10),
  strategicLine: '',
  strategicInvestmentPct: 0,
  isNewCompany: 'no',
  isIndustrialParkUser: 'no',
  industrialParkActivity: '',
  fieldNaturalPct: 0,
  tourismZoneLocation: '',
  mineralProcessingLevel: '',
  minturStrategicFlag: 'no',
  minturInvestmentZoneUi: 0,
  minturInvestmentOutsideUi: 0,
  miemEnergyFlag: 'no',
  miemEnergyInvestmentUi: 0,
  miemHydrogenFlag: 'no',
  miemHydrogenInvestmentUi: 0,
  miemWasteFlag: 'no',
  miemWasteInvestmentUi: 0,
  miemBioFlag: 'no',
  miemBioInvestmentUi: 0,
  miemPharmaFlag: 'no',
  miemPharmaInvestmentUi: 0,
  miemAerospaceFlag: 'no',
  miemAerospaceInvestmentUi: 0,
  miemSatellitesFlag: 'no',
  miemSatellitesInvestmentUi: 0,
  nationalComponent: 'no',
  nationalGoodsUi: 0,
  nationalGoodsTotalUi: 0,
  nationalCivilWorksUi: 0,
  civilWorksMaterialsUi: 0,
};


const getDecimalPlaces = (rawValue) => {
  const match = String(rawValue ?? '').trim().match(/[.,](\d+)$/);
  return match ? Math.min(match[1].length, 2) : 0;
};

const parseNumericValue = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }

  const normalized = raw.replace(/\s/g, '');
  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  const decimalIndex = Math.max(lastComma, lastDot);

  let numberString = normalized;
  if (decimalIndex >= 0) {
    const integerPart = normalized.slice(0, decimalIndex).replace(/[.,]/g, '');
    const decimalPart = normalized.slice(decimalIndex + 1).replace(/[.,]/g, '');
    numberString = `${integerPart}.${decimalPart}`;
  } else {
    numberString = normalized.replace(/[.,]/g, '');
  }

  if (lastComma === -1 && lastDot > -1 && normalized.match(/\.\d{3}$/)) {
    numberString = normalized.replace(/[.,]/g, '');
  }

  const parsed = Number(numberString);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatNumberForDisplay = (value, minFractionDigits = 0) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
};

const buildNumericValues = (source) => {
  const base = {
    investment: source.investment ? String(source.investment) : '',
    employees: source.employees ? String(source.employees) : '',
    annualBillingUi: source.annualBillingUi ? String(source.annualBillingUi) : '',
    usdRate: source.usdRate === 0 ? '0' : String(source.usdRate ?? ''),
    uiRate: source.uiRate === 0 ? '0' : String(source.uiRate ?? ''),
    machineryUi: source.machineryUi === 0 ? '0' : String(source.machineryUi ?? ''),
    civilWorksUi: source.civilWorksUi === 0 ? '0' : String(source.civilWorksUi ?? ''),
    industrialParkInvestmentUi:
      source.industrialParkInvestmentUi === 0
        ? '0'
        : String(source.industrialParkInvestmentUi ?? ''),
    mefRenewableInvestmentUi:
      source.mefRenewableInvestmentUi === 0 ? '0' : String(source.mefRenewableInvestmentUi ?? ''),
    occupiedPersonnel:
      source.occupiedPersonnel === 0 ? '0' : String(source.occupiedPersonnel ?? ''),
    mineralEligibleInvestmentUi:
      source.mineralEligibleInvestmentUi === 0
        ? '0'
        : String(source.mineralEligibleInvestmentUi ?? ''),
    minturInvestmentZoneUi:
      source.minturInvestmentZoneUi === 0 ? '0' : String(source.minturInvestmentZoneUi ?? ''),
    minturInvestmentOutsideUi:
      source.minturInvestmentOutsideUi === 0 ? '0' : String(source.minturInvestmentOutsideUi ?? ''),
    womenBase: String(source.womenBase ?? ''),
    womenIncrease: String(source.womenIncrease ?? ''),
    youthBase: String(source.youthBase ?? ''),
    youthIncrease: String(source.youthIncrease ?? ''),
    disabilityBase: String(source.disabilityBase ?? ''),
    disabilityIncrease: String(source.disabilityIncrease ?? ''),
    dinaliBase: String(source.dinaliBase ?? ''),
    dinaliIncrease: String(source.dinaliIncrease ?? ''),
    tusTransBase: String(source.tusTransBase ?? ''),
    tusTransIncrease: String(source.tusTransIncrease ?? ''),
    protectedProgramBase: String(source.protectedProgramBase ?? ''),
    protectedProgramIncrease: String(source.protectedProgramIncrease ?? ''),
    othersBase: String(source.othersBase ?? ''),
    othersIncrease: String(source.othersIncrease ?? ''),
    currentExports: String(source.currentExports ?? ''),
    exportIncrease: String(source.exportIncrease ?? ''),
    sustainabilityAmount:
      source.sustainabilityAmount === 0 ? '0' : String(source.sustainabilityAmount ?? ''),
    iPlusPct: source.iPlusPct === 0 ? '0' : String(source.iPlusPct ?? ''),
    strategicInvestmentPct:
      source.strategicInvestmentPct === 0 ? '0' : String(source.strategicInvestmentPct ?? ''),
    fieldNaturalPct: source.fieldNaturalPct === 0 ? '0' : String(source.fieldNaturalPct ?? ''),
    nationalGoodsUi: source.nationalGoodsUi === 0 ? '0' : String(source.nationalGoodsUi ?? ''),
    nationalGoodsTotalUi:
      source.nationalGoodsTotalUi === 0 ? '0' : String(source.nationalGoodsTotalUi ?? ''),
    nationalCivilWorksUi:
      source.nationalCivilWorksUi === 0 ? '0' : String(source.nationalCivilWorksUi ?? ''),
    civilWorksMaterialsUi:
      source.civilWorksMaterialsUi === 0 ? '0' : String(source.civilWorksMaterialsUi ?? ''),
    miemEnergyInvestmentUi:
      source.miemEnergyInvestmentUi === 0 ? '0' : String(source.miemEnergyInvestmentUi ?? ''),
    miemHydrogenInvestmentUi:
      source.miemHydrogenInvestmentUi === 0 ? '0' : String(source.miemHydrogenInvestmentUi ?? ''),
    miemWasteInvestmentUi:
      source.miemWasteInvestmentUi === 0 ? '0' : String(source.miemWasteInvestmentUi ?? ''),
    miemBioInvestmentUi:
      source.miemBioInvestmentUi === 0 ? '0' : String(source.miemBioInvestmentUi ?? ''),
    miemPharmaInvestmentUi:
      source.miemPharmaInvestmentUi === 0 ? '0' : String(source.miemPharmaInvestmentUi ?? ''),
    miemAerospaceInvestmentUi:
      source.miemAerospaceInvestmentUi === 0 ? '0' : String(source.miemAerospaceInvestmentUi ?? ''),
    miemSatellitesInvestmentUi:
      source.miemSatellitesInvestmentUi === 0 ? '0' : String(source.miemSatellitesInvestmentUi ?? ''),
  };

  departments.forEach((dept) => {
    const key = `${dept.id}Pct`;
    base[key] = String(source[key] ?? '');
  });

  Object.keys(base).forEach((key) => {
    const rawValue = base[key];
    if (rawValue === '') {
      return;
    }
    const parsed = parseNumericValue(rawValue);
    if (parsed !== null) {
      const decimals = getDecimalPlaces(rawValue);
      base[key] = formatNumberForDisplay(parsed, decimals);
    }
  });

  return base;
};

const ENABLE_VALIDATION = false;

const NumericField = ({
  label,
  labelTitle,
  name,
  placeholder,
  value,
  error,
  onChange,
  onBlur,
  className,
}) => {
  return (
    <div className={`field-group${className ? ` ${className}` : ''}`}>
      <label className="field-label" htmlFor={name} title={labelTitle}>
        {label}
      </label>
      <input
        id={name}
        className={`field-control${error ? ' error' : ''}`}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
      />
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
};

const ScoreBadge = ({ label, value }) => {
  return (
    <div className="score-pill">
      <span>{label}</span>
      <strong>{value.toFixed(2)}</strong>
    </div>
  );
};

const BASE_STEPS = [
  {
    id: 'empresa',
    label: 'Datos de la empresa',
    hint: 'Información general de la empresa solicitante.',
  },
  {
    id: 'proyecto',
    label: 'Datos del proyecto',
    hint: 'Información general del proyecto de inversión.',
  },
  {
    id: 'empleo',
    label: 'Generación de Empleo',
    hint: 'Completa la Información de colectivos para Generación de empleo.',
  },
  {
    id: 'exportaciones',
    label: 'Exportaciones',
    hint: 'Reporta el nivel actual y futuro de exportaciones del proyecto.',
  },
  {
    id: 'descentralizacion',
    label: 'Descentralización',
    hint: 'Distribuye el porcentaje de inversión por departamento.',
  },
  {
    id: 'impacto-ambiental',
    label: 'Sostenibilidad ambiental',
    hint: 'Datos de Sostenibilidad ambiental.',
  },
  {
    id: 'transformacion',
    label: 'Adecuación Tecnológica, Innovación, Investigación y Desarrollo',
    hint: 'Desarrollo tecnológico.',
  },
  {
    id: 'alineacion',
    label: 'Alineación estratégica',
    hint: 'Cómo tu proyecto encaja en prioridades país.',
  },
  {
    id: 'resultado',
    label: 'Resultado',
    hint: 'Este es el impacto estimado de tu proyecto.',
  },
];

export default function App() {
  const [inputs, setInputs] = useState(defaultInputs);
  const [numericValues, setNumericValues] = useState(() => buildNumericValues(defaultInputs));
  const [numericErrors, setNumericErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [deptSelection, setDeptSelection] = useState('');
  const [deptPctValue, setDeptPctValue] = useState('');
  const [deptAllocations, setDeptAllocations] = useState([]);
  const [allocationError, setAllocationError] = useState('');
  const [mgapExportSelection, setMgapExportSelection] = useState('');
  const [mgapExportInitial, setMgapExportInitial] = useState('');
  const [mgapExportIncrease, setMgapExportIncrease] = useState('');
  const [indirectExports, setIndirectExports] = useState([]);
  const [mgapExportError, setMgapExportError] = useState('');
  const pdfRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const steps = useMemo(() => {
    const nextSteps = [...BASE_STEPS];
    if (inputs.evaluatingMinistry === 'mef') {
      const resultIndex = nextSteps.findIndex((step) => step.id === 'resultado');
      const insertIndex = resultIndex === -1 ? nextSteps.length : resultIndex;
      nextSteps.splice(insertIndex, 0, {
        id: 'indicadores-mef',
        label: 'Indicadores sectoriales MEF',
        hint: 'Información específica para proyectos evaluados por MEF.',
      });
    }
    return nextSteps.map((step, index) => ({
      ...step,
      title: `Paso ${index + 1} - ${step.label}`,
    }));
  }, [inputs.evaluatingMinistry]);

  const stepIndexById = useMemo(() => {
    return steps.reduce((acc, step, index) => {
      acc[step.id] = index;
      return acc;
    }, {});
  }, [steps]);

  useEffect(() => {
    if (currentStep > steps.length - 1) {
      setCurrentStep(steps.length - 1);
    }
  }, [currentStep, steps.length]);

  useEffect(() => {
    setInputs((prev) => ({ ...prev, deptAllocations }));
  }, [deptAllocations]);


  const investmentTotal = useMemo(() => {
    const parseValue = (value) => parseNumericValue(value) ?? 0;
    return (
      parseValue(numericValues.machineryUi) + parseValue(numericValues.civilWorksUi)
    );
  }, [numericValues.civilWorksUi, numericValues.machineryUi]);

  const companyCategory = useMemo(() => {
    const revenue = parseNumericValue(numericValues.annualBillingUi) ?? 0;
    const employees = parseNumericValue(numericValues.employees) ?? 0;
    if (!revenue && !employees) {
      return '';
    }
    return classifyCompany(revenue, employees);
  }, [numericValues.annualBillingUi, numericValues.employees]);

  const scoringInputs = useMemo(() => {
    const merged = { ...inputs };
    Object.entries(numericValues).forEach(([key, value]) => {
      const parsed = parseNumericValue(value);
      if (parsed !== null) {
        merged[key] = parsed;
      }
    });
    if (investmentTotal > 0) {
      merged.investment = investmentTotal;
    }
    return merged;
  }, [inputs, investmentTotal, numericValues]);

  const indirectExportsForScore = useMemo(() => {
    if (inputs.evaluatingMinistry !== 'mintur') {
      return indirectExports;
    }
    const parsedIncrease = parseNumericValue(numericValues.exportIncrease);
    if (!parsedIncrease || parsedIncrease <= 0) {
      return [];
    }
    return [{ pct: 100, increase: parsedIncrease }];
  }, [indirectExports, inputs.evaluatingMinistry, numericValues.exportIncrease]);

  const scores = useMemo(() => {
    return {
      employment: scoreEmployment({
        investmentUi: investmentTotal,
        othersBase: parseNumericValue(numericValues.othersBase) ?? 0,
        womenBase: parseNumericValue(numericValues.womenBase) ?? 0,
        youthBase: parseNumericValue(numericValues.youthBase) ?? 0,
        disabilityBase: parseNumericValue(numericValues.disabilityBase) ?? 0,
        dinaliBase: parseNumericValue(numericValues.dinaliBase) ?? 0,
        tusTransBase: parseNumericValue(numericValues.tusTransBase) ?? 0,
        protectedProgramBase: parseNumericValue(numericValues.protectedProgramBase) ?? 0,
        othersIncrease: parseNumericValue(numericValues.othersIncrease) ?? 0,
        womenIncrease: parseNumericValue(numericValues.womenIncrease) ?? 0,
        youthIncrease: parseNumericValue(numericValues.youthIncrease) ?? 0,
        disabilityIncrease: parseNumericValue(numericValues.disabilityIncrease) ?? 0,
        dinaliIncrease: parseNumericValue(numericValues.dinaliIncrease) ?? 0,
        tusTransIncrease: parseNumericValue(numericValues.tusTransIncrease) ?? 0,
        protectedProgramIncrease: parseNumericValue(numericValues.protectedProgramIncrease) ?? 0,
      }),
      decentralization: scoreDecentralization(scoringInputs),
      exports: scoreExports({
        ...scoringInputs,
        totalInvestment: investmentTotal,
        indirectExports: indirectExportsForScore,
      }),
      sustainability: scoreSustainability(scoringInputs),
      iPlus: scoreIPlus(scoringInputs),
      strategic: scoreStrategic(scoringInputs),
    };
  }, [
    numericValues.disabilityIncrease,
    numericValues.disabilityBase,
    numericValues.dinaliIncrease,
    numericValues.dinaliBase,
    numericValues.othersIncrease,
    numericValues.othersBase,
    numericValues.protectedProgramIncrease,
    numericValues.protectedProgramBase,
    numericValues.tusTransIncrease,
    numericValues.tusTransBase,
    numericValues.womenIncrease,
    numericValues.womenBase,
    numericValues.youthIncrease,
    numericValues.youthBase,
    indirectExportsForScore,
    investmentTotal,
    scoringInputs,
  ]);

  const coreScoreSum = useMemo(() => {
    return Object.entries(scores).reduce((sum, [key, value]) => {
      if (key === 'decentralization') {
        return sum;
      }
      return sum + (value ?? 0) * WEIGHTS[key];
    }, 0);
  }, [scores]);
  const totalScore = useMemo(() => finalScore(scores), [scores]);
  const iraePct = useMemo(
    () =>
      computeIraePct(totalScore, {
        scores,
        investmentTotal,
        filedDate: inputs.filedDate,
        firmSize: companyCategory || undefined,
        coreScoreSum,
      }),
    [companyCategory, coreScoreSum, inputs.filedDate, investmentTotal, scores, totalScore]
  );
  const exonerationYears = useMemo(
    () =>
      computeIraeYears({
        investmentTotal,
        weightedScore: totalScore,
        coreScoreSum,
        firmSize: companyCategory || undefined,
      }),
    [companyCategory, coreScoreSum, investmentTotal, totalScore]
  );

  const investmentTotalUsd = useMemo(() => {
    const uiRate = parseNumericValue(numericValues.uiRate);
    const usdRate = parseNumericValue(numericValues.usdRate);
    if (!uiRate || !usdRate) {
      return 0;
    }
    return (investmentTotal * uiRate) / usdRate;
  }, [investmentTotal, numericValues.uiRate, numericValues.usdRate]);

  const totalDepartmentAmount = useMemo(() => {
    return deptAllocations.reduce((sum, allocation) => sum + (allocation.amount ?? 0), 0);
  }, [deptAllocations]);

  const totalInvestmentForDept = investmentTotal || totalDepartmentAmount;
  const minturCoefficient = 3.22;
  const minturWeightedIncrease = useMemo(() => {
    const parsed = parseNumericValue(numericValues.exportIncrease);
    if (parsed === null) {
      return 0;
    }
    return minturCoefficient * parsed;
  }, [minturCoefficient, numericValues.exportIncrease]);

  const scoreByStepId = useMemo(() => {
    return {
      empleo: scores.employment,
      exportaciones: scores.exports,
      descentralizacion: scores.decentralization,
      'impacto-ambiental': scores.sustainability,
      transformacion: scores.iPlus,
      alineacion: scores.strategic,
      resultado: totalScore,
    };
  }, [scores, totalScore]);

  const currentStepScore = scoreByStepId[steps[currentStep]?.id];
  const currentStepScoreLabel = 'Puntaje';

  const isLastStep = currentStep === steps.length - 1;

  const handleExportPdf = async () => {
    if (!pdfRef.current || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);
    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });
      const canvas = await html2canvas(pdfRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#f6f7f9',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.82);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('simulador_decreto_329.pdf');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleNumericChange = (key) => (event) => {
    const nextValue = event.target.value;
    setNumericValues((prev) => ({ ...prev, [key]: nextValue }));
    if (numericErrors[key]) {
      setNumericErrors((prev) => ({ ...prev, [key]: '' }));
    }
    if (!ENABLE_VALIDATION) {
      const parsed = parseNumericValue(nextValue);
      if (parsed !== null) {
        setInputs((prev) => ({ ...prev, [key]: parsed }));
      }
    }
  };

  const handleNumericBlur = (key) => (event) => {
    const rawValue = event.target.value.trim();

    if (!ENABLE_VALIDATION) {
      const parsed = parseNumericValue(rawValue);
      if (parsed !== null) {
        setInputs((prev) => ({ ...prev, [key]: parsed }));
        const decimals = getDecimalPlaces(rawValue);
        setNumericValues((prev) => ({
          ...prev,
          [key]: formatNumberForDisplay(parsed, decimals),
        }));
      }
      return;
    }

    if (!rawValue) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Este campo es obligatorio.' }));
      return;
    }

    const parsed = parseNumericValue(rawValue);
    if (parsed === null) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Ingrese un número válido.' }));
      return;
    }

    if ((key === 'sustainabilityAmount' || key === 'iPlusPct') && parsed < 0) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Debe ser mayor o igual a 0.' }));
      return;
    }

    if (key === 'fieldNaturalPct' && (parsed < 0 || parsed > 100)) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Debe estar entre 0 y 100.' }));
      return;
    }

    setNumericErrors((prev) => ({ ...prev, [key]: '' }));
    setInputs((prev) => ({ ...prev, [key]: parsed }));
  };

  const handleAmountBlur = (setter) => (event) => {
    const rawValue = event.target.value.trim();
    const parsed = parseNumericValue(rawValue);
    if (parsed === null) {
      return;
    }
    const decimals = getDecimalPlaces(rawValue);
    setter(formatNumberForDisplay(parsed, decimals));
  };

  const handleAddDepartment = () => {
    const rawAmount = deptPctValue.trim();
    const parsedAmount = parseNumericValue(rawAmount);

    if (!deptSelection) {
      setAllocationError('Seleccione un departamento.');
      return;
    }

    if (!rawAmount || parsedAmount === null || parsedAmount < 0) {
      setAllocationError('Ingrese un monto válido.');
      return;
    }

    setDeptAllocations((prev) => {
      const orderMap = new Map(departments.map((dept, index) => [dept.id, index]));
      const next = prev.filter((item) => item.id !== deptSelection);
      return [...next, { id: deptSelection, amount: parsedAmount }].sort(
        (a, b) => orderMap.get(a.id) - orderMap.get(b.id)
      );
    });

    setDeptSelection('');
    setDeptPctValue('');
    setAllocationError('');
  };

  const handleRemoveDepartment = (deptId) => {
    setDeptAllocations((prev) => prev.filter((item) => item.id !== deptId));
  };

  const handleAddMgapExport = () => {
    const initialRaw = mgapExportInitial.trim();
    const increaseRaw = mgapExportIncrease.trim();
    const initialParsed = parseNumericValue(initialRaw);
    const increaseParsed = parseNumericValue(increaseRaw);

    if (!mgapExportSelection) {
      setMgapExportError('Seleccione un rubro.');
      return;
    }

    if (!initialRaw || initialParsed === null || initialParsed < 0) {
      setMgapExportError('Ingrese un valor inicial válido.');
      return;
    }

    if (!increaseRaw || increaseParsed === null || increaseParsed < 0) {
      setMgapExportError('Ingrese un incremento válido.');
      return;
    }

    const option = MGAP_EXPORT_OPTIONS.find((item) => item.id === mgapExportSelection);
    if (!option) {
      setMgapExportError('Seleccione un rubro válido.');
      return;
    }

    setIndirectExports((prev) => [
      ...prev,
      {
        id: mgapExportSelection,
        label: option.label,
        pct: option.pct,
        initial: initialParsed,
        increase: increaseParsed,
      },
    ]);

    setMgapExportSelection('');
    setMgapExportInitial('');
    setMgapExportIncrease('');
    setMgapExportError('');
  };

  const handleRemoveMgapExport = (indexToRemove) => {
    setIndirectExports((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const goNext = () => {
    if (!ENABLE_VALIDATION) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }

    if (currentStep === stepIndexById.empresa) {
      const nextErrors = {};
      const rawBilling = numericValues.annualBillingUi?.trim();
      const billingParsed = parseNumericValue(rawBilling);
      const rawEmployees = numericValues.employees?.trim();
      const employeesParsed = parseNumericValue(rawEmployees);

      if (!rawBilling || billingParsed === null || billingParsed <= 0) {
        nextErrors.annualBillingUi = 'Debe ingresar un valor mayor a 0.';
      }

      if (!rawEmployees || employeesParsed === null || employeesParsed <= 0) {
        nextErrors.employees = 'Debe ingresar un valor mayor a 0.';
      }

      if (Object.keys(nextErrors).length) {
        setNumericErrors((prev) => ({ ...prev, ...nextErrors }));
        return;
      }

      setInputs((prev) => ({
        ...prev,
        annualBillingUi: billingParsed,
        employees: employeesParsed,
      }));
    }

    if (currentStep === stepIndexById.proyecto) {
      const nextErrors = {};
      const fields = [
        { key: 'machineryUi', label: 'bienes muebles' },
        { key: 'civilWorksUi', label: 'obra civil' },
        { key: 'industrialParkInvestmentUi', label: 'parque industrial' },
      ];

      fields.forEach(({ key }) => {
        const rawValue = numericValues[key]?.trim();
        const parsed = parseNumericValue(rawValue);

        if (!rawValue || parsed === null || parsed < 0) {
          nextErrors[key] = 'Ingrese un valor válido.';
        }
      });

      if (Object.keys(nextErrors).length) {
        setNumericErrors((prev) => ({ ...prev, ...nextErrors }));
        return;
      }

      if (investmentTotal <= 0) {
        const totalErrors = {};
        fields.forEach(({ key }) => {
          totalErrors[key] = 'La suma debe ser mayor a 0.';
        });
        setNumericErrors((prev) => ({ ...prev, ...totalErrors }));
        return;
      }

      setInputs((prev) => ({
        ...prev,
        machineryUi: parseNumericValue(numericValues.machineryUi) ?? 0,
        civilWorksUi: parseNumericValue(numericValues.civilWorksUi) ?? 0,
        industrialParkInvestmentUi: parseNumericValue(numericValues.industrialParkInvestmentUi) ?? 0,
        investment: investmentTotal,
      }));
    }

    if (currentStep === stepIndexById.descentralizacion) {
      if (!deptAllocations.length) {
        setAllocationError('Agregue al menos un departamento.');
        return;
      }

      setAllocationError('');
      setInputs((prev) => ({ ...prev, deptAllocations }));
    }

    if (isLastStep) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setInputs(defaultInputs);
    setNumericValues(buildNumericValues(defaultInputs));
    setNumericErrors({});
    setCurrentStep(0);
    setDeptSelection('');
    setDeptPctValue('');
    setDeptAllocations([]);
    setAllocationError('');
    setMgapExportSelection('');
    setMgapExportInitial('');
    setMgapExportIncrease('');
    setIndirectExports([]);
    setMgapExportError('');
  };

  return (
    <div className="app">
      <header className="gov-header">
        <div className="gov-inner">
          <div className="gov-brand">
            <img className="gov-logo" src="/mef-logo.png" alt="MEF logo" />
            <div className="gov-text">
              {'Ministerio de Economía y Finanzas'}
              <small>{'Comisión de Aplicación de la Ley de Inversiones - COMAP'}</small>
            </div>
          </div>
          <nav className="gov-nav" />
        </div>
      </header>

      <main className="layout">
        <div className="header-bar">
          <div>
            <div className="proj-header">{'COMAP - Simulador de Exoneración IRAE'}</div>
            <p className="muted">
              {'Decreto 329/025'}
            </p>
          </div>
        </div>

        <div className="card wizard">
          <div className="progress">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`step-dot${index <= currentStep ? ' active' : ''}`}
              />
            ))}
          </div>

          <div className="step-header">
            <div className="step-info">
              <div className="step-title">{steps[currentStep].title}</div>
              <div className="hint">{steps[currentStep].hint}</div>
            </div>
            {currentStepScore !== undefined && steps[currentStep]?.id !== 'resultado' ? (
              <ScoreBadge label={currentStepScoreLabel} value={currentStepScore} />
            ) : null}
          </div>

          <section className={`step${currentStep === stepIndexById.empresa ? ' active' : ''}`}>
            <div className="row row-narrow">
              <NumericField
                label="Facturación anual (UI)"
                name="annualBillingUi"
                placeholder="Ej: 25000000"
                value={numericValues.annualBillingUi ?? ''}
                error={numericErrors.annualBillingUi}
                onChange={handleNumericChange('annualBillingUi')}
                onBlur={handleNumericBlur('annualBillingUi')}
              />
            </div>

            <div className="row row-narrow">
              <NumericField
                label="Cantidad de empleados"
                name="employees"
                placeholder="Ej: 85"
                value={numericValues.employees ?? ''}
                error={numericErrors.employees}
                onChange={handleNumericChange('employees')}
                onBlur={handleNumericBlur('employees')}
              />

              <div className="field-group">
                <label className="field-label" htmlFor="sector">
                  Sector
                </label>
                <select
                  id="sector"
                  className="field-control"
                  value={inputs.sector}
                  onChange={(event) => setInputs((prev) => ({ ...prev, sector: event.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  <option value="industria">Industria</option>
                  <option value="servicios">Comercio y Servicios</option>
                  <option value="agro">Agropecuario</option>
                  <option value="turismo">Turismo</option>
                </select>
              </div>
            </div>

            <div className="row row-narrow">
              <div className="field-group">
                <label className="field-label" htmlFor="companyCategory">
                  Categoría de Empresa
                </label>
                <div id="companyCategory" className="field-control">
                  {companyCategory || '-'}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="field-group">
                <label className="field-label">Empresa nueva</label>
                <div className="radio">
                  <label className="pill">
                    <input
                      type="radio"
                      name="isNewCompany"
                      value="si"
                      checked={inputs.isNewCompany === 'si'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, isNewCompany: event.target.value }))
                      }
                    />
                    Si
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="isNewCompany"
                      value="no"
                      checked={inputs.isNewCompany === 'no'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, isNewCompany: event.target.value }))
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="field-group">
                <label className="field-label">Usuaria de parque industrial</label>
                <div className="radio">
                  <label className="pill">
                    <input
                      type="radio"
                      name="isIndustrialParkUser"
                      value="si"
                      checked={inputs.isIndustrialParkUser === 'si'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, isIndustrialParkUser: event.target.value }))
                      }
                    />
                    Si
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="isIndustrialParkUser"
                      value="no"
                      checked={inputs.isIndustrialParkUser === 'no'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, isIndustrialParkUser: event.target.value }))
                      }
                    />
                    No
                  </label>
                </div>
              </div>
              <div />
            </div>

            {inputs.isIndustrialParkUser === 'si' ? (
              <div className="row">
                <div className="field-group">
                  <label className="field-label" htmlFor="industrialParkActivity">
                    Actividad en parque industrial
                  </label>
                  <select
                    id="industrialParkActivity"
                    className="field-control"
                    value={inputs.industrialParkActivity}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        industrialParkActivity: event.target.value,
                      }))
                    }
                  >
                    <option value="">Seleccionar...</option>
                    <option value="actividades-industriales">Actividades industriales</option>
                    <option value="servicios-logisticos">
                      Prestación de servicios como: operaciones de almacenaje, acondicionamiento,
                      selección, clasificación, fraccionamiento, armado, desarmado, manipulación o
                      mezcla de mercaderías o materias primas, vinculados a las actividades
                      desarrolladas en el parque
                    </option>
                    <option value="energia-solar">
                      Actividades de Generación de Energía solar térmica y/o fotovoltaica enmarcados
                      en medidas promocionales del Poder Ejecutivo
                    </option>
                    <option value="valorizacion-residuos">
                      Actividades de valorización y aprovechamiento de residuos
                    </option>
                    <option value="servicios-tic-biotecnologia">
                      Actividades de servicios en las áreas de tecnologías de Información y
                      comunicación, biotecnología, industrias creativas dado su potencial para la
                      contribución a los objetivos establecidos en el artículo 1 de la Ley N°
                      19.784
                    </option>
                  </select>
                </div>
                <div />
              </div>
            ) : null}

            <div className="row">
              <div className="field-group">
                <label className="field-label" htmlFor="evaluatingMinistry">
                  Ministerio evaluador
                </label>
                <select
                  id="evaluatingMinistry"
                  className="field-control"
                  value={inputs.evaluatingMinistry}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, evaluatingMinistry: event.target.value }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  <option value="miem">MIEM</option>
                  <option value="mef">MEF</option>
                  <option value="mgap">MGAP</option>
                  <option value="mintur">MINTUR</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.proyecto ? ' active' : ''}`}>
            <div className="row">
              <div className="field-group">
                <label className="field-label" htmlFor="filedDate">
                  Fecha de Presentacion
                </label>
                <input
                  id="filedDate"
                  className="field-control"
                  type="date"
                  value={inputs.filedDate}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, filedDate: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="row row-narrow">
              <NumericField
                label="Cotización USD"
                name="usdRate"
                placeholder="Ej: 39.50"
                value={numericValues.usdRate ?? ''}
                error={numericErrors.usdRate}
                onChange={handleNumericChange('usdRate')}
                onBlur={handleNumericBlur('usdRate')}
              />
              <NumericField
                label="Cotización UI"
                name="uiRate"
                placeholder="Ej: 6.10"
                value={numericValues.uiRate ?? ''}
                error={numericErrors.uiRate}
                onChange={handleNumericChange('uiRate')}
                onBlur={handleNumericBlur('uiRate')}
              />
            </div>

            <div className="form-grid">
              <NumericField
                label="Bienes muebles (UI)"
                name="machineryUi"
                placeholder="Ej: 3000000"
                value={numericValues.machineryUi ?? ''}
                error={numericErrors.machineryUi}
                onChange={handleNumericChange('machineryUi')}
                onBlur={handleNumericBlur('machineryUi')}
              />
              <NumericField
                label="Obra Civil (UI)"
                name="civilWorksUi"
                placeholder="Ej: 2500000"
                value={numericValues.civilWorksUi ?? ''}
                error={numericErrors.civilWorksUi}
                onChange={handleNumericChange('civilWorksUi')}
                onBlur={handleNumericBlur('civilWorksUi')}
              />
              {inputs.isIndustrialParkUser === 'si' ? (
                <NumericField
                  label="inversión dentro de parque industrial (UI)"
                  name="industrialParkInvestmentUi"
                  placeholder="Ej: 1500000"
                  value={numericValues.industrialParkInvestmentUi ?? ''}
                  error={numericErrors.industrialParkInvestmentUi}
                  onChange={handleNumericChange('industrialParkInvestmentUi')}
                  onBlur={handleNumericBlur('industrialParkInvestmentUi')}
                />
              ) : null}
            </div>

            <div className="row row-narrow">
              <div className="field-group">
                <label className="field-label" htmlFor="investmentTotalUi">
                  inversión elegible total (UI)
                </label>
                <div id="investmentTotalUi" className="field-control">
                  {formatNumberForDisplay(investmentTotal, 0)}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="investmentTotalUsd">
                  inversión elegible total (USD)
                </label>
                <div id="investmentTotalUsd" className="field-control">
                  {formatNumberForDisplay(investmentTotalUsd, 2)}
                </div>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.empleo ? ' active' : ''}`}>
            <div className="table">
              <div className="table-row table-header">
                <div className="table-cell">Colectivo</div>
                <div className="table-cell">Situacion inicial</div>
                <div className="table-cell">Incremento promedio</div>
              </div>

              <div className="table-row">
                <div className="table-cell">Colectivos No Vulnerables</div>
                <div className="table-cell">
                  <NumericField
                    label="Colectivos No Vulnerables (situacion inicial)"
                    name="othersBase"
                    placeholder="Ej: 1"
                    value={numericValues.othersBase ?? ''}
                    error={numericErrors.othersBase}
                    onChange={handleNumericChange('othersBase')}
                    onBlur={handleNumericBlur('othersBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="Colectivos No Vulnerables (incremento)"
                    name="othersIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.othersIncrease ?? ''}
                    error={numericErrors.othersIncrease}
                    onChange={handleNumericChange('othersIncrease')}
                    onBlur={handleNumericBlur('othersIncrease')}
                  />
                </div>
              </div>

              <div className="table-row">
                <div className="table-cell">Mujeres</div>
                <div className="table-cell">
                  <NumericField
                    label="Mujeres (situacion inicial)"
                    name="womenBase"
                    placeholder="Ej: 1"
                    value={numericValues.womenBase ?? ''}
                    error={numericErrors.womenBase}
                    onChange={handleNumericChange('womenBase')}
                    onBlur={handleNumericBlur('womenBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="Mujeres (incremento)"
                    name="womenIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.womenIncrease ?? ''}
                    error={numericErrors.womenIncrease}
                    onChange={handleNumericChange('womenIncrease')}
                    onBlur={handleNumericBlur('womenIncrease')}
                  />
                </div>
              </div>

              <div className="table-row">
                <div className="table-cell">Jóvenes (15-29 años)</div>
                <div className="table-cell">
                  <NumericField
                    label="Jovenes (situacion inicial)"
                    name="youthBase"
                    placeholder="Ej: 1"
                    value={numericValues.youthBase ?? ''}
                    error={numericErrors.youthBase}
                    onChange={handleNumericChange('youthBase')}
                    onBlur={handleNumericBlur('youthBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="Jovenes (incremento)"
                    name="youthIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.youthIncrease ?? ''}
                    error={numericErrors.youthIncrease}
                    onChange={handleNumericChange('youthIncrease')}
                    onBlur={handleNumericBlur('youthIncrease')}
                  />
                </div>
              </div>

              <div className="table-row">
                <div className="table-cell">Personas con discapacidad</div>
                <div className="table-cell">
                  <NumericField
                    label="Discapacitados (situacion inicial)"
                    name="disabilityBase"
                    placeholder="Ej: 1"
                    value={numericValues.disabilityBase ?? ''}
                    error={numericErrors.disabilityBase}
                    onChange={handleNumericChange('disabilityBase')}
                    onBlur={handleNumericBlur('disabilityBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="Discapacitados (incremento)"
                    name="disabilityIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.disabilityIncrease ?? ''}
                    error={numericErrors.disabilityIncrease}
                    onChange={handleNumericChange('disabilityIncrease')}
                    onBlur={handleNumericBlur('disabilityIncrease')}
                  />
                </div>
              </div>

              <div className="table-row">
                <div className="table-cell">Personas atendidas por DINALI</div>
                <div className="table-cell">
                  <NumericField
                    label="DINALI (situacion inicial)"
                    name="dinaliBase"
                    placeholder="Ej: 1"
                    value={numericValues.dinaliBase ?? ''}
                    error={numericErrors.dinaliBase}
                    onChange={handleNumericChange('dinaliBase')}
                    onBlur={handleNumericBlur('dinaliBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="DINALI (incremento)"
                    name="dinaliIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.dinaliIncrease ?? ''}
                    error={numericErrors.dinaliIncrease}
                    onChange={handleNumericChange('dinaliIncrease')}
                    onBlur={handleNumericBlur('dinaliIncrease')}
                  />
                </div>
              </div>

              <div className="table-row">
                <div className="table-cell">TUS Trans</div>
                <div className="table-cell">
                  <NumericField
                    label="TUS/Trans (situacion inicial)"
                    name="tusTransBase"
                    placeholder="Ej: 1"
                    value={numericValues.tusTransBase ?? ''}
                    error={numericErrors.tusTransBase}
                    onChange={handleNumericChange('tusTransBase')}
                    onBlur={handleNumericBlur('tusTransBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="TUS/Trans (incremento)"
                    name="tusTransIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.tusTransIncrease ?? ''}
                    error={numericErrors.tusTransIncrease}
                    onChange={handleNumericChange('tusTransIncrease')}
                    onBlur={handleNumericBlur('tusTransIncrease')}
                  />
                </div>
              </div>

              <div className="table-row">
                <div className="table-cell">Personas Programa Empleo Protegido</div>
                <div className="table-cell">
                  <NumericField
                    label="Programa Empleo Protegido (situacion inicial)"
                    name="protectedProgramBase"
                    placeholder="Ej: 1"
                    value={numericValues.protectedProgramBase ?? ''}
                    error={numericErrors.protectedProgramBase}
                    onChange={handleNumericChange('protectedProgramBase')}
                    onBlur={handleNumericBlur('protectedProgramBase')}
                  />
                </div>
                <div className="table-cell">
                  <NumericField
                    label="Programa Empleo Protegido (incremento)"
                    name="protectedProgramIncrease"
                    placeholder="Ej: 1"
                    value={numericValues.protectedProgramIncrease ?? ''}
                    error={numericErrors.protectedProgramIncrease}
                    onChange={handleNumericChange('protectedProgramIncrease')}
                    onBlur={handleNumericBlur('protectedProgramIncrease')}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.exportaciones ? ' active' : ''}`}>
            <div className="row">
                <NumericField
                  label="Exportaciones actuales (USD/Año)"
                  name="currentExports"
                  placeholder="Ej: 500000"
                  value={numericValues.currentExports ?? ''}
                  error={numericErrors.currentExports}
                  onChange={handleNumericChange('currentExports')}
                  onBlur={handleNumericBlur('currentExports')}
                />
                <NumericField
                  label="Incremento exportaciones (USD/Año)"
                  name="exportIncrease"
                  placeholder="Ej: 900000"
                  value={numericValues.exportIncrease ?? ''}
                  error={numericErrors.exportIncrease}
                  onChange={handleNumericChange('exportIncrease')}
                  onBlur={handleNumericBlur('exportIncrease')}
                />
              </div>

            {inputs.evaluatingMinistry === 'mgap' ? (
              <>
                <div className="section-subtitle">{'Rubro MGAP'}</div>
                <div className="row row-4 mgap-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="mgapExportSelection">
                      Rubro 
                    </label>
                    <select
                      id="mgapExportSelection"
                      className="field-control"
                      value={mgapExportSelection}
                      onChange={(event) => setMgapExportSelection(event.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {MGAP_EXPORT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label} ({option.pct}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="mgapExportInitial">
                      Situación inicial (USD/Año)
                    </label>
                    <input
                      id="mgapExportInitial"
                      className="field-control"
                      type="text"
                      inputMode="decimal"
                      value={mgapExportInitial}
                    onChange={(event) => setMgapExportInitial(event.target.value)}
                    onBlur={handleAmountBlur(setMgapExportInitial)}
                      placeholder="Ej: 100000"
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="mgapExportIncrease">
                      Incremento (USD/Año)
                    </label>
                    <input
                      id="mgapExportIncrease"
                      className="field-control"
                      type="text"
                      inputMode="decimal"
                      value={mgapExportIncrease}
                    onChange={(event) => setMgapExportIncrease(event.target.value)}
                    onBlur={handleAmountBlur(setMgapExportIncrease)}
                      placeholder="Ej: 20000"
                    />
                  </div>

                  <div className="field-group mgap-actions">
                    <button className="btn-secondary" type="button" onClick={handleAddMgapExport}>
                      +
                    </button>
                  </div>
                </div>

                {indirectExports.length ? (
                  <div className="table five-col">
                    <div className="table-row table-header">
                      <div className="table-cell">Situación inicial (USD)</div>
                      <div className="table-cell">% rubro</div>
                      <div className="table-cell">Promedio incremento (USD)</div>
                      <div className="table-cell">Coef x incremento</div>
                      <div className="table-cell">Acciones</div>
                    </div>
                    {indirectExports.map((item, index) => {
                      const weighted = (item.pct / 100) * item.increase;
                      return (
                        <div className="table-row" key={`${item.id}-${index}`}>
                          <div className="table-cell">{item.initial}</div>
                          <div className="table-cell">{item.pct}%</div>
                          <div className="table-cell">{item.increase}</div>
                          <div className="table-cell">{weighted.toFixed(2)}</div>
                          <div className="table-cell">
                            <button
                              className="btn-secondary"
                              type="button"
                              onClick={() => handleRemoveMgapExport(index)}
                            >
                              X
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                {mgapExportError ? <div className="field-error">{mgapExportError}</div> : null}
              </>
            ) : null}

            {inputs.evaluatingMinistry === 'mintur' ? (
              <>
                <div className="section-subtitle">{'Indicador MINTUR'}</div>

                <div className="row row-narrow">
                  <div className="field-group">
                    <label className="field-label" htmlFor="minturCoefficient">
                      Coeficiente fijo
                    </label>
                    <div id="minturCoefficient" className="field-control">
                      {minturCoefficient.toFixed(2)}
                    </div>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="minturWeighted">
                      Incremento aplicando coeficiente
                    </label>
                    <div id="minturWeighted" className="field-control">
                      {formatNumberForDisplay(minturWeightedIncrease, 2)}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </section>

          <section className={`step${currentStep === stepIndexById.descentralizacion ? ' active' : ''}`}>
            <div className="section-subtitle">{'Distribución por departamento'}</div>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label" htmlFor="deptSelection">
                  Departamento
                </label>
                <select
                  id="deptSelection"
                  className="field-control"
                  value={deptSelection}
                  onChange={(event) => setDeptSelection(event.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="deptPctValue">
                  Monto (UI)
                </label>
                <input
                  id="deptPctValue"
                  className="field-control"
                  type="text"
                  inputMode="decimal"
                  value={deptPctValue}
                  onChange={(event) => setDeptPctValue(event.target.value)}
                  onBlur={handleAmountBlur(setDeptPctValue)}
                  placeholder="Ej: 250000"
                />
              </div>

              <div className="field-group">
                <span className="field-label">Acciones</span>
                <button className="btn-secondary" type="button" onClick={handleAddDepartment}>
                  +
                </button>
              </div>
            </div>

            {deptAllocations.length ? (
              <div className="table four-col">
                <div className="table-row table-header">
                  <div className="table-cell">Departamento</div>
                  <div className="table-cell">Monto (UI)</div>
                  <div className="table-cell">Puntaje ponderado</div>
                  <div className="table-cell">Acciones</div>
                </div>
                {deptAllocations.map((allocation) => {
                  const dept = departments.find((item) => item.id === allocation.id);
                  const deptScore = DEPARTMENT_SCORES[allocation.id] ?? 0;
                  const weightedScore = totalInvestmentForDept
                    ? (allocation.amount / totalInvestmentForDept) * deptScore
                    : 0;
                  return (
                    <div className="table-row" key={allocation.id}>
                      <div className="table-cell">{dept?.label ?? allocation.id}</div>
                      <div className="table-cell">{allocation.amount}</div>
                      <div className="table-cell">{weightedScore.toFixed(2)}</div>
                      <div className="table-cell">
                        <button
                          className="btn-secondary"
                          type="button"
                          onClick={() => handleRemoveDepartment(allocation.id)}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="table-row">
                  <div className="table-cell">Total (UI)</div>
                  <div className="table-cell">{totalDepartmentAmount}</div>
                  <div className="table-cell" />
                  <div className="table-cell" />
                </div>
              </div>
            ) : null}

            {allocationError ? <div className="field-error">{allocationError}</div> : null}
          </section>

          <section className={`step${currentStep === stepIndexById['impacto-ambiental'] ? ' active' : ''}`}>
            <div className="row impacto-ambiental-row">
              <NumericField
                label="Monto inversión (UI)"
                name="sustainabilityAmount"
                placeholder="Ej: 250000"
                value={numericValues.sustainabilityAmount ?? ''}
                error={numericErrors.sustainabilityAmount}
                onChange={handleNumericChange('sustainabilityAmount')}
                onBlur={handleNumericBlur('sustainabilityAmount')}
                className="narrow-field"
              />

              <div>
                <label className="field-label" htmlFor="certification">
                  Certificación
                </label>
                <select
                  id="certification"
                  className="field-control"
                  value={inputs.certification}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, certification: event.target.value }))
                  }
                >
                  <option value="none">Sin Certificación</option>
                  <option value="leed">Leed</option>
                  <option value="leed-plata">Leed Plata</option>
                  <option value="leed-oro">Leed Oro</option>
                  <option value="leed-platino">Leed Platino</option>
                  <option value="breeam-bueno">Breeam Bueno</option>
                  <option value="breeam-muy-bueno">Breeam Muy Bueno</option>
                  <option value="breeam-excelente">Breeam Excelente</option>
                  <option value="breeam-excepcional">Breeam Excepcional</option>
                  <option value="sello-b">Sello Eficiencia Energética B</option>
                  <option value="sello-a">Sello Eficiencia Energética A</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.transformacion ? ' active' : ''}`}>
            <div className="row impacto-ambiental-row">
              <NumericField
                label="Monto inversión (UI)"
                name="iPlusPct"
                placeholder="Ej: 300000"
                value={numericValues.iPlusPct ?? ''}
                error={numericErrors.iPlusPct}
                onChange={handleNumericChange('iPlusPct')}
                onBlur={handleNumericBlur('iPlusPct')}
                className="narrow-field"
              />
              <div>
                <label className="field-label" htmlFor="iPlusCategory">
                  Categoría I+
                </label>
                <select
                  id="iPlusCategory"
                  className="field-control"
                  value={inputs.iPlusCategory}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))
                  }
                >
                  <option value="at">Adecuación Tecnológica (AT)</option>
                  <option value="inn">Innovación (INN)</option>
                  <option value="id">Investigación y Desarrollo Experimental (I+D)</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.alineacion ? ' active' : ''}`}>
            <div className="row row-narrow" />

            {inputs.evaluatingMinistry === 'mgap' ? (
              <div className="spacer-top">
                <NumericField
                  label="% Superficie Campo Natural"
                  name="fieldNaturalPct"
                  placeholder="Ej: 35"
                  value={numericValues.fieldNaturalPct ?? ''}
                  error={numericErrors.fieldNaturalPct}
                  onChange={handleNumericChange('fieldNaturalPct')}
                  onBlur={handleNumericBlur('fieldNaturalPct')}
                  className="narrow-field"
                />
              </div>
            ) : null}

            {inputs.evaluatingMinistry === 'mintur' ? (
              <div className="spacer-top">
                <label className="field-label">Servicios e Infraestructura Turística</label>
                <div className="radio">
                  <label className="pill">
                    <input
                      type="radio"
                      name="minturStrategicFlag"
                      value="si"
                      checked={inputs.minturStrategicFlag === 'si'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, minturStrategicFlag: event.target.value }))
                      }
                    />
                    Si
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="minturStrategicFlag"
                      value="no"
                      checked={inputs.minturStrategicFlag !== 'si'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, minturStrategicFlag: event.target.value }))
                      }
                    />
                    No
                  </label>
                </div>

                {inputs.minturStrategicFlag === 'si' ? (
                  <div className="row row-narrow spacer-top">
                    <NumericField
                      label="Inversión en zonas turísticas (UI)"
                      name="minturInvestmentZoneUi"
                      placeholder="Ej: 500000"
                      value={numericValues.minturInvestmentZoneUi ?? ''}
                      error={numericErrors.minturInvestmentZoneUi}
                      onChange={handleNumericChange('minturInvestmentZoneUi')}
                      onBlur={handleNumericBlur('minturInvestmentZoneUi')}
                      className="narrow-field"
                    />
                    <NumericField
                      label="Inversión fuera de zonas turísticas (UI)"
                      name="minturInvestmentOutsideUi"
                      placeholder="Ej: 200000"
                      value={numericValues.minturInvestmentOutsideUi ?? ''}
                      error={numericErrors.minturInvestmentOutsideUi}
                      onChange={handleNumericChange('minturInvestmentOutsideUi')}
                      onBlur={handleNumericBlur('minturInvestmentOutsideUi')}
                      className="narrow-field"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {inputs.evaluatingMinistry === 'miem' ? (
              <div className="spacer-top">
                <div className="section-subtitle">{'Indicadores estratégicos MIEM'}</div>
                {MIEM_STRATEGIC_INDICATORS.map((indicator) => (
                  <div key={indicator.id} className="row row-narrow">
                    <div className="field-group">
                      <label className="field-label">{indicator.label}</label>
                      <div className="radio">
                        <label className="pill">
                          <input
                            type="radio"
                            name={indicator.flagKey}
                            value="si"
                            checked={inputs[indicator.flagKey] === 'si'}
                            onChange={(event) =>
                              setInputs((prev) => ({
                                ...prev,
                                [indicator.flagKey]: event.target.value,
                              }))
                            }
                          />
                          Si
                        </label>
                        <label className="pill">
                          <input
                            type="radio"
                            name={indicator.flagKey}
                            value="no"
                            checked={inputs[indicator.flagKey] !== 'si'}
                            onChange={(event) =>
                              setInputs((prev) => ({
                                ...prev,
                                [indicator.flagKey]: event.target.value,
                              }))
                            }
                          />
                          No
                        </label>
                      </div>
                    </div>
                    {inputs[indicator.flagKey] === 'si' ? (
                      <NumericField
                        label="Inversión (UI)"
                        name={indicator.amountKey}
                        placeholder="Ej: 300000"
                        value={numericValues[indicator.amountKey] ?? ''}
                        error={numericErrors[indicator.amountKey]}
                        onChange={handleNumericChange(indicator.amountKey)}
                        onBlur={handleNumericBlur(indicator.amountKey)}
                        className="narrow-field"
                      />
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="spacer-top">
              <label className="field-label">Componente Nacional</label>
              <div className="radio">
                <label className="pill">
                  <input
                    type="radio"
                    name="nationalComponent"
                    value="si"
                    checked={inputs.nationalComponent === 'si'}
                    onChange={(event) =>
                      setInputs((prev) => ({ ...prev, nationalComponent: event.target.value }))
                    }
                  />
                  Si
                </label>
                <label className="pill">
                  <input
                    type="radio"
                    name="nationalComponent"
                    value="no"
                    checked={inputs.nationalComponent === 'no'}
                    onChange={(event) =>
                      setInputs((prev) => ({ ...prev, nationalComponent: event.target.value }))
                    }
                  />
                  No
                </label>
              </div>
            </div>

            {inputs.nationalComponent === 'si' ? (
              <>
                <div className="row row-narrow spacer-top">
                  <NumericField
                    label="Bienes muebles Nacional (UI)"
                    name="nationalGoodsUi"
                    placeholder="Ej: 200000"
                    value={numericValues.nationalGoodsUi ?? ''}
                    error={numericErrors.nationalGoodsUi}
                    onChange={handleNumericChange('nationalGoodsUi')}
                    onBlur={handleNumericBlur('nationalGoodsUi')}
                    className="narrow-field"
                  />
                  <NumericField
                    label="Bienes muebles (UI)"
                    name="nationalGoodsTotalUi"
                    placeholder="Ej: 250000"
                    value={numericValues.nationalGoodsTotalUi ?? ''}
                    error={numericErrors.nationalGoodsTotalUi}
                    onChange={handleNumericChange('nationalGoodsTotalUi')}
                    onBlur={handleNumericBlur('nationalGoodsTotalUi')}
                    className="narrow-field"
                  />
                </div>
                <div className="row row-narrow">
                  <NumericField
                    label="Materiales Obra Civil Nacional (UI)"
                    name="nationalCivilWorksUi"
                    placeholder="Ej: 150000"
                    value={numericValues.nationalCivilWorksUi ?? ''}
                    error={numericErrors.nationalCivilWorksUi}
                    onChange={handleNumericChange('nationalCivilWorksUi')}
                    onBlur={handleNumericBlur('nationalCivilWorksUi')}
                    className="narrow-field"
                  />
                  <NumericField
                    label="Materiales Obra Civil (UI)"
                    name="civilWorksMaterialsUi"
                    placeholder="Ej: 120000"
                    value={numericValues.civilWorksMaterialsUi ?? ''}
                    error={numericErrors.civilWorksMaterialsUi}
                    onChange={handleNumericChange('civilWorksMaterialsUi')}
                    onBlur={handleNumericBlur('civilWorksMaterialsUi')}
                    className="narrow-field"
                  />
                </div>
              </>
            ) : null}
          </section>

          <section
            className={`step${currentStep === stepIndexById['indicadores-mef'] ? ' active' : ''}`}
          >
            <div className="row row-narrow">
              <NumericField
                label="inversión en Energías renovables (UI)"
                name="mefRenewableInvestmentUi"
                placeholder="Ej: 500000"
                value={numericValues.mefRenewableInvestmentUi ?? ''}
                error={numericErrors.mefRenewableInvestmentUi}
                onChange={handleNumericChange('mefRenewableInvestmentUi')}
                onBlur={handleNumericBlur('mefRenewableInvestmentUi')}
              />
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.resultado ? ' active' : ''}`}>
            <div ref={pdfRef} className="pdf-export">
              {isExportingPdf ? (
                <div className="pdf-header">
                  <img className="pdf-logo" src="/mef-logo.png" alt="MEF" />
                  <div>
                    <div className="pdf-title">{'COMAP - Simulador de Exoneración IRAE'}</div>
                    <div className="pdf-subtitle">{'Decreto 329/025'}</div>
                  </div>
                </div>
              ) : null}
              <div className="metric-grid">
                <div className="metric-card">
                  <p className="metric-title">Puntaje total</p>
                  <p className="metric-value">{totalScore.toFixed(2)}</p>
                </div>
                <div className="metric-card">
                  <p className="metric-title">Exoneración IRAE</p>
                  <p className="metric-value">{(iraePct * 100).toFixed(1)}%</p>
                </div>
                <div className="metric-card">
                  <p className="metric-title">Años de Exoneración</p>
                  <p className="metric-value">{exonerationYears}</p>
                </div>
              </div>

              <div className="card summary-card card-plain">
                <div className="card-header">
                  <h3>Indicadores</h3>
                  <span>Escala 0-10</span>
                </div>
                <SummaryChart indicators={INDICATORS} scores={scores} />
              </div>

              <p className="disclaimer">
                {
                  'Los resultados presentados constituyen una estimación basada en la información ingresada y en la normativa vigente, y tienen carácter meramente orientativo. No implican aprobación, no generan derecho alguno, ni garantizan el otorgamiento de beneficios fiscales, los cuales quedan sujetos a la evaluación técnica y resolución final de los organismos competentes.'
                }
              </p>
            </div>

            <div className="pdf-actions">
              <button
                className="btn-secondary"
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
              >
                {isExportingPdf ? 'Generando PDF...' : 'Descargar PDF'}
              </button>
            </div>
          </section>
          <div className="actions">
            <button className="btn-secondary" onClick={goPrev} disabled={currentStep === 0}>
              {'Atrás'}
            </button>
            <button className="btn-primary" onClick={goNext}>
              {isLastStep ? 'Finalizar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
