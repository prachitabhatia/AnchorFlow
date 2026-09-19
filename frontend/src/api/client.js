const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
export const PASSCODE_STORAGE_KEY = 'anchorflow_organizer_passcode';

/**
 * Custom error class for API requests.
 */
export class ApiClientError extends Error {
  constructor({ status, code, message, details = null }) {
    super(message || 'An API error occurred');
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code || 'UNKNOWN_ERROR';
    this.details = details;
  }
}

/**
 * Full API fetch client with error envelope parsing & passcode support.
 */
export async function apiFetch(path, { method = 'GET', body, organizer = true, headers = {} } = {}) {
  const url = `${BASE_URL}${path}`;
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (organizer) {
    const storedPasscode = localStorage.getItem(PASSCODE_STORAGE_KEY) || '';
    requestHeaders['x-organizer-passcode'] = storedPasscode;
  }

  const fetchOptions = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (netErr) {
    throw new ApiClientError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: `Cannot reach backend at ${BASE_URL}. Please check your connection or server status.`,
      details: netErr.message,
    });
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    let errorEnvelope = null;
    try {
      errorEnvelope = await response.json();
    } catch {
      // Body is not JSON
    }

    if (errorEnvelope && errorEnvelope.error && typeof errorEnvelope.error === 'object') {
      const { code, message, details } = errorEnvelope.error;
      throw new ApiClientError({
        status: response.status,
        code,
        message,
        details: details ?? null,
      });
    }

    throw new ApiClientError({
      status: response.status,
      code: 'HTTP_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
      details: errorEnvelope,
    });
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}
