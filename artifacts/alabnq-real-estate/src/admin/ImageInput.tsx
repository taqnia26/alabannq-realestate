import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

const MAX_SIZE = 8 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function jsonResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `تعذر رفع الصورة (${response.status})`);
  return body as T;
}

export async function uploadImage(file: File): Promise<string> {
  if (!TYPES.includes(file.type) || file.size < 1 || file.size > MAX_SIZE) {
    throw new Error('اختر صورة JPG أو PNG أو WebP أو GIF بحجم لا يتجاوز 8 ميغابايت.');
  }
  const { uploadURL, imageURL } = await jsonResponse<{ uploadURL: string; imageURL: string }>(
    await fetch('/api/admin/media/images', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
    }),
  );
  const uploaded = await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
  if (!uploaded.ok) throw new Error('تعذر إرسال الصورة إلى التخزين. حاول مجددًا.');
  return imageURL;
}

function discardUploaded(url: string) {
  const match = /^\/api\/media\/images\/([0-9a-f-]{36})$/i.exec(url);
  if (match) void fetch(`/api/admin/media/images/${match[1]}`, {
    method: 'DELETE', credentials: 'include',
  }).catch(() => { /* a referenced image cannot be removed; the server protects it */ });
}

export function ImageInput({ label, value, onChange, onBusyChange, multiple = false, id }: {
  label: string; value: string[]; onChange: (url: string, action: 'add' | 'remove') => void;
  onBusyChange?: (busy: boolean) => void; multiple?: boolean; id: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const uploads = useRef(new Set<string>());
  useEffect(() => () => { for (const url of uploads.current) discardUploaded(url); }, []);
  const change = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (!files.length) return;
    setBusy(true); onBusyChange?.(true); setError('');
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        uploads.current.add(url);
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
            if (uploads.current.has(url)) { uploads.current.delete(url); discardUploaded(url); }
          } }}
          aria-label={`إزالة ${label} ${index + 1}`}><Trash2 size={14} /> إزالة</button>
      </div>)}
    </div>}
    <label className="ad-button ad-button-plain ad-image-picker" htmlFor={id}><ImagePlus size={16} />{busy ? 'جارٍ رفع الصور...' : multiple ? 'رفع صور من الجهاز' : 'رفع صورة من الجهاز'}</label>
    <input id={id} type="file" accept={TYPES.join(',')} multiple={multiple} onChange={e => void change(e)}
      disabled={busy} className="ad-visually-hidden" />
    <small>JPG أو PNG أو WebP أو GIF · الحد الأقصى 8 ميغابايت لكل صورة</small>
    {error && <p role="alert" className="ad-form-error">{error}</p>}
  </div>;
}