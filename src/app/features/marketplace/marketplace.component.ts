import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';
import { Premio, Saldos, Toast } from '../../core/models/recompensas.model';
import { RecompensasService } from '../../core/services/recompensas.service';

@Component({
  selector: 'app-marketplace',
  imports: [DecimalPipe],
  templateUrl: './marketplace.component.html',
})
export class MarketplaceComponent implements OnInit {
  private readonly servicio = inject(RecompensasService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly saldos = signal<Saldos | null>(null);
  protected readonly premios = signal<Premio[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly procesandoId = signal<string | null>(null);
  protected readonly toast = signal<Toast | null>(null);

  protected readonly disponibles = computed(() => this.saldos()?.puntosDisponibles ?? 0);

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.servicio
      .getSaldos()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saldos) => this.saldos.set(saldos),
        error: () => this.mostrarToast('error', 'No fue posible obtener tus saldos.'),
      });

    this.servicio
      .getPremios()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (premios) => {
          this.premios.set(premios);
          this.cargando.set(false);
        },
        error: (err) => {
          this.cargando.set(false);
          this.errorCarga.set(
            err?.error?.mensaje ?? 'No fue posible cargar el catálogo de premios.',
          );
        },
      });
  }

  protected canjear(premio: Premio): void {
    if (this.procesandoId()) return;

    this.procesandoId.set(premio.id);

    this.servicio
      .canjear(premio.id)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.saldos.set(respuesta.saldos);
          this.procesandoId.set(null);
          this.mostrarToast('exito', respuesta.mensaje);
        },
        error: (err) => {
          const mensaje =
            err?.error?.mensaje ?? 'No fue posible procesar el canje. Intenta de nuevo.';
          if (err?.error?.saldos) {
            this.saldos.set(err.error.saldos);
          }
          this.procesandoId.set(null);
          this.mostrarToast('error', mensaje);
        },
      });
  }

  protected alcanzanPuntos(premio: Premio): boolean {
    return this.disponibles() >= premio.costo;
  }

  protected estaProcesando(premio: Premio): boolean {
    return this.procesandoId() === premio.id;
  }

  protected claseBoton(premio: Premio): string {
    const base =
      'rounded-xl px-4 py-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed';

    if (!this.alcanzanPuntos(premio)) {
      return `${base} bg-slate-100 text-slate-400`;
    }
    if (this.estaProcesando(premio)) {
      return `${base} bg-indigo-400 text-white`;
    }
    return `${base} bg-indigo-600 text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-700`;
  }

  protected claseToast(notificacion: Toast): string {
    const base =
      'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl px-4 py-3.5 shadow-2xl ring-1 ring-black/5';
    return notificacion.tipo === 'exito'
      ? `${base} bg-emerald-600 text-white`
      : `${base} bg-rose-600 text-white`;
  }

  protected cerrarToast(): void {
    this.toast.set(null);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  private mostrarToast(tipo: Toast['tipo'], mensaje: string): void {
    this.toast.set({ tipo, mensaje });
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => this.cerrarToast(), 5000);
  }
}
