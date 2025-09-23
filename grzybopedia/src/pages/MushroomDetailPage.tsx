import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Typography, Container, Grid, Chip, Alert, CircularProgress, Button } from "@mui/material";
import { getMushroomById } from "../features/atlas/atlasApi";
import { MushroomLocationMap } from "../components/common/MushroomLocationMap";
import { type Mushroom } from "../types";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const MushroomDetailPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const [mushroom, setMushroom] = useState<Mushroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchMushroom = async () => {
      setIsLoading(true);
      try {
        const data = await getMushroomById(id);
        if (data) {
          setMushroom(data);
        } else {
          setError("Nie znaleziono grzyba o podanym ID.");
        }
      } catch (err) {
        setError("Wystąpił błąd podczas pobierania danych.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMushroom();
  }, [id]);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  if (!mushroom) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
       <Button
        component={RouterLink}
        to="/atlas"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Powrót do Atlasu
      </Button>
      <Grid container spacing={4}>
        <Grid size={{xs:12, md:5}}>
          <Box component="img" src={mushroom.imageUrl} alt={mushroom.name} sx={{ width: '100%', borderRadius: 3, boxShadow: 5 }} />
        </Grid>
         <Grid size={{xs:12, md:7}}>
          <Typography variant="h3" component="h1" fontWeight="bold">{mushroom.name}</Typography>
          <Typography variant="h5" color="text.secondary" fontStyle="italic" gutterBottom>{mushroom.latinName}</Typography>
          <Chip 
            label={mushroom.isEdible ? 'Jadalny' : 'Niejadalny / Trujący'}
            color={mushroom.isEdible ? 'success' : 'error'}
            sx={{ my: 2, fontSize: '1rem', fontWeight: 'bold' }}
          />
          <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7 }}>
            {mushroom.description}
          </Typography>
        </Grid>
      </Grid>
       <Box sx={{ mt: 6 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Gdzie szukać?
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Poniższa mapa pokazuje przykładowy obszar występowania tego grzyba.
        </Typography>
        <MushroomLocationMap center={mushroom.location} />
      </Box>
    </Container>
  );
};