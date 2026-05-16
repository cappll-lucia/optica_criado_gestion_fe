import { Cliente } from './clientes';
import type {BaseEntity} from  './entities';
import { DetalleRecetaAereos, NewDetalleType } from './detalleRecetaAereos';
import { fechaValidator } from '@/lib/utils';

export enum TipoReceta {
  Cerca = 'Cerca',
  Lejos = 'Lejos',
  Multifocal = 'Multifocal',
  Bifocal = 'Bifocal'
}


export enum TipoCristal{
  Organico = 'Orgánico',
  Mineral = 'Mineral',
  Futurex = 'Futurex',
  Policarbonato = 'Policarbonato',
  Trivex = 'Trivex'
}

export enum ColorCristal{
  Blanco = 'Blanco',
  Gris = 'Gris',
  Organico_Fotogromatico = 'Organico Fotogromatico',
  Photobrown = 'Photobrown',
  Photogray = 'Photogray',
  Sepia50 = 'Sepia50',
  Tenido_Degrade = 'Tenido Degrade',
}

export enum TratamientoCristal{
  Sin_Tratamiento='Sin Tratamiento',
  Antireflejo = 'Antireflejo',
  Filtro_Azul='Filtro Azul'
}


export interface RecetasAereos extends BaseEntity{
    fecha: Date;
    tipoReceta: TipoReceta;
    oftalmologo:string;
    cristal:TipoCristal;
    color:ColorCristal;
    tratamiento:TratamientoCristal;
    armazon:string;
    cliente: Cliente;
    observaciones: string,
    detallesRecetaLentesAereos: DetalleRecetaAereos[],
    precioArmazon?: number;
    precioCristales?: number;
    senia?: number;
    dnp?: number;
    od_alt_pelicula?: number;
    oi_alt_pelicula?: number;
}


export const createRecetaAereosCustomValidator = (_newReceta: {
    tipoReceta: TipoReceta, 
    oftalmologo:undefined | string,
    cristal:undefined | TipoCristal,
    color:undefined | ColorCristal,
    tratamiento:undefined | TratamientoCristal,
    armazon:undefined | string,
    observaciones:undefined | string,
    cliente: { id: undefined | number }
  }, 
  _fecha : {
    day: string,
    month: string,
    year: string,
  }) =>{
    const isValid = {
      tipoReceta: Object.keys(TipoReceta).includes(_newReceta.tipoReceta),
      fecha: fechaValidator.safeParse(_fecha).success,
      cliente: Boolean(_newReceta.cliente.id)
    };
    const success = Object.values(isValid).every(Boolean);
    return {success, isValid};
  }

  export const editRecetaAereosCustomValidator = (_newReceta:RecetasAereos | undefined, _fecha : {  day: string,  month: string,  year: string,}) =>{
    const isValid = {
      tipoReceta: _newReceta ? Object.keys(TipoReceta).includes(_newReceta.tipoReceta) : false,
      fecha: fechaValidator.safeParse(_fecha).success,
      cliente: _newReceta ? Boolean(_newReceta.cliente.id) : false,
    };
    const success = Object.values(isValid).every(Boolean);
    return {success, isValid};
  }

export type NewRecetaType = {
   tipoReceta: TipoReceta,
    oftalmologo:undefined | string,
    cristal:undefined | TipoCristal,
    color:undefined | ColorCristal,
    tratamiento:undefined | TratamientoCristal,
    armazon:undefined | string,
    observaciones:undefined | string,
    fecha: Date | undefined,
    cliente: { id: undefined | number }
    detallesRecetaLentesAereos: Array<NewDetalleType>
    obrasSociales?: Array<{ id: number }>
    precioArmazon: number | undefined,
    precioCristales: number | undefined,
    senia: number | undefined,
    dnp: number | undefined,
    od_alt_pelicula: number | undefined,
    oi_alt_pelicula: number | undefined,
}
export type EditedRecetaType = {
  id: number,
  tipoReceta: TipoReceta,
  oftalmologo:undefined | string,
  cristal:undefined | TipoCristal,
  color:undefined | ColorCristal,
  tratamiento:undefined | TratamientoCristal,
  armazon:undefined | string,
  observaciones:undefined | string,
  fecha: Date | undefined,
  cliente: { id: undefined | number }
  detallesRecetaLentesAereos: Array<NewDetalleType>
  precioArmazon?: number,
  precioCristales?: number,
  senia?: number,
  dnp?: number,
  od_alt_pelicula?: number,
  oi_alt_pelicula?: number,
}