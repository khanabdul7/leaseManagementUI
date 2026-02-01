import { useState, useEffect } from "react";
import {
  Box, TextField, MenuItem, Button,
  Typography, IconButton
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Delete } from "@mui/icons-material";
import dayjs from "dayjs";
import axiosInstance from "../api/axios";
import { useMediaQuery } from "@mui/material";

export default function LeaseForm({ editingLease, onSave, onCancel, setIsDirty }) {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const isMobile = useMediaQuery("(max-width:600px)");

  const [formData, setFormData] = useState({
    customerId: "",
    notes: "",
    items: [
      {
        id: null, // keep lease-item id if backend uses it
        itemId: "",
        quantity: 1,
        startDate: null,
        endDate: null,
        pricePerDay: 0,
        totalDays: 0,
        totalBill: 0
      }
    ],
    grandTotal: 0
  });

  useEffect(() => {
    fetchCustomers();
    fetchItems();
    if (editingLease) {
      // convert incoming lease (from API) to form-friendly structure
      const mapped = {
        customerId: editingLease.customerId,
        notes: editingLease.notes || "",
        items: (editingLease.items || []).map(it => ({
          itemId: it.itemId,
          // convert these strings -> dayjs objects (or null)
          startDate: it.startDate ? dayjs(it.startDate) : null,
          endDate: it.endDate ? dayjs(it.endDate) : null,
          quantity: it.quantity || 1,
          pricePerDay: it.dailyRate,
          totalDays: it.totalDays,
          totalBill: it.totalBill,
          // keep lease-item id if backend uses it
          id: it.id
        })),
        grandTotal: editingLease.grandTotal || 0
      };
      setFormData(mapped);
    }
  }, [editingLease]);

  const fetchCustomers = async () => {
    const res = await axiosInstance.get("/customers");
    setCustomers(res.data?.content);
  };

  const fetchItems = async () => {
    const res = await axiosInstance.get("/items");
    setItems(res.data?.content);
  };

  const updateItem = (index, field, value) => {
    setIsDirty(true);
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // auto-fill rate when selecting item
    if (field === "itemId") {
      const selectedItem = items.find(i => i.id === parseInt(value));
      if (selectedItem) {
        newItems[index].pricePerDay = selectedItem.pricePerDay || 0;
      }
    }
    //allowing max price to be 1000
    if (field === "pricePerDay") {
      value > 1000 ? newItems[index].pricePerDay = 1000 : newItems[index].pricePerDay = value
    }

    // recalc totals safely using dayjs
    const start = newItems[index].startDate ? dayjs(newItems[index].startDate) : null;
    const end = newItems[index].endDate ? dayjs(newItems[index].endDate) : null;

    if (start && start.isValid() && end && end.isValid()) {
      const days = end.diff(start, "day") + 1; // inclusive
      const qty = newItems[index].quantity || 1;
      newItems[index].totalDays = days;
      newItems[index].totalBill = days * (newItems[index].pricePerDay || 0) * qty;
    } else {
      newItems[index].totalDays = 0;
      newItems[index].totalBill = 0;
    }

    const grandTotal = newItems.reduce((s, it) => s + (it.totalBill || 0), 0);
    setFormData(prev => ({ ...prev, items: newItems, grandTotal }));
  };

  const addItem = () => {
    setIsDirty(true);
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { id: null, itemId: "", startDate: null, endDate: null, quantity: 1, pricePerDay: 0, totalDays: 0, totalBill: 0 }
      ]
    }));
  };

  const removeItem = (index) => {
    setIsDirty(true);
    const newItems = formData.items.filter((_, i) => i !== index);
    const grandTotal = newItems.reduce((sum, it) => sum + (it.totalBill || 0), 0);
    setFormData(prev => ({ ...prev, items: newItems, grandTotal }));
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.items || formData.items.length === 0) {
      newErrors.items = { 0: { itemId: "At least one item is required" } };
    } else {
      newErrors.items = {};
      formData.items.forEach((it, idx) => {
        let itemErrors = {};
        if (!it.itemId) itemErrors.itemId = "Item is required";
        if (!it.quantity || isNaN(it.quantity) || it.quantity <= 0) itemErrors.quantity = "Qty must be positive";
        if (!it.startDate) itemErrors.startDate = "Start date required";
        if (!it.endDate) itemErrors.endDate = "End date required";
        if (it.startDate && it.endDate && dayjs(it.endDate).isBefore(dayjs(it.startDate))) {
          itemErrors.endDate = "End date must be after start date";
        }
        if (!it.pricePerDay || isNaN(it.pricePerDay) || it.pricePerDay < 0) itemErrors.pricePerDay = "Price/Day must be non-negative";
        if (Object.keys(itemErrors).length > 0) {
          newErrors.items[idx] = itemErrors;
        }
      });
      if (Object.keys(newErrors.items).length === 0) {
        delete newErrors.items;
      }
    }
    // if (!formData.startDate) newErrors.startDate = "Start date required";
    // if (!formData.endDate) newErrors.endDate = "End date required";
    // if (formData.startDate && formData.endDate && dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
    //   newErrors.endDate = "End date must be after start date";
    // }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <Box>
      {/* Customer Select */}
      <TextField
        select
        label="Customer"
        fullWidth
        margin="dense"
        error={!!formErrors.customerId}
        helperText={formErrors.customerId}
        value={formData.customerId}
        onChange={(e) => {
          setFormData({ ...formData, customerId: e.target.value });
          setIsDirty(true);
        }}
      >
        {customers.map(c => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))}
      </TextField>

      {/* Notes */}
      <TextField
        label="Notes"
        fullWidth
        multiline
        rows={2}
        margin="dense"
        value={formData.notes}
        onChange={(e) => {
          setFormData({ ...formData, notes: e.target.value });
          setIsDirty(true);
        }}
      />

      {/* Items Section */}
      <Typography variant="subtitle1" sx={{ mt: 2 }}>Lease Items</Typography>
      {formData.items.map((it, idx) => (
        <Box key={idx} sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 1,
          alignItems: isMobile ? "stretch" : "center",
          mb: 2,
          p: 1,
          border: "1px solid #ddd",
          borderRadius: 2,
        }}>
          <Box
            sx={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: "#93989c",
              color: "#fff",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {idx + 1}
          </Box>

          {/* Item dropdown */}
          <TextField
            select
            label={`Item ${idx + 1}`}
            error={!!(formErrors.items && formErrors.items[idx] && formErrors.items[idx].itemId)}
            helperText={formErrors.items && formErrors.items[idx] && formErrors.items[idx].itemId}
            value={it.itemId}
            onChange={(e) => updateItem(idx, "itemId", e.target.value)}
            sx={{ flex: 2 }}
          >
            {items.map(i => (
              <MenuItem key={i.id} value={i.id}>{i.name} (₹{i.pricePerDay}/day)</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Qty"
            type="number"
            value={it.quantity || 1}
            error={!!(formErrors.items && formErrors.items[idx] && formErrors.items[idx].quantity)}
            helperText={formErrors.items && formErrors.items[idx] && formErrors.items[idx].quantity}
            onChange={(e) =>
              updateItem(idx, "quantity", parseInt(e.target.value) || 1)
            }
            size="small"
            sx={{ flex: 0.5, minWidth: 80 }}
          />

          {/* Start Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Start"
              value={it.startDate ?? null}
              onChange={(val) => updateItem(idx, "startDate", val)}
              sx={{ flex: 1, minWidth: isMobile ? "100%" : 130 }}
              slotProps={{
                textField: {
                  size: "small",
                  error: !!(formErrors.items?.[idx]?.startDate),
                  helperText: formErrors.items?.[idx]?.startDate || "",
                },
              }}
            />
          </LocalizationProvider>

          {/* End Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="End"
              value={it.endDate ?? null}
              onChange={(val) => updateItem(idx, "endDate", val)}
              slotProps={{
                textField: {
                  size: "small",
                  error: !!(formErrors.items?.[idx]?.endDate),
                  helperText: formErrors.items?.[idx]?.endDate || "",
                },
              }}
              sx={{ flex: 1, minWidth: isMobile ? "100%" : 130 }}
            />
          </LocalizationProvider>

          <TextField
            label="Price/Day"
            value={it.pricePerDay}
            // InputProps={{ readOnly: true }}
            onChange={(e) => updateItem(idx, "pricePerDay", parseFloat(e.target.value) || 0)}
            size="small"
            sx={{ flex: 1, minWidth: isMobile ? "100%" : 100 }}
            error={!!(formErrors.items && formErrors.items[idx] && formErrors.items[idx].pricePerDay)}
            helperText={formErrors.items && formErrors.items[idx] && formErrors.items[idx].pricePerDay}
          />
          {/* Subtotal (readonly) */}
          <TextField
            label="Subtotal"
            value={it.totalBill}
            InputProps={{ readOnly: true }}
            size="small"
            sx={{ flex: 1, minWidth: isMobile ? "100%" : 100 }}
            error={!!(formErrors.items && formErrors.items[idx] && formErrors.items[idx].totalBill)}
            helperText={formErrors.items && formErrors.items[idx] && formErrors.items[idx].totalBill}
          />
          {/* Remove button */}
          {formData.items.length > 1 && (
            <IconButton color="error" onClick={() => removeItem(idx)}
              sx={{ alignSelf: isMobile ? "flex-end" : "center" }}
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      ))}

      <Button onClick={addItem} sx={{ mt: 1 }}>+ Add Item</Button>

      {/* Grand Total */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Grand Total: ₹{formData.grandTotal}
      </Typography>

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </Box>
    </Box>
  );
}
