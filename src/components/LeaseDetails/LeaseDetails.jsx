import "./leasedetails.css";

function LeaseDetails({ lease, onEdit, onDelete, onBack, contentRef, onScroll }) {

  return (
    <div className="lease-details">

      {/* 🔒 Sticky Top Section */}
      <div className="sticky-top drag-zone">
        {/* Header */}
        <div className="details-header">
          <button onClick={onBack}>←</button>
          <h3>Lease Details</h3>
          <div className="actions">
            <button onClick={() => onEdit(lease)}>✏️</button>
            <button onClick={() => onDelete(lease.id)}>🗑️</button>
          </div>
        </div>

        {/* Customer */}
        <h2 className="customer">{lease.customerName}</h2>

        {/* Meta info */}
        <div className="meta">
          <span><strong>Lease No:</strong> {lease.id}</span>
          <div>
            <span><strong>Created:</strong> {new Date().toLocaleDateString()}</span>
            <span><strong>Updated:</strong> {new Date().toLocaleDateString()}</span>
          </div>
          <div></div>
          <div></div>
        </div>

      </div>

      {   /* 🔽 Scrollable Items */}
      <div className="items-scroll"
        ref={contentRef}
        onScroll={onScroll}
      >
        {lease.items.map((item, index) => (
          <div key={item.id} className="item">
            <h4>{item.itemName}</h4>
            <span style={{ display: "flex" }}>{`S.No: ${index + 1}`}</span>
            <span>{item.startDate} – {item.endDate}</span>
            <div className="price-row">
              <span>₹{item.dailyRate} / day</span>
              <span>({item.totalDays} days)</span>
              <span>Qty: {item.quantity}</span>
              <span>₹{`${item.dailyRate} * ${item.totalDays} * ${item.quantity}`}</span>
              <strong>₹{item.totalBill}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* 🔒 Sticky Bottom */}
      <div className="grand-total">
        <span>Grand Total</span>
        <strong>₹{lease.grandTotal}</strong>
      </div>

    </div>
  );
}
export default LeaseDetails;
