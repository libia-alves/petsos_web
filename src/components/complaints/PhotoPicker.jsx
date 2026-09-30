import { useEffect, useMemo, useRef, useState } from 'react';
import { MAX_PHOTOS, MAX_PHOTO_BYTES } from '@/constants/complaints.constants';
import { compressImage } from '@/utils/image.utils';

/**
 * Seleção de fotos com pré-visualização. As fotos são comprimidas para JPEG
 * aqui mesmo, então o formulário já recebe os arquivos prontos para envio.
 * @param {{ photos: File[], onChange: (photos: File[]) => void }} props
 */
export default function PhotoPicker({ photos, onChange }) {
  const inputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const previews = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const available = MAX_PHOTOS - photos.length;
    const accepted = files.slice(0, available);
    setError(files.length > available ? `Você pode anexar no máximo ${MAX_PHOTOS} fotos.` : '');

    setIsProcessing(true);
    try {
      const compressed = await Promise.all(accepted.map(compressImage));
      const valid = compressed.filter((file) => file.size <= MAX_PHOTO_BYTES);
      if (valid.length < compressed.length) setError('Alguma foto ficou grande demais e foi ignorada.');
      onChange([...photos, ...valid]);
    } catch {
      setError('Não foi possível ler uma das imagens. Use fotos JPG ou PNG.');
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = (index) => {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
    setError('');
  };

  return (
    <div className="photo-picker">
      <div className="photo-grid">
        {previews.map((url, index) => (
          <div key={url} className="photo-thumb">
            <img src={url} alt={`Foto ${index + 1}`} />
            <button
              type="button"
              className="photo-remove"
              aria-label={`Remover foto ${index + 1}`}
              onClick={() => removePhoto(index)}
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label
            className="photo-add"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFiles(event.dataTransfer.files);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => handleFiles(event.target.files)}
            />
            <span aria-hidden="true">📷</span>
            {isProcessing ? 'Processando...' : 'Adicionar fotos'}
            <small>
              {photos.length}/{MAX_PHOTOS}
            </small>
          </label>
        )}
      </div>

      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
