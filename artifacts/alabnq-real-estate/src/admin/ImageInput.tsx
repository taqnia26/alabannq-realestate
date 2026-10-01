import { useState, type ChangeEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

const MAX_SIZE = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
const ACCEPT = [...TYPES, ...EXTENSIONS].join(',');
const pendingUploads = new Set<string>();

async function jsonResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `تعذر رفع الصورة (${response.status})`);
  return body as T;
}

export async function uploadImage(file: File): Promise<string> {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  // MIME metadata and filenames are only picker hints; the server validates the actual bytes.
  const supportedType = TYPES.includes(file.type) || EXTENSIONS.includes(extension);
  if (!supportedType || file.size < 1 || file.size > MAX_SIZE) {
    throw new Error('اختر صورة JPG/JPEG أو PNG أو WebP أو GIF أو AVIF بحجم لا يتجاوز 8 ميغابايت.');
  }
  const { imageURL } = await jsonResponse<{ imageURL: string }>(
    await fetch('/api/admin/media/images', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/octet-stream' },
      body: file,
    }),
  );
  return imageURL;
}

async function discardUploaded(url: string) {
  const match = /^\/api\/media\/images\/([0-9a-f-]{36})$/i.exec(url);
  if (match) await fetch(`/api/admin/media/images/${match[1]}`, {
    method: 'DELETE', credentials: 'include',
  }).then(response => {
    if (response.ok || response.status === 409) pendingUploads.delete(url);
  }).catch(() => { /* Keep it in the pending set for a later cleanup attempt. */ });
}

export async function discardPendingImages() {
  await Promise.all([...pendingUploads].map(discardUploaded));
}

export function ImageInput({ label, value, onChange, onBusyChange, multiple = false, id }: {
  label: string; value: string[]; onChange: (url: string, action: 'add' | 'remove') => void;
  onBusyChange?: (busy: boolean) => void; multiple?: boolean; id: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (!files.length) return;
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        pendingUploads.add(url);
        onChange(url, 'add');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر رفع الصورة.');
    } finally { setBusy(false); onBusyChange?.(false); }
  };
  return <div className="ad-image-input">
    {value.filter(Boolean).length > 0 && <div className="ad-image-previews">
      {value.filter(Boolean).map((url, index) => <div className="ad-image-preview" key={`${url}-${index}`}>
        <img src={url} alt={`معاينة ${label} ${index + 1}`} loading="lazy" />
        <button type="button" className="ad-button ad-button-plain" disabled={busy}
          onClick={() => { if (window.confirm('إزالة الصورة؟ احفظ التعديلات لتطبيق الإزالة على الموقع.')) {
            onChange(url, 'remove');
          } }}
          aria-label={`إزالة ${label} ${index + 1}`}><Trash2 size={14} /> إزالة</button>
      </div>)}
    </div>}
    <label className="ad-button ad-button-plain ad-image-picker" htmlFor={id}><ImagePlus size={16} />{busy ? 'جارٍ رفع الصور...' : multiple ? 'رفع صور من الجهاز' : 'رفع صورة من الجهاز'}</label>
    <input id={id} type="file" accept={ACCEPT} multiple={multiple} onChange={e => void change(e)}
      disabled={busy} className="ad-visually-hidden" />
    <small>JPG/JPEG أو PNG أو WebP أو GIF أو AVIF · الحد الأقصى 8 ميغابايت لكل صورة</small>
    {error && <p role="alert" className="ad-form-error">{error}</p>}
  </div>;
}