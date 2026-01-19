/**
 * Skrypt do generowania ikon PWA z pliku SVG
 * 
 * Instalacja wymaganych zależności:
 * npm install --save-dev sharp
 * 
 * Użycie:
 * node generate-pwa-icons.js
 */

import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const sourceIcon = './public/mushroom-icon.svg';
const outputDir = './public';

const sizes = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

// Dla maskable icon - dodajemy padding
const maskableSize = { name: 'maskable-icon-512x512.png', size: 512, padding: 51 }; // ~10% padding

async function generateIcons() {
  // Sprawdź czy plik źródłowy istnieje
  if (!existsSync(sourceIcon)) {
    console.error(`❌ Plik źródłowy nie istnieje: ${sourceIcon}`);
    console.log('📝 Możesz użyć własnego pliku SVG lub PNG jako źródła.');
    console.log('   Zmień wartość zmiennej "sourceIcon" w tym skrypcie.');
    return;
  }

  console.log('🎨 Generowanie ikon PWA...\n');

  // Wczytaj źródłowy SVG/PNG
  const svgBuffer = readFileSync(sourceIcon);

  // Generuj zwykłe ikony
  for (const { name, size } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(outputDir, name));
      console.log(`✅ Wygenerowano: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Błąd przy generowaniu ${name}:`, error.message);
    }
  }

  // Generuj maskable icon z paddingiem
  try {
    const innerSize = maskableSize.size - (maskableSize.padding * 2);
    
    await sharp({
      create: {
        width: maskableSize.size,
        height: maskableSize.size,
        channels: 4,
        background: { r: 76, g: 175, b: 80, alpha: 1 } // #4CAF50
      }
    })
      .composite([
        {
          input: await sharp(svgBuffer)
            .resize(innerSize, innerSize)
            .toBuffer(),
          top: maskableSize.padding,
          left: maskableSize.padding
        }
      ])
      .png()
      .toFile(join(outputDir, maskableSize.name));
    
    console.log(`✅ Wygenerowano: ${maskableSize.name} (${maskableSize.size}x${maskableSize.size} z paddingiem)`);
  } catch (error) {
    console.error(`❌ Błąd przy generowaniu maskable icon:`, error.message);
  }

  // Generuj favicon.ico (opcjonalnie - wymaga dodatkowej biblioteki)
  console.log('\n💡 Tip: Favicon.ico możesz wygenerować online na: https://favicon.io/');
  
  console.log('\n✨ Gotowe! Wszystkie ikony zostały wygenerowane w folderze public/');
  console.log('🔍 Możesz teraz uruchomić aplikację i sprawdzić manifest PWA w DevTools');
}

generateIcons().catch(console.error);
