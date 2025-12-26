import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import axiosInstance from "../api/axios";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, [query]);

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get(`/customers?query=${query}`);
      setCustomers(res.data.content || res.data);
    } catch (err) {
      console.error(err);
    }
  };


  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save customer (add or update)
  const handleSave = async () => {
    try {
      if (!validate()) return;

      if (editingCustomer) {
        await axiosInstance.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await axiosInstance.post("/customers", formData);
      }

      setOpenForm(false);
      setEditingCustomer(null);
      setFormData({ name: "", phone: "", address: "" });
      fetchCustomers();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Unique constraint violation
        setErrors({ phone: "Phone number already exists" });
      } else if (err.response?.data?.message?.toLowerCase().includes("phone")) {
        setErrors({ phone: err.response.data.message });
      } else {
        // fallback to global interceptor
        throw err;
      }
    }
  };

  // Delete customer
  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/customers/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err) {
      // Error handled globally
    }
  };

  return (
    <Box>
      {/* Toolbar: Search + Add button */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2,
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 1,
          pt: 1, pb: 1
        }}
      >
        <TextField
          label="Search by name/phone"
          variant="outlined"
          size="small"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={() => {
          setOpenForm(true);
          setEditingCustomer(null);
          setFormData({ name: "", phone: "", address: "" });
        }}>
          Add
        </Button>
      </Box>

      {/* Customers List */}
      {customers.map((c) => (
        <Card key={c.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">{c.name}</Typography>
            <Typography variant="body2">📞 {c.phone}</Typography>
            <Typography variant="body2">{c.address}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small"
              onClick={() => {
                setEditingCustomer(c);
                setFormData({ name: c.name, phone: c.phone, address: c.address });
                setOpenForm(true);
              }}>
              Edit</Button>
            <Button size="small" color="error"
              onClick={() => setDeleteConfirm(c)}>Delete</Button>
          </CardActions>
        </Card>
      ))}

      {/* Add/Edit Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth>
        <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
          />
          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, "") })}
            error={!!errors.phone}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 10 }}
            helperText={errors.phone}
            fullWidth
          />
          <TextField
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{deleteConfirm?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
