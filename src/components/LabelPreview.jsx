import Barcode from './Barcode';

function Block({ title, children, className = '' }) {
  return (
    <div className={`label-block ${className}`}>
      <div className="label-block-title">{title}</div>
      {children}
    </div>
  );
}

export default function LabelPreview({ row, settings, serial = '123450000000001' }) {
  if (!row) {
    return <div className="label-empty">Select a row to preview the 6 × 4 in Master Label.</div>;
  }

  const packingList = row.packingListNumber || 'PACKING LIST #';
  const po = row.customerPoNumber || '';
  const part = row.partNumber || '';
  const qty = row.perPalletQuantity || '';
  const description = row.description || '';

  return (
    <div className="master-label">
      <div className="label-header-row">
        <div className="label-brand">ALTO-SHAAM</div>
        <div className="label-header-title">MASTER LABEL (B-10)</div>
      </div>

      <div className="label-row top-row">
        <Block title="FROM:" className="from-block">
          <div className="label-text multi-line">{settings?.shipFrom || 'Configure Ship From in Settings'}</div>
        </Block>
        <Block title="TO:" className="to-block">
          <div className="label-text multi-line">{settings?.shipTo || 'Configure Ship To in Settings'}</div>
        </Block>
        <Block title="PACKING LIST # (11K)" className="packing-block">
          <div className="label-value">{packingList}</div>
          <Barcode value={`11K${packingList}`} height={36} />
        </Block>
      </div>

      <div className="label-row middle-row">
        <Block title="PART NO. (P)" className="part-block">
          <div className="label-value">{part}</div>
          <Barcode value={`P${part}`} height={34} />
        </Block>
        <Block title="REV LEVEL / PART DESC" className="desc-block">
          <div className="label-value description-value">
            {(row.revisionLevel ? `${row.revisionLevel} / ` : '') + description}
          </div>
          <Barcode value={`${row.revisionLevel || ''}${row.revisionLevel ? ' / ' : ''}${description}`.trim()} height={34} />
        </Block>
      </div>

      <div className="label-row lower-row">
        <Block title="QUANTITY (Q)" className="qty-block">
          <div className="label-value">{qty}</div>
          <Barcode value={`Q${qty}`} height={34} />
        </Block>
        <Block title="PURCHASE ORDER # (K)" className="po-block">
          <div className="label-value">{po}</div>
          <Barcode value={`K${po}`} height={34} />
        </Block>
        <Block title="ITEM / PKG" className="item-block">
          <div className="label-value">{row.itemNumber}{row.packageId ? ` / ${row.packageId}` : ''}</div>
        </Block>
      </div>

      <Block title="SERIAL NO. (9S)" className="serial-block">
        <div className="serial-value">{serial}</div>
        <Barcode value={`9S${serial}`} height={54} />
      </Block>

      <div className="label-footer">6 × 4 in landscape | Code 128 | Master Label B-10</div>
    </div>
  );
}
