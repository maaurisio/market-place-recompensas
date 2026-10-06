export interface Saldos {
  puntosGanados: number;
  puntosDisponibles: number;
  puntosCongelados: number;
}

export interface Premio {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  costo: number;
  imagen: string;
}

export interface RespuestaCanje {
  ok: boolean;
  mensaje: string;
  premio?: { id: string; titulo: string; costo: number };
  premioId?: string;
  costo?: number;
  saldos: Saldos;
}

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  tipo: TipoToast;
  mensaje: string;
}
