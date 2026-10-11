import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node's strip-types test runner requires the source extension.
import { safeGoogleMapsUrl, extractGoogleMapsPoint, resolveGoogleMapsPoint } from "./googleMaps.ts";

test("extracts the place pin instead of the viewport", () => {
  assert.deepEqual(extractGoogleMapsPoint(safeGoogleMapsUrl("https://www.google.com/maps/place/example/@20,30,15z/data=!4m2!3m1!3d21.4225!4d39.8262")), {latitude:21.4225,longitude:39.8262});
});
test("coordinate queries and negative coordinates work", () => {
  assert.deepEqual(extractGoogleMapsPoint(safeGoogleMapsUrl("https://www.google.com/maps/search/?api=1&query=-33.9,151.2")), {latitude:-33.9,longitude:151.2});
});
test("viewport-only, directions, out-of-range and ambiguous links are not property pins", () => {
  for (const value of [
    "https://www.google.com/maps/@21.42,39.82,13z",
    "https://www.google.com/maps/place/x/data=!3d21!4d39!3d22!4d40",
    "https://www.google.com/maps?q=91,30",
  ]) assert.equal(extractGoogleMapsPoint(safeGoogleMapsUrl(value)), null);
});
test("rejects hosts, credentials, ports and non-HTTPS before network access", () => {
  for (const value of ["http://maps.app.goo.gl/x", "https://google.com.evil.test/maps", "https://127.0.0.1/maps", "https://www.google.com:8443/maps", "https://u:p@google.com/maps", "https://google.com/url?q=x"]) {
    assert.throws(() => safeGoogleMapsUrl(value));
  }
});
test("short sharing link follows validated redirects", async () => {
  const result = await resolveGoogleMapsPoint("https://maps.app.goo.gl/abc", (async () => new Response(null, {status:302,headers:{location:"https://www.google.com/maps?q=21.4225,39.8262"}})) as typeof fetch);
  assert.equal(result.latitude,21.4225);
});
test("short link cannot redirect to internal or third-party hosts", async () => {
  await assert.rejects(resolveGoogleMapsPoint("https://maps.app.goo.gl/abc", (async () => new Response(null,{status:302,headers:{location:"http://127.0.0.1/private"}})) as typeof fetch));
});
