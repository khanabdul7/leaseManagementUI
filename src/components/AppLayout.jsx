import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  CssBaseline,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import NavDrawer from "./NavDrawer";
import BottomNav from "./BottomNav";

const drawerWidth = 200;

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Normalize CSS across browsers */}
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Matania Lease Manager
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Spacer for AppBar height (prevents content being hidden behind it) */}
      <Box sx={theme.mixins.toolbar} />

      {/* Drawer for navigation */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
        }}
      >
        <NavDrawer toggleDrawer={toggleDrawer} />
      </Drawer>

      {/* Page content */}
      <Box sx={{ flex: 1, mb: 7, p: 2, overflowY: "auto" }}>
        {children}
      </Box>

      {/* Bottom Navigation */}
      <BottomNav />
    </Box>
  );
}
