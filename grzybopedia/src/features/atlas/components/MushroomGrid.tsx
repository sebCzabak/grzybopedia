import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Grid, Skeleton, Typography } from "@mui/material";
import { type Mushroom } from "../../../types";
import { getMushrooms } from "../atlasApi";
import { MushroomCard } from "./MushroomCard";


interface MushroomGridProps{
  searchQuery:string;
}

export const MushroomGrid = ({searchQuery}:MushroomGridProps) => {
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMushrooms = async () => {
      try {
        const data = await getMushrooms();
        setMushrooms(data);
        setError(null);
      } catch (err) {
        setError("Nie udało się załadować danych.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMushrooms();
  }, []);


  const filteredMushrooms = useMemo(() => {
    return mushrooms.filter(mushroom =>
      mushroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mushroom.latinName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mushrooms, searchQuery]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (isLoading) {
    // Wyświetlanie "szkieletów" podczas ładowania
    return (
      <Grid container spacing={3}>
        {Array.from(new Array(6)).map((_, index) => (
          <Grid size={{xs:12, sm:6,md:4}} key={index}>
            <Skeleton variant="rectangular" height={160} />
            <Skeleton height={40} />
            <Skeleton height={20} width="60%" />
          </Grid>
        ))}
      </Grid>
    );
  }

  // Komunikat, gdy nie znaleziono wyników
  if (filteredMushrooms.length === 0) {
    return (
      <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 5 }}>
        Nie znaleziono grzybów pasujących do Twojego zapytania.
      </Typography>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {filteredMushrooms.map((mushroom) => (
            <Grid size={{xs:12, sm:6,md:4}} key={mushroom.id}>
            <MushroomCard mushroom={mushroom} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};