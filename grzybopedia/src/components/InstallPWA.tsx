import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Zapobiegaj automatycznemu wyświetleniu mini-infobar
      e.preventDefault();
      // Zapisz event, żeby móc wywołać go później
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Pokaż własny przycisk instalacji
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Pokaż prompt instalacji
    deferredPrompt.prompt();

    // Czekaj na wybór użytkownika
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);

    // Wyczyść saved prompt, ponieważ może być użyty tylko raz
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
  };

  return (
    <Snackbar
      open={showInstallPrompt}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={null}
    >
      <Alert
        severity="info"
        icon={<InstallMobileIcon />}
        action={
          <>
            <Button color="inherit" size="small" onClick={handleInstallClick}>
              Zainstaluj
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              Później
            </Button>
          </>
        }
      >
        Zainstaluj Grzybopedię na swoim urządzeniu!
      </Alert>
    </Snackbar>
  );
}
