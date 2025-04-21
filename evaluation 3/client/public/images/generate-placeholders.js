import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const destinations = [
  'shimla', 'goa', 'kerala', 'rajasthan', 'ladakh',
  'rameshwaram', 'varanasi', 'darjeeling', 'munnar', 'andaman'
];

const colors = {
  shimla: '#4A90E2',
  goa: '#F5A623',
  kerala: '#50E3C2',
  rajasthan: '#D0021B',
  ladakh: '#7ED321',
  rameshwaram: '#9013FE',
  varanasi: '#417505',
  darjeeling: '#F8E71C',
  munnar: '#B8E986',
  andaman: '#4A90E2'
};

const imagesDir = path.join(__dirname, '..', 'public', 'images');

// Create images directory if it doesn't exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

destinations.forEach(destination => {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');

  // Fill background with destination color
  ctx.fillStyle = colors[destination];
  ctx.fillRect(0, 0, 800, 600);

  // Add destination name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(destination.toUpperCase(), 400, 300);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(imagesDir, `${destination}.jpg`), buffer);
});

console.log('Placeholder images generated successfully!'); 