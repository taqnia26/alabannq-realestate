import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ArrowDown, ArrowUp, Check, CircleAlert, Copy, Plus, RotateCcw, Trash2,
} from 'lucide-react';
import {
  MAX_SLIDES, defaultHeroSlider, heroImagePosition, heroOverlay, heroSliderSchema, newHeroSlide, readHeroSlider,
  type HeroSlide, type HeroSliderConfig,
} from '@workspace/slider-config';
import { AnimatePresence, motion } from 'framer-motion';
import { ImageInput } from './ImageInput';
import { discardSliderDraft, readSliderDraft, storeSliderDraft } from './sliderDraft';
import './slider-editor.css';

const arabicNumber = new Intl.NumberFormat('ar-SA');
const fieldNames: Record<string, string> = {
  image: 'الصورة', imageAlt: 'النص البديل', imageAltEn: 'النص البديل بالإنجليزية', title: 'العنوان',
  titleEn: 'العنوان بالإنجليزية', subtitle: 'الوصف', subtitleEn: 'الوصف بالإنجليزية', eyebrow: 'العنوان العلوي',
  eyebrowEn: 'العنوان العلوي بالإنجليزية', buttonText: 'نص الزر', buttonTextEn: 'نص الزر بالإنجليزية',
  buttonHref: 'رابط الزر', overlayOpacity: 'عتامة الطبقة', interval: 'مدة العرض', transitionDuration: 'مدة الانتقال',
  slides: 'الشرائح',
};
const newId = () => `slide-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`;

function describeStoredError(err: unknown) {
  if (err instanceof SyntaxError) return 'القيمة المحفوظة ليست JSON صالحًا.';
  const issues = (err as { issues?: { path: (string | number)[] }[] })?.issues;
  if (issues?.length) return `بنية الإعدادات المحفوظة غير صالحة (${arabicNumber.format(issues.length)} مشكلة، أولها في: ${issues[0].path.join(' / ') || 'الجذر'}).`;
  return 'تعذر قراءة الإعدادات المحفوظة.';
}

function validate(config: HeroSliderConfig): string[] {
  const result = heroSliderSchema.safeParse(config);
  if (result.success) return [];
  return result.error.issues.map(issue => {
    const [head, index, field] = issue.path;
    const custom = issue.code === 'custom' || /[\u0600-\u06FF]/.test(issue.message);
    const slideLabel = head === 'slides' && typeof index === 'number' ? `الشريحة ${arabicNumber.format(index + 1)}: ` : '';
    const name = fieldNames[String(field ?? (typeof index === 'string' ? index : head))] || String(field ?? head);
    return `${slideLabel}${custom ? issue.message : `قيمة غير صالحة في «${name}»`}`;
  });
}

function Field({ id, label, hint, full, children }: { id: string; label: string; hint?: string; full?: boolean; children: ReactNode }) {
  return <div className={`ad-field ${full ? 'full' : ''}`}><label htmlFor={id}>{label}</label>{children}{hint && <small>{hint}</small>}</div>;
}

function Toggle({ id, label, checked, onChange, hint }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return <div className="ad-field"><label className="ad-check" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} data-testid={`checkbox-${id}`} />{label}
  </label>{hint && <small>{hint}</small>}</div>;
}

function Layer({ slide, config, lang }: { slide: HeroSlide; config: HeroSliderConfig; lang: 'ar' | 'en' }) {
  const en = lang === 'en';
  const pick = (ar: string, e: string) => (en ? e || ar : ar);
  const title = pick(slide.title, slide.titleEn), sub = pick(slide.subtitle, slide.subtitleEn);
  const eyebrow = pick(slide.eyebrow, slide.eyebrowEn), btn = pick(slide.buttonText, slide.buttonTextEn);
  return <>
    {slide.image ? <div className="se-preview-img" style={{ backgroundImage: `url("${slide.image.replace(/"/g, '%22')}")`, backgroundPosition: heroImagePosition(slide.imagePosition) }} /> : <div className="se-preview-empty">لم تتم إضافة صورة بعد</div>}
    <div className="se-preview-shade" style={{ background: heroOverlay(slide.overlayOpacity) }} />
    {config.goldLines && <div className="se-preview-lines" />}
    <div className={`se-preview-copy ${slide.textAlign === 'center' ? 'center' : ''}`}>
      {eyebrow && <span className="eb">{eyebrow}</span>}
      <h4>{title || (en ? 'Slide title' : 'عنوان الشريحة')}</h4>
      {sub && <p>{sub}</p>}
      {btn && <span className="se-preview-btn">{btn}</span>}
    </div>
  </>;
}

function Preview({ slide, slides, config, lang, narrow, playing }: { slide: HeroSlide; slides: HeroSlide[]; config: HeroSliderConfig; lang: 'ar' | 'en'; narrow: boolean; playing: boolean }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const rtl = lang === 'ar';
  const count = slides.length;
  const current = playing && count ? slides[index % count] : slide;
  useEffect(() => { if (playing) setIndex(0); }, [playing]);
  useEffect(() => {
    if (!playing || !config.autoplay || count < 2 || (config.pauseOnHover && hover)) return;
    const timer = window.setTimeout(() => setIndex(i => (i + 1) % count), config.interval);
    return () => window.clearTimeout(timer);
  }, [playing, config.autoplay, config.interval, config.pauseOnHover, hover, count, index]);
  const dur = config.transition === 'none' ? 0 : config.transitionDuration / 1000;
  const dir = rtl ? -1 : 1;
  const variants = config.transition === 'slide'
    ? { initial: { x: `${100 * dir}%` }, animate: { x: '0%' }, exit: { x: `${-100 * dir}%` } }
    : config.transition === 'fade' ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } };
  const showIndex = playing ? index % Math.max(count, 1) : slides.findIndex(s => s.id === slide.id);
  return <div className={`se-preview ${narrow ? 'narrow' : ''}`} dir={rtl ? 'rtl' : 'ltr'} role="img" aria-label="معاينة مباشرة للشريحة"
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
    {playing ? <AnimatePresence initial={false}>
      <motion.div key={current.id} className="se-preview-layer" {...variants} transition={{ duration: dur, ease: 'easeInOut' }}>
        <motion.div className="se-preview-layer" initial={{ scale: 1 }} animate={{ scale: config.imageMotion ? 1.08 : 1 }} transition={{ duration: config.imageMotion ? (config.interval + config.transitionDuration) / 1000 : 0, ease: 'linear' }}>
          <Layer slide={current} config={{ ...config, goldLines: false }} lang={lang} />
        </motion.div>
        {config.goldLines && <div className="se-preview-lines" />}
      </motion.div>
    </AnimatePresence> : <Layer slide={current} config={config} lang={lang} />}
    {config.showIndicators && count > 1 && <div className="se-preview-dots" aria-hidden="true">{slides.slice(0, 12).map((s, i) => <i key={s.id} className={i === showIndex ? 'on' : ''} />)}</div>}
    {playing && !config.autoplay && count > 1 && <button type="button" className="ad-button ad-button-plain se-preview-next" onClick={() => setIndex(i => (i + 1) % count)}>التالي</button>}
  </div>;
}

type Confirm = { title: string; text: string; label: string; run: () => void };

export default function SliderEditor({ site, onSave, onDirtyChange, onUploadsChange }: {
  site: Record<string, string>;
  onSave: (value: string) => Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onUploadsChange?: (count: number) => void;
}) {
  const parsed = useMemo(() => {
    try { return { config: readHeroSlider(site), error: '' }; }
    catch (err) { return { config: null, error: describeStoredError(err) }; }
  }, [site]);
  const cachedDraft = useRef(readSliderDraft());
  const recovered = parsed.config && cachedDraft.current?.baseline === JSON.stringify(parsed.config) ? cachedDraft.current : null;
  const [config, setConfig] = useState<HeroSliderConfig | null>(recovered?.config ?? parsed.config);
  const [baseline, setBaseline] = useState(parsed.config ? JSON.stringify(parsed.config) : '');
  const [selectedId, setSelectedId] = useState(recovered?.selectedId ?? parsed.config?.slides[0]?.id ?? '');
  const [uploads, setUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showIssues, setShowIssues] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [narrow, setNarrow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [replacedCorrupt, setReplacedCorrupt] = useState(false);

  const dirty = config !== null && (JSON.stringify(config) !== baseline || (replacedCorrupt && !parsed.config));
  useEffect(() => {
    if (dirty && config) storeSliderDraft(config, baseline, selectedId);
    else discardSliderDraft();
  }, [dirty, config, baseline, selectedId]);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const onDirtyRef = useRef(onDirtyChange);
  onDirtyRef.current = onDirtyChange;
  const onUploadsRef = useRef(onUploadsChange);
  onUploadsRef.current = onUploadsChange;
  useEffect(() => { onDirtyRef.current?.(dirty); }, [dirty]);
  useEffect(() => { onUploadsRef.current?.(uploads); }, [uploads]);
  useEffect(() => () => { onDirtyRef.current?.(false); onUploadsRef.current?.(0); }, []);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Server refresh: only adopt it when there is no unsaved draft.
  useEffect(() => {
    if (!parsed.config) return;
    if (!dirtyRef.current) {
      setBaseline(JSON.stringify(parsed.config));
      setConfig(parsed.config);
      setSelectedId(id => parsed.config!.slides.some(s => s.id === id) ? id : parsed.config!.slides[0].id);
    }
  }, [parsed]);

  const busyChange = (busy: boolean) => setUploads(count => Math.max(0, count + (busy ? 1 : -1)));
  const issues = useMemo(() => (config ? validate(config) : []), [config]);
  const legacy = ['home.title', 'home.subtitle', 'home.heroImage'].filter(key => site[key]);

  if (!config) {
    return <div className="ad-card ad-error-box" style={{ padding: 24 }}>
      <CircleAlert size={31} /><h2>إعدادات السلايدر المحفوظة تالفة</h2>
      <p role="alert" data-testid="status-slider-corrupt">{parsed.error} لم يتم تعديل أي شيء، والموقع العام لن يتأثر حتى تحفظ إعدادات جديدة.</p>
      <button type="button" className="ad-button ad-button-primary" data-testid="button-slider-start-default"
        onClick={() => setConfirm({ title: 'البدء من الإعدادات الافتراضية؟', text: 'ستُنشأ مسودة جديدة من الإعدادات الافتراضية. لن يُستبدل المحفوظ حاليًا إلا إذا ضغطت حفظ.', label: 'نعم، ابدأ من الافتراضي', run: () => { const d = defaultHeroSlider(site); setConfig(d); setSelectedId(d.slides[0].id); setReplacedCorrupt(true); } })}>
        <RotateCcw />إنشاء مسودة افتراضية</button>
      {confirm && <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />}
    </div>;
  }

  const uploading = uploads > 0;
  const slide = config.slides.find(s => s.id === selectedId) ?? config.slides[0];
  const slideIndex = config.slides.findIndex(s => s.id === slide.id);
  const enabledCount = config.slides.filter(s => s.enabled).length;
  const setGlobal = <K extends keyof HeroSliderConfig>(key: K, value: HeroSliderConfig[K]) => setConfig(c => c && { ...c, [key]: value });
  const patch = (changes: Partial<HeroSlide>) => setConfig(c => c && { ...c, slides: c.slides.map(s => s.id === slide.id ? { ...s, ...changes } : s) });
  const move = (from: number, to: number) => setConfig(c => {
    if (!c || to < 0 || to >= c.slides.length) return c;
    const slides = [...c.slides];
    const [item] = slides.splice(from, 1);
    slides.splice(to, 0, item);
    return { ...c, slides };
  });
  const add = () => {
    if (config.slides.length >= MAX_SLIDES) return;
    const fresh = newHeroSlide(newId());
    setConfig({ ...config, slides: [...config.slides, fresh] });
    setSelectedId(fresh.id);
  };
  const duplicate = () => {
    if (config.slides.length >= MAX_SLIDES) return;
    const copy = { ...slide, id: newId() };
    const slides = [...config.slides];
    slides.splice(slideIndex + 1, 0, copy);
    setConfig({ ...config, slides });
    setSelectedId(copy.id);
  };
  const remove = () => {
    const slides = config.slides.filter(s => s.id !== slide.id);
    setConfig({ ...config, slides });
    setSelectedId(slides[Math.min(slideIndex, slides.length - 1)].id);
  };
  const discard = () => {
    const base = parsed.config ?? null;
    setConfig(base); setReplacedCorrupt(false); setServerError(''); setShowIssues(false);
    if (base) setSelectedId(base.slides[0].id);
  };
  const resetDefault = () => {
    const d = defaultHeroSlider(site);
    setConfig(d); setSelectedId(d.slides[0].id);
  };
  const save = async () => {
    setServerError('');
    const result = heroSliderSchema.safeParse(config);
    if (!result.success) { setShowIssues(true); return; }
    setSaving(true);
    try {
      const value = JSON.stringify(result.data);
      await onSave(value);
      setBaseline(JSON.stringify(config));
      setReplacedCorrupt(false); setShowIssues(false);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'تعذر حفظ السلايدر.');
    } finally { setSaving(false); }
  };
  
  const saveDisabled = saving || uploading || !dirty;
  const input = (key: keyof HeroSlide, label: string, opts: { en?: boolean; multiline?: boolean; full?: boolean; hint?: string; max: number; type?: string; placeholder?: string }) => {
    const id = `slider-${key}`;
    const common = { id, className: 'ad-input', dir: opts.en ? 'ltr' as const : undefined, value: String(slide[key] ?? ''), maxLength: opts.max, placeholder: opts.placeholder, onChange: (e: { target: { value: string } }) => patch({ [key]: e.target.value } as Partial<HeroSlide>), 'data-testid': `input-slider-${key}` };
    return <Field id={id} label={label} full={opts.full} hint={opts.hint} key={`${slide.id}-${key}`}>
      {opts.multiline ? <textarea {...common} rows={3} /> : <input {...common} type={opts.type || 'text'} />}
    </Field>;
  };
  const seg = <T extends string>(label: string, value: T, options: [T, string][], set: (v: T) => void, testid: string) =>
    <div className="ad-field"><span id={`${testid}-l`} style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
      <div className="se-seg" role="group" aria-labelledby={`${testid}-l`}>{options.map(([v, text]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => set(v)} data-testid={`${testid}-${v}`}>{text}</button>)}</div></div>;

  return <div className="se-root">
    {parsed.error && replacedCorrupt && <p className="se-legacy" role="alert">الإعدادات المحفوظة تالفة ({parsed.error}). أنت تعمل على مسودة جديدة، وحفظها سيستبدل القيمة التالفة.</p>}
    <div className="ad-card se-bar" role="region" aria-label="حالة الحفظ">
      <span className="se-status" role="status" data-testid="status-slider-dirty"><span className={`se-dot ${dirty ? 'dirty' : ''}`} />{uploading ? 'جارٍ رفع الصور... الحفظ متوقف مؤقتًا' : saving ? 'جارٍ الحفظ...' : dirty ? 'توجد تعديلات غير محفوظة' : 'كل التعديلات محفوظة'}</span>
      <div className="se-actions">
        <button type="button" className="ad-button ad-button-plain" disabled={!dirty || saving || uploading} onClick={() => setConfirm({ title: 'تجاهل التعديلات؟', text: 'ستفقد كل التعديلات غير المحفوظة في السلايدر.', label: 'نعم، تجاهل', run: discard })} data-testid="button-slider-discard"><RotateCcw size={15} />تجاهل التعديلات</button>
        <button type="button" className="ad-button ad-button-plain" disabled={saving || uploading} onClick={() => setConfirm({ title: 'إعادة الضبط للافتراضي؟', text: 'ستُستبدل المسودة الحالية بالشرائح والإعدادات الافتراضية. لن يتغير الموقع قبل الحفظ.', label: 'نعم، أعد الضبط', run: resetDefault })} data-testid="button-slider-reset">إعادة الضبط للافتراضي</button>
        <button type="button" className="ad-button ad-button-primary" disabled={saveDisabled} onClick={() => void save()} data-testid="button-slider-save"><Check />{uploading ? 'جارٍ رفع الصور...' : saving ? 'جارٍ الحفظ...' : 'حفظ السلايدر'}</button>
      </div>
    </div>
    {(showIssues || serverError) && (issues.length > 0 || serverError) && <ul className="se-errors" role="alert" data-testid="status-slider-errors">
      {serverError && <li>{serverError}</li>}{showIssues && issues.map((m, i) => <li key={i}>{m}</li>)}
    </ul>}
    {!showIssues && issues.length > 0 && <p className="se-hint" data-testid="text-slider-issues">تنبيه: {issues[0]}{issues.length > 1 ? ` (و${arabicNumber.format(issues.length - 1)} ملاحظات أخرى)` : ''}</p>}
    {legacy.length > 0 && <p className="se-legacy" data-testid="text-slider-legacy">
      القيم القديمة في «محتوى الموقع» ({legacy.join('، ')}) هي قيم افتراضية فقط، وتُستخدم لبناء السلايدر قبل حفظ سلايدر مخصص. بعد الحفظ هنا لا تؤثر عليه.
    </p>}

    <div className="se-layout">
      <section className="ad-card se-panel" aria-label="قائمة الشرائح">
        <div className="ad-card-head" style={{ padding: 0 }}><div><h2>الشرائح</h2><p>{arabicNumber.format(config.slides.length)} من {arabicNumber.format(MAX_SLIDES)} · المفعّلة {arabicNumber.format(enabledCount)}</p></div></div>
        <ol className="se-list">{config.slides.map((s, i) => <li key={s.id}>
          <button type="button" className={`se-item ${s.enabled ? '' : 'off'}`} disabled={uploading && s.id !== slide.id} aria-current={s.id === slide.id} onClick={() => setSelectedId(s.id)} data-testid={`button-slide-${s.id}`}>
            <span className="se-thumb" style={s.image ? { backgroundImage: `url("${s.image.replace(/"/g, '%22')}")` } : undefined}>{!s.image && arabicNumber.format(i + 1)}</span>
            <span><strong>{s.title || 'شريحة بدون عنوان'}</strong><small>{s.enabled ? 'مفعّلة' : 'معطّلة'} · الترتيب {arabicNumber.format(i + 1)}</small></span>
          </button></li>)}</ol>
        <button type="button" className="ad-button ad-button-primary" onClick={add} disabled={config.slides.length >= MAX_SLIDES || uploading} data-testid="button-slide-add"><Plus />إضافة شريحة</button>
        {config.slides.length >= MAX_SLIDES && <p className="se-hint">بلغت الحد الأقصى للشرائح.</p>}
      </section>

      <div style={{ display: 'grid', gap: 18, minWidth: 0 }}>
        <section className="ad-card se-panel" aria-label="المعاينة المباشرة">
          <div className="ad-card-head" style={{ padding: 0, flexWrap: 'wrap', gap: 10 }}><div><h2>معاينة مباشرة</h2><p>تتحدث فور كل تعديل، قبل الحفظ.</p></div>
            <div className="se-actions">
              <div className="se-seg" role="group" aria-label="لغة المعاينة"><button type="button" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')} data-testid="button-preview-ar">العربية</button><button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} data-testid="button-preview-en">English</button></div>
              <button type="button" className="ad-button ad-button-plain" aria-pressed={playing} disabled={enabledCount < 1} onClick={() => setPlaying(v => !v)} data-testid="button-preview-play">{playing ? 'إيقاف معاينة التأثيرات' : 'تشغيل معاينة التأثيرات'}</button>
              <div className="se-seg" role="group" aria-label="حجم المعاينة"><button type="button" aria-pressed={!narrow} onClick={() => setNarrow(false)} data-testid="button-preview-wide">سطح المكتب</button><button type="button" aria-pressed={narrow} onClick={() => setNarrow(true)} data-testid="button-preview-narrow">الجوال</button></div>
            </div></div>
          <Preview slide={slide} slides={config.slides.filter(x => x.enabled)} config={config} lang={lang} narrow={narrow} playing={playing} />
        </section>

        <section className="ad-card se-panel" aria-label={`تحرير الشريحة ${slideIndex + 1}`}>
          <div className="ad-card-head" style={{ padding: 0, flexWrap: 'wrap', gap: 10 }}><div><h2>الشريحة {arabicNumber.format(slideIndex + 1)}</h2><p>{slide.title || 'بدون عنوان'}</p></div>
            <div className="se-row-tools">
              <button type="button" className="se-tool" disabled={slideIndex === 0 || uploading} onClick={() => move(slideIndex, slideIndex - 1)} aria-label="تقديم الشريحة" title="تقديم" data-testid="button-slide-up"><ArrowUp size={15} /></button>
              <button type="button" className="se-tool" disabled={slideIndex === config.slides.length - 1 || uploading} onClick={() => move(slideIndex, slideIndex + 1)} aria-label="تأخير الشريحة" title="تأخير" data-testid="button-slide-down"><ArrowDown size={15} /></button>
              <button type="button" className="se-tool" disabled={config.slides.length >= MAX_SLIDES || uploading} onClick={duplicate} aria-label="تكرار الشريحة" title="تكرار" data-testid="button-slide-duplicate"><Copy size={15} /></button>
              <button type="button" className="se-tool" disabled={config.slides.length <= 1 || uploading} onClick={() => setConfirm({ title: 'حذف الشريحة؟', text: `ستُحذف «${slide.title || 'شريحة بدون عنوان'}» من المسودة. لن يتغير الموقع قبل الحفظ.`, label: 'نعم، احذف', run: remove })} aria-label="حذف الشريحة" title="حذف" data-testid="button-slide-delete"><Trash2 size={15} /></button>
            </div></div>
          <Toggle id={`slide-enabled`} label="تفعيل الشريحة في الموقع" checked={slide.enabled} onChange={v => patch({ enabled: v })} hint="الشريحة المعطّلة تبقى محفوظة ولا تظهر للزوار." />
          <div className="se-grid">
            <Field id="slider-image" label="رابط الصورة" full hint="رابط يبدأ بـ / أو https:// ، أو ارفع صورة من الجهاز.">
              <input id="slider-image" className="ad-input" dir="ltr" value={slide.image} maxLength={2048} onChange={e => patch({ image: e.target.value.trim() })} placeholder="https://..." data-testid="input-slider-image" />
            </Field>
            <div className="ad-field full" key={`up-${slide.id}`}>
              <ImageInput id={`slider-upload-${slide.id}`} label="صورة الشريحة" value={slide.image ? [slide.image] : []} onBusyChange={busyChange} onChange={(url, action) => patch({ image: action === 'add' ? url : '' })} />
            </div>
            {input('imageAlt', 'النص البديل للصورة', { max: 220, hint: 'وصف مختصر للصورة لقارئات الشاشة.' })}
            {input('imageAltEn', 'Image alt text (English)', { en: true, max: 220 })}
            {input('eyebrow', 'العنوان العلوي', { max: 120 })}
            {input('eyebrowEn', 'Eyebrow (English)', { en: true, max: 120 })}
            {input('title', 'العنوان', { max: 220, full: false })}
            {input('titleEn', 'Title (English)', { en: true, max: 220 })}
            {input('subtitle', 'الوصف', { max: 600, multiline: true })}
            {input('subtitleEn', 'Subtitle (English)', { en: true, max: 600, multiline: true })}
            {input('buttonText', 'نص الزر', { max: 80, hint: 'اتركه فارغًا لإخفاء الزر.' })}
            {input('buttonTextEn', 'Button text (English)', { en: true, max: 80 })}
            {input('buttonHref', 'رابط الزر', { en: true, max: 2048, full: true, placeholder: '/properties أو https://...', hint: 'مسار داخلي يبدأ بـ / أو رابط https:// فقط.' })}
          </div>
          <div className="se-grid three">
            <Field id="slider-imagePosition" label="موضع الصورة">
              <select id="slider-imagePosition" className="ad-input" value={slide.imagePosition} onChange={e => patch({ imagePosition: e.target.value as HeroSlide['imagePosition'] })} data-testid="select-slider-imagePosition">
                <option value="center">الوسط</option><option value="top">الأعلى</option><option value="bottom">الأسفل</option>
              </select></Field>
            <Field id="slider-textAlign" label="محاذاة النص">
              <select id="slider-textAlign" className="ad-input" value={slide.textAlign} onChange={e => patch({ textAlign: e.target.value as HeroSlide['textAlign'] })} data-testid="select-slider-textAlign">
                <option value="start">بداية السطر</option><option value="center">الوسط</option>
              </select></Field>
            <Field id="slider-overlay" label="عتامة الطبقة الداكنة">
              <div className="se-range"><input id="slider-overlay" type="range" min={0.15} max={0.9} step={0.05} value={slide.overlayOpacity} onChange={e => patch({ overlayOpacity: Math.round(Number(e.target.value) * 100) / 100 })} data-testid="input-slider-overlay" /><output htmlFor="slider-overlay">{arabicNumber.format(Math.round(slide.overlayOpacity * 100))}٪</output></div></Field>
          </div>
        </section>

        <section className="ad-card se-panel" aria-label="الإعدادات العامة">
          <div className="ad-card-head" style={{ padding: 0 }}><div><h2>الإعدادات العامة للسلايدر</h2><p>تنطبق على كل الشرائح.</p></div></div>
          <div className="se-grid three">
            <Toggle id="slider-autoplay" label="تشغيل تلقائي" checked={config.autoplay} onChange={v => setGlobal('autoplay', v)} />
            <Toggle id="slider-pauseOnHover" label="إيقاف مؤقت عند التمرير بالمؤشر" checked={config.pauseOnHover} onChange={v => setGlobal('pauseOnHover', v)} />
            <Toggle id="slider-showIndicators" label="إظهار المؤشرات" checked={config.showIndicators} onChange={v => setGlobal('showIndicators', v)} />
            <Toggle id="slider-imageMotion" label="حركة بطيئة للصورة" checked={config.imageMotion} onChange={v => setGlobal('imageMotion', v)} />
            <Toggle id="slider-goldLines" label="الخطوط الذهبية" checked={config.goldLines} onChange={v => setGlobal('goldLines', v)} />
          </div>
          <div className="se-grid three">
            <Field id="slider-interval" label="مدة بقاء الشريحة (ثوانٍ)" hint="من ٣ إلى ٣٠ ثانية.">
              <input id="slider-interval" className="ad-input" type="number" min={3} max={30} step={1} value={config.interval / 1000} onChange={e => setGlobal('interval', Math.round(Number(e.target.value) * 1000))} data-testid="input-slider-interval" /></Field>
            <Field id="slider-transition" label="نوع الانتقال">
              <select id="slider-transition" className="ad-input" value={config.transition} onChange={e => setGlobal('transition', e.target.value as HeroSliderConfig['transition'])} data-testid="select-slider-transition">
                <option value="fade">تلاشٍ</option><option value="slide">انزلاق</option><option value="none">بدون حركة</option>
              </select></Field>
            <Field id="slider-duration" label="مدة الانتقال (ميلي ثانية)" hint="من ٣٠٠ إلى ٢٥٠٠.">
              <input id="slider-duration" className="ad-input" type="number" min={300} max={2500} step={50} value={config.transitionDuration} onChange={e => setGlobal('transitionDuration', Math.round(Number(e.target.value)))} data-testid="input-slider-duration" /></Field>
          </div>
        </section>
      </div>
    </div>
    {confirm && <ConfirmDialog confirm={confirm} onClose={() => setConfirm(null)} />}
  </div>;
}

function ConfirmDialog({ confirm, onClose }: { confirm: Confirm; onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return <div className="ad-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }} role="presentation">
    <div className="ad-confirm" role="alertdialog" aria-modal="true" aria-label={confirm.title}>
      <CircleAlert className="ad-confirm-icon" size={31} /><h2>{confirm.title}</h2><p>{confirm.text}</p>
      <div className="ad-confirm-actions">
        <button type="button" className="ad-button ad-button-danger" onClick={() => { confirm.run(); onClose(); }} data-testid="button-slider-confirm">{confirm.label}</button>
        <button ref={ref} type="button" className="ad-button ad-button-plain" onClick={onClose} data-testid="button-slider-confirm-cancel">إلغاء</button>
      </div>
    </div>
  </div>;
}
