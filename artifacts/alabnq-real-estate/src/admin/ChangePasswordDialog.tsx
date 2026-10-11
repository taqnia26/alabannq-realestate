import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Eye, EyeOff, KeyRound, X } from 'lucide-react';
import { changeAdminPassword } from '@workspace/api-client-react';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
};
const fields = [
  { key: 'currentPassword', id: 'current-password', label: 'كلمة المرور الحالية', autoComplete: 'current-password' },
  { key: 'newPassword', id: 'new-password', label: 'كلمة المرور الجديدة', autoComplete: 'new-password' },
  { key: 'confirmation', id: 'confirm-password', label: 'تأكيد كلمة المرور الجديدة', autoComplete: 'new-password' },
] as const;

export default function ChangePasswordDialog({ onClose, onSuccess, returnFocusRef }: Props) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [visible, setVisible] = useState({ currentPassword: false, newPassword: false, confirmation: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  const firstInput = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);
  const sending = useRef(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    mounted.current = true;
    firstInput.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation(); closeRef.current(); return;
      }
      if (event.key !== 'Tab') return;
      const controls = [...(dialog.current?.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled]), [tabindex="0"]') ?? [])]
        .filter(node => node.getClientRects().length > 0);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); dialog.current?.focus(); return; }
      const outside = !dialog.current?.contains(document.activeElement);
      if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', keydown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      mounted.current = false;
      document.removeEventListener('keydown', keydown, true);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [returnFocusRef]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending.current) return;
    setError('');
    if (values.newPassword.length < 12) return setError('كلمة المرور الجديدة يجب ألا تقل عن 12 حرفًا.');
    if (values.newPassword !== values.confirmation) return setError('تأكيد كلمة المرور لا يطابق كلمة المرور الجديدة.');
    sending.current = true; setBusy(true);
    try {
      await changeAdminPassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }, { credentials: 'include' });
      if (mounted.current) setValues({ currentPassword: '', newPassword: '', confirmation: '' });
      // Keep the request alive if Escape closed the dialog: the rotated cookie must still be received.
      onSuccess();
    } catch (failure) {
      if (!mounted.current) return;
      const body = failure && typeof failure === 'object' && 'data' in failure ? failure.data : undefined;
      setError(body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error : 'تعذر تغيير كلمة المرور. حاول مرة أخرى.');
    } finally {
      sending.current = false;
      if (mounted.current) setBusy(false);
    }
  };

  return <div className="ad-overlay" role="presentation" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="change-password-title"
      aria-describedby="change-password-hint" tabIndex={-1} dir="rtl" className="ad-confirm"
      style={{ maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', width: 'min(480px, calc(100% - 30px))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <KeyRound size={24} aria-hidden="true" />
        <button type="button" className="ad-button ad-button-plain" onClick={onClose}
          aria-label="إغلاق تغيير كلمة المرور" data-testid="button-close-change-password"><X size={17} /></button>
      </div>
      <h2 id="change-password-title">تغيير كلمة المرور</h2>
      <p id="change-password-hint">الحد الأدنى 12 حرفًا. بعد التغيير تُلغى الجلسات السابقة وتبقى هذه الجلسة مسجّلة الدخول.</p>
      <form onSubmit={event => void submit(event)} aria-busy={busy}>
        {fields.map(field => <div className="ad-field" key={field.key} style={{ marginBottom: 16 }}>
          <label htmlFor={`input-${field.id}`}>{field.label}</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input ref={field.key === 'currentPassword' ? firstInput : undefined} id={`input-${field.id}`}
              data-testid={`input-${field.id}`} className="ad-input" dir="ltr"
              type={visible[field.key] ? 'text' : 'password'} autoComplete={field.autoComplete}
              maxLength={1024} required disabled={busy} value={values[field.key]}
              aria-invalid={!!error} aria-describedby={error ? 'error-change-password' : 'change-password-hint'}
              style={{ minWidth: 0, flex: 1 }}
              onChange={event => { setValues(previous => ({ ...previous, [field.key]: event.target.value })); setError(''); }} />
            <button type="button" className="ad-button ad-button-plain" aria-controls={`input-${field.id}`}
              aria-label={`${visible[field.key] ? 'إخفاء' : 'إظهار'} ${field.label}`} aria-pressed={visible[field.key]}
              data-testid={`button-toggle-${field.id}`} disabled={busy}
              onClick={() => setVisible(previous => ({ ...previous, [field.key]: !previous[field.key] }))}>
              {visible[field.key] ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>)}
        {error && <div role="alert" id="error-change-password" data-testid="error-change-password" className="ad-form-error">{error}</div>}
        <div className="ad-confirm-actions">
          <button type="submit" className="ad-button ad-button-primary" disabled={busy} data-testid="button-submit-change-password">
            <KeyRound size={16} />{busy ? 'جارٍ التغيير...' : 'حفظ كلمة المرور'}
          </button>
          <button type="button" className="ad-button ad-button-plain" onClick={onClose} data-testid="button-cancel-change-password">إلغاء</button>
        </div>
      </form>
    </div>
  </div>;
}
