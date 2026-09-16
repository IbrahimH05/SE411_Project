import { useState } from 'react';

import { CATEGORIES, EMPTY_ASSET, normaliseAsset } from '../domain/assetModel';
import { isValid, validateAsset } from '../domain/assetValidation';

export function AssetForm({ initialValues = EMPTY_ASSET, existingAssets, editingId, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setField = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));

    if (touched[field]) {
      setErrors(validateAsset({ ...values, [field]: value }, { existingAssets, editingId }));
    }
  };

  const markTouched = (field) => () => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validateAsset(values, { existingAssets, editingId }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateAsset(values, { existingAssets, editingId });
    setErrors(nextErrors);
    setTouched(Object.fromEntries(Object.keys(values).map((key) => [key, true])));

    if (isValid(nextErrors)) {
      onSubmit(normaliseAsset(values));
    }
  };

  const fieldProps = (field) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: setField(field),
    onBlur: markTouched(field),
    'aria-invalid': errors[field] ? 'true' : undefined,
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  });

  const errorFor = (field) =>
    errors[field] ? (
      <span className="field-error" id={`${field}-error`} role="alert">
        {errors[field]}
      </span>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="ticker">Ticker</label>
          <input {...fieldProps('ticker')} placeholder="AAPL" maxLength={10} />
          {errorFor('ticker')}
        </div>

        <div className="field">
          <label htmlFor="name">Name</label>
          <input {...fieldProps('name')} placeholder="Apple Inc." maxLength={80} />
          {errorFor('name')}
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select {...fieldProps('category')}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errorFor('category')}
        </div>

        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input {...fieldProps('quantity')} type="number" step="any" min="0" placeholder="50" />
          {errorFor('quantity')}
        </div>

        <div className="field">
          <label htmlFor="purchasePrice">Purchase price (USD)</label>
          <input {...fieldProps('purchasePrice')} type="number" step="any" min="0" placeholder="178.20" />
          {errorFor('purchasePrice')}
        </div>

        <div className="field">
          <label htmlFor="currentPrice">Current price (USD)</label>
          <input {...fieldProps('currentPrice')} type="number" step="any" min="0" placeholder="214.60" />
          {errorFor('currentPrice')}
        </div>

        <div className="field">
          <label htmlFor="purchaseDate">Purchase date</label>
          <input {...fieldProps('purchaseDate')} type="date" />
          {errorFor('purchaseDate')}
        </div>

        <div className="field field-full">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea {...fieldProps('notes')} maxLength={280} placeholder="Why you hold this position" />
          {errorFor('notes') ?? <span className="field-hint">{values.notes.length}/280</span>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
