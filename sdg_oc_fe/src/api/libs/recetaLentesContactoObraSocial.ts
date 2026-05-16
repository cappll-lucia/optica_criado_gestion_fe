import { AxiosError } from 'axios';
import { http } from '../http';
import {
    CreateRecetaLentesContactoObraSocialDto,
    RecetaLentesContactoObraSocial,
    UpdateRecetaLentesContactoObraSocialDto,
} from '../entities/recetaLentesContactoObraSocial';

const BASE = '/receta-lentes-contacto-obra-social';

const getAll = async (params?: { idRecetaLentesContacto?: number; idObraSocial?: number }) => {
    try {
        const resp = await http.get(BASE, { params });
        return resp.data.data as RecetaLentesContactoObraSocial[];
    } catch (error) {
        throw error instanceof AxiosError
            ? new Error(error?.response?.data?.message)
            : new Error('Algo salió mal');
    }
};

const getOne = async (_id: number) => {
    try {
        const resp = await http.get(`${BASE}/${_id}`);
        return resp.data.data as RecetaLentesContactoObraSocial;
    } catch (error) {
        throw error instanceof AxiosError
            ? new Error(error?.response?.data?.message)
            : new Error('Algo salió mal');
    }
};

const create = async (_dto: CreateRecetaLentesContactoObraSocialDto) => {
    try {
        const resp = await http.post(BASE, _dto);
        return resp.data.data as RecetaLentesContactoObraSocial;
    } catch (error) {
        throw error instanceof AxiosError
            ? new Error(error?.response?.data?.message)
            : new Error('Algo salió mal');
    }
};

const update = async (_id: number, _dto: UpdateRecetaLentesContactoObraSocialDto) => {
    try {
        const resp = await http.patch(`${BASE}/${_id}`, _dto);
        return resp.data.data as RecetaLentesContactoObraSocial;
    } catch (error) {
        throw error instanceof AxiosError
            ? new Error(error?.response?.data?.message)
            : new Error('Algo salió mal');
    }
};

const remove = async (_id: number) => {
    try {
        await http.delete(`${BASE}/${_id}`);
    } catch (error) {
        throw error instanceof AxiosError
            ? new Error(error?.response?.data?.message)
            : new Error('Algo salió mal');
    }
};

export const recetaLentesContactoObraSocialApi = {
    getAll: (params?: { idRecetaLentesContacto?: number; idObraSocial?: number }) => getAll(params),
    getOne: (_id: number) => getOne(_id),
    create: (_dto: CreateRecetaLentesContactoObraSocialDto) => create(_dto),
    update: (_id: number, _dto: UpdateRecetaLentesContactoObraSocialDto) => update(_id, _dto),
    remove: (_id: number) => remove(_id),
};
