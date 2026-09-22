import { useEffect, useMemo, useState } from 'react';
import DataTable from './components/DataTable';
import EditRowModal from './components/EditRowModal';
import HistoryPanel from './components/HistoryPanel';
import LabelPreview from './components/LabelPreview';
import SettingsPanel from './components/SettingsPanel';
import { generateLabels, getHistory, getSettings, previewLabels, pdfUrl, updateSettings } from './services/api';
import { parsePastedData } from './utils/parser';

const SAMPLE_DATA = `Cust PO Num\tInvoice Num\tPKG ID\tItem No.\tPart No.\tItem/Service Description\tPer Pallet Qty\tTotal Quantity Packed\tNo of Pallets\tNo of labels to be printed
ASI-PO-11745\t262721284\t\tALT-10\t5014542\tGREASE CART ASSY. COMBI GREASE COLLECTION\t16\t160\t10\t60
ASI-PO-11746\t262721194\t\tALT-01\t5017530\tFLUE, WELDMENT,EXHAUST, 7-20\t30\t180\t6\t36
ASI-PO-12708\t262721286\t\tALT-02\t5017531\tFLUE ,WELDMENT, INLET, 7-20\t30\t80\t2\t12`;

export default function App() {
  const [activeTab, setActiveTab] = useState('generate');
  const [inputText, setInputText] = useState('');
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [settings, setSettings] = useState(null);
  const [previewRow, setPreviewRow] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [lastBatch, setLastBatch] = useState(null);
  const [markPrinted, setMarkPrinted] = useState(true);

  useEffect(() => {
    loadSettings();
    loadHistory();
  }, []);

  async function loadSettings() {
    try {
      setSettings(await getSettings());
    } catch (error) {
      setMessage({ type: 'error', text: `Backend not reachable: ${error.message}` });
    }
  }

  async function loadHistory() {
    try {
      setHistory(await getHistory());
    } catch {
      // History is non-blocking during startup.
    }
  }

  function showSample() {
    setInputText(SAMPLE_DATA);
  }

  function clearAll() {
    setInputText('');
    setRows([]);
    setSelectedIds(new Set());
    setPreviewRow(null);
    setEditingRow(null);
    setLastBatch(null);
    setMessage(null);
  }

  async function processData() {
    setMessage(null);
    setLastBatch(null);
    try {
      setBusy(true);
      const parsed = parsePastedData(inputText);
      const response = await previewLabels(parsed);
      const returnedRows = response.rows.map((row, index) => ({
        ...parsed[index],
        ...row
      }));
      setRows(returnedRows);
      setSelectedIds(new Set(returnedRows.filter(row => row.status !== 'ERROR').map(row => row.clientRowId)));
      setPreviewRow(returnedRows[0] || null);
      if (returnedRows.some(row => row.status === 'ERROR')) {
        setMessage({ type: 'error', text: 'Review the red rows before generating labels.' });
      } else if (returnedRows.some(row => row.status === 'WARNING')) {
        setMessage({ type: 'warning', text: 'Rows contain review warnings. You can edit them before generating.' });
      } else if (!response.canGenerate) {
        setMessage({ type: 'warning', text: 'Complete the Settings tab before generating labels.' });
      } else {
        setMessage({ type: 'success', text: `${returnedRows.length} rows processed successfully.` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function refreshRows(nextRows) {
    const response = await previewLabels(nextRows);
    const merged = response.rows.map((row, index) => ({ ...nextRows[index], ...row }));
    setRows(merged);
    if (previewRow) setPreviewRow(merged.find(row => row.clientRowId === previewRow.clientRowId) || merged[0]);
    return merged;
  }

  function toggleRow(id) {
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(previous => {
      const all = rows.every(row => previous.has(row.clientRowId));
      return all ? new Set() : new Set(rows.map(row => row.clientRowId));
    });
  }

  async function changePrintQuantity(id, value) {
    const quantity = value === '' ? null : Math.max(1, Number(value));
    const nextRows = rows.map(row => row.clientRowId === id ? { ...row, requestedPrintQuantity: Number.isFinite(quantity) ? Math.trunc(quantity) : null } : row);
    setRows(nextRows);
    try {
      await refreshRows(nextRows);
    } catch {
      // Keep local edit visible if backend preview is temporarily unavailable.
    }
  }

  async function saveEditedRow(nextRow) {
    const nextRows = rows.map(row => row.clientRowId === nextRow.clientRowId ? nextRow : row);
    try {
      setBusy(true);
      await refreshRows(nextRows);
      setEditingRow(null);
      setMessage({ type: 'success', text: 'Row updated and revalidated.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  const selectableRows = useMemo(() => rows.filter(row => selectedIds.has(row.clientRowId)), [rows, selectedIds]);
  const totalRequested = useMemo(() => rows.reduce((sum, row) => sum + (row.requestedPrintQuantity || 0), 0), [rows]);
  const totalRecommended = useMemo(() => rows.reduce((sum, row) => sum + (row.recommendedPrintQuantity || 0), 0), [rows]);

  async function handleGenerate() {
    if (!rows.length) {
      setMessage({ type: 'error', text: 'Process data first.' });
      return;
    }
    if (!selectableRows.length) {
      setMessage({ type: 'error', text: 'Select at least one row to generate.' });
      return;
    }
    const invalid = selectableRows.find(row => row.status === 'ERROR');
    if (invalid) {
      setMessage({ type: 'error', text: `Fix row ${invalid.clientRowId} before generating.` });
      return;
    }
    const pdfWindow = window.open('about:blank', '_blank');
    try {
      setBusy(true);
      const response = await generateLabels(selectableRows, markPrinted);
      setLastBatch(response);
      setMessage({ type: 'success', text: `${response.physicalLabels} physical labels generated. Batch ${response.batchNumber}.` });
      await loadHistory();
      setActiveTab('history');
      if (pdfWindow) {
        pdfWindow.location.href = pdfUrl(response.batchId);
      }
    } catch (error) {
      if (pdfWindow) pdfWindow.close();
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings(next) {
    try {
      const saved = await updateSettings(next);
      setSettings(saved);
      setMessage({ type: 'success', text: 'Configuration saved.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      throw error;
    }
  }

  const previewSerial = useMemo(() => {
    const supplierId = settings?.supplierId || '0';
    if (/^\d{1,14}$/.test(supplierId)) {
      return supplierId + '1'.padStart(15 - supplierId.length, '0');
    }
    return '123450000000001';
  }, [settings]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-line"><span className="brand-mark">AS</span><span>ALTO-SHAAM</span></div>
          <h1>Master Label System</h1>
          <p>B-10 label generation, serial control, PDF printing and print history.</p>
        </div>
        <div className="topbar-meta">
          <span className="top-badge">6 × 4 in</span>
          <span className="top-badge">Code 128</span>
          <span className="top-badge">PostgreSQL</span>
        </div>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'generate' ? 'tab active' : 'tab'} onClick={() => setActiveTab('generate')}>Generate Labels</button>
        <button className={activeTab === 'history' ? 'tab active' : 'tab'} onClick={() => setActiveTab('history')}>Print History</button>
        <button className={activeTab === 'settings' ? 'tab active' : 'tab'} onClick={() => setActiveTab('settings')}>Settings</button>
      </nav>

      {message && <div className={`global-message ${message.type}`}>{message.text}</div>}

      {activeTab === 'generate' && (
        <main className="content">
          <section className="panel input-panel">
            <div className="section-heading">
              <div>
                <h2>1. Paste shipment data</h2>
                <p>Paste the complete Excel range. Pipe-separated Markdown tables and tab-separated Excel data are supported.</p>
              </div>
              <div className="heading-actions">
                <button className="secondary-button" onClick={showSample}>Load sample</button>
                <button className="secondary-button" onClick={clearAll}>Clear</button>
              </div>
            </div>
            <textarea
              className="paste-area"
              value={inputText}
              onChange={event => setInputText(event.target.value)}
              placeholder="Paste the header row followed by your shipment rows here..."
              spellCheck="false"
            />
            <div className="input-footer">
              <span>{inputText.trim() ? `${inputText.split(/\r?\n/).filter(Boolean).length - 1} data rows detected before parsing` : 'Waiting for pasted data'}</span>
              <button className="primary-button" disabled={busy || !inputText.trim()} onClick={processData}>{busy ? 'Processing...' : 'Process Data'}</button>
            </div>
          </section>

          {rows.length > 0 && (
            <section className="panel review-panel">
              <div className="section-heading">
                <div>
                  <h2>2. Review, validate and edit</h2>
                  <p>Rule Labels is the B-10 calculation. Print Qty is the physical-label quantity you have requested; the backend revalidates it.</p>
                </div>
                <div className="summary-strip">
                  <span><strong>{rows.length}</strong> rows</span>
                  <span><strong>{totalRecommended}</strong> rule labels</span>
                  <span><strong>{totalRequested}</strong> requested</span>
                </div>
              </div>

              <div className="table-toolbar">
                <div className="selection-text">{selectableRows.length} selected</div>
                <div className="toolbar-actions">
                  <label className="checkbox-label"><input type="checkbox" checked={markPrinted} onChange={event => setMarkPrinted(event.target.checked)} /> Mark as printed</label>
                  <button className="primary-button" disabled={busy || !selectableRows.length} onClick={handleGenerate}>{busy ? 'Generating...' : 'Generate Master Labels'}</button>
                </div>
              </div>

              <DataTable
                rows={rows}
                selectedIds={selectedIds}
                onToggle={toggleRow}
                onToggleAll={toggleAll}
                onEdit={setEditingRow}
                onPreview={setPreviewRow}
                onPrintQuantityChange={changePrintQuantity}
              />
            </section>
          )}

          <section className="panel preview-panel">
            <div className="section-heading">
              <div>
                <h2>3. Master Label preview</h2>
                <p>This preview is a UI representation of the 6 × 4 inch landscape B-10 layout. The PDF is generated by Java/PDFBox on the server.</p>
              </div>
            </div>
            <div className="preview-grid">
              <div className="preview-card">
                <LabelPreview row={previewRow} settings={settings} serial={previewSerial} />
              </div>
              <div className="preview-notes">
                <div className="note-card">
                  <strong>Serial number</strong>
                  <span>Backend-owned and persisted. Format: supplier ID + unique numeric sequence = exactly 15 digits.</span>
                </div>
                <div className="note-card">
                  <strong>Barcode payload</strong>
                  <span>Master Serial uses Data Identifier 9S, so the Code 128 value is 9S + the 15-digit serial.</span>
                </div>
                <div className="note-card">
                  <strong>Two-label set</strong>
                  <span>For an identical pallet, the PDF requirement calls for a set of two identical Master Labels. One serial is therefore assigned per label unit and repeated for its copies.</span>
                </div>
                <div className="note-card warning-note">
                  <strong>Packing List #</strong>
                  <span>It is a required Master Label field. Your input has Invoice Num and PKG ID, so the application resolves it from settings and lets you override it per row.</span>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {activeTab === 'history' && <main className="content"><HistoryPanel history={history} onRefresh={loadHistory} /></main>}

      {activeTab === 'settings' && <main className="content"><SettingsPanel settings={settings} onSave={saveSettings} /></main>}

      {editingRow && <EditRowModal row={editingRow} onClose={() => setEditingRow(null)} onSave={saveEditedRow} />}

      <footer className="footer">
        <span>Alto-Shaam Master Label System</span>
        <span>Server-side validation • Persistent serial sequence • Reprint-safe</span>
      </footer>
    </div>
  );
}
