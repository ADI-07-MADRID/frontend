import { useEffect, useState } from 'react';

export default function SettingsPanel({ settings, onSave }) {
  const [form, setForm] = useState(settings || {});
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(settings || {}), [settings]);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel settings-panel">
      <div className="section-heading">
        <div>
          <h2>Master Label Configuration</h2>
          <p>These values are stored in PostgreSQL and used by the backend label generator.</p>
        </div>
        <div className="rule-badge">B-10 / 4 × 6 in / Code 128</div>
      </div>

      <form onSubmit={submit} className="form-grid">
        <label>A-S Supplier ID *
          <input required inputMode="numeric" pattern="[0-9]{1,14}" value={form.supplierId || ''} onChange={e => update('supplierId', e.target.value)} placeholder="1 to 14 numeric digits" />
          <span className="field-help">The 15-digit serial starts with this ID.</span>
        </label>
        <label>Supplier Name
          <input value={form.supplierName || ''} onChange={e => update('supplierName', e.target.value)} />
        </label>
        <label className="wide">Ship From *
          <textarea required rows="4" value={form.shipFrom || ''} onChange={e => update('shipFrom', e.target.value)} placeholder="Supplier address + A-S assigned supplier ID" />
        </label>
        <label className="wide">Ship To *
          <textarea required rows="4" value={form.shipTo || ''} onChange={e => update('shipTo', e.target.value)} placeholder="A-S receiving address" />
        </label>
        <label>Packing List Source
          <select value={form.packingListSource || 'AUTO'} onChange={e => update('packingListSource', e.target.value)}>
            <option value="AUTO">AUTO: PKG ID, otherwise Invoice Number</option>
            <option value="PKG_ID">PKG ID</option>
            <option value="INVOICE_NUMBER">Invoice Number</option>
          </select>
          <span className="field-help">The PDF allows 8 data characters for packing list number. Use Edit to override per row.</span>
        </label>
        <label>Default Revision Level
          <input value={form.defaultRevisionLevel || ''} onChange={e => update('defaultRevisionLevel', e.target.value)} />
        </label>

        <div className="settings-rule wide">
          <strong>Serial rule</strong>
          <span>Supplier ID + zero-padded unique sequence = exactly 15 numeric digits. Barcode payload = 9S + serial number.</span>
        </div>

        <div className="modal-actions wide">
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Configuration'}</button>
        </div>
      </form>
    </section>
  );
}
