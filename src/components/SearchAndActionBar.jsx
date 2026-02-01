import { Box, Button, TextField } from "@mui/material";

const SearchAndActionBar = ({
  searchTerm,
  setSearchTerm,
  pageType,
  buttonOnClick,
  label,
  btnLabel
}) => {

  return (
    <div className="search-and-action-bar" style={{width: '90vw'}}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2,
          position: "sticky",
          top: 0,
          backgroundColor: "white",
          zIndex: 1,
          pt: 1, pb: 1,
          width: '80%',
          ml: 'auto',
          mr: 'auto'
        }}
      >
        <TextField
          label={label}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={buttonOnClick} style={{ width: '10rem' }}>
          {btnLabel}
        </Button>
      </Box>
    </div>
  );
}

export default SearchAndActionBar;