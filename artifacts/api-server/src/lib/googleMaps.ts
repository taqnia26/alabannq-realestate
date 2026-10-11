const googleDomains = /^(?:(?:www|maps)\.)?google\.(?:com|com\.sa|co\.uk|ae|com\.eg|com\.au|co\.in|de|fr)$/;
const SHORT_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"]);

export function safeGoogleMapsUrl(input: string): URL {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new Error("أدخل رابط مشاركة صالحًا من خرائط Google."); }
  if (url.protocol !== "https:" || url.username || url.password || url.port ||
    /[\u0000-\u0020\u007f]/.test(input.trim()) || input.length > 4000 ||
    !(googleDomains.test(url.hostname) || SHORT_HOSTS.has(url.hostname)) ||
    (url.hostname === "goo.gl" && !url.pathname.startsWith("/maps/")) ||
    (googleDomains.test(url.hostname) && url.hostname !== "maps.google.com" && !url.pathname.startsWith("/maps"))) {
    throw new Error("استخدم رابط خرائط Google الآمن فقط، وليس رابط موقع آخر.");
  }
  return url;
}

function point(latitude: string, longitude: string) {
  const lat = Number(latitude), lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}

export function extractGoogleMapsPoint(url: URL) {
  const decoded = decodeURIComponent(url.href);
  // Place coordinates take precedence over @lat,lng (the camera's centre).
  const pins = [...decoded.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)];
  if (pins.length) {
    const points = pins.map(match => point(match[1], match[2])).filter(x => x !== null);
    if (points.length !== pins.length) return null;
    const unique = new Set(points.map(p => `${p.latitude},${p.longitude}`));
    if (unique.size === 1) return points[0];
    return null; // Directions or several places must not silently choose the wrong property.
  }
  for (const key of ["q", "query", "destination"]) {
    const value = url.searchParams.get(key)?.trim();
    const match = value?.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (match) return point(match[1], match[2]);
  }
  const pathPin = decoded.match(/\/maps\/(?:place|search)\/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:\/|$|\?)/);
  return pathPin ? point(pathPin[1], pathPin[2]) : null;
}

export async function resolveGoogleMapsPoint(input: string, fetcher: typeof fetch = fetch) {
  let url = safeGoogleMapsUrl(input);
  const signal = AbortSignal.timeout(8000);
  for (let hop = 0; hop < 5; hop++) {
    let coordinates;
    try { coordinates = extractGoogleMapsPoint(url); }
    catch { throw new Error("رابط الخرائط يحتوي على ترميز غير صالح."); }
    if (coordinates) return { ...coordinates, sourceUrl: url.href };
    if (!SHORT_HOSTS.has(url.hostname)) break;
    const response = await fetcher(url.href, {
      method: "GET", redirect: "manual", signal, headers: { Accept: "text/html" },
    });
    await response.body?.cancel();
    const location = response.headers.get("location");
    if (![301, 302, 303, 307, 308].includes(response.status) || !location) break;
    // Every hop is checked, including redirects from trusted Google short links.
    url = safeGoogleMapsUrl(new URL(location, url).href);
  }
  throw new Error("لم نجد نقطة عقار دقيقة في الرابط. ضع دبوسًا على الموقع ثم انسخ رابط المشاركة، أو استخدم الإدخال اليدوي. رابط منطقة البحث أو مركز عرض الخريطة لا يكفي.");
}
