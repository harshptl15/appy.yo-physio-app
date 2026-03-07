const resolveApiUrl = (url) => {
  if (!url || /^https?:\/\//i.test(url)) return url;

  const configuredOrigin = import.meta.env.VITE_API_ORIGIN;
  if (configuredOrigin) {
    return new URL(url, configuredOrigin).toString();
  }

  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return new URL(url, 'http://localhost:3000').toString();
  }

  return url;
};

export async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.toLowerCase().includes('application/json');

  if (isJson) {
    const data = await response.json();
    return { data, contentType, isJson: true };
  }

  const text = await response.text();
  return {
    data: null,
    contentType,
    isJson: false,
    text
  };
}

export async function fetchJson(url, options = {}) {
  const resolvedUrl = resolveApiUrl(url);
  let response;

  try {
    response = await fetch(resolvedUrl, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw new Error(
      `Network request failed for ${resolvedUrl}. Check that backend is running and reachable.`
    );
  }

  const parsed = await parseJsonResponse(response);

  if (!response.ok) {
    if (parsed.isJson) {
      throw new Error(parsed.data?.error || `Request failed with status ${response.status}.`);
    }

    const snippet = (parsed.text || '').replace(/\s+/g, ' ').slice(0, 140);
    throw new Error(
      snippet
        ? `Request failed (${response.status}) with non-JSON response: ${snippet}`
        : `Request failed (${response.status}) with non-JSON response.`
    );
  }

  if (!parsed.isJson) {
    throw new Error('Expected JSON response but received non-JSON content.');
  }

  return parsed.data;
}
