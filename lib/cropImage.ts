// Crops an image to a centered square and resizes it, entirely client-side
// (avoids adding a server-side image library like sharp to this lean pilot deploy).
export async function cropToSquare(file: File, size = 1000): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const minSide = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - minSide) / 2;
  const sy = (bitmap.height - minSide) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported in this browser');
  ctx.drawImage(bitmap, sx, sy, minSide, minSide, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to process image'))),
      'image/jpeg',
      0.9,
    );
  });
}
