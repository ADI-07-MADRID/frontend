import { useEffect, useState } from 'react';

const SCENARIOS = [
  ['PALLET_IDENTICAL', 'Pallet - identical part/PO/packing list'],
  ['PALLET_MIXED', 'Mixed pallet - one Master Label per combination'],
  ['LARGE_CONTAINER_IDENTICAL', 'Large/bulk container - identical part'],
  ['LOOSE_CONTAINER', 'Loose container']
];

export default function EditRowModal({ row, onClose, onSave }) {
  const [form, setForm] = useState(row);

  useEffect(() => setForm(row), [row]);
  if (!row) return null;

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function numeric(field, value) {
    const cleaned = value === '' ? null : Number(value);
    update(field, Number.isFinite(cleaned) ? Math.trunc(cleaned) : null);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>Edit Master Label Row</h3>
            <p>Changes remain local until you generate the label batch.</p>
          </div>
          <button className="icon-button" onClick={onClose}>×</button>
        </div>

        <div className="form-grid">
          <label>Customer PO<input value={form.customerPoNumber || ''} onChange={e => update('customerPoNumber', e.target.value)} /></label>
          <label>Invoice Number<input value={form.invoiceNumber || ''} onChange={e => update('invoiceNumber', e.target.value)} /></label>
          <label>PKG ID<input value={form.packageId || ''} onChange={e => update('packageId', e.target.value)} /></label>
          <label>Item No.<input value={form.itemNumber || ''} onChange={e => update('itemNumber', e.target.value)} /></label>
          <label>Part No.<input value={form.partNumber || ''} onChange={e => update('partNumber', e.target.value)} /></label>
          <label className="wide">Description<textarea rows="2" value={form.description || ''} onChange={e => update('description', e.target.value)} /></label>
          <label>Per Pallet Qty<input type="number" min="1" value={form.perPalletQuantity ?? ''} onChange={e => numeric('perPalletQuantity', e.target.value)} /></label>
          <label>Total Quantity<input type="number" min="1" value={form.totalQuantity ?? ''} onChange={e => numeric('totalQuantity', e.target.value)} /></label>
          <label>No. of Pallets<input type="number" min="1" value={form.numberOfPallets ?? ''} onChange={e => numeric('numberOfPallets', e.target.value)} /></label>
          <label>Print Quantity<input type="number" min="1" value={form.requestedPrintQuantity ?? ''} onChange={e => numeric('requestedPrintQuantity', e.target.value)} /></label>
          <label>Packing List # (override)<input value={form.packingListOverride || ''} onChange={e => update('packingListOverride', e.target.value)} placeholder="Required if source data is invalid" /></label>
          <label>Revision Level<input value={form.revisionLevel || ''} onChange={e => update('revisionLevel', e.target.value)} /></label>
          <label className="wide">Shipping Scenario
            <select value={form.shippingScenario || 'PALLET_IDENTICAL'} onChange={e => update('shippingScenario', e.target.value)}>
              {SCENARIOS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSave(form)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
