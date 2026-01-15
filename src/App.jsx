import { useEffect, useMemo, useRef, useState } from 'react';
import SummaryChart from './components/SummaryChart.jsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  computeIraePct,
  finalScore,
  scoreDecentralization,
  scoreEmployment,
  scoreExports,
  scoreIPlus,
  scoreStrategic,
  scoreSustainability,
} from './utils/scoring.js';
import { DEPARTMENT_SCORES } from './utils/scoring.js';
import { INDICATORS } from './utils/constants.js';

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

const defaultInputs = {
  investment: 0,
  employees: 0,
  annualBillingUi: 0,
  usdRate: 38.5,
  uiRate: 6.5,
  machineryUi: 0,
  installationsUi: 0,
  civilWorksUi: 0,
  industrialParkInvestmentUi: 0,
  mefRenewableInvestmentUi: 0,
  occupiedPersonnel: 0,
  employmentInitial: 0,
  employmentIncreaseAvg: 0,
  deptAllocations: [],
  exportPct: 35,
  sustainabilityAmount: 0,
  iPlusType: 'b',
  iPlusPct: 0,
  strategicPriorities: 2,
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
  othersBase: 0,
  othersIncrease: 0,
  currentExports: 0,
  exportIncrease: 0,
  certification: 'none',
  iPlusCategory: 'at',
  ministry: '',
  evaluatingMinistry: '',
  strategicLine: '',
  strategicInvestmentPct: 0,
  isNewCompany: 'no',
  isIndustrialParkUser: 'no',
  industrialParkActivity: '',
  fieldNaturalPct: 0,
  tourismZoneLocation: '',
  mineralProcessingLevel: '',
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
    installationsUi: source.installationsUi === 0 ? '0' : String(source.installationsUi ?? ''),
    civilWorksUi: source.civilWorksUi === 0 ? '0' : String(source.civilWorksUi ?? ''),
    industrialParkInvestmentUi:
      source.industrialParkInvestmentUi === 0
        ? '0'
        : String(source.industrialParkInvestmentUi ?? ''),
    mefRenewableInvestmentUi:
      source.mefRenewableInvestmentUi === 0 ? '0' : String(source.mefRenewableInvestmentUi ?? ''),
    occupiedPersonnel:
      source.occupiedPersonnel === 0 ? '0' : String(source.occupiedPersonnel ?? ''),
    employmentInitial:
      source.employmentInitial === 0 ? '0' : String(source.employmentInitial ?? ''),
    employmentIncreaseAvg:
      source.employmentIncreaseAvg === 0 ? '0' : String(source.employmentIncreaseAvg ?? ''),
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
    hint: 'Completa la información de colectivos para generación de empleo.',
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
    label: 'Impacto ambiental',
    hint: 'Datos de impacto ambiental.',
  },
  {
    id: 'transformacion',
    label: 'Transformación productiva (I+)',
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
  const [mgapExportItems, setMgapExportItems] = useState([]);
  const [mgapExportError, setMgapExportError] = useState('');
  const [minturInitial, setMinturInitial] = useState('');
  const [minturIncrease, setMinturIncrease] = useState('');
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
      parseValue(numericValues.machineryUi) +
      parseValue(numericValues.installationsUi) +
      parseValue(numericValues.civilWorksUi)
    );
  }, [numericValues.civilWorksUi, numericValues.installationsUi, numericValues.machineryUi]);

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

  const scores = useMemo(() => {
    return {
      employment: scoreEmployment({
        womenIncrease: parseNumericValue(numericValues.womenIncrease) ?? 0,
        youthIncrease: parseNumericValue(numericValues.youthIncrease) ?? 0,
        disabilityIncrease: parseNumericValue(numericValues.disabilityIncrease) ?? 0,
        dinaliIncrease: parseNumericValue(numericValues.dinaliIncrease) ?? 0,
        tusTransIncrease: parseNumericValue(numericValues.tusTransIncrease) ?? 0,
        othersIncrease: parseNumericValue(numericValues.othersIncrease) ?? 0,
      }),
      decentralization: scoreDecentralization(scoringInputs),
      exports: scoreExports({
        ...scoringInputs,
        totalInvestment: investmentTotal,
        mgapExportItems,
        minturInitial,
        minturIncrease,
      }),
      sustainability: scoreSustainability(scoringInputs),
      iPlus: scoreIPlus(scoringInputs),
      strategic: scoreStrategic(scoringInputs),
    };
  }, [
    numericValues.disabilityIncrease,
    numericValues.dinaliIncrease,
    numericValues.othersIncrease,
    numericValues.tusTransIncrease,
    numericValues.womenIncrease,
    numericValues.youthIncrease,
    mgapExportItems,
    minturIncrease,
    minturInitial,
    investmentTotal,
    scoringInputs,
  ]);

  const totalScore = useMemo(() => finalScore(scores), [scores]);
  const iraePct = useMemo(() => computeIraePct(totalScore), [totalScore]);
  const exonerationYears = totalScore >= 8 ? 10 : totalScore >= 6 ? 7 : totalScore >= 4 ? 5 : 3;

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
    const parsed = parseNumericValue(minturIncrease);
    if (parsed === null) {
      return 0;
    }
    return minturCoefficient * parsed;
  }, [minturCoefficient, minturIncrease]);

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

    setMgapExportItems((prev) => [
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
    setMgapExportItems((prev) => prev.filter((_, index) => index !== indexToRemove));
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
        { key: 'machineryUi', label: 'maquinaria' },
        { key: 'installationsUi', label: 'instalaciones' },
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
        installationsUi: parseNumericValue(numericValues.installationsUi) ?? 0,
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
    setMgapExportItems([]);
    setMgapExportError('');
    setMinturInitial('');
    setMinturIncrease('');
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
            <div className="proj-header">{'Simulador de Exoneración'}</div>
            <p className="muted">
              {'Completa la información paso a paso para simular el beneficio COMAP estimado.'}
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
                  <option value="servicios">Servicios</option>
                  <option value="agro">Agro</option>
                  <option value="turismo">Turismo</option>
                  <option value="energia">Energía</option>
                </select>
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
                      Actividades de generación de energía solar térmica y/o fotovoltaica enmarcados
                      en medidas promocionales del Poder Ejecutivo
                    </option>
                    <option value="valorizacion-residuos">
                      Actividades de valorización y aprovechamiento de residuos
                    </option>
                    <option value="servicios-tic-biotecnologia">
                      Actividades de servicios en las áreas de tecnologías de información y
                      comunicación, biotecnología, industrias creativas dado su potencial para la
                      contribución a los objetivos establecidos en el artículo 1 de la Ley N°
                      19.784
                    </option>
                  </select>
                </div>
                <div />
              </div>
            ) : null}
          </section>

          <section className={`step${currentStep === stepIndexById.proyecto ? ' active' : ''}`}>
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
              <div />
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
                label="Maquinas y equipos (UI)"
                name="machineryUi"
                placeholder="Ej: 3000000"
                value={numericValues.machineryUi ?? ''}
                error={numericErrors.machineryUi}
                onChange={handleNumericChange('machineryUi')}
                onBlur={handleNumericBlur('machineryUi')}
              />
              <NumericField
                label="Instalaciones (UI)"
                name="installationsUi"
                placeholder="Ej: 4500000"
                value={numericValues.installationsUi ?? ''}
                error={numericErrors.installationsUi}
                onChange={handleNumericChange('installationsUi')}
                onBlur={handleNumericBlur('installationsUi')}
              />
              <NumericField
                label="Obra civil (UI)"
                name="civilWorksUi"
                placeholder="Ej: 2500000"
                value={numericValues.civilWorksUi ?? ''}
                error={numericErrors.civilWorksUi}
                onChange={handleNumericChange('civilWorksUi')}
                onBlur={handleNumericBlur('civilWorksUi')}
              />
              {inputs.isIndustrialParkUser === 'si' ? (
                <NumericField
                  label="Inversión dentro de parque industrial (UI)"
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
                  Inversión elegible total (UI)
                </label>
                <div id="investmentTotalUi" className="field-control">
                  {formatNumberForDisplay(investmentTotal, 0)}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="investmentTotalUsd">
                  Inversión elegible total (USD)
                </label>
                <div id="investmentTotalUsd" className="field-control">
                  {formatNumberForDisplay(investmentTotalUsd, 2)}
                </div>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.empleo ? ' active' : ''}`}>
            <div className="form-grid">
              <NumericField
                label="Situación inicial"
                name="employmentInitial"
                placeholder="Ej: 100"
                value={numericValues.employmentInitial ?? ''}
                error={numericErrors.employmentInitial}
                onChange={handleNumericChange('employmentInitial')}
                onBlur={handleNumericBlur('employmentInitial')}
              />
              <NumericField
                label="Incremento promedio"
                name="employmentIncreaseAvg"
                placeholder="Ej: 20"
                value={numericValues.employmentIncreaseAvg ?? ''}
                error={numericErrors.employmentIncreaseAvg}
                onChange={handleNumericChange('employmentIncreaseAvg')}
                onBlur={handleNumericBlur('employmentIncreaseAvg')}
              />
            </div>

            <div className="table two-col">
              <div className="table-row table-header">
                <div className="table-cell">Colectivo</div>
                <div className="table-cell">Incremento</div>
              </div>

              <div className="table-row">
                <div className="table-cell">Colectivos No Vulnerables</div>
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
                <div className="table-cell">{'Jóvenes'}</div>
                <div className="table-cell">
                  <NumericField
                    label={'Jóvenes (incremento)'}
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
                <div className="table-cell">Discapacitados</div>
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
                <div className="table-cell">DINALI</div>
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
                <div className="table-cell">TUS/Trans</div>
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
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.exportaciones ? ' active' : ''}`}>
            {inputs.evaluatingMinistry !== 'mintur' ? (
              <div className="row">
                <NumericField
                  label="Exportaciones actuales (USD/año)"
                  name="currentExports"
                  placeholder="Ej: 500000"
                  value={numericValues.currentExports ?? ''}
                  error={numericErrors.currentExports}
                  onChange={handleNumericChange('currentExports')}
                  onBlur={handleNumericBlur('currentExports')}
                />
                <NumericField
                  label="Incremento exportaciones (USD/año)"
                  name="exportIncrease"
                  placeholder="Ej: 900000"
                  value={numericValues.exportIncrease ?? ''}
                  error={numericErrors.exportIncrease}
                  onChange={handleNumericChange('exportIncrease')}
                  onBlur={handleNumericBlur('exportIncrease')}
                />
              </div>
            ) : null}

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

                {mgapExportItems.length ? (
                  <div className="table five-col">
                    <div className="table-row table-header">
                      <div className="table-cell">Situación inicial (USD)</div>
                      <div className="table-cell">% rubro</div>
                      <div className="table-cell">Promedio incremento (USD)</div>
                      <div className="table-cell">Coef x incremento</div>
                      <div className="table-cell">Acciones</div>
                    </div>
                    {mgapExportItems.map((item, index) => {
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
                    <label className="field-label" htmlFor="minturInitial">
                      Situación inicial (USD)
                    </label>
                    <input
                      id="minturInitial"
                      className="field-control"
                      type="text"
                      inputMode="decimal"
                      value={minturInitial}
                      onChange={(event) => setMinturInitial(event.target.value)}
                      onBlur={handleAmountBlur(setMinturInitial)}
                      placeholder="Ej: 100000"
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="minturIncrease">
                      Promedio incremento
                    </label>
                    <input
                      id="minturIncrease"
                      className="field-control"
                      type="text"
                      inputMode="decimal"
                      value={minturIncrease}
                      onChange={(event) => setMinturIncrease(event.target.value)}
                      onBlur={handleAmountBlur(setMinturIncrease)}
                      placeholder="Ej: 20000"
                    />
                  </div>
                </div>
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
                  <option value="none">Sin certificación</option>
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
            <div className="row iplus-row">
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
                  <option value="at">Adecuación Tecnológica (AT) - 4</option>
                  <option value="inn">Innovación (INN) - 7</option>
                  <option value="id">Investigación y Desarrollo Experimental (I+D) - 10</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === stepIndexById.alineacion ? ' active' : ''}`}>
            <div className="row row-narrow">
              <div>
                <label className="field-label" htmlFor="strategicLine">
                  Línea estratégica
                </label>
                <select
                  id="strategicLine"
                  className="field-control"
                  value={inputs.strategicLine}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, strategicLine: event.target.value }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  <option value="riego">Riego</option>
                  <option value="produccion-ganadera">Mejora de la Producción Ganadera</option>
                  <option value="pesca-acuicultura">
                    Desarrollo y modernización de la pesca y la acuicultura
                  </option>
                  <option value="infraestructura-turistica">Servicios e infraestructura turística</option>
                  <option value="eficiencia-desfosilizacion">Eficiencia y Desfosilización</option>
                  <option value="hidrogeno-verde">
                    Cadena de valor del hidrógeno verde y sus derivados
                  </option>
                  <option value="residuos-reciclaje">Valorización de residuos y reciclaje</option>
                  <option value="bioinsumos">Producción de Bioinsumos</option>
                  <option value="farmaceutica-ciencias">
                    Industria farmacéutica y ciencias de la vida
                  </option>
                  <option value="cadena-aeroespacial">
                    Desarrollo de una cadena industrial aeroespacial
                  </option>
                  <option value="plataformas-satelitales">
                    Desarrollo y manufactura de plataformas satelitales
                  </option>
                  <option value="industria-nacional">Componente de Industria Nacional</option>
                </select>
              </div>
              <NumericField
                label="Monto inversión asociada (UI)"
                name="strategicInvestmentPct"
                placeholder="Ej: 200000"
                value={numericValues.strategicInvestmentPct ?? ''}
                error={numericErrors.strategicInvestmentPct}
                onChange={handleNumericChange('strategicInvestmentPct')}
                onBlur={handleNumericBlur('strategicInvestmentPct')}
                className="narrow-field"
              />
            </div>

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
                <label className="field-label">
                  Localización Servicios e Infraestructura Turística en zona turística
                </label>
                <div className="radio">
                  <label className="pill">
                    <input
                      type="radio"
                      name="tourismZoneLocation"
                      value="si"
                      checked={inputs.tourismZoneLocation === 'si'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, tourismZoneLocation: event.target.value }))
                      }
                    />
                    Si
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="tourismZoneLocation"
                      value="no"
                      checked={inputs.tourismZoneLocation === 'no'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, tourismZoneLocation: event.target.value }))
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            ) : null}

            {inputs.evaluatingMinistry === 'miem' ? (
              <div className="spacer-top">
                <label className="field-label" htmlFor="mineralProcessingLevel">
                  Industrialización a partir de minerales naturales
                </label>
                <select
                  id="mineralProcessingLevel"
                  className="field-control"
                  value={inputs.mineralProcessingLevel}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      mineralProcessingLevel: event.target.value,
                    }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  <option value="minima">Transformación Mínima</option>
                  <option value="intermedia">Transformación Intermedia</option>
                  <option value="maxima">Transformación Máxima</option>
                </select>
              </div>
            ) : null}
          </section>

          <section
            className={`step${currentStep === stepIndexById['indicadores-mef'] ? ' active' : ''}`}
          >
            <div className="row row-narrow">
              <NumericField
                label="Inversión en energías renovables (UI)"
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
                    <div className="pdf-title">Simulador COMAP</div>
                    <div className="pdf-subtitle">Resumen de resultados</div>
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
                  <p className="metric-title">Años de exoneración</p>
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
