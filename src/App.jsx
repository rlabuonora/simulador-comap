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

const defaultInputs = {
  investment: 1800000,
  employees: 120,
  exportPct: 35,
  sustainabilityPct: 8,
  iPlusType: 'b',
  iPlusPct: 4,
  strategicPriorities: 2,
  regionTier: 'interior',
  sector: '',
  department: '',
  weeklyHours: 40,
  collectiveWomen: false,
  collectiveYouth: false,
  collectiveDisability: false,
  currentExports: 0,
  futureExports: 0,
  certification: 'ninguna',
  iPlusCategory: 'adecuacion',
  ministry: '',
  strategicLine: '',
  strategicInvestmentPct: 0,
};

const buildNumericValues = (source) => ({
  investment: String(source.investment ?? ''),
  employees: String(source.employees ?? ''),
  weeklyHours: String(source.weeklyHours ?? ''),
  currentExports: String(source.currentExports ?? ''),
  futureExports: String(source.futureExports ?? ''),
  sustainabilityPct: String(source.sustainabilityPct ?? ''),
  iPlusPct: String(source.iPlusPct ?? ''),
  strategicInvestmentPct: String(source.strategicInvestmentPct ?? ''),
});

const steps = [
  {
    id: 'identidad',
    title: 'Paso 1 - Identidad del proyecto',
    hint: 'Definimos el tamaño y la ubicación de tu inversión.',
  },
  {
    id: 'impacto-economico',
    title: 'Paso 2 - Impacto económico',
    hint: 'Cuánto empleo y exportaciones genera tu proyecto.',
  },
  {
    id: 'impacto-ambiental',
    title: 'Paso 3 - Impacto ambiental',
    hint: 'Qué tan verde es tu inversión.',
  },
  {
    id: 'transformacion',
    title: 'Paso 4 - Transformación productiva (I+)',
    hint: 'Cómo el proyecto cambia tu nivel tecnológico.',
  },
  {
    id: 'alineacion',
    title: 'Paso 5 - Alineación estratégica',
    hint: 'Cómo tu proyecto encaja en prioridades país.',
  },
  {
    id: 'resultado',
    title: 'Paso 6 - Resultado',
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

    setNumericErrors((prev) => ({ ...prev, [key]: '' }));
    setInputs((prev) => ({ ...prev, [key]: parsed }));
  };

  const goNext = () => {
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

  const handleDownload = () => {
    const payload = {
      inputs,
      scores,
      totalScore: Number(totalScore.toFixed(2)),
      iraePct: Number((iraePct * 100).toFixed(1)),
      exonerationYears,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'comap-simulacion.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const NumericField = ({ label, name, placeholder }) => {
    const error = numericErrors[name];

    return (
      <div className="field-group">
        <label className="field-label" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          className={`field-control${error ? ' error' : ''}`}
          type="text"
          inputMode="decimal"
          value={numericValues[name] ?? ''}
          onChange={handleNumericChange(name)}
          onBlur={handleNumericBlur(name)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
        />
        {error ? <div className="field-error">{error}</div> : null}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="gov-header">
        <div className="gov-inner">
          <div className="gov-brand">
            <img className="gov-logo" src="/mef-logo.png" alt="MEF logo" />
            <div className="gov-text">
              Ministerio de Economía y Finanzas
              <small>Comisión de Aplicación de la Ley de Inversiones - COMAP</small>
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
            <div className="proj-header">Simulador de Puntaje</div>
            <p className="muted">
              Completa la información paso a paso para simular el beneficio COMAP estimado.
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
            <NumericField
              label="Inversión elegible total (UI)"
              name="investment"
              placeholder="Ej: 10000000"
            />

            <div className="row">
              <div>
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
              <div>
                <label className="field-label" htmlFor="department">
                  Departamento
                </label>
                <select
                  id="department"
                  className="field-control"
                  value={inputs.department}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, department: event.target.value }))
                  }
                >
                  <option value="">Seleccionar...</option>
                  <option value="montevideo">Montevideo</option>
                  <option value="canelones">Canelones</option>
                  <option value="tacuarembo">Tacuarembó</option>
                  <option value="rocha">Rocha</option>
                  <option value="artigas">Artigas</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`step${currentStep === 1 ? ' active' : ''}`}>
            <NumericField label="Empleos nuevos" name="employees" placeholder="Ej: 6" />

            <NumericField label="Horas promedio semanales" name="weeklyHours" placeholder="Ej: 40" />

            <label className="field-label">Colectivos</label>
            <div className="check">
              <label className="pill">
                <input
                  type="checkbox"
                  checked={inputs.collectiveWomen}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, collectiveWomen: event.target.checked }))
                  }
                />
                Mujeres
              </label>
              <label className="pill">
                <input
                  type="checkbox"
                  checked={inputs.collectiveYouth}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, collectiveYouth: event.target.checked }))
                  }
                />
                Jóvenes
              </label>
              <label className="pill">
                <input
                  type="checkbox"
                  checked={inputs.collectiveDisability}
                  onChange={(event) =>
                    setInputs((prev) => ({ ...prev, collectiveDisability: event.target.checked }))
                  }
                />
                Discapacidad
              </label>
            </div>

            <div className="row">
              <NumericField
                label="Exportaciones actuales (USD/año)"
                name="currentExports"
                placeholder="Ej: 500000"
              />
              <NumericField
                label="Exportaciones futuras (USD/año)"
                name="futureExports"
                placeholder="Ej: 900000"
              />
            </div>
          </section>

          <section className={`step${currentStep === 2 ? ' active' : ''}`}>
            <NumericField label="% inversión ambiental" name="sustainabilityPct" placeholder="Ej: 25" />

            <label className="field-label" htmlFor="certification">
              Certificación
            </label>
            <select
              id="certification"
              className="field-control"
              value={inputs.certification}
              onChange={(event) => setInputs((prev) => ({ ...prev, certification: event.target.value }))}
            >
              <option value="ninguna">Ninguna</option>
              <option value="leed">LEED</option>
              <option value="breeam">BREEAM</option>
              <option value="eficiencia">Sello eficiencia energética</option>
            </select>
          </section>

          <section className={`step${currentStep === 3 ? ' active' : ''}`}>
            <label className="field-label">Categoría I+</label>
            <div className="radio">
              <label className="pill">
                <input
                  type="radio"
                  name="iplus"
                  value="adecuacion"
                  checked={inputs.iPlusCategory === 'adecuacion'}
                  onChange={(event) => setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))}
                />
                Adecuación tecnológica
              </label>
              <label className="pill">
                <input
                  type="radio"
                  name="iplus"
                  value="innovacion"
                  checked={inputs.iPlusCategory === 'innovacion'}
                  onChange={(event) => setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))}
                />
                Innovación
              </label>
              <label className="pill">
                <input
                  type="radio"
                  name="iplus"
                  value="id"
                  checked={inputs.iPlusCategory === 'id'}
                  onChange={(event) => setInputs((prev) => ({ ...prev, iPlusCategory: event.target.value }))}
                />
                I+D
              </label>
            </div>

            <NumericField label="% inversión asociada" name="iPlusPct" placeholder="Ej: 30" />
          </section>

          <section className={`step${currentStep === 4 ? ' active' : ''}`}>
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

            <NumericField
              label="% inversión asociada"
              name="strategicInvestmentPct"
              placeholder="Ej: 20"
            />
          </section>

          <section className={`step${currentStep === 5 ? ' active' : ''}`}>
            <div className="summary">
              <strong>Resultado simulado</strong>
              <p>Puntaje total: {totalScore.toFixed(2)}</p>
              <p>Exoneración IRAE: {(iraePct * 100).toFixed(1)}%</p>
              <p>Años de exoneración: {exonerationYears}</p>
              <p className="muted">(En esta versión el cálculo está conectado.)</p>
            </div>

            <div className="card summary-card">
              <div className="card-header">
                <h3>Indicadores</h3>
                <span>Escala 0-10</span>
              </div>
              <SummaryChart indicators={INDICATORS} scores={scores} />
            </div>

            <button className="btn-primary" onClick={handleDownload}>
              Descargar resultado JSON
            </button>
          </section>

          <div className="actions">
            <button className="btn-secondary" onClick={goPrev} disabled={currentStep === 0}>
              Atrás
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
