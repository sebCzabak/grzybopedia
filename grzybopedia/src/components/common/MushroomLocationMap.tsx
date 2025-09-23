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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" 
  });

  if (!isLoaded) return <div>Ładowanie mapy...</div>;

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
