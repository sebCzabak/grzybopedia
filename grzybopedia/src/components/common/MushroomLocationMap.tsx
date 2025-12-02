import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
}

export const MushroomLocationMap = ({ center }: MapProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey 
  });

  if (loadError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Nie udało się załadować mapy. Sprawdź konfigurację klucza API Google Maps.
      </div>
    );
  }

  if (!isLoaded) return <div>Ładowanie mapy...</div>;
  
  if (!apiKey) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Mapa wymaga klucza API Google Maps. Dodaj VITE_GOOGLE_MAPS_API_KEY do pliku .env
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
    >
      <Marker position={center} />
    </GoogleMap>
  );
};
