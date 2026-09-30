import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailVerificationNotice from '@/components/EmailVerificationNotice';
import PhotoPicker from '@/components/complaints/PhotoPicker';
import LocationPicker from '@/components/map/LocationPicker';
import { ANIMAL_EMOJI, ANIMAL_TYPES, COMPLAINT_TYPES } from '@/constants/complaints.constants';
import { useAuth } from '@/context/AuthContext';
import { createComplaint } from '@/services/complaints.service';

const INITIAL_FORM = {
  title: '',
  description: '',
  type: '',
  animal: '',
  location: null,
  photos: [],
  isAnonymous: false,
};

// Mesmas regras do createComplaintSchema da API
function validate(form) {
  const errors = {};
  if (form.title.trim().length < 3) errors.title = 'O título deve ter pelo menos 3 caracteres.';
  if (!form.type) errors.type = 'Selecione o tipo da denúncia.';
  if (!form.animal) errors.animal = 'Selecione o animal.';
  if (!form.location) errors.location = 'Informe onde o caso aconteceu.';
  if (!form.description.trim() && form.photos.length === 0) {
    errors.description = 'Escreva uma descrição ou anexe pelo menos uma foto.';
  }
  return errors;
}

export default function CreateComplaintPage() {
  const navigate = useNavigate();
  const { emailVerified } = useAuth();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      document.querySelector('.field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createComplaint({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
      });
      navigate(`/denuncias/${created.id}`, { replace: true, state: { justCreated: true } });
    } catch (error) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        setSubmitError('Confirme seu email antes de registrar a denúncia.');
      } else if (error.status === 429) {
        setSubmitError('Muitas denúncias enviadas em pouco tempo. Tente novamente mais tarde.');
      } else {
        setSubmitError(error.message || 'Não foi possível registrar a denúncia. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page page--narrow">
      <header className="page-header">
        <h1>Nova denúncia</h1>
        <p>Conte o que aconteceu, anexe fotos e marque o local. Leva menos de 2 minutos.</p>
      </header>

      {!emailVerified && <EmailVerificationNotice />}

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <fieldset className="form-section">
          <legend>1. O que aconteceu?</legend>

          <div className="field">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              className="input"
              maxLength={120}
              placeholder="Ex.: Cachorro preso sem água no quintal"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field">
            <span className="field-label">Tipo *</span>
            <div className="chips" role="radiogroup" aria-label="Tipo da denúncia">
              {COMPLAINT_TYPES.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={form.type === value}
                  className={`chip${form.type === value ? ' is-active' : ''}`}
                  onClick={() => updateField('type', value)}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

          <div className="field">
            <span className="field-label">Animal *</span>
            <div className="chips" role="radiogroup" aria-label="Animal">
              {ANIMAL_TYPES.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={form.animal === value}
                  className={`chip${form.animal === value ? ' is-active' : ''}`}
                  onClick={() => updateField('animal', value)}
                >
                  {ANIMAL_EMOJI[value]} {label}
                </button>
              ))}
            </div>
            {errors.animal && <span className="field-error">{errors.animal}</span>}
          </div>

          <div className="field">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              className="input"
              rows={5}
              maxLength={2000}
              placeholder="Descreva a situação: estado do animal, há quanto tempo acontece, se há alguém no local..."
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>2. Evidências</legend>
          <p className="form-hint">Até 5 fotos. Elas são reduzidas automaticamente antes do envio.</p>
          <PhotoPicker
            photos={form.photos}
            onChange={(photos) => {
              updateField('photos', photos);
              if (photos.length > 0) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
          />
        </fieldset>

        <fieldset className="form-section">
          <legend>3. Onde aconteceu? *</legend>
          <LocationPicker value={form.location} onChange={(location) => updateField('location', location)} />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </fieldset>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.isAnonymous}
            onChange={(event) => updateField('isAnonymous', event.target.checked)}
          />
          <span>
            Denunciar anonimamente
            <small>Seu nome de usuário não aparecerá publicamente na denúncia.</small>
          </span>
        </label>

        {submitError && <div className="alert-error">{submitError}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className="btn" disabled={isSubmitting || !emailVerified}>
            {isSubmitting ? 'Enviando...' : 'Registrar denúncia'}
          </button>
        </div>
      </form>
    </div>
  );
}
