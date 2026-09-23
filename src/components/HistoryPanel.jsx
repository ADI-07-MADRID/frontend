import { useState } from 'react';
import { API_BASE_URL, pdfUrl, reprintUrl } from '../services/api';

export default function HistoryPanel({ history, onRefresh }) {
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);

  async function openDetail(id) {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/master-labels/batches/${id}`);
      if (!response.ok) throw new Error('Unable to load batch details');
      setDetail(await response.json());
      setExpanded(id);
    } catch {
      setExpanded(id);
      setDetail(null);
    }
  }

  return (
    <section className="enterprise-panel" style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* ── Header with Matching Proportions ── */}
      <div
        className="enterprise-panel-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--enterprise-gray-900)' }}>
            Audited Print Batches
          </h2>
          <p style={{ fontSize: '13px', margin: '4px 0 0', color: 'var(--enterprise-gray-500)' }}>
            Every generated batch is tracked to prevent duplicate serial assignment.
          </p>
        </div>
        <button
          className="enterprise-btn-secondary"
          onClick={onRefresh}
          style={{ padding: '8px 18px', fontSize: '13px' }}
        >
          Refresh
        </button>
      </div>

      {/* ── Batch List ── */}
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--enterprise-gray-400)', fontSize: '14px' }}>
          No label batches have been recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {history.map(batch => (
            <div
              key={batch.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px 20px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'monospace', color: 'var(--enterprise-primary)' }}>
                    Batch: {batch.batchNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--enterprise-gray-500)', marginTop: '4px' }}>
                    {new Date(batch.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="enterprise-role-badge" style={{ backgroundColor: 'var(--enterprise-gray-100)', color: 'var(--enterprise-gray-700)', padding: '5px 10px' }}>
                    {batch.totalRows} Rows
                  </span>
                  <span className="enterprise-role-badge" style={{ backgroundColor: 'var(--enterprise-gray-100)', color: 'var(--enterprise-gray-700)', padding: '5px 10px' }}>
                    {batch.totalPhysicalLabels} Labels
                  </span>
                  <a className="enterprise-btn-secondary" href={pdfUrl(batch.id)} target="_blank" rel="noreferrer" style={{ padding: '6px 14px' }}>
                    View PDF
                  </a>
                  <a className="enterprise-btn-secondary" href={reprintUrl(batch.id)} target="_blank" rel="noreferrer" style={{ padding: '6px 14px' }}>
                    Reprint
                  </a>
                  <button className="enterprise-btn-link" onClick={() => openDetail(batch.id)} style={{ fontSize: '13px' }}>
                    {expanded === batch.id ? 'Hide Details' : 'Details'}
                  </button>
                </div>
              </div>

              {expanded === batch.id && detail && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                  {detail.items.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        padding: '8px 0',
                        color: 'var(--enterprise-gray-700)',
                        borderBottom: '1px dashed var(--border-color)'
                      }}
                    >
                      <span><strong>{item.customerPoNumber}</strong> / {item.partNumber}</span>
                      <span style={{ fontFamily: 'monospace' }}>
                        {item.generatedLabels.map(l => `${l.serialNumber} (x${l.copyCount})`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}