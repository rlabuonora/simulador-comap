export default function IndicatorInput({
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step,
  suffix,
  hint,
  options = [],
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {type === 'select' ? (
        <select
          className="field-control"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="field-row">
          <input
            className="field-control"
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => onChange(event.target.value)}
          />
          {suffix ? <span className="field-suffix">{suffix}</span> : null}
        </div>
      )}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}
