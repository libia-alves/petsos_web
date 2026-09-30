// Mesmos valores do app mobile (complaints.service.jsx)
const MAX_UPLOAD_DIMENSION = 1280;
const JPEG_UPLOAD_QUALITY = 0.72;

/**
 * Redimensiona e converte a foto para JPEG antes do upload.
 * A API só aceita JPG/PNG, então isso também cobre WEBP e outros formatos
 * que o navegador consegue abrir.
 * @param {File} file
 * @returns {Promise<File>}
 */
export async function compressImage(file) {
  const bitmap = await createImageBitmap(file);

  const largerSide = Math.max(bitmap.width, bitmap.height);
  const scale = largerSide > MAX_UPLOAD_DIMENSION ? MAX_UPLOAD_DIMENSION / largerSide : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Falha ao converter imagem'))),
      'image/jpeg',
      JPEG_UPLOAD_QUALITY,
    );
  });

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
