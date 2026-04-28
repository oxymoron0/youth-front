import { env } from '../env';

const SDK_URL_BASE = 'https://oapi.map.naver.com/openapi/v3/maps.js';

let loadPromise: Promise<typeof naver> | null = null;

export function loadNaverScript(): Promise<typeof naver> {
  if (loadPromise) return loadPromise;

  if (window.naver?.maps) {
    loadPromise = Promise.resolve(window.naver);
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const clientId = env('VITE_NAVER_MAPS_CLIENT_ID');
    if (!clientId) {
      loadPromise = null;
      reject(new Error('VITE_NAVER_MAPS_CLIENT_ID is not configured'));
      return;
    }

    window.navermap_authFailure = () => {
      console.error(
        '[naver-maps] auth failure — verify ncpKeyId and Web service URL whitelist in NCP console',
      );
    };

    const script = document.createElement('script');
    script.src = `${SDK_URL_BASE}?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.async = true;
    script.onload = () => {
      if (window.naver?.maps) {
        resolve(window.naver);
      } else {
        loadPromise = null;
        reject(new Error('Naver Maps SDK loaded but naver.maps is unavailable'));
      }
    };
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Naver Maps SDK script'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
