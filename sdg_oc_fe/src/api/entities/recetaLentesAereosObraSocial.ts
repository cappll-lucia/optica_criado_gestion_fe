import type { BaseEntity } from './entities';
import type { ObraSocial } from './obraSocial';
import type { RecetasAereos } from './recetasAereos';

export interface RecetaLentesAereosObraSocial extends BaseEntity {
    deletedAt: string | null;
    recetaLentesAereos?: RecetasAereos;
    obraSocial?: ObraSocial;
    recetaLentesAereosId?: number;
    obraSocialId?: number;
}

export interface CreateRecetaLentesAereosObraSocialDto {
    recetaLentesAereos: { id: number };
    obraSocial: { id: number };
}

export interface UpdateRecetaLentesAereosObraSocialDto {
    recetaLentesAereos?: { id: number };
    obraSocial?: { id: number };
}
