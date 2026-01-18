const LeasePdf = ({ lease }) => {
  return (
    <div
      id="lease-pdf"
      style={{
        width: "794px", // A4 width in px
        padding: "24px",
        fontFamily: "Arial",
        color: "#000",
        background: "#fff"
      }}
    >
      <h2>Lease Invoice</h2>

      <p><strong>Customer:</strong> {lease.customerName}</p>
      <p><strong>Lease No:</strong> {lease.id}</p>
      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>

      <hr />

      <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #000" }}>
            <th align="left">#</th>
            <th align="left">Item</th>
            <th align="left">From --- To</th>
            <th align="right">Qty</th>
            <th align="right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lease.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.itemName}</td>
              <td>{item.startDate} --- {item.endDate}</td>
              <td align="right">{item.quantity}</td>
              <td align="right">₹{item.totalBill}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      <h3 style={{ textAlign: "right" }}>
        Grand Total: ₹{lease.grandTotal}
      </h3>
    </div>
  );
};

export default LeasePdf;
