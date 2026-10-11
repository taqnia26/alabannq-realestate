import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ExternalLink, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './location-input.css';
import type { GoogleMapsLocation } from '@workspace/api-client-react';
type Props = {
  latitude: string; longitude: string; mapUrl: string;
  onChange: (values: { latitude: number; longitude: number; mapUrl?: string }) => void;
  onUrlChange: (url: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

const icon = L.divIcon({ className: 'pl-marker', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 22] });

function Recenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(position); }, [map, position]);
  return null;
}

const valid = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

export function PropertyLocationInput({ latitude, longitude, mapUrl, onChange, onUrlChange, onBusyChange }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const seq = useRef(0);
  const latInput = useRef<HTMLInputElement>(null);
  const lngInput = useRef<HTMLInputElement>(null);
  const urlRef = useRef(mapUrl);
  urlRef.current = mapUrl;
  const busyRef = useRef(onBusyChange);
  busyRef.current = onBusyChange;
  useEffect(() => () => { seq.current++; busyRef.current?.(false); }, []);

  const lat = Number(latitude), lng = Number(longitude);
  const hasPoint = latitude.trim() !== '' && longitude.trim() !== '' && valid(lat, lng);

  const edit = (url: string) => {
    seq.current++; // invalidate in-flight resolution
    if (busy) { setBusy(false); onBusyChange?.(false); }
    setError(''); setOk('');
    onUrlChange(url);
  };
  const extract = async () => {
    const url = mapUrl.trim();
    if (!url) { setError('الصق رابط خرائط جوجل أولاً.'); return; }
    const id = ++seq.current;
    setBusy(true); onBusyChange?.(true); setError(''); setOk('');
    try {
      const res = await fetch('/api/admin/maps/resolve', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
      });
      const body = await res.json().catch(() => ({}));
      if (id !== seq.current) return;
      if (!res.ok) throw new Error(body.error || `تعذر قراءة الرابط (${res.status})`);
      const loc = body as GoogleMapsLocation;
      if (!valid(loc.latitude, loc.longitude) || typeof loc.latitude !== 'number') throw new Error('لم يتم العثور على إحداثيات صحيحة في الرابط.');
      onChange({ latitude: loc.latitude, longitude: loc.longitude, mapUrl: loc.sourceUrl || url });
      setOk('تم استخراج الإحداثيات من الرابط.');
    } catch (err) {
      if (id !== seq.current) return;
      setError(err instanceof Error ? err.message : 'تعذر استخراج الإحداثيات.');
    } finally {
      if (id === seq.current) { setBusy(false); onBusyChange?.(false); }
    }
  };
  const manual = (which: 'latitude' | 'longitude', value: string) => {
    const first = which === 'latitude' ? value : latInput.current?.value ?? '';
    const second = which === 'longitude' ? value : lngInput.current?.value ?? '';
    const a = Number(first), b = Number(second);
    if (!first.trim() || !second.trim() || !valid(a, b)) { setError('أدخل الإحداثيين معًا: العرض بين -90 و90 والطول بين -180 و180.'); return; }
    setError(''); setOk('');
    onChange({ latitude: a, longitude: b });
  };

  return <div className="pl-root">
    <div className="ad-field full">
      <label htmlFor="pl-url">رابط خرائط جوجل</label>
      <div className="pl-row">
        <input id="pl-url" className="ad-input" dir="ltr" type="url" value={mapUrl} onChange={e => edit(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
        <button type="button" className="ad-button ad-button-primary" disabled={busy || !mapUrl.trim()} onClick={() => void extract()}><MapPin size={14} />{busy ? 'جارٍ الاستخراج...' : 'استخراج الإحداثيات'}</button>
      </div>
      {error && <p role="alert" className="ad-form-error">{error}</p>}
      {ok && <small className="pl-ok" role="status">{ok}</small>}
    </div>
    <div className="pl-coords">
      <div className="ad-field"><label htmlFor="pl-lat">خط العرض</label>
        <input ref={latInput} key={`lat-${latitude}`} id="pl-lat" className="ad-input" dir="ltr" type="number" min={-90} max={90} required step="any" defaultValue={latitude} onBlur={e => { if (e.target.value !== latitude) manual('latitude', e.target.value); }} /></div>
      <div className="ad-field"><label htmlFor="pl-lng">خط الطول</label>
        <input ref={lngInput} key={`lng-${longitude}`} id="pl-lng" className="ad-input" dir="ltr" type="number" min={-180} max={180} required step="any" defaultValue={longitude} onBlur={e => { if (e.target.value !== longitude) manual('longitude', e.target.value); }} /></div>
    </div>
    {hasPoint ? <>
      <div className="pl-map" dir="ltr">
        <MapContainer key={`${lat},${lng}`} center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[lat, lng]} icon={icon} />
          <Recenter position={[lat, lng]} />
        </MapContainer>
      </div>
      <a className="ad-button ad-button-plain pl-link" href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer"><ExternalLink size={14} />فتح الموقع في خرائط جوجل</a>
    </> : <p className="ad-subtitle">لا توجد إحداثيات صحيحة للمعاينة بعد.</p>}
  </div>;
}

export default PropertyLocationInput;
