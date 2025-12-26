import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (location.pathname.startsWith("/customers")) setValue(0);
    else if (location.pathname.startsWith("/items")) setValue(1);
    else if (location.pathname.startsWith("/leases")) setValue(2);
  }, [location.pathname]);

  return (
    <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0,zIndex:1 }} elevation={3}>
      <BottomNavigation
        value={value}
        onChange={(e, newValue) => {
          setValue(newValue);
          if (newValue === 0) navigate("/customers");
          if (newValue === 1) navigate("/items");
          if (newValue === 2) navigate("/leases");
        }}
      >
        <BottomNavigationAction label="Customers" icon={<PeopleIcon />} />
        <BottomNavigationAction label="Items" icon={<InventoryIcon />} />
        <BottomNavigationAction label="Leases" icon={<ReceiptIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
