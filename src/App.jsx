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

const defaultInputs = {
  investment: 0,
  employees: 0,
  annualBillingUi: 0,
  usdRate: 0,
  uiRate: 0,
  machineryUi: 0,
  installationsUi: 0,
  civilWorksUi: 0,
  industrialParkInvestmentUi: 0,
  occupiedPersonnel: 0,
  employmentInitial: 0,
  employmentIncreaseAvg: 0,
  deptAllocations: [],
  exportPct: 35,
  sustainabilityPct: 0,
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
  futureExports: 0,
  certification: 'none',
  iPlusCategory: 'at',
  ministry: '',
  evaluatingMinistry: '',
  strategicLine: '',
  strategicInvestmentPct: 0,
  isNewCompany: '',
  isIndustrialParkUser: '',
  industrialParkActivity: '',
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
    futureExports: String(source.futureExports ?? ''),
    sustainabilityPct: source.sustainabilityPct === 0 ? '0' : String(source.sustainabilityPct ?? ''),
    iPlusPct: source.iPlusPct === 0 ? '0' : String(source.iPlusPct ?? ''),
    strategicInvestmentPct:
      source.strategicInvestmentPct === 0 ? '0' : String(source.strategicInvestmentPct ?? ''),
  };

  departments.forEach((dept) => {
    const key = `${dept.id}Pct`;
    base[key] = String(source[key] ?? '');
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

const steps = [
  {
    id: 'empresa',
    title: 'Paso 1 - Datos de la empresa',
    hint: 'Información general de la empresa solicitante.',
  },
  {
    id: 'proyecto',
    title: 'Paso 2 - Datos del proyecto',
    hint: 'Información general del proyecto de inversión.',
  },
  {
    id: 'empleo',
    title: 'Paso 3 - Generación de Empleo',
    hint: 'Completa la información de colectivos para generación de empleo.',
  },
  {
    id: 'exportaciones',
    title: 'Paso 4 - Exportaciones',
    hint: 'Reporta el nivel actual y futuro de exportaciones del proyecto.',
  },
  {
    id: 'descentralizacion',
    title: 'Paso 5 - Descentralización',
    hint: 'Distribuye el porcentaje de inversión por departamento.',
  },
  {
    id: 'impacto-ambiental',
    title: 'Paso 6 - Impacto ambiental',
    hint: 'Datos de impacto ambiental.',
  },
  {
    id: 'transformacion',
    title: 'Paso 7 - Transformación productiva (I+)',
    hint: 'Desarrollo tecnológico.',
  },
  {
    id: 'alineacion',
    title: 'Paso 8 - Alineación estratégica',
    hint: 'Cómo tu proyecto encaja en prioridades país.',
  },
  {
    id: 'resultado',
    title: 'Paso 9 - Resultado',
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
  const [showEmploymentDetails, setShowEmploymentDetails] = useState(false);
  const pdfRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    setInputs((prev) => ({ ...prev, deptAllocations }));
  }, [deptAllocations]);

  const scores = useMemo(() => {
    return {
      employment: scoreEmployment(inputs),
      decentralization: scoreDecentralization(inputs),
      exports: scoreExports(inputs),
      sustainability: scoreSustainability(inputs),
      iPlus: scoreIPlus(inputs),
      strategic: scoreStrategic(inputs),
    };
  }, [inputs]);

  const totalScore = useMemo(() => finalScore(scores), [scores]);
  const iraePct = useMemo(() => computeIraePct(totalScore), [totalScore]);
  const exonerationYears = totalScore >= 8 ? 10 : totalScore >= 6 ? 7 : totalScore >= 4 ? 5 : 3;
  const parseNumericValue = (value) => {
    const parsed = Number(String(value ?? '').trim());
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const investmentTotal = useMemo(() => {
    return (
      parseNumericValue(numericValues.machineryUi) +
      parseNumericValue(numericValues.installationsUi) +
      parseNumericValue(numericValues.civilWorksUi)
    );
  }, [numericValues.civilWorksUi, numericValues.installationsUi, numericValues.machineryUi]);

  const investmentTotalUsd = useMemo(() => {
    const uiRate = parseNumericValue(numericValues.uiRate);
    const usdRate = parseNumericValue(numericValues.usdRate);
    if (!uiRate || !usdRate) {
      return 0;
    }
    return (investmentTotal * uiRate) / usdRate;
  }, [investmentTotal, numericValues.uiRate, numericValues.usdRate]);

  const totalDepartmentAmount = useMemo(() => {
    return deptAllocations.reduce((sum, allocation) => sum + (allocation.pct ?? 0), 0);
  }, [deptAllocations]);

  const totalInvestmentForDept = investmentTotal || totalDepartmentAmount;

  const isLastStep = currentStep === steps.length - 1;

  const handleExportPdf = async () => {
    if (!pdfRef.current || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f6f7f9',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('simulador-comap.pdf');
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
  };

  const handleNumericBlur = (key) => (event) => {
    const rawValue = event.target.value.trim();

    if (!ENABLE_VALIDATION) {
      const parsed = Number(rawValue);
      if (!Number.isNaN(parsed)) {
        setInputs((prev) => ({ ...prev, [key]: parsed }));
      }
      return;
    }

    if (!rawValue) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Este campo es obligatorio.' }));
      return;
    }

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Ingrese un número válido.' }));
      return;
    }

    if ((key === 'sustainabilityPct' || key === 'iPlusPct') && parsed < 0) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Debe ser mayor o igual a 0.' }));
      return;
    }

    setNumericErrors((prev) => ({ ...prev, [key]: '' }));
    setInputs((prev) => ({ ...prev, [key]: parsed }));
  };

  const handleAddDepartment = () => {
    const rawPct = deptPctValue.trim();
    const parsedPct = Number(rawPct);

    if (!deptSelection) {
      setAllocationError('Seleccione un departamento.');
      return;
    }

    if (!rawPct || Number.isNaN(parsedPct) || parsedPct < 0) {
      setAllocationError('Ingrese un monto válido.');
      return;
    }

    setDeptAllocations((prev) => {
      const orderMap = new Map(departments.map((dept, index) => [dept.id, index]));
      const next = prev.filter((item) => item.id !== deptSelection);
      return [...next, { id: deptSelection, pct: parsedPct }].sort(
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

  const goNext = () => {
    if (!ENABLE_VALIDATION) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      return;
    }

    if (currentStep === 0) {
      const nextErrors = {};
      const rawBilling = numericValues.annualBillingUi?.trim();
      const billingParsed = Number(rawBilling);
      const rawEmployees = numericValues.employees?.trim();
      const employeesParsed = Number(rawEmployees);

      if (!rawBilling || Number.isNaN(billingParsed) || billingParsed <= 0) {
        nextErrors.annualBillingUi = 'Debe ingresar un valor mayor a 0.';
      }

      if (!rawEmployees || Number.isNaN(employeesParsed) || employeesParsed <= 0) {
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

    if (currentStep === 1) {
      const nextErrors = {};
      const fields = [
        { key: 'machineryUi', label: 'maquinaria' },
        { key: 'installationsUi', label: 'instalaciones' },
        { key: 'civilWorksUi', label: 'obra civil' },
        { key: 'industrialParkInvestmentUi', label: 'parque industrial' },
      ];

      fields.forEach(({ key }) => {
        const rawValue = numericValues[key]?.trim();
        const parsed = Number(rawValue);

        if (!rawValue || Number.isNaN(parsed) || parsed < 0) {
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
        machineryUi: Number(numericValues.machineryUi),
        installationsUi: Number(numericValues.installationsUi),
        civilWorksUi: Number(numericValues.civilWorksUi),
        industrialParkInvestmentUi: Number(numericValues.industrialParkInvestmentUi),
        investment: investmentTotal,
      }));
    }

    if (currentStep === 4) {
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
    setShowEmploymentDetails(false);
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
          <nav className="gov-nav">
            <a className="active" href="#">
              Simulador
            </a>
          </nav>
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
          <button className="btn-secondary" onClick={handleReset}>
            Restablecer
          </button>
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
            <div className="step-title">{steps[currentStep].title}</div>
            <div className="hint">{steps[currentStep].hint}</div>
          </div>

          <section className={`step${currentStep === 0 ? ' active' : ''}`}>
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

          <section className={`step${currentStep === 1 ? ' active' : ''}`}>
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
                  {investmentTotal.toFixed(0)}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="investmentTotalUsd">
                  Inversión elegible total (USD)
                </label>
                <div id="investmentTotalUsd" className="field-control">
                  {investmentTotalUsd.toFixed(2)}
                </div>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === 2 ? ' active' : ''}`}>
            <div className="form-grid">
              <NumericField
                label="Personal ocupado"
                labelTitle="Equivalente a 30 hs. semanales o 130 hs. mensuales."
                name="occupiedPersonnel"
                placeholder="Ej: 120"
                value={numericValues.occupiedPersonnel ?? ''}
                error={numericErrors.occupiedPersonnel}
                onChange={handleNumericChange('occupiedPersonnel')}
                onBlur={handleNumericBlur('occupiedPersonnel')}
              />
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

            <button
              className="btn-secondary"
              type="button"
              onClick={() => setShowEmploymentDetails((prev) => !prev)}
            >
              {showEmploymentDetails ? 'Ocultar detalle por colectivos' : 'Mostrar detalle por colectivos'}
            </button>

            {showEmploymentDetails ? (
              <div className="table two-col">
                <div className="table-row table-header">
                  <div className="table-cell">Colectivo</div>
                  <div className="table-cell">Incremento</div>
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

                <div className="table-row">
                  <div className="table-cell">Otros</div>
                  <div className="table-cell">
                    <NumericField
                      label="Otros (incremento)"
                      name="othersIncrease"
                      placeholder="Ej: 1"
                      value={numericValues.othersIncrease ?? ''}
                      error={numericErrors.othersIncrease}
                      onChange={handleNumericChange('othersIncrease')}
                      onBlur={handleNumericBlur('othersIncrease')}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className={`step${currentStep === 3 ? ' active' : ''}`}>
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
                label="Exportaciones futuras (USD/año)"
                name="futureExports"
                placeholder="Ej: 900000"
                value={numericValues.futureExports ?? ''}
                error={numericErrors.futureExports}
                onChange={handleNumericChange('futureExports')}
                onBlur={handleNumericBlur('futureExports')}
              />
            </div>
          </section>

          <section className={`step${currentStep === 4 ? ' active' : ''}`}>
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
                    ? (allocation.pct / totalInvestmentForDept) * deptScore
                    : 0;
                  return (
                    <div className="table-row" key={allocation.id}>
                      <div className="table-cell">{dept?.label ?? allocation.id}</div>
                      <div className="table-cell">{allocation.pct}</div>
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

          <section className={`step${currentStep === 5 ? ' active' : ''}`}>
            <div className="row impacto-ambiental-row">
              <NumericField
                label="Monto inversión (UI)"
                name="sustainabilityPct"
                placeholder="Ej: 250000"
                value={numericValues.sustainabilityPct ?? ''}
                error={numericErrors.sustainabilityPct}
                onChange={handleNumericChange('sustainabilityPct')}
                onBlur={handleNumericBlur('sustainabilityPct')}
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

          <section className={`step${currentStep === 6 ? ' active' : ''}`}>
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

          <section className={`step${currentStep === 7 ? ' active' : ''}`}>
            <div className="row">
              <div>
                <label className="field-label" htmlFor="ministry">
                  Ministerio
                </label>
                <select
                  id="ministry"
                  className="field-control"
                  value={inputs.ministry}
                  onChange={(event) => setInputs((prev) => ({ ...prev, ministry: event.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  <option value="mgap">MGAP</option>
                  <option value="mintur">MINTUR</option>
                  <option value="miem">MIEM</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="strategicLine">
                  Línea estratégica
                </label>
                <input
                  id="strategicLine"
                  className="field-control"
                  type="text"
                  value={inputs.strategicLine}
                  onChange={(event) => setInputs((prev) => ({ ...prev, strategicLine: event.target.value }))}
                  placeholder="Ej: riego / turismo / desfosilización"
                />
              </div>
            </div>

            <div className="spacer-top">
              <NumericField
                label="% inversión asociada"
                name="strategicInvestmentPct"
                placeholder="Ej: 20"
                value={numericValues.strategicInvestmentPct ?? ''}
                error={numericErrors.strategicInvestmentPct}
                onChange={handleNumericChange('strategicInvestmentPct')}
                onBlur={handleNumericBlur('strategicInvestmentPct')}
                className="narrow-field"
              />
            </div>
          </section>

          <section className={`step${currentStep === 8 ? ' active' : ''}`}>
            <div ref={pdfRef} className="pdf-export">
              <div className="pdf-header">
                <img className="pdf-logo" src="/mef-logo.png" alt="MEF" />
                <div>
                  <div className="pdf-title">Simulador COMAP</div>
                  <div className="pdf-subtitle">Resumen de resultados</div>
                </div>
              </div>
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
