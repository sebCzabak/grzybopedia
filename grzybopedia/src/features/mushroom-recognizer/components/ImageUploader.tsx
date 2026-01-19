import  { useState, type ChangeEvent, useRef, useCallback } from 'react';
import {
  Box, Button, Paper, Typography, Alert,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Container,
  Grid, Chip,
  keyframes
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ReplayIcon from '@mui/icons-material/Replay';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Webcam from 'react-webcam';
import confetti from 'canvas-confetti';
import { type Mushroom } from '../../../types/index'
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext'


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
  const [confidence, setConfidence] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [isFindingSaved,setIsFindingSaved]=useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const { refetchUser, isAuthenticated } = useAuth();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
      setUploadProgress(0);
      setIsFindingSaved(false);
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
      const response = await axiosInstance.post('/usermushroom/recognize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total ?? selectedFile.size;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percentCompleted);
        },
      });

      const recognitionResult = response.data;
      console.log('Wynik rozpoznawania:', recognitionResult);

      // Zapisz confidence z rozpoznawania (jeśli istnieje)
      const recognitionConfidence = recognitionResult.confidence || recognitionResult.confidenceScore || null;
      if (recognitionConfidence !== null) {
        let confidenceValue: number;
        
        if (typeof recognitionConfidence === 'number') {
          confidenceValue = recognitionConfidence;
        } else {
          // Usuń znak % jeśli istnieje i parsuj
          const cleaned = String(recognitionConfidence).replace('%', '').trim();
          confidenceValue = parseFloat(cleaned);
        }
        
        console.log('Confidence przed konwersją:', confidenceValue, 'Typ:', typeof confidenceValue);
        
        // Jeśli confidence jest w zakresie 0-1 (ułamek), zamień na procent
        // Sprawdzamy czy wartość jest mniejsza lub równa 1.0 (ułamek)
        if (!isNaN(confidenceValue) && confidenceValue <= 1.0 && confidenceValue >= 0) {
          confidenceValue = confidenceValue * 100;
          console.log('Confidence po konwersji z ułamka (0-1):', confidenceValue);
        }
        // Jeśli wartość jest już w procentach (większa niż 1), użyj bezpośrednio
        else if (!isNaN(confidenceValue) && confidenceValue > 1.0 && confidenceValue <= 100) {
          console.log('Confidence już w procentach:', confidenceValue);
          // Użyj bezpośrednio
        }
        
        // Upewnij się że wartość jest poprawna
        if (isNaN(confidenceValue) || confidenceValue < 0 || confidenceValue > 100) {
          console.warn('Nieprawidłowa wartość confidence:', confidenceValue);
          setConfidence(null);
        } else {
          console.log('Confidence finalne (przed zaokrągleniem):', confidenceValue);
          setConfidence(confidenceValue);
        }
      }

      // Pobierz pełne dane z atlasu
      let mushroomData: Mushroom | null = null;

      // Jeśli odpowiedź zawiera prawidłowe ID (int lub GUID), pobierz dane po ID
      if (recognitionResult.id && isValidId(recognitionResult.id)) {
        console.log('Pobieranie danych grzyba z atlasu po ID:', recognitionResult.id);
        mushroomData = await fetchMushroomById(String(recognitionResult.id));
      } 
      // Jeśli nie ma prawidłowego ID, wyszukaj po nazwie
      else if (recognitionResult.name || recognitionResult.latinName) {
        console.log('Wyszukiwanie grzyba w atlasie po nazwie:', recognitionResult.name || recognitionResult.latinName);
        mushroomData = await findMushroomInAtlas(
          recognitionResult.name || '', 
          recognitionResult.latinName || ''
        );
      }

      // Jeśli znaleziono grzyb w atlasie, użyj danych z atlasu (ale zachowaj confidence)
      if (mushroomData) {
        console.log('Znaleziono grzyb w atlasie:', mushroomData);
        setResult(mushroomData);
        toast.success('Grzyb rozpoznany pomyślnie!');
      } 
      // Jeśli nie znaleziono w atlasie, użyj danych z rozpoznawania (fallback)
      else {
        console.warn('Nie znaleziono grzyba w atlasie, używam danych z rozpoznawania');
        setResult(recognitionResult);
        toast.warning('Grzyb rozpoznany, ale nie znaleziono w atlasie. Niektóre funkcje mogą być niedostępne.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Nie udało się rozpoznać grzyba. Spróbuj z innym zdjęciem.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setConfidence(null);
    setError(null);
    setUploadProgress(0);
    setIsFindingSaved(false);
    setShowCelebrationModal(false);
  };

  // Funkcja do wywołania konfetti
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Konfetti z lewej strony
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      
      // Konfetti z prawej strony
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  // Funkcja do sprawdzania czy ID jest prawidłowe (int lub GUID, nie placeholder)
  const isValidId = (id: string | number): boolean => {
    if (typeof id === 'number') return true; // int jest zawsze prawidłowy
    
    const str = String(id);
    
    // Sprawdź czy to nie jest placeholder (temp-id, etc.)
    if (str.toLowerCase().includes('temp') || str === '' || str === 'undefined' || str === 'null') {
      return false;
    }
    
    // Sprawdź czy to int (tylko cyfry)
    if (/^\d+$/.test(str)) return true;
    
    // Sprawdź czy to GUID
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(str);
  };

  // Funkcja do pobierania pełnych danych grzyba z atlasu po ID
  const fetchMushroomById = async (id: string): Promise<Mushroom | null> => {
    try {
      const response = await axiosInstance.get(`/mushrooms/${id}`);
      return response.data;
    } catch (error) {
      console.error('Błąd podczas pobierania grzyba z atlasu:', error);
      return null;
    }
  };

  // Funkcja do wyszukiwania grzyba w atlasie po nazwie/latinName i zwracania pełnych danych
  const findMushroomInAtlas = async (name: string, latinName: string): Promise<Mushroom | null> => {
    try {
      const response = await axiosInstance.get('/mushrooms');
      const mushrooms = response.data;
      
      // Szukaj po nazwie lub nazwie łacińskiej
      const found = mushrooms.find((m: any) => 
        m.name?.toLowerCase() === name.toLowerCase() || 
        m.latinName?.toLowerCase() === latinName.toLowerCase()
      );
      
      return found || null;
    } catch (error) {
      console.error('Błąd podczas wyszukiwania grzyba w atlasie:', error);
      return null;
    }
  };

  const handleSaveFinding = async () => {
    if(!result) return;
    
    // Walidacja przed wysłaniem
    if(!result.id){
      toast.error('Brak ID grzyba. Spróbuj rozpoznać grzyba ponownie.');
      return;
    }

    let mushroomId = result.id;

    // Jeśli ID nie jest prawidłowe (placeholder), spróbuj znaleźć prawdziwy ID w atlasie
    if (!isValidId(mushroomId)) {
      console.log('ID nie jest prawidłowe, wyszukuję grzyb w atlasie...');
      toast.info('Wyszukiwanie grzyba w bazie...');
      
      const mushroom = await findMushroomInAtlas(result.name, result.latinName);
      
      if (mushroom && mushroom.id) {
        mushroomId = mushroom.id;
        // Zaktualizuj result z pełnymi danymi z atlasu
        setResult(mushroom);
        console.log('Znaleziono prawdziwy ID:', mushroomId);
      } else {
        toast.error('Nie udało się znaleźć grzyba w bazie. Upewnij się, że grzyb istnieje w atlasie.');
        return;
      }
    }

    const requestData = {
      mushroomId: mushroomId
    };

    console.log('Wysyłanie zapytania do /findings:', requestData);
    console.log('Pełny obiekt result:', result);

    try{
      const response = await axiosInstance.post('/findings', requestData);
      console.log('Odpowiedź z serwera:', response.data);

      setIsFindingSaved(true);
      
      // Odśwież dane użytkownika w tle (bez pokazywania loadera)
      await refetchUser(true);
      
      // Wywołaj konfetti i pokaż modal z gratulacją
      triggerConfetti();
      setShowCelebrationModal(true);
      
    }
    catch(err:any){
      console.error('Błąd podczas zapisywania znaleziska:', err);
      console.error('Status:', err.response?.status);
      console.error('Status Text:', err.response?.statusText);
      console.error('Response Data:', err.response?.data);
      console.error('Request Data:', requestData);
      
      // Lepsze wyświetlanie błędów walidacji
      let errorMessage = 'Nie udało się zapisać znaleziska. Spróbuj ponownie.';
      
      if(err.response?.data){
        // Sprawdź różne możliwe formaty błędów
        errorMessage = err.response.data.message 
          || err.response.data.error 
          || err.response.data.title
          || (Array.isArray(err.response.data.errors) 
              ? err.response.data.errors.map((e: any) => e.message || e).join(', ')
              : JSON.stringify(err.response.data));
      } else if(err.message){
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  }
  
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

        {error &&  <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}
        
        {result && (
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out`, mt: 4 }}>
            <Grid container spacing={4}>
              {/* Zdjęcie grzyba */}
              <Grid size={{xs:12, md:5}}>
                <Box 
                  component="img" 
                  src={result.imageUrl} 
                  alt={result.name} 
                  sx={{ 
                    width: '100%', 
                    borderRadius: 3, 
                    boxShadow: 5,
                    objectFit: 'cover',
                    maxHeight: '400px'
                  }} 
                />
              </Grid>
              
              {/* Informacje o grzybie */}
              <Grid size={{xs:12, md:7}}>
                <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                  {result.name}
                </Typography>
                <Typography variant="h5" color="text.secondary" fontStyle="italic" gutterBottom>
                  {result.latinName}
                </Typography>
                
                {/* Confidence */}
                {confidence !== null && (
                  <Box sx={{ my: 2 }}>
                    <Chip 
                      label={`Pewność: ${Math.round(confidence)}%`}
                      color={confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'error'}
                      sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                    />
                  </Box>
                )}
                
                <Typography variant="body1" sx={{ mt: 2, lineHeight: 1.7 }}>
                  {result.description}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Przyciski akcji */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAuthenticated && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSaveFinding}
                  disabled={isFindingSaved}
                  size="large"
                >
                  {isFindingSaved ? "Zapisano!" : "✅ Zapisz w moich znaleziskach"}
                </Button>
              )}
              <Button 
                variant="outlined" 
                onClick={handleClear} 
                startIcon={<ReplayIcon />}
                size="large"
              >
                Rozpoznaj kolejnego
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Modal z gratulacją */}
      <Dialog 
        open={showCelebrationModal} 
        onClose={() => setShowCelebrationModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            textAlign: 'center',
            p: 2
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <CelebrationIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom color="primary">
            Gratulacje! 🎉
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Znalezisko zapisane!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Twój grzyb został dodany do kolekcji. Zdobyłeś punkty!
          </Typography>
          {result && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {result.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                {result.latinName}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => setShowCelebrationModal(false)}
            startIcon={<CheckCircleIcon />}
          >
            Świetnie!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog kamery */}
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
    </Container>
  );
};