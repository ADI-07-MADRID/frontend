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
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Print History</h2>
          <p>Every generated serial is stored so reprints reuse the same serial number.</p>
        </div>
        <button className="secondary-button" onClick={onRefresh}>Refresh</button>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">No label batches have been generated yet.</div>
      ) : (
        <div className="history-list">
          {history.map(batch => (
            <div className="history-card" key={batch.id}>
              <div className="history-main">
                <div>
                  <strong>{batch.batchNumber}</strong>
                  <span className="history-time">{new Date(batch.createdAt).toLocaleString()}</span>
                </div>
                <div className="history-metrics">
                  <span>{batch.totalRows} rows</span>
                  <span>{batch.totalLabelUnits} serials</span>
                  <span>{batch.totalPhysicalLabels} physical labels</span>
                  <span className={`status-pill ${batch.status === 'PRINTED' ? 'status-ok' : 'status-warning'}`}>{batch.status}</span>
                </div>
                <div className="history-actions">
                  <a className="secondary-button anchor-button" href={pdfUrl(batch.id)} target="_blank" rel="noreferrer">Open PDF</a>
                  <a className="secondary-button anchor-button" href={reprintUrl(batch.id)} target="_blank" rel="noreferrer">Reprint</a>
                  <button className="link-button" onClick={() => openDetail(batch.id)}>{expanded === batch.id ? 'Hide' : 'Details'}</button>
                </div>
              </div>
              {expanded === batch.id && detail && (
                <div className="history-detail">
                  {detail.items.map(item => (
                    <div key={item.id} className="history-detail-row">
                      <div><strong>{item.customerPoNumber}</strong> / {item.partNumber}</div>
                      <div>{item.generatedLabels.length} serial units</div>
                      <div className="mono">{item.generatedLabels.map(label => `${label.serialNumber} × ${label.copyCount}`).join(', ')}</div>
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
