import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

const BUCKET = 'client-photos';
const SIGNED_SECONDS = 120;
let pending = new Map();
let flushTimer;

export const recognitionPath = (source) => {
  if (!source) return null;
  try {
    const url = new URL(source);
    const origin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
    const prefix = `/storage/v1/object/public/${BUCKET}/`;
    return url.origin === origin && url.pathname.startsWith(prefix)
      ? decodeURIComponent(url.pathname.slice(prefix.length))
      : null;
  } catch {
    return null;
  }
};

// Avatar renderizzati nello stesso giro condividono una richiesta batch.
const requestSignature = (path) => new Promise((resolve) => {
  const listeners = pending.get(path) || [];
  listeners.push(resolve);
  pending.set(path, listeners);
  if (flushTimer) return;
  flushTimer = window.setTimeout(async () => {
    const batch = pending;
    pending = new Map();
    flushTimer = null;
    const paths = [...batch.keys()];
    for (let start = 0; start < paths.length; start += 100) {
      const slice = paths.slice(start, start + 100);
      let signed = new Map();
      try {
        const { data, error } = await supabase.storage.from(BUCKET)
          .createSignedUrls(slice, SIGNED_SECONDS);
        if (error) throw error;
        signed = new Map((data || []).map((item) => [item.path, item.signedUrl || null]));
      } catch (error) {
        console.warn('Firma foto di riconoscimento non disponibile', error);
      }
      slice.forEach((key) => batch.get(key).forEach((done) => done(signed.get(key) || null)));
    }
  }, 0);
});

export default function StorageImage({ src, ...props }) {
  const path = recognitionPath(src);
  const [signed, setSigned] = useState(null);
  useEffect(() => {
    let active = true;
    let timer;
    setSigned(null);
    if (!path) return undefined;
    const refresh = async () => {
      const url = await requestSignature(path);
      if (!active) return;
      setSigned({ source: src, url });
      timer = window.setTimeout(refresh, 90_000);
    };
    refresh();
    return () => { active = false; window.clearTimeout(timer); };
  }, [path, src]);
  const visibleSource = path ? (signed?.source === src ? signed.url : null) : src;
  return visibleSource ? <img {...props} src={visibleSource} /> : null;
}
