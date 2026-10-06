'use strict';

const { json, handleCors, rejectMethod, readJsonBody } = require('../lib/http');
const { findPremio, canjear, getSaldos } = require('../lib/store');

/**
 * POST /api/canjear
 * Body: { "id": "<id-del-premio>" }
 *
 * Valida que los puntos disponibles cubran el costo. Si es exitoso, resta el costo
 * de `puntosDisponibles`, lo suma a `puntosCongelados` (pre-autorización) y
 * devuelve el nuevo saldo. Si no alcanzan, responde HTTP 400.
 */
module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (rejectMethod(req, res, ['POST'])) return;

  const body = await readJsonBody(req);
  const id = body && body.id;

  if (!id || typeof id !== 'string') {
    return json(res, 400, {
      ok: false,
      mensaje: 'Debes indicar el id del premio a canjear.',
      saldos: getSaldos(),
    });
  }

  const premio = findPremio(id);
  if (!premio) {
    return json(res, 404, {
      ok: false,
      mensaje: 'El premio solicitado no existe en el catálogo.',
      saldos: getSaldos(),
    });
  }

  const resultado = canjear(premio);

  if (!resultado.ok) {
    return json(res, 400, {
      ok: false,
      mensaje: `No tienes puntos suficientes para "${premio.titulo}". Necesitas ${premio.costo.toLocaleString('es')} pts.`,
      premioId: premio.id,
      costo: premio.costo,
      saldos: resultado.saldos,
    });
  }

  return json(res, 200, {
    ok: true,
    mensaje: `¡Canje exitoso! "${premio.titulo}" está en proceso de entrega.`,
    premio: { id: premio.id, titulo: premio.titulo, costo: premio.costo },
    saldos: resultado.saldos,
  });
};
