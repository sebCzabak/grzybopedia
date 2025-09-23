import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { type Mushroom } from "../../../types";

interface MushroomCardProps {
  mushroom: Mushroom;
}

export const MushroomCard = ({ mushroom }: MushroomCardProps) => {
  return (
    <RouterLink to={`/atlas/${mushroom.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}>
        <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <CardMedia
            component="img"
            height="160"
            image={mushroom.imageUrl}
            alt={mushroom.name}
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography gutterBottom variant="h6" component="div">
              {mushroom.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {mushroom.latinName}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </RouterLink>
  );
};