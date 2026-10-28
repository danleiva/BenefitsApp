import { useId, type ReactNode } from 'react';
import type { Option } from '../data/options';

interface FieldProps {
  legend: string;
  help?: ReactNode;
  children: ReactNode;
}

export function Field({ legend, help, children }: FieldProps) {
  return (
    <fieldset className="field">
      <legend className="field-legend">{legend}</legend>
      {help && <p className="field-help">{help}</p>}
      {children}
    </fieldset>
  );
}

interface ChoiceProps<T extends string> {
  legend: string;
  help?: ReactNode;
  options: Option<T>[];
  value: T | '';
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}

export function Choice<T extends string>({ legend, help, options, value, onChange, columns = 2 }: ChoiceProps<T>) {
  const name = useId();
  return (
    <Field legend={legend} help={help}>
      <div className={`choices cols-${columns}`}>
        {options.map((o) => (
          <label key={o.value} className={`choice ${value === o.value ? 'selected' : ''}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span className="choice-text">
              <span className="choice-label">{o.label}</span>
              {o.hint && <span className="choice-hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </Field>
  );
}

interface MultiProps<T extends string> {
  legend: string;
  help?: ReactNode;
  options: Option<T>[];
  value: T[];
  onChange: (v: T[]) => void;
  columns?: 1 | 2 | 3;
}

export function MultiChoice<T extends string>({ legend, help, options, value, onChange, columns = 1 }: MultiProps<T>) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <Field legend={legend} help={help}>
      <div className={`choices cols-${columns}`}>
        {options.map((o) => (
          <label key={o.value} className={`choice check ${value.includes(o.value) ? 'selected' : ''}`}>
            <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
            <span className="choice-text">
              <span className="choice-label">{o.label}</span>
              {o.hint && <span className="choice-hint">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </Field>
  );
}

interface YesNoProps {
  legend: string;
  help?: ReactNode;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function YesNo({ legend, help, value, onChange }: YesNoProps) {
  const name = useId();
  return (
    <Field legend={legend} help={help}>
      <div className="choices cols-2 yesno">
        {[true, false].map((v) => (
          <label key={String(v)} className={`choice ${value === v ? 'selected' : ''}`}>
            <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
            <span className="choice-label">{v ? 'Yes' : 'No'}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

interface SelectProps {
  label: string;
  help?: ReactNode;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function Select({ label, help, options, value, onChange, placeholder = 'Select…' }: SelectProps) {
  const id = useId();
  return (
    <div className="field">
      <label className="field-legend" htmlFor={id}>
        {label}
      </label>
      {help && <p className="field-help">{help}</p>}
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CounterProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}

export function Counter({ label, value, onChange, max = 12 }: CounterProps) {
  return (
    <div className="counter">
      <span className="counter-label">{label}</span>
      <div className="counter-controls">
        <button type="button" className="btn-icon" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>
          −
        </button>
        <output aria-live="polite">{value}</output>
        <button type="button" className="btn-icon" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
          +
        </button>
      </div>
    </div>
  );
}

interface TextInputProps {
  label: string;
  help?: ReactNode;
  value: string;
  onChange: (v: string) => void;
  inputMode?: 'numeric' | 'text';
  maxLength?: number;
  placeholder?: string;
}

export function TextInput({ label, help, value, onChange, inputMode = 'text', maxLength, placeholder }: TextInputProps) {
  const id = useId();
  return (
    <div className="field">
      <label className="field-legend" htmlFor={id}>
        {label}
      </label>
      {help && <p className="field-help">{help}</p>}
      <input
        id={id}
        className="input input-short"
        value={value}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
