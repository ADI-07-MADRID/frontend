import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

function BarcodeCanvas({ value, height = 34, width = 1.35 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value && String(value).trim().length > 0) {
      try {
        JsBarcode(canvasRef.current, String(value), {
          format: 'CODE128',
          lineColor: '#000000',
          width,
          height,
          displayValue: false,
          margin: 2,
        });
      } catch (err) {
        console.error('JsBarcode failed for value:', value, err);
      }
    }
  }, [value, height, width]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%', display: 'block' }} />;
}

export default function LabelPreview({ row, settings, serial }) {
  const supplierId = settings?.supplierId || '654321';
  const supplierName = settings?.supplierName || 'ABC SUPPLIER';
  const shipFrom = settings?.shipFrom || '1425 EDEN ROAD\nYORK PA 17402';
  const shipTo = settings?.shipTo || 'W164N9221 WATER ST\nMENOMONEE FALLS WI 53051';
  const delLoc = settings?.delLoc || '';

  const partNo = row?.partNumber || '1234567890';
  const packListNo = row?.customerPoNumber
    ? row.customerPoNumber.replace(/[^0-9]/g, '').slice(-8) || '11111111'
    : '11111111';
  const poNo = row?.customerPoNumber || 'R098765432';
  const qty = row?.perPalletQuantity ?? row?.totalQuantity ?? 50000;
  const revLevel = row?.revLevel || 'A';
  const description = row?.description || 'BRAKE ASSEMBLY';
  const serialNo = serial || `${supplierId}012345678`;

  return (
    <div className="as-b10-label-6x4">
      {/* ─── ROW 1: FROM / TO / PACKING LIST # (11K) ─── */}
      <div className="as-grid-row row-1">
        {/* FROM */}
        <div className="as-cell cell-from">
          <div className="as-title">FROM:</div>
          <div className="as-data-bold">{supplierName}</div>
          <div className="as-data-text">{shipFrom}</div>
          <div className="as-data-bold supplier-id">SUPPLIER: {supplierId}</div>
        </div>

        {/* TO */}
        <div className="as-cell cell-to">
          <div className="as-title">TO:</div>
          <div className="as-data-bold">ALTO-SHAAM INC</div>
          <div className="as-data-text">{shipTo}</div>
          {delLoc && <div className="as-data-bold del-loc">DEL LOC: {delLoc}</div>}
        </div>

        {/* PACKING LIST # (11K) */}
        <div className="as-cell cell-packlist">
          <div className="as-title">PACKING LIST # (11K)</div>
          <div className="as-human-val">{packListNo}</div>
          <div className="as-barcode-wrap">
            <BarcodeCanvas value={`11K${packListNo}`} height={30} width={1.2} />
          </div>
        </div>
      </div>

      {/* ─── ROW 2: PART NO. (P) / MASTER LABEL & DESCRIPTION ─── */}
      <div className="as-grid-row row-2">
        {/* PART NO */}
        <div className="as-cell cell-part">
          <div className="as-title">PART NO. (P)</div>
          <div className="as-human-val large">{partNo}</div>
          <div className="as-barcode-wrap">
            <BarcodeCanvas value={`P${partNo}`} height={34} width={1.4} />
          </div>
        </div>

        {/* MASTER LABEL / REV / DESC (NO BARCODE) */}
        <div className="as-cell cell-desc">
          <div className="as-master-badge">MASTER LABEL</div>
          <div className="as-desc-inner">
            <div className="as-sub-col-rev">
              <span className="as-sub-title">REV LEVEL</span>
              <span className="as-human-val">{revLevel}</span>
            </div>
            <div className="as-sub-col-desc">
              <span className="as-sub-title">PART DESC</span>
              <span className="as-data-bold desc-clamp">{description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ROW 3: QUANTITY (Q) / PURCHASE ORDER # (K) ─── */}
      <div className="as-grid-row row-3">
        {/* QUANTITY */}
        <div className="as-cell cell-qty">
          <div className="as-title">QUANTITY (Q)</div>
          <div className="as-human-val large">{qty}</div>
          <div className="as-barcode-wrap">
            <BarcodeCanvas value={`Q${qty}`} height={32} width={1.2} />
          </div>
        </div>

        {/* PURCHASE ORDER */}
        <div className="as-cell cell-po">
          <div className="as-title">PURCHASE ORDER # (K)</div>
          <div className="as-human-val large">{poNo}</div>
          <div className="as-barcode-wrap">
            <BarcodeCanvas value={`K${poNo}`} height={32} width={1.3} />
          </div>
        </div>
      </div>

      {/* ─── ROW 4: SERIAL NO. (9S) - 15 DIGITS ─── */}
      <div className="as-grid-row row-4">
        <div className="as-cell cell-serial">
          <div className="as-serial-meta">
            <div className="as-title">SERIAL NO. (9S)</div>
            <div className="as-serial-val">{serialNo}</div>
          </div>
          <div className="as-serial-barcode">
            <BarcodeCanvas value={`9S${serialNo}`} height={42} width={1.6} />
          </div>
        </div>
      </div>
    </div>
  );
}