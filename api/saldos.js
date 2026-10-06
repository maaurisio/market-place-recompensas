'use strict';

const { json, handleCors, rejectMethod } = require('../lib/http');
const { getSaldos } = require('../lib/store');

/**
 * GET /api/saldos
 * Estado de cuenta del usuario.
 */
module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (rejectMethod(req, res, ['GET'])) return;

  return json(res, 200, getSaldos());
};
