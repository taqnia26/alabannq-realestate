import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Activity, ArrowLeft, BarChart3, BookOpen, Building2, Check, ChevronLeft,
  CircleAlert, ExternalLink, FileText, Image, LayoutDashboard, LogOut,
  Megaphone, Moon, MoreHorizontal, Pencil, Plus, RefreshCw, Search,
  Settings2, Sun, Trash2, TrendingUp, X,
} from 'lucide-react';
import type { Property } from '../data/mockProperties';
import type { Article } from '../data/articles';
import { officialProperties } from '../data/mockProperties';
import { articles } from '../data/articles';
import { mergeRecords, contentQueryKey } from '../data/siteContent';
import { ImageInput } from './ImageInput';
import './admin.css';

type Campaign = {
  id: string;
  name: string;
  channel: string;
  utmCampaign: string;
  budget: number;
  status: string;
  startDate: string;
  endDate: string;
  notes: string;
};
type PublishedProperty = Property & { published?: boolean };
type PublishedArticle = Article & { published?: boolean };
type Stats = {
  total: number;
  last7: number;
  today: number;
  daily: { date: string; visits: number }[];
  topPages: { path: string; visits: number }[];
  campaignVisits: { campaign: string; visits: number }[];
};
type AdminState = {
  properties: PublishedProperty[];
  articles: PublishedArticle[];
  campaigns: Campaign[];
  site: Record<string, string>;
  stats: Stats;
  inquiries: { id: number; name: string; phone: string; email: string | null; message: string; read: boolean; createdAt: string }[];
};
type Kind = 'properties' | 'articles' | 'campaigns';
type Section = 'overview' | Kind | 'site' | 'analytics' | 'inquiries';
type Item = PublishedProperty | PublishedArticle | Campaign;
type Notice = { text: string; error?: boolean };

const siteFields = [
  ['home.title', 'عنوان الصفحة الرئيسية', 'العنوان الرئيسي الذي يراه الزائر أولاً'],
  ['home.subtitle', 'وصف الصفحة الرئيسية', 'النص التعريفي أسفل العنوان'],
  ['home.heroImage', 'صورة واجهة الرئيسية', 'رابط صورة الغلاف'],
  ['home.intro', 'مقدمة الرئيسية', ''],
  ['home.commitment', 'التزامنا في الرئيسية', ''],
  ['home.customerService', 'خدمة العملاء في الرئيسية', ''],
  ['home.propertiesHeading', 'عنوان قسم العقارات في الرئيسية', ''],
  ['home.articlesHeading', 'عنوان قسم المقالات في الرئيسية', ''],
  ['about.heading', 'عنوان من نحن', 'عنوان قسم التعريف بالشركة'],
  ['about.intro', 'مقدمة من نحن', 'نبذة مختصرة عن الشركة'],
  ['about.story', 'النص التفصيلي عن الشركة', ''],
  ['about.commitment', 'التزام الشركة', ''],
  ['about.vision', 'رؤية الشركة', ''],
  ['about.mission', 'رسالة الشركة', ''],
  ['about.servicesIntro', 'مقدمة الخدمات', ''],
  ['about.servicesHeading', 'عنوان قسم الخدمات', ''],
  ['about.image', 'صورة من نحن', 'رابط صورة قسم من نحن'],
  ['about.service.marketing', 'خدمة التسويق العقاري', ''],
  ['about.service.auctions', 'خدمة المزادات', ''],
  ['about.service.management', 'خدمة إدارة العقارات', ''],
  ['about.service.facilities', 'خدمة إدارة المرافق', ''],
  ['about.service.legal', 'الخدمات القانونية', ''],
  ['articles.heading', 'عنوان صفحة المقالات', ''],
  ['articles.intro', 'وصف صفحة المقالات', ''],
  ['seo.description', 'الوصف التعريفي لمحركات البحث', ''],
  ['contact.heading', 'عنوان صفحة التواصل', ''],
  ['contact.intro', 'وصف صفحة التواصل', ''],
  ['contact.address', 'العنوان', 'عنوان المكتب المعروض للزوار'],
  ['contact.phone', 'رقم الهاتف', 'رقم التواصل الرئيسي'],
  ['contact.whatsapp', 'رقم واتساب', 'رقم التواصل عبر واتساب'],
  ['footer.about', 'نبذة التذييل', 'النص التعريفي أسفل الموقع'],
  ['footer.image', 'صورة التذييل', 'رابط صورة خلفية التذييل'],
  ['footer.email', 'بريد التواصل الظاهر', ''],
  ['footer.twitter', 'رابط حساب X', ''],
  ['footer.instagram', 'رابط إنستغرام', ''],
  ['footer.linkedin', 'رابط لينكدإن', ''],
] as const;
const sectionNames: Record<Section, string> = {
  overview: 'نظرة عامة', properties: 'العقارات', articles: 'المقالات',
  campaigns: 'الحملات', site: 'محتوى الموقع', analytics: 'التحليلات', inquiries: 'الرسائل',
};
const itemNames: Record<Kind, string> = { properties: 'عقار', articles: 'مقال', campaigns: 'حملة' };
const numberFormat = new Intl.NumberFormat('ar-SA');
const formatNumber = (value: number) => numberFormat.format(value || 0);
const dateLabel = (date: string) => {
  if (!date) return '—';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('ar-SA', { month: 'short', day: 'numeric' }).format(parsed);
};
const newItem = (kind: Kind): Item => {
  const id = `${kind.slice(0, -1)}-${crypto.randomUUID()}`;
  if (kind === 'properties') return {
    id, title: '', neighborhood: '', city: 'مكة المكرمة', type: 'شقق للبيع', purpose: 'sale',
    price: 0, priceLabel: '', area: 0, rooms: 0, bathrooms: 0, coordinates: [21.4225, 39.8262],
    image: '', gallery: [], sourceUrl: '', featured: false, published: true, description: '', amenities: [],
  };
  if (kind === 'articles') return {
    id, title: '', excerpt: '', content: '', category: '', date: new Date().toISOString().slice(0, 10),
    readTime: '3 دقائق قراءة', image: '', author: 'فريق العبنق العقارية', published: true,
  };
  return { id, name: '', channel: '', utmCampaign: '', budget: 0, status: 'draft', startDate: '', endDate: '', notes: '' };
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `تعذر إكمال الطلب (${response.status})`);
  return body as T;
}

function Empty({ title, text, action }: { title: string; text: string; action?: { label: string; onClick: () => void } }) {
  return <div className="ad-empty">
    <FileText size={28} strokeWidth={1.5} />
    <strong>{title}</strong><p>{text}</p>
    {action && <button type="button" className="ad-button ad-button-plain" onClick={action.onClick}><Plus size={14} />{action.label}</button>}
  </div>;
}

function ItemForm({ kind, initial, saving, onClose, onSave }: {
  kind: Kind; initial: Item; saving: boolean; onClose: () => void; onSave: (item: Item) => Promise<void>;
}) {
  const [form, setForm] = useState<Item>(initial);
  const [error, setError] = useState('');
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  const changeUploadState = (busy: boolean) => setUploadsInProgress(count => count + (busy ? 1 : -1));
  const isNew = !('createdAt' in initial) && initial.id.startsWith(`${kind.slice(0, -1)}-`) &&
    !('sourceUrl' in initial && initial.sourceUrl) && !('title' in initial && initial.title) && !('name' in initial && initial.name);
  const value = (key: string): string => {
    const result = (form as unknown as Record<string, unknown>)[key];
    return Array.isArray(result) ? result.join('\n') : String(result ?? '');
  };
  const set = (key: string, next: unknown) => setForm(prev => ({ ...prev, [key]: next }) as Item);
  const field = (key: string, label: string, opts: {
    required?: boolean; type?: string; full?: boolean; multiline?: boolean; placeholder?: string;
    choices?: { value: string; label: string }[]; hint?: string; min?: number;
  } = {}) => <div className={`ad-field ${opts.full ? 'full' : ''}`} key={key}>
    <label htmlFor={`ad-${key}`}>{label} {opts.required && <span>*</span>}</label>
     {opts.choices ? <select id={`ad-${key}`} className="ad-input" dir={key.endsWith('En') ? 'ltr' : undefined} value={value(key)} onChange={e => set(key, e.target.value)} required={opts.required} data-testid={`select-${key}`}>
      {opts.choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
     </select> : opts.multiline ? <textarea id={`ad-${key}`} className="ad-input" dir={key.endsWith('En') ? 'ltr' : undefined} value={value(key)} onChange={e => set(key, e.target.value)} required={opts.required} placeholder={opts.placeholder} rows={key === 'content' || key === 'contentEn' ? 9 : 3} data-testid={`textarea-${key}`} /> :
       <input id={`ad-${key}`} className="ad-input" dir={key.endsWith('En') ? 'ltr' : undefined} type={opts.type || 'text'} min={opts.min} step={opts.type === 'number' ? 'any' : undefined} value={value(key)} onChange={e => set(key, opts.type === 'number' ? Number(e.target.value) : e.target.value)} required={opts.required} placeholder={opts.placeholder} data-testid={`input-${key}`} />}
    {opts.hint && <small>{opts.hint}</small>}
  </div>;
  const checkbox = (key: string, label: string) => <label className="ad-check" key={key}>
    <input type="checkbox" checked={(form as unknown as Record<string, unknown>)[key] !== false && Boolean((form as unknown as Record<string, unknown>)[key] ?? (key === 'published'))} onChange={e => set(key, e.target.checked)} data-testid={`checkbox-${key}`} />
    {label}
  </label>;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    let payload: Item = form;
    if (kind === 'properties') {
      const property = form as PublishedProperty;
      if (!property.title.trim() || !property.neighborhood.trim()) return setError('أدخل عنوان العقار والحي.');
      if (property.published !== false && ![property.titleEn, property.neighborhoodEn, property.cityEn, property.typeEn, property.descriptionEn, property.priceLabelEn].every(text => text?.trim())) return setError('أكمل عنوان العقار والحي والمدينة والنوع والوصف والسعر بالإنجليزية قبل النشر، أو احفظه كمسودة.');
      if (property.published !== false && property.amenities.length && !property.amenitiesEn?.length && !value('amenitiesEn').trim()) return setError('أكمل المميزات بالإنجليزية قبل النشر، أو احفظ العقار كمسودة.');
      if (property.price < 0 || property.area < 0 || property.rooms < 0 || property.bathrooms < 0) return setError('القيم الرقمية يجب ألا تكون سالبة.');
      const lat = Number(value('latitude')), lng = Number(value('longitude'));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return setError('أدخل إحداثيات صحيحة للموقع.');
       payload = { ...property, coordinates: [lat, lng], amenities: value('amenities').split('\n').map(s => s.trim()).filter(Boolean), amenitiesEn: value('amenitiesEn').split('\n').map(s => s.trim()).filter(Boolean), gallery: value('gallery').split('\n').map(s => s.trim()).filter(Boolean), priceLabel: property.priceLabel.trim() || `${formatNumber(property.price)} ر.س` } as Item;
    }
    if (kind === 'articles') {
      const article = form as PublishedArticle;
      if (!article.title.trim() || !article.content.trim() || !article.excerpt.trim()) return setError('العنوان والملخص والمحتوى حقول مطلوبة.');
      if (article.published !== false && ![article.titleEn, article.excerptEn, article.contentEn, article.categoryEn, article.authorEn, article.readTimeEn].every(text => text?.trim())) return setError('أكمل العنوان والملخص والمحتوى والتصنيف والكاتب ووقت القراءة بالإنجليزية قبل النشر، أو احفظ المقال كمسودة.');
    }
    if (kind === 'campaigns') {
      const campaign = form as Campaign;
      if (!campaign.name.trim() || !campaign.utmCampaign.trim()) return setError('اسم الحملة ومعرّف التتبع مطلوبان.');
      if (campaign.budget < 0) return setError('الميزانية لا يمكن أن تكون سالبة.');
      if (campaign.startDate && campaign.endDate && campaign.endDate < campaign.startDate) return setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية.');
    }
    try { await onSave(payload); } catch (err) { setError(err instanceof Error ? err.message : 'تعذر حفظ التغييرات.'); }
  };
  return <div className="ad-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} role="presentation">
    <div className="ad-drawer" role="dialog" aria-modal="true" aria-label={`${isNew ? 'إضافة' : 'تعديل'} ${itemNames[kind]}`}>
      <div className="ad-drawer-header"><div><span className="ad-eyebrow">{sectionNames[kind]}</span><h2>{isNew ? `إضافة ${itemNames[kind]} جديد` : `تعديل ${itemNames[kind]}`}</h2></div><button type="button" className="ad-icon-btn" onClick={onClose} aria-label="إغلاق" data-testid="button-close-editor"><X /></button></div>
      <form className="ad-form" onSubmit={submit}>
        <div className="ad-form-body">
          {kind === 'properties' && <>
            <div className="ad-form-section"><h3>التفاصيل الأساسية</h3><div className="ad-field-grid">
              {field('title', 'عنوان العرض', { required: true, full: true, placeholder: 'شقة للبيع في حي العوالي' })}
              {field('neighborhood', 'الحي', { required: true })}
              {field('type', 'نوع العقار', { choices: ['شقق للبيع', 'أراضي للبيع', 'عمائر للبيع', 'شقق للإيجار'].map(v => ({ value: v, label: v })) })}
              {field('purpose', 'الغرض', { choices: [{ value: 'sale', label: 'بيع' }, { value: 'rent', label: 'إيجار' }] })}
              {field('price', 'السعر (ر.س)', { type: 'number', min: 0, required: true })}
              {field('priceLabel', 'صيغة السعر المعروضة', { placeholder: 'يُنشأ تلقائياً إن تُرك فارغاً' })}
              {field('area', 'المساحة (م²)', { type: 'number', min: 0 })}
              {field('rooms', 'الغرف', { type: 'number', min: 0 })}
              {field('bathrooms', 'دورات المياه', { type: 'number', min: 0 })}
              {field('description', 'وصف العقار', { full: true, multiline: true })}
              {field('amenities', 'المميزات', { full: true, multiline: true, hint: 'ميزة واحدة في كل سطر' })}
            </div></div>
            <div className="ad-form-section"><h3>الترجمة الإنجليزية (اختيارية)</h3><p className="ad-subtitle">يُرجى إكمال الترجمة الإنجليزية لمساعدة زوار الموقع.</p><div className="ad-field-grid">
              {field('titleEn', 'Property title (English)', { full: true, placeholder: 'Apartment for sale in Al Awali' })}
              {field('neighborhoodEn', 'Neighborhood (English)')}
              {field('cityEn', 'City (English)')}
              {field('typeEn', 'Property type (English)')}
              {field('priceLabelEn', 'Displayed price label (English)', { placeholder: 'Optional custom price text' })}
              {field('descriptionEn', 'Property description (English)', { full: true, multiline: true })}
              {field('amenitiesEn', 'Amenities (English)', { full: true, multiline: true, hint: 'One amenity per line' })}
            </div></div>
            <div className="ad-form-section"><h3>الصور والموقع</h3><div className="ad-field-grid">
              <div className="ad-field full">{field('image', 'رابط الصورة الرئيسية', { type: 'text', placeholder: 'https://... أو ارفع صورة أدناه' })}
                <ImageInput id="property-image" label="الصورة الرئيسية" value={value('image') ? [value('image')] : []} onBusyChange={changeUploadState} onChange={(url, action) => set('image', action === 'add' ? url : '')} /></div>
              <div className="ad-field full">{field('gallery', 'روابط معرض الصور', { multiline: true, hint: 'رابط واحد في كل سطر' })}
                <ImageInput id="property-gallery" label="صورة المعرض" multiple value={value('gallery').split('\n').map(x => x.trim()).filter(Boolean)}
                  onBusyChange={changeUploadState} onChange={(url, action) => setForm(prev => {
                    const gallery = (prev as PublishedProperty).gallery;
                    const urls = (Array.isArray(gallery) ? gallery.join('\n') : String(gallery ?? '')).split('\n').map(x => x.trim()).filter(Boolean);
                    return { ...prev, gallery: action === 'add' ? [...urls, url] : urls.filter(x => x !== url) };
                  })} /></div>
              {field('sourceUrl', 'رابط الإعلان الأصلي', { full: true, type: 'url', placeholder: 'https://...' })}
              {field('latitude', 'خط العرض', { type: 'number', hint: 'مثال: 21.4225' })}
              {field('longitude', 'خط الطول', { type: 'number', hint: 'مثال: 39.8262' })}
            </div></div>
            <div className="ad-form-section"><h3>الظهور</h3>{checkbox('featured', 'عرضه ضمن العقارات المميزة')}{checkbox('published', 'منشور على الموقع')}</div>
          </>}
          {kind === 'articles' && <>
            <div className="ad-form-section"><h3>محتوى المقال</h3><div className="ad-field-grid">
              {field('title', 'عنوان المقال', { required: true, full: true })}
              {field('category', 'التصنيف', { required: true })}
              {field('author', 'الكاتب')}
              {field('excerpt', 'الملخص', { required: true, full: true, multiline: true })}
              {field('content', 'نص المقال', { required: true, full: true, multiline: true, hint: 'يمكن كتابة المحتوى بتنسيق HTML كما في المقالات الحالية.' })}
            </div></div>
            <div className="ad-form-section"><h3>الترجمة الإنجليزية (اختيارية)</h3><p className="ad-subtitle">يُرجى إكمال الترجمة الإنجليزية لمساعدة زوار الموقع.</p><div className="ad-field-grid">
              {field('titleEn', 'Article title (English)', { full: true })}
              {field('categoryEn', 'Category (English)')}
              {field('authorEn', 'Author (English)')}
              {field('excerptEn', 'Excerpt (English)', { full: true, multiline: true })}
              {field('contentEn', 'Article content (English)', { full: true, multiline: true, hint: 'HTML formatting is supported, as in the Arabic article.' })}
              {field('readTimeEn', 'Reading time (English)')}
            </div></div>
            <div className="ad-form-section"><h3>بيانات النشر</h3><div className="ad-field-grid">
              <div className="ad-field full">{field('image', 'رابط صورة المقال', { type: 'text', placeholder: 'https://... أو ارفع صورة أدناه' })}
                <ImageInput id="article-image" label="صورة المقال" value={value('image') ? [value('image')] : []} onBusyChange={changeUploadState} onChange={(url, action) => set('image', action === 'add' ? url : '')} /></div>
              {field('date', 'تاريخ النشر', { type: 'date' })}
              {field('readTime', 'وقت القراءة')}
            </div>{checkbox('published', 'منشور على الموقع')}</div>
          </>}
          {kind === 'campaigns' && <>
            <div className="ad-form-section"><h3>تفاصيل الحملة</h3><div className="ad-field-grid">
              {field('name', 'اسم الحملة', { required: true, full: true })}
              {field('channel', 'القناة', { placeholder: 'مثل: انستغرام، جوجل' })}
              {field('utmCampaign', 'معرّف UTM', { required: true, placeholder: 'summer_makkah', hint: 'يُستخدم لتمييز زيارات الحملة' })}
              {field('budget', 'الميزانية (ر.س)', { type: 'number', min: 0 })}
              {field('status', 'الحالة', { choices: [{ value: 'draft', label: 'مسودة' }, { value: 'active', label: 'نشطة' }, { value: 'paused', label: 'متوقفة مؤقتاً' }, { value: 'completed', label: 'مكتملة' }] })}
              {field('startDate', 'تاريخ البداية', { type: 'date' })}
              {field('endDate', 'تاريخ النهاية', { type: 'date' })}
              {field('notes', 'ملاحظات', { multiline: true, full: true })}
            </div></div>
          </>}
          {error && <p className="ad-form-error" role="alert" data-testid="status-form-error">{error}</p>}
        </div>
        <div className="ad-form-footer"><button type="button" className="ad-button ad-button-plain" onClick={onClose} data-testid="button-cancel-editor">إلغاء</button><button type="submit" className="ad-button ad-button-primary" disabled={saving || uploadsInProgress > 0} data-testid="button-save-item"><Check />{uploadsInProgress > 0 ? 'جارٍ رفع الصور...' : saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</button></div>
      </form>
    </div>
  </div>;
}

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('alabnq-admin-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; }
  });
  const [section, setSection] = useState<Section>('overview');
  const [data, setData] = useState<AdminState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<{ kind: Kind; item: Item; creating: boolean } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: Kind; item: Item } | null>(null);
  const [saving, setSaving] = useState(false);
  const [siteDraft, setSiteDraft] = useState<Record<string, string>>({});
  const [siteKey, setSiteKey] = useState('');
  const [siteValue, setSiteValue] = useState('');
  const [siteValueEn, setSiteValueEn] = useState('');
  const [savingKey, setSavingKey] = useState('');
  const [siteUploads, setSiteUploads] = useState<string[]>([]);

  useEffect(() => { try { localStorage.setItem('alabnq-admin-theme', theme); } catch { /* storage unavailable */ } }, [theme]);
  useEffect(() => { if (!notice) return; const timeout = window.setTimeout(() => setNotice(null), 5000); return () => clearTimeout(timeout); }, [notice]);
  const reload = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    setLoadError('');
    try {
      const response = await request<AdminState>('/state');
      setData({
        ...response,
        properties: mergeRecords(officialProperties, response.properties).filter(item => !item.deleted),
        articles: mergeRecords(articles, response.articles).filter(item => !item.deleted),
      });
      setSiteDraft(response.site || {});
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'تعذر تحميل البيانات.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(true); }, [reload]);
  const showError = (err: unknown) => setNotice({ text: err instanceof Error ? err.message : 'حدث خطأ غير متوقع.', error: true });
  const saveItem = async (item: Item) => {
    if (!editor) return;
    setSaving(true);
    try {
      await request(`/items/${editor.kind}${editor.creating ? '' : `/${encodeURIComponent(item.id)}`}`, {
        method: editor.creating ? 'POST' : 'PUT', body: JSON.stringify(item),
      });
      await reload();
      await queryClient.invalidateQueries({ queryKey: contentQueryKey });
      setEditor(null);
      setNotice({ text: `تم ${editor.creating ? 'إضافة' : 'تحديث'} ${itemNames[editor.kind]} بنجاح.` });
    } finally { setSaving(false); }
  };
  const deleteItem = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await request(`/items/${deleting.kind}/${encodeURIComponent(deleting.item.id)}`, { method: 'DELETE' });
      await reload();
      await queryClient.invalidateQueries({ queryKey: contentQueryKey });
      setNotice({ text: `تم حذف ${itemNames[deleting.kind]} بنجاح.` });
      setDeleting(null);
    } catch (err) { showError(err); } finally { setSaving(false); }
  };
  const saveSite = async (key: string, value: string): Promise<boolean> => {
    if (!key.trim()) { setNotice({ text: 'أدخل مفتاح المحتوى أولاً.', error: true }); return false; }
    setSavingKey(key);
    try {
      await request('/site', { method: 'PUT', body: JSON.stringify({ key: key.trim(), value }) });
      await queryClient.invalidateQueries({ queryKey: contentQueryKey });
      setData(current => current ? { ...current, site: { ...current.site, [key.trim()]: value } } : current);
      setSiteDraft(current => ({ ...current, [key.trim()]: value }));
      setNotice({ text: 'تم حفظ محتوى الموقع بنجاح.' });
      return true;
    } catch (err) { showError(err); return false; } finally { setSavingKey(''); }
  };
  const saveNewSiteKey = async () => {
    const key = siteKey.trim();
    if (!key) { setNotice({ text: 'أدخل مفتاح المحتوى أولاً.', error: true }); return; }
    try {
      if (!await saveSite(key, siteValue)) return;
      if (siteValueEn.trim() && !await saveSite(`${key}.en`, siteValueEn)) return;
      setSiteKey('');
      setSiteValue('');
      setSiteValueEn('');
    } catch { /* Keep entered values if an unexpected save error occurs. */ }
  };
  const changeSection = (next: Section) => { setSection(next); setSearch(''); };
  const openNew = (kind: Kind) => setEditor({ kind, item: newItem(kind), creating: true });
  const filtered = useMemo(() => {
    if (!data || !['properties', 'articles', 'campaigns'].includes(section)) return [];
    const items = data[section as Kind] as Item[];
    const term = search.trim().toLocaleLowerCase('ar');
    return term ? items.filter(item => JSON.stringify(item).toLocaleLowerCase('ar').includes(term)) : items;
  }, [data, section, search]);
  const nav = [
    { id: 'overview' as Section, label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'properties' as Section, label: 'العقارات', icon: Building2 },
    { id: 'articles' as Section, label: 'المقالات', icon: BookOpen },
    { id: 'campaigns' as Section, label: 'الحملات', icon: Megaphone },
    { id: 'inquiries' as Section, label: 'الرسائل', icon: FileText },
    { id: 'site' as Section, label: 'الموقع', icon: Settings2 },
    { id: 'analytics' as Section, label: 'التحليلات', icon: BarChart3 },
  ];
  const stats = data?.stats;
  const chart = (height = 260) => <div className="ad-chart" style={{ height }}>
    {stats?.daily?.length ? <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={stats.daily} margin={{ top: 14, right: 5, left: -19, bottom: 0 }}>
        <defs><linearGradient id="adChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ba9954" stopOpacity={0.26} /><stop offset="95%" stopColor="#ba9954" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid vertical={false} strokeDasharray="3 5" />
        <XAxis dataKey="date" tickFormatter={dateLabel} tick={{ fontSize: 10, fill: theme === 'dark' ? '#aaa99c' : '#777a71', fontFamily: 'Cairo' }} tickLine={false} axisLine={false} dy={8} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: theme === 'dark' ? '#aaa99c' : '#777a71' }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: theme === 'dark' ? '#222622' : '#fbfaf6', border: `1px solid ${theme === 'dark' ? '#393d36' : '#e2dfd5'}`, borderRadius: 7, color: theme === 'dark' ? '#eeeae0' : '#252722', fontFamily: 'Cairo', fontSize: 11 }} labelFormatter={label => dateLabel(String(label))} formatter={value => [formatNumber(Number(value)), 'زيارة']} />
        <Area type="monotone" dataKey="visits" stroke="#b39554" strokeWidth={2.5} fill="url(#adChartFill)" activeDot={{ r: 5, fill: '#b39554', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer> : <Empty title="لا توجد زيارات بعد" text="سيظهر منحنى الزيارات هنا بمجرد بدء تسجيل الزيارات." />}
  </div>;
  const list = (entries: { label: string; value: number }[], empty: string) => <div className="ad-stat-list">
    {entries.length ? entries.map((entry, index) => <div className="ad-stat-row" key={`${entry.label}-${index}`}><span title={entry.label} data-testid={`text-stat-label-${index}`}>{entry.label}</span><strong data-testid={`text-stat-value-${index}`}>{formatNumber(entry.value)}</strong></div>) : <Empty title={empty} text="ستظهر البيانات هنا تلقائياً عند توفرها." />}
  </div>;
  const itemTitle = (item: Item) => 'name' in item ? item.name : item.title;
  const status = (item: Item) => {
    if ('status' in item) {
      const labels: Record<string, string> = { draft: 'مسودة', active: 'نشطة', paused: 'متوقفة', completed: 'مكتملة' };
      return <span className={`ad-badge ${item.status === 'active' ? 'success' : item.status === 'draft' ? 'muted' : ''}`}>{labels[item.status] || item.status}</span>;
    }
    return <span className={`ad-badge ${item.published === false ? 'muted' : 'success'}`}>{item.published === false ? 'غير منشور' : 'منشور'}</span>;
  };
  const itemTable = (kind: Kind, items: Item[], compact = false) => <div className="ad-card ad-table-wrap">
    {items.length ? <table className="ad-table"><thead><tr>
      <th>{kind === 'campaigns' ? 'الحملة' : kind === 'properties' ? 'العقار' : 'المقال'}</th>
      <th>{kind === 'properties' ? 'السعر' : kind === 'articles' ? 'التصنيف' : 'القناة'}</th>
      <th>{kind === 'properties' ? 'الحي' : kind === 'articles' ? 'التاريخ' : 'الميزانية'}</th>
      <th>الحالة</th><th>إجراءات</th>
    </tr></thead><tbody>{items.map(item => <tr key={item.id} data-testid={`row-${kind}-${item.id}`}>
      <td><div className="ad-item-cell">
        {kind !== 'campaigns' && ('image' in item) && item.image ? <img src={item.image} alt="" loading="lazy" /> : <span className="ad-kpi-icon">{kind === 'campaigns' ? <Megaphone /> : <Image />}</span>}
        <div><strong title={itemTitle(item)}>{itemTitle(item) || 'بدون عنوان'}</strong><small>{kind === 'properties' ? ('type' in item ? item.type : '') : kind === 'articles' ? ('author' in item ? item.author : '') : ('utmCampaign' in item ? item.utmCampaign : '')}</small></div>
      </div></td>
      <td>{kind === 'properties' ? ('price' in item ? `${formatNumber(item.price)} ر.س` : '') : kind === 'articles' ? ('category' in item ? item.category : '') : ('channel' in item ? item.channel : '')}</td>
      <td>{kind === 'properties' ? ('neighborhood' in item ? item.neighborhood : '') : kind === 'articles' ? ('date' in item ? dateLabel(item.date) : '') : ('budget' in item ? `${formatNumber(item.budget)} ر.س` : '')}</td>
      <td>{status(item)}</td>
      <td><div className="ad-row-actions">
        {kind === 'campaigns' && 'utmCampaign' in item && <button type="button" aria-label={`نسخ رابط حملة ${itemTitle(item)}`} title="نسخ رابط الحملة" onClick={() => {
          const url = new URL(window.location.origin + '/');
          url.searchParams.set('utm_campaign', item.utmCampaign);
          if (item.channel) url.searchParams.set('utm_source', item.channel);
          void navigator.clipboard.writeText(url.toString()).then(() => setNotice({ text: 'تم نسخ رابط تتبع الحملة.' })).catch(() => setNotice({ text: 'تعذر نسخ الرابط. تحقق من أذونات الحافظة.', error: true }));
        }}><ExternalLink size={15} /></button>}
        <button type="button" aria-label={`تعديل ${itemTitle(item)}`} title="تعديل" onClick={() => setEditor({ kind, item, creating: false })} data-testid={`button-edit-${kind}-${item.id}`}><Pencil size={15} /></button>
        <button type="button" aria-label={`حذف ${itemTitle(item)}`} title="حذف" onClick={() => setDeleting({ kind, item })} data-testid={`button-delete-${kind}-${item.id}`}><Trash2 size={15} /></button>
      </div></td>
    </tr>)}</tbody></table> : <Empty title={compact ? 'لا توجد عناصر بعد' : search ? 'لا توجد نتائج مطابقة' : `لا توجد ${sectionNames[kind]} بعد`} text={search ? 'جرّب البحث بكلمة أخرى.' : `ابدأ بإضافة ${itemNames[kind]} جديد لإدارته من هنا.`} action={!compact && !search ? { label: `إضافة ${itemNames[kind]}`, onClick: () => openNew(kind) } : undefined} />}
  </div>;
  const siteKeys = [...new Set([...siteFields.map(entry => entry[0]), ...Object.keys(data?.site || {}).map(key => key.endsWith('.en') ? key.slice(0, -3) : key)])];
  const isLanguageNeutralSiteKey = (key: string) => {
    const normalized = key.toLowerCase();
    return normalized.includes('image') || normalized.includes('link') || normalized.includes('url') ||
      normalized.includes('phone') || normalized.includes('whatsapp') || normalized.includes('email') ||
      normalized.includes('twitter') || normalized.includes('instagram') || normalized.includes('linkedin');
  };

  return <div className="admin-root" dir="rtl" data-theme={theme}>
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <div className="ad-brand"><span className="ad-brand-mark"><img src="/brand/alabnq-logo.png" alt="" /></span><div><strong>العبنق العقارية</strong><small>OWNER CONSOLE</small></div></div>
        <div className="ad-nav-label">مساحة الإدارة</div>
        <nav className="ad-nav" aria-label="أقسام لوحة الإدارة">
          {nav.map(entry => <button key={entry.id} type="button" className={section === entry.id ? 'active' : ''} onClick={() => changeSection(entry.id)} data-testid={`button-nav-${entry.id}`} aria-current={section === entry.id ? 'page' : undefined}><entry.icon />{entry.label}{data && ['properties', 'articles', 'campaigns'].includes(entry.id) && <span>{data[entry.id as Kind].length}</span>}</button>)}
        </nav>
        <div className="ad-sidebar-bottom"><button type="button" onClick={onLogout} data-testid="button-logout"><LogOut size={17} />تسجيل الخروج</button><div className="ad-sidebar-note">العبنق العقارية · لوحة إدارة الموقع</div></div>
      </aside>
      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-breadcrumb"><span>لوحة التحكم</span><ChevronLeft size={13} /><strong>{sectionNames[section]}</strong></div>
          <div className="ad-top-actions"><span className="ad-live">البيانات المباشرة</span><button type="button" className="ad-icon-btn" onClick={() => void reload(true)} title="تحديث البيانات" aria-label="تحديث البيانات" data-testid="button-refresh"><RefreshCw /></button><button type="button" className="ad-icon-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'} aria-label="تبديل السمة" data-testid="button-theme">{theme === 'light' ? <Moon /> : <Sun />}</button><span className="ad-avatar" aria-label="المدير">ع</span></div>
        </header>
        <div className="ad-content">
          <div className="ad-heading"><div><span className="ad-eyebrow">العبنق / الإدارة</span><h1>{section === 'overview' ? 'صباح الخير، أهلاً بك.' : sectionNames[section]}</h1><p className="ad-subtitle">{section === 'overview' ? 'مساحتك لمتابعة أعمالك واتخاذ القرار بثقة.' : section === 'analytics' ? 'صورة واضحة لأداء موقعك ومصادر الزيارات.' : section === 'site' ? 'حدّث النصوص والصور التي تظهر لزوار موقعك.' : `إدارة ${sectionNames[section]} المعروضة على موقعك.`}</p></div>
            {(['properties', 'articles', 'campaigns'] as Section[]).includes(section) && <button className="ad-button ad-button-primary" type="button" onClick={() => openNew(section as Kind)} data-testid={`button-add-${section}`}><Plus />إضافة {itemNames[section as Kind]}</button>}
          </div>
          {loading ? <div className="ad-loading" aria-label="جارٍ تحميل لوحة التحكم"><div className="ad-skeleton" /><div className="ad-kpis"><div className="ad-skeleton" /><div className="ad-skeleton" /><div className="ad-skeleton" /><div className="ad-skeleton" /></div><div className="ad-skeleton" style={{ height: 280 }} /></div> :
            loadError && !data ? <div className="ad-card ad-error-box"><CircleAlert size={31} /><h2>تعذر الوصول إلى بيانات اللوحة</h2><p role="alert">{loadError}</p><button type="button" className="ad-button ad-button-primary" onClick={() => void reload(true)} data-testid="button-retry"><RefreshCw />إعادة المحاولة</button></div> :
            data && <>
              {loadError && <div className="ad-card ad-error-box" style={{ padding: 20, marginBottom: 18 }}><p role="alert">تعذر تحديث البيانات: {loadError}</p><button type="button" className="ad-button ad-button-plain" onClick={() => void reload()} data-testid="button-retry-refresh">إعادة المحاولة</button></div>}
              {section === 'overview' && <>
                <div className="ad-dashboard-hero"><div><span className="ad-eyebrow">مركز القيادة</span><h2>كل ما يهم عملك، في مكان واحد.</h2><p>تابع الزيارات، وأدر عروضك، وانشر قصصك العقارية.</p></div><div className="ad-hero-date">{new Intl.DateTimeFormat('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</div></div>
                <div className="ad-kpis">
                  {[{ label: 'إجمالي الزيارات', value: stats?.total || 0, note: 'منذ بدء التتبع', icon: Activity }, { label: 'آخر ٧ أيام', value: stats?.last7 || 0, note: 'زيارة في الأسبوع الحالي', icon: TrendingUp }, { label: 'العقارات', value: data.properties.length, note: 'عرض عقاري في الموقع', icon: Building2 }, { label: 'المقالات', value: data.articles.length, note: 'مقال منشور أو مسودة', icon: BookOpen }].map(kpi => <div className="ad-card ad-kpi" key={kpi.label}><div className="ad-kpi-top"><span>{kpi.label}</span><span className="ad-kpi-icon"><kpi.icon /></span></div><strong data-testid={`text-kpi-${kpi.label}`}>{formatNumber(kpi.value)}</strong><small>{kpi.note}</small></div>)}
                </div>
                <div className="ad-grid"><section className="ad-card"><div className="ad-card-head"><div><h2>حركة الزيارات</h2><p>اتجاه الزيارات حسب الأيام</p></div><button type="button" className="ad-text-action" onClick={() => changeSection('analytics')} data-testid="button-all-analytics">كل التحليلات <ArrowLeft size={13} /></button></div>{chart()}</section><section className="ad-card"><div className="ad-card-head"><div><h2>الصفحات الأكثر زيارة</h2><p>ما الذي يجذب اهتمام الزوار؟</p></div><MoreHorizontal size={17} color="var(--ad-muted)" /></div>{list((stats?.topPages || []).slice(0, 5).map(x => ({ label: x.path, value: x.visits })), 'لا توجد صفحات مسجلة')}</section></div>
                <section className="ad-section-gap"><div className="ad-card-head" style={{ paddingRight: 0, paddingLeft: 0 }}><div><h2>أحدث العقارات</h2><p>نظرة سريعة على عروضك العقارية</p></div><button type="button" className="ad-text-action" onClick={() => changeSection('properties')} data-testid="button-all-properties">إدارة العقارات <ArrowLeft size={13} /></button></div>{itemTable('properties', data.properties.slice(0, 4), true)}</section>
              </>}
              {(['properties', 'articles', 'campaigns'] as Section[]).includes(section) && <>
                <div className="ad-toolbar"><label className="ad-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`ابحث في ${sectionNames[section]}...`} aria-label={`ابحث في ${sectionNames[section]}`} data-testid="input-search" /></label><span className="ad-count">{formatNumber(filtered.length)} {sectionNames[section]}</span></div>
                {itemTable(section as Kind, filtered)}
              </>}
              {section === 'analytics' && <>
                <div className="ad-kpis">
                  {[{ label: 'إجمالي الزيارات', value: stats?.total || 0, note: 'جميع الزيارات المسجلة', icon: Activity }, { label: 'آخر ٧ أيام', value: stats?.last7 || 0, note: 'خلال الأسبوع الماضي', icon: TrendingUp }, { label: 'زيارات اليوم', value: stats?.today || 0, note: 'منذ بداية اليوم', icon: BarChart3 }, { label: 'حملات التتبع', value: stats?.campaignVisits?.length || 0, note: 'حملة جلبت زيارات', icon: Megaphone }].map(kpi => <div className="ad-card ad-kpi" key={kpi.label}><div className="ad-kpi-top"><span>{kpi.label}</span><span className="ad-kpi-icon"><kpi.icon /></span></div><strong data-testid={`text-analytics-${kpi.label}`}>{formatNumber(kpi.value)}</strong><small>{kpi.note}</small></div>)}
                </div>
                <section className="ad-card" style={{ marginBottom: 18 }}><div className="ad-card-head"><div><h2>الزيارات عبر الزمن</h2><p>بيانات حقيقية من حركة الموقع اليومية</p></div><Activity size={17} color="var(--ad-gold)" /></div>{chart(330)}</section>
                <div className="ad-grid"><section className="ad-card"><div className="ad-card-head"><div><h2>الصفحات الأكثر زيارة</h2><p>مرتبّة حسب عدد الزيارات</p></div><ExternalLink size={16} color="var(--ad-muted)" /></div>{list((stats?.topPages || []).map(x => ({ label: x.path, value: x.visits })), 'لا توجد صفحات مسجلة')}</section><section className="ad-card"><div className="ad-card-head"><div><h2>مصادر الحملات</h2><p>الزيارات بحسب معرّف الحملة</p></div><Megaphone size={16} color="var(--ad-muted)" /></div>{list((stats?.campaignVisits || []).map(x => ({ label: x.campaign, value: x.visits })), 'لا توجد زيارات حملات')}</section></div>
              </>}
              {section === 'inquiries' && <section className="ad-card" style={{ padding: 24 }}>
                <div className="ad-card-head"><div><h2>رسائل الزوار</h2><p>الرسائل المستلمة من نموذج التواصل، محفوظة في قاعدة البيانات.</p></div></div>
                {data.inquiries?.length ? <div style={{ display: 'grid', gap: 14 }}>
                  {data.inquiries.map(item => <article key={item.id} className="ad-card" style={{ padding: 20, background: 'var(--ad-panel-alt)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <strong>{item.name} {!item.read && <span className="ad-badge success">جديدة</span>}</strong>
                      <small>{new Date(item.createdAt).toLocaleString('ar-SA')}</small>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', margin: '12px 0' }}>{item.message}</p>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                      <a dir="ltr" href={`tel:${item.phone.replace(/[^\d+]/g, '')}`}>{item.phone}</a>
                      {item.email && <a href={`mailto:${item.email}`}>{item.email}</a>}
                      {!item.read && <button type="button" className="ad-button ad-button-plain" onClick={() => void request(`/inquiries/${item.id}/read`, { method: 'PATCH' }).then(() => reload()).catch(showError)}>تحديد كمقروءة</button>}
                    </div>
                  </article>)}
                </div> : <Empty title="لا توجد رسائل بعد" text="تظهر هنا الرسائل التي يرسلها الزوار عبر صفحة التواصل." />}
              </section>}
              {section === 'site' && <>
                <div className="ad-dashboard-hero"><div><span className="ad-eyebrow">إدارة المحتوى</span><h2>موقعك، بصوتك.</h2><p>عدّل النصوص والروابط مباشرة، ثم احفظ كل حقل على حدة.</p><p className="ad-site-shared-note">الصور والوسائط والروابط وأرقام الهاتف مشتركة بين اللغتين.</p></div></div>
                <div className="ad-site-grid">{siteKeys.map(key => {
                  const detail = siteFields.find(entry => entry[0] === key);
                  const value = siteDraft[key] ?? '';
                  const englishValue = siteDraft[`${key}.en`] ?? '';
                  const imageKey = key.toLowerCase().includes('image');
                  const neutral = isLanguageNeutralSiteKey(key);
                  return <div className="ad-card ad-site-card" key={key}><label htmlFor={`site-${key}`}>{detail?.[1] || key}</label><div className="ad-site-key">{detail?.[2] || key}</div>
                    {neutral ? <>
                      <label htmlFor={`site-${key}`}>{imageKey ? 'رابط / صورة (مشترك بين اللغتين)' : 'قيمة مشتركة بين اللغتين'}</label>
                      {imageKey || isLanguageNeutralSiteKey(key) ? <input id={`site-${key}`} className="ad-input" type="text" dir={imageKey || /link|url|email|twitter|instagram|linkedin/i.test(key) ? 'ltr' : 'auto'} value={value} onChange={e => setSiteDraft(d => ({ ...d, [key]: e.target.value }))} placeholder={imageKey ? 'https://...' : 'اكتب المحتوى هنا'} data-testid={`input-site-${key}`} /> : <textarea id={`site-${key}`} className="ad-input" value={value} onChange={e => setSiteDraft(d => ({ ...d, [key]: e.target.value }))} placeholder="اكتب المحتوى هنا" data-testid={`textarea-site-${key}`} />}
                    </> : <>
                      <div className="ad-site-language-field"><label htmlFor={`site-${key}`}>العربية</label><textarea id={`site-${key}`} className="ad-input" value={value} onChange={e => setSiteDraft(d => ({ ...d, [key]: e.target.value }))} placeholder="اكتب النص بالعربية" data-testid={`textarea-site-${key}`} /><button type="button" className="ad-button ad-button-plain" disabled={savingKey === key || value === (data.site?.[key] ?? '')} onClick={() => void saveSite(key, value)} data-testid={`button-save-site-${key}`}><Check />{savingKey === key ? 'جارٍ الحفظ...' : 'حفظ العربية'}</button></div>
                      <div className="ad-site-language-field" dir="ltr"><label htmlFor={`site-${key}-en`}>English</label><textarea id={`site-${key}-en`} className="ad-input" dir="ltr" value={englishValue} onChange={e => setSiteDraft(d => ({ ...d, [`${key}.en`]: e.target.value }))} placeholder="Enter the English text" data-testid={`textarea-site-${key}-en`} /><button type="button" className="ad-button ad-button-plain" disabled={savingKey === `${key}.en` || englishValue === (data.site?.[`${key}.en`] ?? '')} onClick={() => void saveSite(`${key}.en`, englishValue)} data-testid={`button-save-site-${key}-en`}><Check />{savingKey === `${key}.en` ? 'Saving...' : 'Save English'}</button></div>
                    </>}
                     {imageKey && <ImageInput id={`upload-site-${key}`} label={detail?.[1] || key} value={value ? [value] : []}
                       onBusyChange={busy => setSiteUploads(keys => busy ? [...keys, key] : keys.filter(x => x !== key))}
                       onChange={(url, action) => setSiteDraft(d => ({ ...d, [key]: action === 'add' ? url : '' }))} />}
                      {neutral && <button type="button" className="ad-button ad-button-plain" disabled={savingKey === key || siteUploads.includes(key) || value === (data.site?.[key] ?? '')} onClick={() => void saveSite(key, value)} data-testid={`button-save-site-${key}`}><Check />{savingKey === key ? 'جارٍ الحفظ...' : 'حفظ التعديل'}</button>}
                  </div>;
                })}</div>
                <div className="ad-site-add ad-section-gap"><h3>إضافة مفتاح محتوى آخر</h3><div className="ad-field-grid"><input className="ad-input" value={siteKey} onChange={e => setSiteKey(e.target.value)} placeholder="اسم المفتاح، مثال: services.title" dir="ltr" aria-label="اسم مفتاح المحتوى" data-testid="input-site-new-key" /><div><label htmlFor="input-site-new-value">العربية</label><textarea id="input-site-new-value" className="ad-input" value={siteValue} onChange={e => setSiteValue(e.target.value)} placeholder="النص بالعربية" aria-label="قيمة المحتوى بالعربية" data-testid="input-site-new-value" /></div><div dir="ltr"><label htmlFor="input-site-new-value-en">English (optional)</label><textarea id="input-site-new-value-en" className="ad-input" value={siteValueEn} onChange={e => setSiteValueEn(e.target.value)} placeholder="English text" aria-label="English content value" data-testid="input-site-new-value-en" /></div></div><button type="button" className="ad-button ad-button-primary" onClick={() => void saveNewSiteKey()} disabled={!!savingKey || !siteKey.trim()} data-testid="button-add-site-key"><Plus />حفظ المحتوى</button></div>
              </>}
            </>}
        </div>
      </main>
    </div>
    {notice && <div className={`ad-feedback ${notice.error ? 'error' : ''}`} role="status" data-testid="status-feedback">{notice.error ? <CircleAlert size={16} /> : <Check size={16} />}{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="إغلاق التنبيه" data-testid="button-dismiss-feedback"><X size={15} /></button></div>}
    {editor && <ItemForm key={`${editor.kind}-${editor.item.id}`} kind={editor.kind} initial={editor.kind === 'properties' ? { ...editor.item, latitude: (editor.item as PublishedProperty).coordinates?.[0] ?? 21.4225, longitude: (editor.item as PublishedProperty).coordinates?.[1] ?? 39.8262 } as unknown as Item : editor.item} saving={saving} onClose={() => setEditor(null)} onSave={saveItem} />}
    {deleting && <div className="ad-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setDeleting(null); }} role="presentation"><div className="ad-confirm" role="alertdialog" aria-modal="true" aria-label="تأكيد الحذف"><CircleAlert className="ad-confirm-icon" size={31} /><h2>حذف {itemNames[deleting.kind]}؟</h2><p>سيتم حذف «{itemTitle(deleting.item)}» من لوحة الإدارة والموقع. لا يمكن التراجع عن هذا الإجراء.</p><div className="ad-confirm-actions"><button type="button" className="ad-button ad-button-danger" onClick={() => void deleteItem()} disabled={saving} data-testid="button-confirm-delete"><Trash2 />{saving ? 'جارٍ الحذف...' : 'نعم، احذف'}</button><button type="button" className="ad-button ad-button-plain" onClick={() => setDeleting(null)} data-testid="button-cancel-delete">إلغاء</button></div></div></div>}
  </div>;
}