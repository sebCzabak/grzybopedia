import { useState } from "react";
import { Box, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { MushroomGrid } from "../features/atlas/components/MushroomGrid";

export const AtlasPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
          Atlas Grzybów
        </Typography>
        <TextField
          label="Szukaj grzyba..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: '300px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <MushroomGrid searchQuery={searchQuery} />
    </Box>
  );
}