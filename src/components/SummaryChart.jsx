export default function SummaryChart({ indicators, scores }) {
  return (
    <div className="summary">
      {indicators.map((indicator) => {
        const score = scores[indicator.id] ?? 0;
        const percent = Math.min((score / indicator.maxScore) * 100, 100);

        return (
          <div key={indicator.id} className="summary-row">
            <div className="summary-header">
              <span>{indicator.label}</span>
              <span>{score.toFixed(1)}</span>
            </div>
            <div className="summary-track">
              <div
                className="summary-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
