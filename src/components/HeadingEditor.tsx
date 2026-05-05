import { Compass } from 'lucide-react';

interface HeadingEditorProps {
  autoHeading?: number;
  manualHeading: string;
  onManualHeadingChange: (value: string) => void;
  disabled?: boolean;
}

export function HeadingEditor({
  autoHeading,
  manualHeading,
  onManualHeadingChange,
  disabled
}: HeadingEditorProps) {
  const autoLabel = typeof autoHeading === 'number' ? `${Math.round(autoHeading)}°` : 'Not captured';

  return (
    <div className="heading-editor">
      <div className="section-title-row">
        <Compass size={18} />
        <h3>Heading</h3>
      </div>
      <div className="heading-grid">
        <div className="metric-inline">
          <span>Auto</span>
          <strong>{autoLabel}</strong>
        </div>
        <label className="field-control">
          <span>Manual correction</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="359.99"
            step="0.1"
            value={manualHeading}
            disabled={disabled}
            onChange={(event) => onManualHeadingChange(event.target.value)}
            placeholder="0-359.9"
          />
        </label>
      </div>
      <p className="subtle-text">Manual heading is preserved separately and wins when present.</p>
    </div>
  );
}

