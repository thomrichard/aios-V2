/* Optional shared secret. When you start the OS with SM4RT_TOKEN set, the server puts the
   token in this page's <meta name="sm4rt-token"> and this adds it as the x-sm4rt-token header
   to every request this page makes to the OS. Without SM4RT_TOKEN it does nothing. */
(() => {
  const meta = document.querySelector('meta[name="sm4rt-token"]');
  let token = meta && meta.getAttribute('content');
  if (!token) { try { if (parent !== window) token = parent.__sm4rtToken; } catch (_) { } }
  if (!token || !window.fetch) return;
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, options = {}) => {
    const url = new URL(String((input && input.url) || input), location.href);
    if (url.origin !== location.origin) return realFetch(input, options);
    const headers = new Headers(options.headers || (input && input.headers) || {});
    headers.set('x-sm4rt-token', token);
    return realFetch(input, { ...options, headers });
  };
  /* the Second Brain's frames are on the same page origin: hand them the token too */
  window.__sm4rtToken = token;
})();
