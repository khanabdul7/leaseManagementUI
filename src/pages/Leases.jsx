import { useState, useEffect } from "react";
import {
  Box, Button, TextField, Card, CardContent,
  Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import dayjs from "dayjs";
import axiosInstance from "../api/axios";
import LeaseForm from "../components/LeaseForm";
import "./leasecard.css";
import BottomSheet from "../components/BottomSheet";
import LeaseDetails from "../components/LeaseDetails";
import { useRef } from "react";

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingLease, setEditingLease] = useState(null);
  const [openLease, setOpenLease] = useState(null);

  const contentRef = useRef(null);
  const isAtTop = useRef(true);

  const onScroll = () => {
    isAtTop.current = contentRef.current.scrollTop === 0;
  };

  useEffect(() => {
    fetchLeases();
    fetchCustomers();
    fetchItems();
  }, []);

  const fetchLeases = async () => {
    const res = await axiosInstance.get("/lease");
    setLeases(res.data);
  };

  const fetchCustomers = async () => {
    const res = await axiosInstance.get("/customers");
    setCustomers(res.data?.content);
  };

  const fetchItems = async () => {
    const res = await axiosInstance.get("/items");
    setItems(res.data?.content);
  };

  //   if (start && end && itemId) {
  //     const days = dayjs(end).diff(dayjs(start), "day") + 1;
  //     const item = items.find(i => i.id === parseInt(itemId));
  //     if (item) {
  //       const total = days * item.dailyRate;
  //       setFormData(prev => ({
  //         ...prev,
  //         totalDays: days,
  //         dailyRateSnapshot: item.dailyRate,
  //         totalBill: total
  //       }));
  //     }
  //   }
  // };

  const handleEdit = (lease) => {
    setEditingLease(lease);
    setOpenForm(true);
  };

  const handleDelete = async (leaseId) => {
    //confirm deletion
    if (!window.confirm("Are you sure you want to delete this lease?")) return;
    await axiosInstance.delete(`/lease/${leaseId}`);
    fetchLeases();
  }

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => {
          setOpenForm(true);
          setEditingLease(null);
          // setFormData({
          //   customerId: "",
          //   itemId: "",
          //   startDate: null,
          //   endDate: null,
          //   dailyRateSnapshot: "",
          //   totalDays: 0,
          //   totalBill: 0
          // });
          // setErrors({});
        }}
      >
        Add Lease
      </Button>

      {/* Lease List */}
      {leases.map((lease) => (
        <div className="lease-summary-card" onClick={() => setOpenLease(lease)}>
          <div className="top">
            <h4>{lease.customerName}</h4>
            <span>Lease #{lease.id} • {new Date().toLocaleDateString()}</span>
          </div>

          <div className="items">
            {lease.items.map(it => it.itemName).slice(0, 2).join(", ")}
            {lease.items.length > 2 && ` +${lease.items.length - 2} more`}
          </div>

          <div className="total">
            <span>Grand Total</span>
            <strong>₹{lease.grandTotal}</strong>
          </div>
        </div>

      ))}
      <BottomSheet open={!!openLease} onClose={() => setOpenLease(null)} isAtTop={isAtTop}>
        <LeaseDetails lease={openLease} onEdit={handleEdit} onDelete={handleDelete} onBack={() => setOpenLease(null)} 
        contentRef={contentRef} onScroll={onScroll} />
      </BottomSheet>


      {/* Add/Edit Lease Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} PaperProps={{
        sx: {
          width: "90%",      // or "600px"
          maxWidth: "800px", // optional
        }
      }}>
        <DialogTitle>{editingLease ? "Edit Lease" : "Add Lease"}</DialogTitle>
        <DialogContent>
          <LeaseForm
            editingLease={editingLease}
            onSave={async (formData) => {
    
              const payload = {
                customerId: formData.customerId,
                notes: formData.notes,
                items: formData.items.map(it => ({
                  itemId: it.itemId,
                  startDate: it.startDate ? dayjs(it.startDate).format("YYYY-MM-DD") : null,
                  endDate: it.endDate ? dayjs(it.endDate).format("YYYY-MM-DD") : null,
                  totalDays: it.totalDays,
                  pricePerDay: it.pricePerDay,
                  totalBill: it.totalBill,
                  quantity: it.quantity,
                  leaseItemId: it.id // optional: include existing lease-item id for edits if backend expects it
                })),
                grandTotal: formData.grandTotal
              };
              if (editingLease) {
                await axiosInstance.put(`/lease/${editingLease.id}`, payload);
              } else {
                await axiosInstance.post("/lease", payload);
              }
              setOpenForm(false);
              fetchLeases();
              setOpenLease(null);
            }}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>

        {/* <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions> */}
      </Dialog>
    </Box>
  );
}
