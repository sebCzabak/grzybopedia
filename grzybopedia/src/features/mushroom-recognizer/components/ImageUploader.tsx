import  { useState, type ChangeEvent, useRef, useCallback } from 'react';
import {
  Box, Button, Paper, Typography, Alert, Card, CardMedia, CardContent,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Container,
  Snackbar, keyframes
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ReplayIcon from '@mui/icons-material/Replay';
import Webcam from 'react-webcam';
import { type Mushroom } from '../../../types/index'
import axiosInstance from '../../../api/axiosInstance';

// Definicja animacji "wejścia" dla karty wyniku
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment"
};

export const ImageUploader = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Mushroom | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "grzybopedia-photo.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
          setPreview(imageSrc);
          setResult(null);
          setError(null);
          setIsWebcamOpen(false);
        });
    }
  }, [webcamRef]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axiosInstance.post('/recognize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? selectedFile.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        },
      });

      setResult(response.data);
      setSnackbar({ open: true, message: 'Grzyb rozpoznany pomyślnie!', severity: 'success' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Nie udało się rozpoznać grzyba. Spróbuj z innym zdjęciem.";
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setUploadProgress(0);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', borderRadius: 4, overflow: 'hidden' }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Grzybopedia
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Wgraj zdjęcie z dysku lub użyj kamery, aby dowiedzieć się, co znalazłeś!
        </Typography>

        <Box 
          sx={{ 
            minHeight: '300px', 
            border: '2px dashed', 
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: preview ? 'none' : 'action.hover',
            p: 1
          }}
        >
          {preview ? (
            <img src={preview} alt="Podgląd" style={{ maxHeight: '300px', width: 'auto', maxWidth: '100%', borderRadius: '8px' }} />
          ) : (
            <Typography color="text.secondary">Podgląd zdjęcia pojawi się tutaj</Typography>
          )}
        </Box>

        <Box sx={{ minHeight: '52px', mt: 3 }}>
          {isLoading ? (
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ flexGrow: 1, height: 10, borderRadius: 5 }} />
              <Typography variant="body1" color="text.secondary">{`${uploadProgress}%`}</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {!selectedFile && (
                <>
                  <Button variant="contained" component="label" startIcon={<UploadFileIcon />}>
                    Wybierz Plik
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                  <Button variant="outlined" startIcon={<PhotoCamera />} onClick={() => setIsWebcamOpen(true)}>
                    Użyj Kamery
                  </Button>
                </>
              )}
              {selectedFile && !result && (
                <>
                  <Button variant="contained" color="primary" onClick={handleUpload} disabled={isLoading}>
                    Analizuj
                  </Button>
                  <Button variant="text" color="secondary" onClick={handleClear} startIcon={<ReplayIcon />}>
                    Wybierz inny
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>

        {error && !snackbar.open && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}
        
        {result && (
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
            <Card sx={{ mt: 4, display: 'flex', textAlign: 'left', flexDirection: { xs: 'column', md: 'row' } }}>
              <CardMedia
                component="img"
                sx={{ width: { xs: '100%', md: 250 } }}
                image={result.imageUrl}
                alt={result.name}
              />
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                  {result.name}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" fontStyle="italic">
                  {result.latinName}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  {result.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2, color: result.isEdible ? 'primary.main' : 'error.main' }}>
                  {result.isEdible ? 'Jadalny' : 'Niejadalny / Trujący'}
                </Typography>
              </CardContent>
            </Card>
            <Button variant="outlined" onClick={handleClear} startIcon={<ReplayIcon />} sx={{ mt: 2 }}>
              Rozpoznaj kolejnego
            </Button>
          </Box>
        )}
      </Paper>
      
      <Dialog open={isWebcamOpen} onClose={() => setIsWebcamOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Zrób zdjęcie</DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
            onUserMediaError={(error: string | DOMException) => {
              console.error("DIAGNOSTYKA: Wystąpił błąd podczas próby dostępu do kamery:", error);
              const errorMessage = typeof error === 'string' ? error : error.name;
              setError(`Błąd kamery: ${errorMessage}. Sprawdź, czy strona ma uprawnienia do kamery i działa na HTTPS.`);
              setIsWebcamOpen(false);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsWebcamOpen(false)}>Anuluj</Button>
          <Button onClick={capturePhoto} variant="contained">Zrób zdjęcie</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};