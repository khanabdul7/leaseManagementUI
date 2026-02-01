import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import NavDrawer from "./NavDrawer";
import BottomNav from "./BottomNav";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, Menu, MenuItem } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";


const drawerWidth = 200;

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const username = localStorage.getItem("username") || "User";

  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const { logout } = useAuth();

  return (
    <>
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
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 'auto' }}>
              {/* <Typography variant="body1">{username}</Typography> */}

              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} title={username}>
                <Avatar sx={{ bgcolor: "#4f7cff" }}>
                  {username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => setOpen(true)}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

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
          <NavDrawer toggleDrawer={toggleDrawer} username={username}/>
        </Drawer>

        {/* Page content */}

        {/* Bottom Navigation */}
        <BottomNav />
      </Box>
      <div className="outlet" style={{ display: 'flex', width: '98vw', justifyContent: 'center', height: '75vh' }}>
        <Outlet />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>

        <DialogContent>
          Are you sure you want to logout?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={logout}
            color="error"
            variant="contained"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
