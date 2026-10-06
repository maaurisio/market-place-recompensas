import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Premio, RespuestaCanje, Saldos } from '../models/recompensas.model';

@Injectable({ providedIn: 'root' })
export class RecompensasService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  getSaldos(): Observable<Saldos> {
    return this.http.get<Saldos>(`${this.base}/saldos`);
  }

  getPremios(): Observable<Premio[]> {
    return this.http.get<Premio[]>(`${this.base}/premios`);
  }

  canjear(id: string): Observable<RespuestaCanje> {
    return this.http.post<RespuestaCanje>(`${this.base}/canjear`, { id });
  }
}
