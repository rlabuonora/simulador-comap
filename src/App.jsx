import { useMemo, useState } from 'react';
import SummaryChart from './components/SummaryChart.jsx';
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
  employees: 120,
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
  certification: 'ninguna',
  iPlusCategory: 'adecuacion',
  ministry: '',
  strategicLine: '',
  strategicInvestmentPct: 0,
};

departments.forEach((dept) => {
  defaultInputs[`${dept.id}Pct`] = 0;
});

const buildNumericValues = (source) => {
  const base = {
    investment: source.investment ? String(source.investment) : '',
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

const NumericField = ({ label, name, placeholder, value, error, onChange, onBlur, className }) => {
  return (
    <div className={`field-group${className ? ` ${className}` : ''}`}>
      <label className="field-label" htmlFor={name}>
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

const isDepartmentKey = (key) => departments.some((dept) => `${dept.id}Pct` === key);

const steps = [
  {
    id: 'identidad',
    title: 'Paso 1 - Datos generales del proyecto',
    hint: 'Información general del proyecto de inversión.',
  },
  {
    id: 'descentralizacion',
    title: 'Paso 2 - Descentralización',
    hint: 'Distribuye el porcentaje de inversión por departamento.',
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
    id: 'impacto-ambiental',
    title: 'Paso 5 - Impacto ambiental',
    hint: 'Datos de impacto ambiental.',
  },
  {
    id: 'transformacion',
    title: 'Paso 6 - Transformación productiva (I+)',
    hint: 'Desarrollo tecnológico.',
  },
  {
    id: 'alineacion',
    title: 'Paso 7 - Alineación estratégica',
    hint: 'Cómo tu proyecto encaja en prioridades país.',
  },
  {
    id: 'resultado',
    title: 'Paso 8 - Resultado',
    hint: 'Este es el impacto estimado de tu proyecto.',
  },
];

export default function App() {
  const [inputs, setInputs] = useState(defaultInputs);
  const [numericValues, setNumericValues] = useState(() => buildNumericValues(defaultInputs));
  const [numericErrors, setNumericErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

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

  const isLastStep = currentStep === steps.length - 1;

  const handleNumericChange = (key) => (event) => {
    const nextValue = event.target.value;
    setNumericValues((prev) => ({ ...prev, [key]: nextValue }));
    if (numericErrors[key]) {
      setNumericErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleNumericBlur = (key) => (event) => {
    const rawValue = event.target.value.trim();

    if (!rawValue) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Este campo es obligatorio.' }));
      return;
    }

    const parsed = Number(rawValue);
    if (Number.isNaN(parsed)) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Ingrese un número válido.' }));
      return;
    }

    if ((isDepartmentKey(key) || key === 'sustainabilityPct') && (parsed < 0 || parsed > 100)) {
      setNumericErrors((prev) => ({ ...prev, [key]: 'Debe estar entre 0 y 100.' }));
      return;
    }

    setNumericErrors((prev) => ({ ...prev, [key]: '' }));
    setInputs((prev) => ({ ...prev, [key]: parsed }));
  };

  const goNext = () => {
    if (currentStep === 0) {
      const rawValue = numericValues.investment?.trim();
      const parsed = Number(rawValue);

      if (!rawValue || Number.isNaN(parsed) || parsed <= 0) {
        setNumericErrors((prev) => ({ ...prev, investment: 'Debe ingresar un valor mayor a 0.' }));
        return;
      }

      setInputs((prev) => ({ ...prev, investment: parsed }));
    }

    if (currentStep === 1) {
      let hasError = false;
      let total = 0;
      const nextErrors = {};

      departments.forEach((dept) => {
        const key = `${dept.id}Pct`;
        const rawValue = numericValues[key]?.trim();
        const parsed = Number(rawValue);

        if (!rawValue || Number.isNaN(parsed)) {
          nextErrors[key] = 'Ingrese un valor entre 0 y 100.';
          hasError = true;
          return;
        }

        if (parsed < 0 || parsed > 100) {
          nextErrors[key] = 'Debe estar entre 0 y 100.';
          hasError = true;
          return;
        }

        total += parsed;
      });

      if (hasError || total !== 100) {
        if (!hasError) {
          departments.forEach((dept) => {
            const key = `${dept.id}Pct`;
            nextErrors[key] = 'La suma debe ser 100.';
          });
        }
        setNumericErrors((prev) => ({ ...prev, ...nextErrors }));
        return;
      }

      const nextInputs = {};
      departments.forEach((dept) => {
        const key = `${dept.id}Pct`;
        nextInputs[key] = Number(numericValues[key]);
      });
      setInputs((prev) => ({ ...prev, ...nextInputs }));
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
            <a href="#">Panel</a>
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
                label="Inversión elegible total (UI)"
                name="investment"
                placeholder="Ej: 10000000"
                value={numericValues.investment ?? ''}
                error={numericErrors.investment}
                onChange={handleNumericChange('investment')}
                onBlur={handleNumericBlur('investment')}
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
          </section>

          <section className={`step${currentStep === 1 ? ' active' : ''}`}>
            <div className="section-subtitle">{'Distribución por departamento'}</div>
            <div className="table two-col">
              <div className="table-row table-header">
                <div className="table-cell">Departamento</div>
                <div className="table-cell">% de inversión</div>
              </div>
              {departments.map((dept) => {
                const fieldName = `${dept.id}Pct`;
                return (
                  <div className="table-row" key={dept.id}>
                    <div className="table-cell">{dept.label}</div>
                    <div className="table-cell">
                      <NumericField
                        label={`${dept.label} (% inversión)`}
                        name={fieldName}
                        placeholder="Ej: 10"
                        value={numericValues[fieldName] ?? ''}
                        error={numericErrors[fieldName]}
                        onChange={handleNumericChange(fieldName)}
                        onBlur={handleNumericBlur(fieldName)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`step${currentStep === 2 ? ' active' : ''}`}>
            <div className="table">
              <div className="table-row table-header">
                <div className="table-cell">Colectivo</div>
                <div className="table-cell">Base</div>
                <div className="table-cell">Incremento</div>
              </div>

              <div className="table-row">
                <div className="table-cell">Mujeres</div>
                <div className="table-cell">
                  <NumericField
                    label="Mujeres (base)"
                    name="womenBase"
                    placeholder="Ej: 2"
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
                <div className="table-cell">{'Jóvenes'}</div>
                <div className="table-cell">
                  <NumericField
                    label={'Jóvenes (base)'}
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
                    label="Discapacitados (base)"
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
                <div className="table-cell">DINALI</div>
                <div className="table-cell">
                  <NumericField
                    label="DINALI (base)"
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
                <div className="table-cell">TUS/Trans</div>
                <div className="table-cell">
                  <NumericField
                    label="TUS/Trans (base)"
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
                <div className="table-cell">Otros</div>
                <div className="table-cell">
                  <NumericField
                    label="Otros (base)"
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
            <div className="row impacto-ambiental-row">
              <NumericField
                label="% inversión"
                name="sustainabilityPct"
                placeholder="Ej: 25"
                value={numericValues.sustainabilityPct ?? ''}
                error={numericErrors.sustainabilityPct}
                onChange={handleNumericChange('sustainabilityPct')}
                onBlur={handleNumericBlur('sustainabilityPct')}
                className="narrow-field"
              />

              <div>
                <label className="field-label">Certificación</label>
                <div className="radio radio-tight">
                  <label className="pill">
                    <input
                      type="radio"
                      name="certification"
                      value="ninguna"
                      checked={inputs.certification === 'ninguna'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, certification: event.target.value }))
                      }
                    />
                    Sin certificación
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="certification"
                      value="leed-breeam"
                      checked={inputs.certification === 'leed-breeam'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, certification: event.target.value }))
                      }
                    />
                    LEED/BREEAM
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="certification"
                      value="eficiencia"
                      checked={inputs.certification === 'eficiencia'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, certification: event.target.value }))
                      }
                    />
                    Sello eficiencia energética
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="certification"
                      value="iso"
                      checked={inputs.certification === 'iso'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, certification: event.target.value }))
                      }
                    />
                    ISO 14001 / 50001
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === 5 ? ' active' : ''}`}>
            <div className="row iplus-row">
              <NumericField
                label="% inversión"
                name="iPlusPct"
                placeholder="Ej: 30"
                value={numericValues.iPlusPct ?? ''}
                error={numericErrors.iPlusPct}
                onChange={handleNumericChange('iPlusPct')}
                onBlur={handleNumericBlur('iPlusPct')}
                className="narrow-field"
              />
              <div>
                <label className="field-label">Categoría I+</label>
                <div className="radio radio-tight">
                  <label className="pill">
                    <input
                      type="radio"
                      name="iplus"
                      value="adecuacion"
                      checked={inputs.iPlusCategory === 'adecuacion'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))
                      }
                    />
                    Adecuación tecnológica
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="iplus"
                      value="innovacion"
                      checked={inputs.iPlusCategory === 'innovacion'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))
                      }
                    />
                    Innovación
                  </label>
                  <label className="pill">
                    <input
                      type="radio"
                      name="iplus"
                      value="id"
                      checked={inputs.iPlusCategory === 'id'}
                      onChange={(event) =>
                        setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))
                      }
                    />
                    I+D
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === 6 ? ' active' : ''}`}>
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
                  {'Línea estratégica'}
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

          <section className={`step${currentStep === 7 ? ' active' : ''}`}>
            <div className="metric-grid">
              <div className="metric-card">
                <p className="metric-title">Puntaje total</p>
                <p className="metric-value">{totalScore.toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <p className="metric-title">{'Exoneración IRAE'}</p>
                <p className="metric-value">{(iraePct * 100).toFixed(1)}%</p>
              </div>
              <div className="metric-card">
                <p className="metric-title">{'Años de exoneración'}</p>
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
