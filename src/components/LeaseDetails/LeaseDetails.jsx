import "./leasedetails.css";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import LeasePdf from "../Pdf/LeasePDF.jsx";

function LeaseDetails({ lease, onEdit, onDelete, onBack, contentRef, onScroll }) {

  const formatDateForFileName = (date = new Date()) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };


  const generateLeasePdf = (lease) => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Header
    pdf.setFontSize(16);
    pdf.text("Lease Invoice", 14, 20);

    pdf.setFontSize(10);
    pdf.text(`Customer: ${lease.customerName}`, 14, 30);
    pdf.text(`Lease No: ${lease.id}`, 14, 36);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

    // Table
    autoTable(pdf, {
      startY: 50,
      head: [[
        "#",
        "Item",
        "From",
        "To",
        "Qty",
        "Days",
        "Total (Rs.)"
      ]],
      body: lease.items.map((item, index) => ([
        index + 1,
        item.itemName,
        item.startDate,
        item.endDate,
        item.quantity,
        item.totalDays,
        item.totalBill
      ])),
      styles: {
        fontSize: 9,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
      },
      columnStyles: {
        0: { cellWidth: 8 },
        6: { halign: "right" },
      },
    });

    // Grand total
    const finalY = pdf.lastAutoTable.finalY + 10;

    pdf.setFontSize(12);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const rightMargin = 14;

    pdf.setFontSize(12);
    pdf.text("Grand Total", 14, finalY);

    pdf.text(
      `Rs.${lease.grandTotal}`,
      pageWidth - rightMargin,
      finalY,
      { align: "right" }
    );



    const dateStr = formatDateForFileName();
    const fileName = `Lease_${lease.id}_${dateStr}.pdf`;

    pdf.save(fileName);
  };



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
        <button onClick={() => generateLeasePdf(lease)}>print</button>
        <span>Grand Total</span>
        <strong>₹{lease.grandTotal}</strong>
      </div>

      {/* Hidden PDF Content */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <LeasePdf lease={lease} />
      </div>
    </div>
  );
}
export default LeaseDetails;
