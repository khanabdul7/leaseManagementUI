import { useState, useEffect } from "react";
import {
  Box, Button, TextField, Card, CardContent,
  Typography, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axiosInstance from "../api/axios";
import SearchAndActionBar from "../components/SearchAndActionBar";

export default function Items() {
  const [allItems, setAllItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [query, setQuery] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", pricePerDay: 0, description: "" });
  const [errors, setErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = allItems.filter(i =>
      i.name.toLowerCase().includes(keyword) ||
      i.description?.toLowerCase().includes(keyword) ||
      i.pricePerDay.toString().includes(keyword)
    );
    setFilteredItems(filtered);
  }, [searchTerm, allItems]);

  const fetchItems = async () => {
    const res = await axiosInstance.get("/items");
    setAllItems(res.data?.content);
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.pricePerDay || isNaN(formData.pricePerDay) || Number(formData.pricePerDay) <= 0) {
      newErrors.pricePerDay = "Daily Rate must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editingItem) {
        await axiosInstance.put(`/items/${editingItem.id}`, formData);
      } else {
        await axiosInstance.post("/items", formData);
      }
      setOpenForm(false);
      setEditingItem(null);
      setFormData({ name: "", pricePerDay: 0, description: "" });
      fetchItems();
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors({ name: "Item name already exists" });
      } else {
        throw err;
      }
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/items/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchItems();
    } catch (err) {
      // Error handled globally
    }
  };

  return (
    <Box>
      {/* Sticky Search + Add button */}
      <SearchAndActionBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        pageType="items"
        buttonOnClick={() => {
          setOpenForm(true);
          setEditingItem(null);
          setFormData({ name: "", pricePerDay: 0, description: "" });
          setErrors({});
        }}
        label="Search items"
        btnLabel="Add"
      />

      {/* Items list */}
      <div className="item-card-container" style={{ display: 'flex',  
          justifyContent: 'space-evenly' ,margin: '0.5rem', width: '90vw',
          maxHeight: '62vh', overflowY: 'auto', flexWrap: 'wrap', gap: '1rem' }}>
        {filteredItems.length > 0 ? filteredItems.map((item) => (
          <Card key={item.id} sx={{ mb: 2, width: '10rem' }}>
            <CardContent>
              <Typography variant="h6">{item.name}</Typography>
              <Typography>Rate: ₹{item.pricePerDay}</Typography>
              <Typography color="text.secondary">{item.description}</Typography>

              <IconButton onClick={() => {
                setEditingItem(item);
                setFormData(item);
                setErrors({});
                setOpenForm(true);
              }}>
                <Edit />
              </IconButton>

              <IconButton onClick={() => { setDeleteConfirm(item) }}>
                <Delete />
              </IconButton>
            </CardContent>
          </Card>
        )) : (
          <Typography variant="body2" color="textSecondary">No items found.</Typography>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Daily Rate"
            fullWidth
            margin="dense"
            value={formData.pricePerDay}
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/[^0-9.]/g, ""); // allow numbers & decimal
              setFormData({ ...formData, pricePerDay: onlyNums });
            }}
            inputProps={{ inputMode: "decimal", pattern: "[0-9.]*" }}
            error={!!errors.pricePerDay}
            helperText={errors.pricePerDay}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
