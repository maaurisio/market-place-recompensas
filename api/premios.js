'use strict';

const { json, handleCors, rejectMethod } = require('../lib/http');
const { getPremios } = require('../lib/store');

/**
 * GET /api/premios
 * Catálogo de premios del marketplace.
 */
module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  if (rejectMethod(req, res, ['GET'])) return;

  return json(res, 200, getPremios());
};
