import { Box, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NavDrawer({ toggleDrawer, username }) {
  const navigate = useNavigate();

  const links = [
    { text: "Customers", path: "/customers" },
    { text: "Items", path: "/items" },
    { text: "Leases", path: "/leases" },
  ];

  return (
    <Box sx={{ width: 250 }} role="presentation">
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Welcome
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {username}
        </Typography>
      </Box>
      <Divider />
      <List>
        {links?.map((link) => (
          <ListItemButton
            key={link.path}
            onClick={() => {
              navigate(link.path);
              toggleDrawer();
            }}
          >
            <ListItemText primary={link.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}