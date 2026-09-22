export default function DataTable({ rows, selectedIds, onToggle, onToggleAll, onEdit, onPreview, onPrintQuantityChange }) {
  const allSelected = rows.length > 0 && rows.every(row => selectedIds.has(row.clientRowId));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Select all" /></th>
            <th>PO</th>
            <th>Part No.</th>
            <th>Description</th>
            <th>Pallet Qty</th>
            <th>Total Qty</th>
            <th>Pallets</th>
            <th>Rule Labels</th>
            <th>Print Qty</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const statusClass = row.status === 'ERROR' ? 'status-error' : row.status === 'WARNING' ? 'status-warning' : 'status-ok';
            return (
              <tr key={row.clientRowId} className={selectedIds.has(row.clientRowId) ? 'selected-row' : ''}>
                <td><input type="checkbox" checked={selectedIds.has(row.clientRowId)} onChange={() => onToggle(row.clientRowId)} /></td>
                <td className="mono">{row.customerPoNumber || '-'}</td>
                <td className="mono">{row.partNumber || '-'}</td>
                <td className="description-cell" title={row.description}>{row.description || '-'}</td>
                <td>{row.perPalletQuantity ?? '-'}</td>
                <td>{row.totalQuantity ?? '-'}</td>
                <td>{row.numberOfPallets ?? '-'}</td>
                <td>{row.recommendedPrintQuantity}</td>
                <td>
                  <input
                    className="inline-number"
                    type="number"
                    min="1"
                    value={row.requestedPrintQuantity ?? ''}
                    onBlur={event => onPrintQuantityChange(row.clientRowId, event.target.value)}
                    title="Physical labels to print; backend re-validates against B-10 calculation."
                  />
                </td>
                <td><span className={`status-pill ${statusClass}`}>{row.status}</span></td>
                <td className="row-actions">
                  <button className="link-button" onClick={() => onPreview(row)}>Preview</button>
                  <button className="link-button" onClick={() => onEdit(row)}>Edit</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
