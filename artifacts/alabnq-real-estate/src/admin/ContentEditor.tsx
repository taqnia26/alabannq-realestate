import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { contentFields, contentDefaults, type ContentField } from '../lib/contentCatalog';
import { ImageInput } from './ImageInput';
import './content-editor.css';

type Props = {
  site: Record<string, string>;
  onSave: (key: string, value: string) => Promise<boolean>;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
};
type StoredDraft = { base: string; value: string };

const STORE = 'alabnq-content-editor-drafts';
const PAGE_LIMIT = 60;
const base = (site: Record<string, string>, key: string) => site[key] ?? contentDefaults[key] ?? '';
const isBool = (f: ContentField) => /^pages\..+\.enabled$/.test(f.key);
const isNumber = (f: ContentField) => /^metrics\..+\.value$/.test(f.key);

function loadStored(): Record<string, StoredDraft> {
  try { return JSON.parse(sessionStorage.getItem(STORE) || '{}'); } catch { return {}; }
}

export function ContentEditor({ site, onSave, onBusyChange, onDirtyChange }: Props) {
  const siteRef = useRef(site);
  siteRef.current = site;
  const [drafts, setDrafts] = useState<Record<string, string>>(() => {
    const stored = loadStored();
    const out: Record<string, string> = {};
    for (const [k, d] of Object.entries(stored)) if (d && d.base === base(site, k) && d.value !== d.base) out[k] = d.value;
    return out;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [uploads, setUploads] = useState(0);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [limits, setLimits] = useState<Record<string, number>>({});

  // Drop drafts whose saved baseline changed elsewhere to the same value; keep unsaved edits otherwise.
  useEffect(() => {
    setDrafts(cur => {
      let changed = false;
      const next = { ...cur };
      for (const k of Object.keys(cur)) if (cur[k] === base(site, k)) { delete next[k]; changed = true; }
      return changed ? next : cur;
    });
  }, [site]);

  useEffect(() => {
    const stored: Record<string, StoredDraft> = {};
    for (const [k, value] of Object.entries(drafts)) stored[k] = { base: base(siteRef.current, k), value };
    try {
      if (Object.keys(stored).length) sessionStorage.setItem(STORE, JSON.stringify(stored));
      else sessionStorage.removeItem(STORE);
    } catch { /* storage unavailable */ }
  }, [drafts]);

  const busyRef = useRef(onBusyChange);
  busyRef.current = onBusyChange;
  const anySaving = Object.values(saving).some(Boolean);
  useEffect(() => { busyRef.current?.(uploads > 0 || anySaving); }, [uploads, anySaving]);
  useEffect(() => () => busyRef.current?.(false), []);

  const dirty = Object.keys(drafts).length > 0 || uploads > 0;
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false); }, [dirty, onDirtyChange]);
  useEffect(() => {
    if (!dirty || onDirtyChange) return;
    const msg = 'لديك تعديلات غير محفوظة في محتوى الموقع. هل تريد المغادرة؟';
    const unload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    const click = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || /^(mailto|tel):/.test(a.getAttribute('href') || '')) return;
      if (a.href === window.location.href) return;
      if (!window.confirm(msg)) { e.preventDefault(); e.stopImmediatePropagation(); }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', click, true); };
  }, [dirty, onDirtyChange]);

  const current = useCallback((key: string) => drafts[key] ?? base(site, key), [drafts, site]);
  const setDraft = (key: string, value: string) => {
    setSaved(s => ({ ...s, [key]: false }));
    setErrors(e => ({ ...e, [key]: '' }));
    setDrafts(d => {
      const next = { ...d };
      if (value === base(siteRef.current, key)) delete next[key]; else next[key] = value;
      return next;
    });
  };
  const save = async (key: string) => {
    const value = drafts[key];
    if (value === undefined || saving[key]) return;
    if (/^metrics\..+\.value$/.test(key) && !Number.isFinite(Number(value))) { setErrors(e => ({ ...e, [key]: 'أدخل رقماً صحيحاً.' })); return; }
    setSaving(s => ({ ...s, [key]: true }));
    setErrors(e => ({ ...e, [key]: '' }));
    try {
      const ok = await onSave(key, value);
      if (ok) {
        setSaved(s => ({ ...s, [key]: true }));
        setDrafts(d => {
          if (d[key] !== value) return d; // edited again while saving
          const next = { ...d }; delete next[key]; return next;
        });
      } else setErrors(e => ({ ...e, [key]: 'تعذر الحفظ. تم الاحتفاظ بتعديلك، حاول مرة أخرى.' }));
    } catch (err) {
      setErrors(e => ({ ...e, [key]: err instanceof Error ? err.message : 'تعذر الحفظ.' }));
    } finally { setSaving(s => ({ ...s, [key]: false })); }
  };
  const changeUpload = useCallback((busy: boolean) => setUploads(n => Math.max(0, n + (busy ? 1 : -1))), []);

  const groups = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('ar');
    const map = new Map<string, ContentField[]>();
    for (const f of contentFields) {
      if (term && !`${f.key} ${f.label} ${f.group} ${f.defaultValue} ${f.englishDefault ?? ''}`.toLocaleLowerCase('ar').includes(term)) continue;
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group)!.push(f);
    }
    return [...map.entries()];
  }, [query]);
  const matches = groups.reduce((n, [, l]) => n + l.length, 0);

  const control = (f: ContentField, key: string, lang: 'ar' | 'en' | 'shared') => {
    const value = current(key);
    const id = `ce-${key}`;
    const dir = lang === 'en' || f.type === 'value' || f.type === 'image' ? 'ltr' : undefined;
    const isSaving = !!saving[key];
    const has = drafts[key] !== undefined;
    let input;
    if (isBool(f)) {
      input = <label className="ad-check"><input type="checkbox" id={id} checked={value !== 'false'} onChange={e => setDraft(key, e.target.checked ? 'true' : 'false')} />{value !== 'false' ? 'ظاهرة في الموقع' : 'مخفية من الموقع'}</label>;
    } else if (f.type === 'image') {
      input = <>
        <input id={id} className="ad-input" dir="ltr" value={value} onChange={e => setDraft(key, e.target.value)} placeholder="https://... أو ارفع صورة" />
        <ImageInput id={`${id}-file`} label={f.label} value={value ? [value] : []} onBusyChange={changeUpload} onChange={(url, action) => setDraft(key, action === 'add' ? url : '')} />
      </>;
    } else if (isNumber(f)) {
      input = <input id={id} className="ad-input" dir="ltr" type="number" step="any" inputMode="decimal" value={value} onChange={e => setDraft(key, e.target.value)} />;
    } else if (f.type === 'value' || value.length < 70 && !value.includes('\n')) {
      input = <input id={id} className="ad-input" dir={dir} value={value} onChange={e => setDraft(key, e.target.value)} />;
    } else {
      input = <textarea id={id} className="ad-input" dir={dir} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 70)))} value={value} onChange={e => setDraft(key, e.target.value)} />;
    }
    const tag = lang === 'shared' ? 'قيمة مشتركة' : lang === 'en' ? 'English' : 'العربية';
    return <div className="ce-control" key={key}>
      <div className="ce-control-head"><label htmlFor={id}>{tag}</label>{has && <em>تعديل غير محفوظ</em>}{saved[key] && !has && <span className="ce-ok">تم الحفظ</span>}</div>
      {input}
      <div className="ce-actions">
        <button type="button" className="ad-button ad-button-primary" disabled={!has || isSaving || uploads > 0} onClick={() => void save(key)}>
          <Check size={14} />{isSaving ? 'جارٍ الحفظ...' : uploads > 0 ? 'جارٍ رفع الصور...' : lang === 'en' ? 'حفظ الإنجليزية' : lang === 'ar' ? 'حفظ العربية' : 'حفظ'}
        </button>
        {has && <button type="button" className="ad-button ad-button-plain" disabled={isSaving} onClick={() => setDraft(key, base(site, key))}>تراجع</button>}
      </div>
      {errors[key] && <p role="alert" className="ad-form-error">{errors[key]}</p>}
    </div>;
  };

  return <div className="ce-root">
    <div className="ce-toolbar">
      <div className="ce-search"><Search size={15} /><input className="ad-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث بالاسم أو المفتاح أو النص..." aria-label="بحث في محتوى الموقع" /></div>
      <span className="ad-subtitle">{matches} من {contentFields.length} حقلاً{dirty ? ` · ${Object.keys(drafts).length} غير محفوظ` : ''}</span>
    </div>
    {groups.length === 0 && <div className="ad-empty"><strong>لا نتائج</strong><p>جرّب كلمة بحث مختلفة.</p></div>}
    {groups.map(([group, fields]) => {
      const isOpen = !!query.trim() || open[group];
      const limit = limits[group] ?? PAGE_LIMIT;
      const unsaved = fields.filter(f => drafts[f.key] !== undefined || drafts[`${f.key}.en`] !== undefined).length;
      return <section className="ce-group" key={group}>
        <button type="button" className="ce-group-head" aria-expanded={isOpen} onClick={() => setOpen(o => ({ ...o, [group]: !o[group] }))}>
          <strong>{group}</strong><span>{fields.length}{unsaved ? ` · ${unsaved} غير محفوظ` : ''}</span><ChevronDown size={16} className={isOpen ? 'ce-rot' : ''} />
        </button>
        {isOpen && <div className="ce-fields">
          {fields.slice(0, limit).map(f => {
            const english = f.englishDefault !== undefined;
            const title = f.label && f.label !== f.key && f.label.length <= 80 ? f.label : f.label?.slice(0, 77) + (f.label && f.label !== f.key ? '...' : '');
            return <article className="ce-field" key={f.key}>
              <header><h4>{title || f.key}</h4><code dir="ltr">{f.key}</code></header>
              <div className={english ? 'ce-pair' : ''}>
                {control(f, f.key, english ? 'ar' : 'shared')}
                {english && control(f, `${f.key}.en`, 'en')}
              </div>
            </article>;
          })}
          {fields.length > limit && <button type="button" className="ad-button ad-button-plain" onClick={() => setLimits(l => ({ ...l, [group]: limit + PAGE_LIMIT }))}>عرض المزيد ({fields.length - limit})</button>}
        </div>}
      </section>;
    })}
  </div>;
}

export default ContentEditor;
