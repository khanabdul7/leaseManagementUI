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
import BottomSheet from "../components/BottomSheet/BottomSheet";
import LeaseDetails from "../components/LeaseDetails/LeaseDetails";
import { useRef } from "react";
import { useConfirmOnExit } from "../CustomHooks/useConfirmOnExit";

export default function Leases() {
  const [leases, setLeases] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [editingLease, setEditingLease] = useState(null);
  const [openLease, setOpenLease] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);


  const contentRef = useRef(null);
  const isAtTop = useRef(true);

  //using custom hook to prevent accidental exit
  const { requestClose } = useConfirmOnExit({
  isDirty,
  onClose: () => setOpenDialog(false),
  openConfirmDialog: () => setConfirmClose(true),
});

  const onScroll = () => {
    isAtTop.current = contentRef.current.scrollTop === 0;
  };

  useEffect(() => {
    fetchLeases();
    fetchCustomers();
    fetchItems();
  }, []);

  useEffect(() => {
  if (!openDialog) return;

  window.history.pushState(null, "");
  const handler = () => requestClose();

  window.addEventListener("popstate", handler);
  return () => window.removeEventListener("popstate", handler);
}, [openDialog]);


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

  const handleEdit = (lease) => {
    setEditingLease(lease);
    setOpenDialog(true);
  };

  const handleDelete = async (leaseId) => {
    //confirm deletion
    if (!window.confirm("Are you sure you want to delete this lease?")) return;
    await axiosInstance.delete(`/lease/${leaseId}`);
    fetchLeases();
  }

  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      requestClose();
      return;
    }
    setOpenDialog(false);
  };


  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => {
          setOpenDialog(true);
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
        <LeaseDetails lease={openLease} onEdit={handleEdit} onDelete={handleDelete} onBack={() => requestClose()}
          contentRef={contentRef} onScroll={onScroll} />
      </BottomSheet>


      {/* Add/Edit Lease Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} PaperProps={{
        sx: {
          width: "90%",      // or "600px"
          maxWidth: "800px", // optional
        }
      }}>
        <DialogTitle>{editingLease ? "Edit Lease" : "Add Lease"}</DialogTitle>
        <DialogContent>
          <LeaseForm
            editingLease={editingLease}
            setIsDirty={setIsDirty}
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
              setIsDirty(false);
              setOpenDialog(false);
              fetchLeases();
              setOpenLease(null);
            }}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>

        <Dialog
          open={confirmClose}
          onClose={() => setConfirmClose(false)}
        >
          <DialogTitle>Discard changes?</DialogTitle>
          <DialogContent>
            You have unsaved changes. Are you sure you want to close?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmClose(false)}>
              Cancel
            </Button>
            <Button
              color="error"
              onClick={() => {
                setIsDirty(false);
                setConfirmClose(false);
                setOpenDialog(false);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

      </Dialog>
    </Box>
  );
}
