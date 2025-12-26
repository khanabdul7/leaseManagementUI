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

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingLease, setEditingLease] = useState(null);


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
        <Card key={lease.id} sx={{ mb: 2 }}>
          <CardContent>
            {/* Lease Header */}
            <Typography variant="h6">
              Lease #{lease.id} — {lease.customerName}
            </Typography>
            {lease.notes && (
              <Typography color="text.secondary">Notes: {lease.notes}</Typography>
            )}

            {/* Items list */}
            {lease.items.map((it) => (
              <Box key={it.id} sx={{ pl: 2, mt: 1 }}>
                <Typography>
                  • {it.itemName}: {it.startDate} → {it.endDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {it.totalDays} days × ₹{it.dailyRate} = ₹{it.totalBill}
                </Typography>
              </Box>
            ))}

            {/* Grand Total */}
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: "bold" }}>
              Grand Total: ₹{lease.grandTotal}
            </Typography>

            {/* Actions */}
            <IconButton
              onClick={() => {
                setEditingLease(lease);
                setOpenForm(true);
              }}
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={async () => {
                await axiosInstance.delete(`/lease/${lease.id}`);
                fetchLeases();
              }}
            >
              <Delete />
            </IconButton>
          </CardContent>
        </Card>
      ))}


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
