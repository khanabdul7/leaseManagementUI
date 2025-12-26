import { List, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NavDrawer({ toggleDrawer }) {
  const navigate = useNavigate();

  const links = [
    { text: "Customers", path: "/customers" },
    { text: "Items", path: "/items" },
    { text: "Leases", path: "/leases" },
  ];

  return (
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
  );
}