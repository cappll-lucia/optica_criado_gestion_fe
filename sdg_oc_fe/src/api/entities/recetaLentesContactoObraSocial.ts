import type { BaseEntity } from './entities';
import type { ObraSocial } from './obraSocial';
import type { RecetaContacto } from './recetasContacto';

export interface RecetaLentesContactoObraSocial extends BaseEntity {
    deletedAt: string | null;
    recetaLentesContacto?: RecetaContacto;
    obraSocial?: ObraSocial;
    recetaLentesContactoId?: number;
    obraSocialId?: number;
}

export interface CreateRecetaLentesContactoObraSocialDto {
    recetaLentesContacto: { id: number };
    obraSocial: { id: number };
}

export interface UpdateRecetaLentesContactoObraSocialDto {
    recetaLentesContacto?: { id: number };
    obraSocial?: { id: number };
}
