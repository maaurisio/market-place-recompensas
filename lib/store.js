'use strict';

/**
 * Base de datos simulada en memoria.
 *
 * En Vercel cada Serverless Function vive en un proceso aislado, por lo que el
 * estado se guarda en `globalThis` para que persista entre invocaciones "calientes"
 * de la MISMA instancia. Al ser un mini-proyecto de demo, no hay persistencia real:
 * cada reinicio de la instancia vuelve a los valores iniciales.
 */

const SALDOS_INICIALES = Object.freeze({
  puntosGanados: 145000,
  puntosDisponibles: 48500,
  puntosCongelados: 12000,
});

const PREMIOS = Object.freeze([
  {
    id: 'pasaje-panama',
    titulo: 'Pasaje aéreo a Panamá',
    descripcion: 'Ida y vuelta a la Ciudad de Panamá, aeropuerto Tocumen.',
    categoria: 'Pasajes',
    costo: 18000,
    imagen: 'https://picsum.photos/seed/panama-flight/640/400',
  },
  {
    id: 'pasaje-colombia',
    titulo: 'Pasaje aéreo a Colombia',
    descripcion: 'Ida y vuelta a Bogotá, aeropuerto El Dorado.',
    categoria: 'Pasajes',
    costo: 25000,
    imagen: 'https://picsum.photos/seed/colombia-flight/640/400',
  },
  {
    id: 'pasaje-usa',
    titulo: 'Pasaje aéreo a Estados Unidos',
    descripcion: 'Ida y vuelta a Miami, aeropuerto MIA.',
    categoria: 'Pasajes',
    costo: 65000,
    imagen: 'https://picsum.photos/seed/usa-flight/640/400',
  },
  {
    id: 'giftcard-25',
    titulo: 'Gift Card USD 25',
    descripcion: 'Tarjeta de regalo canjeable en tiendas aliadas.',
    categoria: 'Gift Cards',
    costo: 5000,
    imagen: 'https://picsum.photos/seed/giftcard25/640/400',
  },
  {
    id: 'giftcard-50',
    titulo: 'Gift Card USD 50',
    descripcion: 'Tarjeta de regalo canjeable en tiendas aliadas.',
    categoria: 'Gift Cards',
    costo: 9500,
    imagen: 'https://picsum.photos/seed/giftcard50/640/400',
  },
  {
    id: 'giftcard-100',
    titulo: 'Gift Card USD 100',
    descripcion: 'Tarjeta de regalo canjeable en tiendas aliadas.',
    categoria: 'Gift Cards',
    costo: 17500,
    imagen: 'https://picsum.photos/seed/giftcard100/640/400',
  },
  {
    id: 'hotel-3n',
    titulo: 'Hotel 3 noches + desayuno',
    descripcion: 'Estancia para dos personas en hotel 4 estrellas.',
    categoria: 'Experiencias',
    costo: 42000,
    imagen: 'https://picsum.photos/seed/hotel-stay/640/400',
  },
  {
    id: 'gadget-audifonos',
    titulo: 'Audífonos Bluetooth Premium',
    descripcion: 'Cancelación de ruido activa y 30h de batería.',
    categoria: 'Tecnología',
    costo: 32000,
    imagen: 'https://picsum.photos/seed/headphones/640/400',
  },
]);

const CLAVE = '__clubDePuntosDB__';

function getDb() {
  if (!globalThis[CLAVE]) {
    globalThis[CLAVE] = {
      saldos: { ...SALDOS_INICIALES },
      canjes: [],
    };
  }
  return globalThis[CLAVE];
}

function getSaldos() {
  return { ...getDb().saldos };
}

function getPremios() {
  return PREMIOS.map((premio) => ({ ...premio }));
}

function findPremio(id) {
  if (typeof id !== 'string') return undefined;
  return PREMIOS.find((premio) => premio.id === id);
}

/**
 * Simula la pre-autorización de un canje:
 * resta los puntos disponibles y los mueve a "congelados".
 */
function canjear(premio) {
  const db = getDb();

  if (db.saldos.puntosDisponibles < premio.costo) {
    return { ok: false, motivo: 'puntos-insuficientes', saldos: getSaldos() };
  }

  db.saldos.puntosDisponibles -= premio.costo;
  db.saldos.puntosCongelados += premio.costo;
  db.canjes.push({
    premioId: premio.id,
    costo: premio.costo,
    fecha: new Date().toISOString(),
  });

  return { ok: true, saldos: getSaldos() };
}

module.exports = {
  SALDOS_INICIALES,
  getDb,
  getSaldos,
  getPremios,
  findPremio,
  canjear,
};
