import { useState, type FormEvent } from 'react';
import { Check, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import { ImageInput } from './ImageInput';
import './pages-editor.css';

export type AdminPage = {
  id: string; slug: string; title: string; titleEn?: string; content: string; contentEn?: string;
  image?: string; published?: boolean; showInNav?: boolean;
};
type Props = { pages: AdminPage[]; onRefresh: () => Promise<void> };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const blank = (): AdminPage => ({
  id: `page-${crypto.randomUUID()}`, slug: '', title: '', titleEn: '', content: '', contentEn: '',
  image: '', published: true, showInNav: false,
});

async function api(path: string, init: RequestInit) {
  const res = await fetch(`/api/admin/items/pages${path}`, {
    credentials: 'include', ...init, headers: { 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `تعذر إكمال الطلب (${res.status})`);
}

export function PagesEditor({ pages, onRefresh }: Props) {
  const [form, setForm] = useState<AdminPage | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [confirmId, setConfirmId] = useState('');

  const open = (page: AdminPage | null) => {
    setError(''); setNotice('');
    setCreating(!page);
    setForm(page ? { ...page } : blank());
  };
  const close = () => {
    if (uploads > 0) return;
    setForm(null);
  };
  const set = <K extends keyof AdminPage>(key: K, value: AdminPage[K]) => setForm(f => f ? { ...f, [key]: value } : f);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form || saving || uploads > 0) return;
    const slug = form.slug.trim();
    if (!SLUG.test(slug)) return setError('الرابط المختصر يجب أن يتكون من أحرف إنجليزية صغيرة وأرقام وشرطات فقط، مثل: our-services.');
    if (pages.some(p => p.slug === slug && p.id !== form.id)) return setError('هذا الرابط المختصر مستخدم في صفحة أخرى.');
    if (!form.title.trim()) return setError('أدخل عنوان الصفحة.');
    if (!form.content.trim()) return setError('أدخل محتوى الصفحة.');
    setSaving(true); setError('');
    try {
      const payload = { ...form, slug, title: form.title.trim(), titleEn: form.titleEn?.trim() || '', contentEn: form.contentEn || '', image: form.image || '', published: form.published !== false, showInNav: !!form.showInNav };
      await api(creating ? '' : `/${encodeURIComponent(form.id)}`, { method: creating ? 'POST' : 'PUT', body: JSON.stringify(payload) });
      await onRefresh();
      setNotice(creating ? 'تمت إضافة الصفحة.' : 'تم تحديث الصفحة.');
      setForm(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذر حفظ الصفحة.'); } finally { setSaving(false); }
  };
  const remove = async (page: AdminPage) => {
    setSaving(true); setNotice(''); setError('');
    try {
      await api(`/${encodeURIComponent(page.id)}`, { method: 'DELETE' });
      await onRefresh();
      setConfirmId('');
      setNotice('تم حذف الصفحة.');
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذر حذف الصفحة.'); } finally { setSaving(false); }
  };

  return <div className="pe-root">
    <div className="pe-head">
      <div><h3>صفحات الموقع</h3><p className="ad-subtitle">صفحات مخصصة تظهر على /pages/الرابط-المختصر</p></div>
      <button type="button" className="ad-button ad-button-primary" onClick={() => open(null)}><Plus size={14} />إضافة صفحة</button>
    </div>
    {notice && <p role="status" className="pe-notice">{notice}</p>}
    {!form && error && <p role="alert" className="ad-form-error">{error}</p>}
    {pages.length === 0 ? <div className="ad-empty"><strong>لا توجد صفحات مخصصة</strong><p>أضف صفحة جديدة لتظهر هنا.</p></div> :
      <ul className="pe-list">{pages.map(p => <li key={p.id} className="pe-item">
        <div className="pe-info">
          <strong>{p.title}</strong>
          <code dir="ltr">/pages/{p.slug}</code>
          <span className="pe-tags"><em>{p.published === false ? 'مسودة' : 'منشورة'}</em>{p.showInNav && <em>في القائمة</em>}</span>
        </div>
        <div className="pe-btns">
          <a className="ad-button ad-button-plain" href={`/pages/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={14} />معاينة</a>
          <button type="button" className="ad-button ad-button-plain" onClick={() => open(p)}><Pencil size={14} />تعديل</button>
          {confirmId === p.id ? <>
            <button type="button" className="ad-button ad-button-primary" disabled={saving} onClick={() => void remove(p)}>تأكيد الحذف</button>
            <button type="button" className="ad-button ad-button-plain" onClick={() => setConfirmId('')}>إلغاء</button>
          </> : <button type="button" className="ad-button ad-button-plain" onClick={() => setConfirmId(p.id)}><Trash2 size={14} />حذف</button>}
        </div>
      </li>)}</ul>}

    {form && <div className="ad-overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
      <div className="ad-drawer" role="dialog" aria-modal="true" aria-label={creating ? 'إضافة صفحة' : 'تعديل صفحة'}>
        <div className="ad-drawer-header"><div><span className="ad-eyebrow">الصفحات</span><h2>{creating ? 'إضافة صفحة جديدة' : 'تعديل الصفحة'}</h2></div>
          <button type="button" className="ad-icon-btn" onClick={close} aria-label="إغلاق"><X /></button></div>
        <form className="ad-form" onSubmit={e => void submit(e)}>
          <div className="ad-form-body">
            <div className="ad-form-section"><h3>المحتوى</h3><div className="ad-field-grid">
              <div className="ad-field full"><label htmlFor="pg-title">عنوان الصفحة <span>*</span></label><input id="pg-title" className="ad-input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
              <div className="ad-field full"><label htmlFor="pg-slug">الرابط المختصر <span>*</span></label>
                <input id="pg-slug" className="ad-input" dir="ltr" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase())} placeholder="our-services" />
                <small dir="ltr">/pages/{form.slug || 'slug'}</small></div>
              <div className="ad-field full"><label htmlFor="pg-content">نص الصفحة <span>*</span></label><textarea id="pg-content" className="ad-input" rows={9} value={form.content} onChange={e => set('content', e.target.value)} /><small>يمكن استخدام HTML كما في المقالات.</small></div>
            </div></div>
            <div className="ad-form-section"><h3>الترجمة الإنجليزية (اختيارية)</h3><div className="ad-field-grid">
              <div className="ad-field full"><label htmlFor="pg-title-en">Page title (English)</label><input id="pg-title-en" className="ad-input" dir="ltr" value={form.titleEn || ''} onChange={e => set('titleEn', e.target.value)} /></div>
              <div className="ad-field full"><label htmlFor="pg-content-en">Page content (English)</label><textarea id="pg-content-en" className="ad-input" dir="ltr" rows={9} value={form.contentEn || ''} onChange={e => set('contentEn', e.target.value)} /></div>
            </div></div>
            <div className="ad-form-section"><h3>الصورة والظهور</h3>
              <ImageInput id="page-image" label="صورة الصفحة" value={form.image ? [form.image] : []} onBusyChange={b => setUploads(n => Math.max(0, n + (b ? 1 : -1)))} onChange={(url, a) => set('image', a === 'add' ? url : '')} />
              <label className="ad-check"><input type="checkbox" checked={form.published !== false} onChange={e => set('published', e.target.checked)} />منشورة على الموقع</label>
              <label className="ad-check"><input type="checkbox" checked={!!form.showInNav} onChange={e => set('showInNav', e.target.checked)} />عرضها في قائمة التنقل</label>
            </div>
            {error && <p className="ad-form-error" role="alert">{error}</p>}
          </div>
          <div className="ad-form-footer">
            <button type="button" className="ad-button ad-button-plain" onClick={close} disabled={uploads > 0}>إلغاء</button>
            <button type="submit" className="ad-button ad-button-primary" disabled={saving || uploads > 0}><Check />{uploads > 0 ? 'جارٍ رفع الصور...' : saving ? 'جارٍ الحفظ...' : 'حفظ الصفحة'}</button>
          </div>
        </form>
      </div>
    </div>}
  </div>;
}

export default PagesEditor;
