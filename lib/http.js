'use strict';

/** Helpers compartidos por todas las Serverless Functions. */

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

/**
 * Maneja el preflight de CORS y devuelve `true` si la petición ya fue resuelta.
 */
function handleCors(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

/**
 * Devuelve `true` (y responde 405) si el método no es el esperado.
 */
function rejectMethod(req, res, allowed) {
  if (allowed.includes(req.method)) return false;
  res.setHeader('Allow', allowed.join(', '));
  json(res, 405, {
    ok: false,
    mensaje: `Método no permitido. Usa: ${allowed.join(', ')}.`,
  });
  return true;
}

/**
 * Obtiene el body JSON. `@vercel/node` ya lo deja parseado en `req.body`,
 * pero se mantiene un fallback para poder probar los handlers con Node local.
 */
async function readJsonBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = {
  setCors,
  json,
  handleCors,
  rejectMethod,
  readJsonBody,
};
