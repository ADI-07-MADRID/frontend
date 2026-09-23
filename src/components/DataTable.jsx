export default function DataTable({
  rows,
  selectedIds,
  onToggle,
  onToggleAll,
  onEdit,
  onPackageIdChange,
  onPreview,
  onPrintQuantityChange
}) {
  const allSelected = rows.length > 0 && rows.every(row => selectedIds.has(row.clientRowId));

  return (
    <div className="enterprise-table-container">
      <table>
        <thead>
          <tr>
            <th style={{ width: '40px', textAlign: 'center' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all rows"
              />
            </th>
            <th>Customer PO</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Pallet Qty</th>
            <th>Total Qty</th>
            <th>Pallets</th>
            <th>Rule Labels</th>
            <th style={{ width: '110px' }}>Print Qty</th>
            <th style={{ minWidth: '130px' }}>Package ID</th>
            <th style={{ textAlign: 'center', width: '90px', paddingRight: '16px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const isSelected = selectedIds.has(row.clientRowId);

            return (
              <tr key={row.clientRowId} className={isSelected ? 'selected-row' : ''}>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(row.clientRowId)}
                  />
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.customerPoNumber || '-'}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--enterprise-primary)' }}>
                  {row.partNumber || '-'}
                </td>
                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.description}>
                  {row.description || '-'}
                </td>
                <td>{row.perPalletQuantity ?? '-'}</td>
                <td>{row.totalQuantity ?? '-'}</td>
                <td>{row.numberOfPallets ?? '-'}</td>
                <td style={{ fontWeight: 600 }}>{row.recommendedPrintQuantity}</td>
                <td>
                  <input
                    type="number"
                    disabled
                    value={row.requestedPrintQuantity ?? ''}
                    style={{
                      width: '78px',
                      padding: '4px 8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#070808ff',
                    }}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Enter PKG ID"
                    value={row.pkgId || row.packageId || ''}
                    onChange={event => onPackageIdChange(row.clientRowId, event.target.value)}
                    style={{
                      width: '100%',
                      maxWidth: '120px',
                      padding: '4px 8px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                  />
                </td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap', paddingRight: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {/* Preview Eye Icon Button */}
                    <button
                      className="enterprise-btn-link"
                      onClick={() => onPreview(row)}
                      title="Preview Label"
                      aria-label="Preview Label"
                      style={{
                        padding: '4px 6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: 'var(--enterprise-primary, #1e3a8a)'
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    {/* Edit Pencil Icon Button */}
                    <button
                      className="enterprise-btn-link"
                      onClick={() => onEdit(row)}
                      title="Edit Row Details"
                      aria-label="Edit Row Details"
                      style={{
                        padding: '4px 6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: 'var(--enterprise-gray-600, #475569)'
                      }}
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}