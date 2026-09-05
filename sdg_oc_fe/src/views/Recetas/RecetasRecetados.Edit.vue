<script setup lang="ts">
import { editDetalleAereosCustomValidator } from '@/api/entities/detalleRecetaAereos';
import { ColorCristal, RecetasAereos, TipoCristal, TipoReceta, TratamientoCristal, editRecetaAereosCustomValidator } from '@/api/entities/recetasAereos';
import { recetasApi } from '@/api/libs/recetas';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { previousRoute, router } from '@/router';
import { AsteriskIcon, PlusCircleIcon, GlassesIcon } from 'lucide-vue-next';
import { SlashIcon, Cross2Icon } from '@radix-icons/vue';
import { computed, onMounted, ref } from 'vue';
import { Cliente } from '@/api/entities/clientes';
import { clientesApi } from '@/api/libs/clientes';
import { RecetaLentesAereosObraSocial } from '@/api/entities/recetaLentesAereosObraSocial';
import { recetaLentesAereosObraSocialApi } from '@/api/libs/recetaLentesAereosObraSocial';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import AddObraSocialClienteForm from '@/components/AddObraSocialCliente.Form.vue';
import AlertError from '@/components/AlertError.vue';
import { useRoute } from 'vue-router';
import { toast } from '@/components/ui/toast';
import { useLoaderStore } from '@/stores/LoaderStore';

const route = useRoute();
const loader = useLoaderStore();

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

const currentReceta = ref<RecetasAereos>()
const clienteForOS = ref<Cliente>();
const currentObrasSociales = ref<RecetaLentesAereosObraSocial[]>([]);
const openNewClienteOS = ref<boolean>(false);
const obraSocialSelectOpen = ref<boolean>(false);
const obraSocialSelectValue = ref<string | undefined>(undefined);
const obraSocialSelectKey = ref(0);

const availableObrasSociales = computed(() =>
    clienteForOS.value?.clienteObrasSociales?.filter(cos =>
        !currentObrasSociales.value.some(a => a.obraSocialId === cos.obraSocial.id || a.obraSocial?.id === cos.obraSocial.id)
    ) ?? []
);

const addObraSocial = async (id: string) => {
    if (!currentReceta.value || !id) return;
    try {
        const created = await recetaLentesAereosObraSocialApi.create({
            recetaLentesAereos: { id: currentReceta.value.id },
            obraSocial: { id: Number(id) },
        });
        currentObrasSociales.value.push(created);
    } catch (err: any) {
        errorMessage.value = err.message;
        showError.value = true;
    }
    obraSocialSelectValue.value = undefined;
};

const removeObraSocial = async (asociacionId: number) => {
    try {
        await recetaLentesAereosObraSocialApi.remove(asociacionId);
        const idx = currentObrasSociales.value.findIndex(a => a.id === asociacionId);
        if (idx !== -1) currentObrasSociales.value.splice(idx, 1);
    } catch (err: any) {
        errorMessage.value = err.message;
        showError.value = true;
    }
    obraSocialSelectValue.value = undefined;
    obraSocialSelectKey.value++;
};

const handleShowNewObraSocialCliente = () => {
    obraSocialSelectOpen.value = false;
    openNewClienteOS.value = true;
};

const handleAddObraSocialCliente = async (obraSocialId: number) => {
    if (clienteForOS.value?.id) {
        clienteForOS.value = await clientesApi.getOne(clienteForOS.value.id);
        await addObraSocial(String(obraSocialId));
        openNewClienteOS.value = false;
    }
};

const currentDetalleCerca = ref<{
    tipo_detalle: TipoReceta,
    od_esferico: number | undefined,
    od_cilindrico: number | undefined,
    od_grados: number | undefined,
    oi_esferico: number | undefined,
    oi_cilindrico: number | undefined,
    oi_grados: number | undefined,
}>({
    tipo_detalle: TipoReceta.Cerca,
    od_esferico: undefined,
    od_cilindrico: undefined,
    od_grados: undefined,
    oi_esferico: undefined,
    oi_cilindrico: undefined,
    oi_grados: undefined,
})

const currentDetalleLejos = ref<{
    tipo_detalle: TipoReceta,
    od_esferico: number | undefined,
    od_cilindrico: number | undefined,
    od_grados: number | undefined,
    oi_esferico: number | undefined,
    oi_cilindrico: number | undefined,
    oi_grados: number | undefined,
}>({
    tipo_detalle: TipoReceta.Lejos,
    od_esferico: undefined,
    od_cilindrico: undefined,
    od_grados: undefined,
    oi_esferico: undefined,
    oi_cilindrico: undefined,
    oi_grados: undefined,
})

const isValidReceta = ref<{
    tipoReceta: boolean,
    fecha: boolean,
    cliente: boolean,
    dnp: boolean,
    precioArmazon: boolean,
    precioCristales: boolean,
    senia: boolean,
    od_alt_pelicula: boolean,
    oi_alt_pelicula: boolean,
}>({
    tipoReceta: true,
    fecha: true,
    cliente: true,
    dnp: true,
    precioArmazon: true,
    precioCristales: true,
    senia: true,
    od_alt_pelicula: true,
    oi_alt_pelicula: true,
})

const isValidDetalleCerca = ref<{
    tipo_detalle: boolean,
    od_esferico: boolean,
    od_cilindrico: boolean,
    od_grados: boolean,
    oi_esferico: boolean,
    oi_cilindrico: boolean,
    oi_grados: boolean,
}>({
    tipo_detalle: true,
    od_esferico: true,
    od_cilindrico: true,
    od_grados: true,
    oi_esferico: true,
    oi_cilindrico: true,
    oi_grados: true,
})

const isValidDetalleLejos = ref<{
    tipo_detalle: boolean,
    od_esferico: boolean,
    od_cilindrico: boolean,
    od_grados: boolean,
    oi_esferico: boolean,
    oi_cilindrico: boolean,
    oi_grados: boolean,
}>({
    tipo_detalle: true,
    od_esferico: true,
    od_cilindrico: true,
    od_grados: true,
    oi_esferico: true,
    oi_cilindrico: true,
    oi_grados: true,
})

const fechaReceta = ref({
    day: '',
    month: '',
    year: '',
})

onMounted(async () => {
    try {
        loader.show();
        currentReceta.value = await recetasApi.getOneAereos(Number(route.params.id));
        let detalleCerca, detalleLejos
        switch (currentReceta.value.tipoReceta) {
            case TipoReceta.Cerca:
                detalleCerca = currentReceta.value.detallesRecetaLentesAereos.find(d => d.tipo_detalle == TipoReceta.Cerca)
                if (detalleCerca) currentDetalleCerca.value = detalleCerca
                break;
            case TipoReceta.Lejos:
                detalleLejos = currentReceta.value.detallesRecetaLentesAereos.find(d => d.tipo_detalle == TipoReceta.Lejos)
                if (detalleLejos) currentDetalleLejos.value = detalleLejos
                break;
            case TipoReceta.Multifocal:
                detalleCerca = currentReceta.value.detallesRecetaLentesAereos.find(d => d.tipo_detalle == TipoReceta.Cerca)
                if (detalleCerca) currentDetalleCerca.value = detalleCerca
                detalleLejos = currentReceta.value.detallesRecetaLentesAereos.find(d => d.tipo_detalle == TipoReceta.Lejos)
                if (detalleLejos) currentDetalleLejos.value = detalleLejos
                break;
            case TipoReceta.Bifocal:
                detalleCerca = currentReceta.value.detallesRecetaLentesAereos.find(d => d.tipo_detalle == TipoReceta.Cerca)
                if (detalleCerca) currentDetalleCerca.value = detalleCerca
                detalleLejos = currentReceta.value.detallesRecetaLentesAereos.find(d => d.tipo_detalle == TipoReceta.Lejos)
                if (detalleLejos) currentDetalleLejos.value = detalleLejos
                break;
        }
        fechaReceta.value.day = currentReceta.value.fecha.getDate().toString()
        fechaReceta.value.month = (currentReceta.value.fecha.getMonth() + 1).toString()
        fechaReceta.value.year = currentReceta.value.fecha.getFullYear().toString()
        const [obrasSociales, clienteFetched] = await Promise.all([
            recetaLentesAereosObraSocialApi.getAll({ idRecetaLentesAereos: currentReceta.value.id }),
            clientesApi.getOne(currentReceta.value.cliente.id),
        ]);
        currentObrasSociales.value = obrasSociales;
        clienteForOS.value = clienteFetched;
        loader.hide();
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    }
})

const onSubmit = async () => {
    if (!currentReceta.value) return
    try {
        loader.show();
        let editedRecetaObj
        switch (currentReceta.value.tipoReceta) {
            case TipoReceta.Lejos:
                editedRecetaObj = { ...currentReceta.value, detallesRecetaLentesAereos: [currentDetalleLejos.value] }
                break;
            case TipoReceta.Cerca:
                editedRecetaObj = { ...currentReceta.value, detallesRecetaLentesAereos: [currentDetalleCerca.value] }
                break;
            case TipoReceta.Multifocal:
                editedRecetaObj = { ...currentReceta.value, detallesRecetaLentesAereos: [currentDetalleCerca.value, currentDetalleLejos.value] }
                break;
            case TipoReceta.Bifocal:
                editedRecetaObj = { ...currentReceta.value, detallesRecetaLentesAereos: [currentDetalleCerca.value, currentDetalleLejos.value] }
                break;
        }
        editedRecetaObj.fecha = new Date(parseInt(fechaReceta.value.year), parseInt(fechaReceta.value.month) - 1, parseInt(fechaReceta.value.day))
        await recetasApi.editRecetaAereos(editedRecetaObj)
        loader.hide();
        toast({ title: 'Receta actualizada con éxito' })
        router.push(`/recetas/${currentReceta.value.cliente.id}?tab=recetados&recetaId=${currentReceta.value.id}`)
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    };
}

const validateAndEdit = async () => {
    loader.show();
    const validDetalle = validateDetalles();
    const resultReceta = editRecetaAereosCustomValidator(currentReceta.value, fechaReceta.value);
    isValidReceta.value = resultReceta.isValid
    if (validDetalle && resultReceta.success) {
        await onSubmit();
    }
    loader.hide();
}

const validateDetalles = () => {
    let resultCerca, resultLejos
    if (!currentReceta.value) return
    switch (currentReceta.value.tipoReceta) {
        case TipoReceta.Cerca:
            resultCerca = editDetalleAereosCustomValidator(currentDetalleCerca.value)
            isValidDetalleCerca.value = resultCerca.isValid
            return resultCerca.success
        case TipoReceta.Lejos:
            resultLejos = editDetalleAereosCustomValidator(currentDetalleLejos.value)
            isValidDetalleLejos.value = resultLejos.isValid
            return resultLejos.success
        case TipoReceta.Multifocal:
            resultLejos = editDetalleAereosCustomValidator(currentDetalleLejos.value)
            isValidDetalleLejos.value = resultLejos.isValid
            resultCerca = editDetalleAereosCustomValidator(currentDetalleCerca.value)
            isValidDetalleCerca.value = resultCerca.isValid
            return resultCerca.success && resultLejos.success
        case TipoReceta.Bifocal:
            resultLejos = editDetalleAereosCustomValidator(currentDetalleLejos.value)
            isValidDetalleLejos.value = resultLejos.isValid
            resultCerca = editDetalleAereosCustomValidator(currentDetalleCerca.value)
            isValidDetalleCerca.value = resultCerca.isValid
            return resultCerca.success && resultLejos.success
    }
}

const nombreCliente = computed(() => currentReceta.value?.cliente.apellido + ", " + currentReceta.value?.cliente.nombre)

const redirectCancel = () => {
    if (previousRoute) {
        router.push(previousRoute);
    } else {
        if (currentReceta.value?.cliente) {
            router.push(`/clientes/dashboard/${currentReceta.value?.cliente.id}`);
        }
    }
}

const showLejos = computed(() =>
    currentReceta.value?.tipoReceta === TipoReceta.Lejos ||
    currentReceta.value?.tipoReceta === TipoReceta.Multifocal ||
    currentReceta.value?.tipoReceta === TipoReceta.Bifocal
)

const showCerca = computed(() =>
    currentReceta.value?.tipoReceta === TipoReceta.Cerca ||
    currentReceta.value?.tipoReceta === TipoReceta.Multifocal ||
    currentReceta.value?.tipoReceta === TipoReceta.Bifocal
)

const totalReceta = computed(() => {
    const armazon = Number(currentReceta.value?.precioArmazon) || 0
    const cristales = Number(currentReceta.value?.precioCristales) || 0
    return armazon + cristales
})

const restoReceta = computed(() => {
    const senia = Number(currentReceta.value?.senia) || 0
    return totalReceta.value - senia
})
</script>

<template>
<div class="page" v-if="currentReceta">
    <div class="inter-page">
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbLink href="/clientes">Clientes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbLink :href="`/clientes/dashboard/${currentReceta?.cliente.id}`">
                    {{ nombreCliente }}
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbLink :href="`/recetas/${currentReceta?.cliente.id}`">Recetas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbPage>Editar Receta</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4">
        <form @submit.prevent="validateAndEdit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-[10px] bg-[#1a1a1a] text-white">
                        <GlassesIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Editar Receta · Anteojos Recetados</h2>
                        <p class="text-lg text-zinc-400">
                            {{ nombreCliente }} · {{ fechaReceta.day.padStart(2, '0') }}/{{ fechaReceta.month.padStart(2, '0') }}/{{ fechaReceta.year }}
                        </p>
                    </div>
                </div>
                <div class="flex gap-3 shrink-0">
                    <Button type="button" variant="outline" @click="redirectCancel">Cancelar</Button>
                    <Button type="submit">Guardar receta</Button>
                </div>
            </div>

            <!-- Grid principal: contenido + sidebar Precios -->
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start w-full">

                <!-- COLUMNA IZQUIERDA -->
                <div class="flex flex-col gap-6 min-w-0">

                    <!-- Datos de la receta -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Datos de la receta</h4>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            <!-- Cliente -->
                            <div class="flex flex-col gap-1 xl:col-span-2">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Cliente</Label>
                                <div class="h-9 flex items-center px-3 rounded-lg border border-[#e5e5e5] bg-muted cursor-not-allowed text-sm">
                                    {{ currentReceta.cliente.apellido }}, {{ currentReceta.cliente.nombre }}
                                </div>
                            </div>

                            <!-- Fecha Receta -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Fecha</Label>
                                <div class="h-9 flex items-center px-3 rounded-lg border border-[#e5e5e5] bg-muted cursor-not-allowed text-sm">
                                    {{ fechaReceta.day.padStart(2, '0') }}/{{ fechaReceta.month.padStart(2, '0') }}/{{ fechaReceta.year }}
                                </div>
                            </div>

                            <!-- Tipo Receta -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Tipo receta</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Select v-model="currentReceta.tipoReceta" @update:model-value="(value) => currentReceta && (currentReceta.tipoReceta = value as TipoReceta)">
                                        <SelectTrigger class="h-9 w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem v-for="tipo in Object.entries(TipoReceta)" :key="tipo[0]" :value="tipo[0]">
                                                    {{ tipo[1] }}
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidReceta.tipoReceta }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Seleccionar tipo de receta</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <!-- Oftalmólogo -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Oftalmólogo</Label>
                                <Input class="h-9 w-full" v-model="currentReceta.oftalmologo" />
                            </div>
                        </div>
                    </div>

                    <!-- Graduación -->
                    <div v-if="showLejos || showCerca" class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden w-full">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Graduación</h4>
                        </div>
                        <div class="p-6 overflow-x-auto">
                            <div class="grid grid-cols-[4.5rem_2.75rem_5.5rem_5.5rem_5.5rem] gap-x-6 gap-y-2 items-center justify-center">
                                <span></span>
                                <span></span>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Esférico</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Cilíndrico</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Eje (°)</Label>

                                <template v-if="showLejos">
                                    <span class="row-span-2 self-center font-bold text-base text-[#1a1a1a]">Lejos</span>

                                    <!-- OD -->
                                    <span class="font-bold text-xs text-[#1a1a1a]">O.D.</span>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleLejos.od_esferico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleLejos.od_cilindrico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-14 text-center text-sm" v-model="currentDetalleLejos.od_grados" />
                                        <span class="text-xs text-[#888]">°</span>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.od_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>

                                    <!-- OI -->
                                    <span class="font-bold text-xs text-[#1a1a1a]">O.I.</span>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleLejos.oi_esferico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleLejos.oi_cilindrico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-14 text-center text-sm" v-model="currentDetalleLejos.oi_grados" />
                                        <span class="text-xs text-[#888]">°</span>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.oi_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </template>

                                <div v-if="showLejos && showCerca" class="col-span-5 border-t border-[#f0f0f0] my-4"></div>

                                <template v-if="showCerca">
                                    <span class="row-span-2 self-center font-bold text-base text-[#1a1a1a]">Cerca</span>

                                    <!-- OD -->
                                    <span class="font-bold text-xs text-[#1a1a1a]">O.D.</span>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleCerca.od_esferico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleCerca.od_cilindrico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-14 text-center text-sm" v-model="currentDetalleCerca.od_grados" />
                                        <span class="text-xs text-[#888]">°</span>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.od_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>

                                    <!-- OI -->
                                    <span class="font-bold text-xs text-[#1a1a1a]">O.I.</span>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleCerca.oi_esferico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentDetalleCerca.oi_cilindrico" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="relative flex items-center justify-center gap-1">
                                        <Input type="decimal" class="h-9 w-14 text-center text-sm" v-model="currentDetalleCerca.oi_grados" />
                                        <span class="text-xs text-[#888]">°</span>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.oi_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Medidas/Obras sociales + Cristales y armazón/Observaciones -->
                    <div class="flex flex-col lg:flex-row gap-6 w-full items-stretch">

                    <!-- COLUMNA IZQUIERDA -->
                    <div class="flex flex-col min-[580px]:flex-row lg:flex-col min-[580px]:items-stretch gap-6 w-full lg:w-auto">

                    <!-- Medidas -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden min-[580px]:shrink-0">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Medidas</h4>
                        </div>
                        <div class="p-8">
                            <div class="flex items-stretch gap-0">

                                <!-- DNP -->
                                <div class="flex flex-col gap-1 justify-center pr-4">
                                    <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">DNP</Label>
                                    <div class="flex items-center gap-2">
                                        <Input type="decimal" class="h-10 w-16 text-base" v-model="currentReceta.dnp" />
                                        <span class="text-xs text-zinc-400 shrink-0">mm.</span>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.dnp }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Requerido. DNP mayor a 0mm</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>

                                <Separator orientation="vertical" class="mx-2 h-auto self-stretch" />

                                <!-- Alt. película OD / OI apilados -->
                                <div class="flex flex-col gap-1 justify-center pl-4">
                                    <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Alt. película <span class="normal-case text-zinc-400">mm.</span></Label>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-medium text-[#1a1a1a] w-6 shrink-0">O.D.</span>
                                        <Input type="decimal" class="h-9 w-16" v-model="currentReceta.od_alt_pelicula" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_alt_pelicula }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 50</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-medium text-[#1a1a1a] w-6 shrink-0">O.I.</span>
                                        <Input type="decimal" class="h-9 w-16" v-model="currentReceta.oi_alt_pelicula" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_alt_pelicula }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 50</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- Obras sociales -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden flex-1 flex flex-col">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Obras sociales</h4>
                        </div>
                        <div class="p-6 flex-1">
                            <div v-if="currentObrasSociales.length > 0" class="flex flex-col items-start gap-2 mb-4">
                                <div v-for="asoc in currentObrasSociales" :key="asoc.id"
                                     class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm max-w-full">
                                    <span class="truncate">{{ asoc.obraSocial?.nombre ?? clienteForOS?.clienteObrasSociales?.find(cos => cos.obraSocial.id === asoc.obraSocialId)?.obraSocial.nombre }}</span>
                                    <button type="button" @click="removeObraSocial(asoc.id)" class="text-[#aaa] hover:text-destructive shrink-0">
                                        <Cross2Icon class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <div v-if="(clienteForOS?.clienteObrasSociales?.length ?? 0) > 0 || currentObrasSociales.length > 0">
                                <Select :key="obraSocialSelectKey" :model-value="obraSocialSelectValue" v-model:open="obraSocialSelectOpen" @update:model-value="(val) => addObraSocial(val)">
                                    <SelectTrigger class="h-9 w-full">
                                        <SelectValue placeholder="Agregar obra social..." />
                                    </SelectTrigger>
                                    <SelectContent class="max-h-[20rem] w-[15rem] pr-1">
                                        <SelectGroup class="max-h-[20rem] w-[16rem] m-0 p-0 overflow-scroll">
                                            <SelectItem
                                                v-for="cos in availableObrasSociales"
                                                :key="cos.obraSocial.id"
                                                :value="String(cos.obraSocial.id)"
                                            >
                                                {{ cos.obraSocial.nombre }}
                                            </SelectItem>
                                            <Button
                                                @click="handleShowNewObraSocialCliente()"
                                                variant="ghost"
                                                type="button"
                                                class="w-full h-max p-2 bg-secondary rounded-none flex-row items-center justify-start text-sm"
                                            >
                                                <PlusCircleIcon />
                                                <span class="w-[9rem] text-wrap text-left">Asociar nueva obra social al cliente</span>
                                            </Button>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div v-else class="flex flex-col items-start gap-2">
                                <p class="text-sm text-[#888]">Sin cobertura asignada</p>
                                <Button type="button" size="sm" variant="outline" @click="handleShowNewObraSocialCliente">
                                    Registrar obra social
                                </Button>
                            </div>
                            <Dialog v-model:open="openNewClienteOS">
                                <DialogContent class="max-w-[33rem]">
                                    <AddObraSocialClienteForm v-if="clienteForOS" :cliente="clienteForOS" @handle-add-obra-social-cliente="handleAddObraSocialCliente" />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    </div>

                    <!-- COLUMNA DERECHA -->
                    <div class="flex flex-col min-[580px]:flex-row lg:flex-col min-[580px]:items-stretch gap-6 w-full flex-1 min-w-0">

                    <!-- Cristales y armazón -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden min-[580px]:flex-1 min-[580px]:min-w-0">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Cristales y armazón</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Tipo de cristal</Label>
                                <Select v-model="currentReceta.cristal" @update:model-value="(value) => currentReceta && (currentReceta.cristal = value as TipoCristal)">
                                    <SelectTrigger class="h-9 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="tipo in Object.entries(TipoCristal)" :key="tipo[0]" :value="tipo[0]">
                                                {{ tipo[1] }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Color</Label>
                                <Select v-model="currentReceta.color" @update:model-value="(value) => currentReceta && (currentReceta.color = value as ColorCristal)">
                                    <SelectTrigger class="h-9 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="color in Object.entries(ColorCristal)" :key="color[0]" :value="color[0]">
                                                {{ color[1] }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Tratamiento</Label>
                                <Select v-model="currentReceta.tratamiento" @update:model-value="(value) => currentReceta && (currentReceta.tratamiento = value as TratamientoCristal)">
                                    <SelectTrigger class="h-9 w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem v-for="trat in Object.entries(TratamientoCristal)" :key="trat[0]" :value="trat[0]">
                                                {{ trat[1] }}
                                            </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Armazón</Label>
                                <Input class="h-9 w-full" v-model="currentReceta.armazon" placeholder="Modelo o código" />
                            </div>
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden min-[580px]:flex-1 min-[580px]:min-w-0">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Observaciones</h4>
                        </div>
                        <div class="p-6">
                            <Textarea class="resize-none w-full min-h-[6rem]" v-model="currentReceta.observaciones" />
                        </div>
                    </div>

                    </div>

                    </div>


                </div>

                <!-- COLUMNA DERECHA: Precios -->
                <div class="lg:sticky lg:top-4 flex flex-col gap-6">
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Precios</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Precio armazón</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="currentReceta.precioArmazon" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.precioArmazon }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Precio cristales</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="currentReceta.precioCristales" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.precioCristales }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Seña recibida</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="currentReceta.senia" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.senia }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5 pt-3 border-t border-[#e5e5e5] text-sm">
                                <div class="flex justify-between text-zinc-500">
                                    <span>Armazón</span>
                                    <span>{{ currentReceta.precioArmazon ? '$ ' + Number(currentReceta.precioArmazon).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                                <div class="flex justify-between text-zinc-500">
                                    <span>+ Cristales</span>
                                    <span>{{ currentReceta.precioCristales ? '$ ' + Number(currentReceta.precioCristales).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                                <div class="flex justify-between text-zinc-500">
                                    <span>− Seña</span>
                                    <span>{{ currentReceta.senia ? '- $ ' + Number(currentReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between rounded-xl bg-[#1a1a1a] px-4 py-3 text-white">
                                <span class="text-[10px] font-medium tracking-wide uppercase">Total</span>
                                <span class="text-base font-bold">{{ totalReceta > 0 ? '$ ' + totalReceta.toLocaleString('es-AR') : '$ —' }}</span>
                            </div>

                            <div class="flex items-center justify-between rounded-xl border px-4 py-3 bg-secondary">
                                <span class="text-[10px] font-medium tracking-wide uppercase">Resto a pagar</span>
                                <span class="text-base font-bold">{{ totalReceta > 0 ? '$ ' + restoReceta.toLocaleString('es-AR') : '$ —' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#e5e5e5] mt-2">
                <div class="flex flex-row items-center justify-between gap-6 py-3">
                    <div class="flex items-center gap-6 text-sm">
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Total</span>
                            <span class="font-semibold text-[#1a1a1a]">{{ totalReceta > 0 ? '$ ' + totalReceta.toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Seña</span>
                            <span class="font-semibold text-[#1a1a1a]">{{ currentReceta.senia ? '$ ' + Number(currentReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Resto</span>
                            <span class="font-semibold" :class="restoReceta < 0 ? 'text-destructive' : 'text-[#1a1a1a]'">{{ totalReceta > 0 ? '$ ' + restoReceta.toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <Button type="button" variant="outline" @click="redirectCancel">Cancelar</Button>
                        <Button type="submit">Guardar receta</Button>
                    </div>
                </div>
            </div>

        </form>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>

<div v-else class="page">
    <div class="pt-2 mb-4">
        <div class="forms-wide flex flex-col justify-between items-start px-[5rem]">
            <div class="w-full">
                <h3 class="page-subtitle text-center">Receta con id {{ route.params.id }} no encontrada</h3>
            </div>
        </div>
    </div>
</div>
</template>

<style>
</style>