<script setup lang="ts">
import { Cliente } from '@/api/entities/clientes';
import { createDetalleAereosCustomValidator } from '@/api/entities/detalleRecetaAereos';
import { ColorCristal, TipoCristal, TipoReceta, TratamientoCristal, createRecetaAereosCustomValidator } from '@/api/entities/recetasAereos';
import { clientesApi } from '@/api/libs/clientes';
import { recetasApi } from '@/api/libs/recetas';
import { generateFichaRecetaAereosPDF } from '@/lib/utils.recetas';
import SelectClienteDialog from '@/components/SelectClienteDialog.vue';
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
import { toast } from '@/components/ui/toast';
import { previousRoute, router } from '@/router';
import { AsteriskIcon, PlusCircleIcon, GlassesIcon } from 'lucide-vue-next';
import { SlashIcon, Cross2Icon } from '@radix-icons/vue';
import { computed, onMounted, ref } from 'vue';
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
import { useLoaderStore } from '@/stores/LoaderStore';

const route = useRoute();
const loader = useLoaderStore();

const selectedCliente = ref<Cliente | null>(null);
const searchClienteOpen = ref<boolean>(false);

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

const selectedObrasSocialIds = ref<number[]>([]);
const openNewClienteOS = ref<boolean>(false);
const obraSocialSelectOpen = ref<boolean>(false);
const obraSocialSelectValue = ref<string | undefined>(undefined);
const obraSocialSelectKey = ref(0);

const availableObrasSociales = computed(() =>
    selectedCliente.value?.clienteObrasSociales?.filter(cos => !selectedObrasSocialIds.value.includes(cos.obraSocial.id)) ?? []
);

const addObraSocial = (id: string) => {
    const numId = Number(id);
    if (numId && !selectedObrasSocialIds.value.includes(numId)) {
        selectedObrasSocialIds.value.push(numId);
    }
    obraSocialSelectValue.value = undefined;
};

const removeObraSocial = (id: number) => {
    const idx = selectedObrasSocialIds.value.indexOf(id);
    if (idx !== -1) selectedObrasSocialIds.value.splice(idx, 1);
    obraSocialSelectValue.value = undefined;
    obraSocialSelectKey.value++;
};

const handleShowNewObraSocialCliente = () => {
    if (!selectedCliente.value) return;
    obraSocialSelectOpen.value = false;
    openNewClienteOS.value = true;
};

const handleAddObraSocialClick = () => {
    if (!selectedCliente.value) return;
    const hasAny = (selectedCliente.value.clienteObrasSociales?.length ?? 0) > 0 || selectedObrasSocialIds.value.length > 0;
    if (hasAny) {
        obraSocialSelectOpen.value = true;
    } else {
        handleShowNewObraSocialCliente();
    }
};

const handleAddObraSocialCliente = async (obraSocialId: number) => {
    if (selectedCliente.value?.id) {
        selectedCliente.value = await clientesApi.getOne(selectedCliente.value.id);
        if (!selectedObrasSocialIds.value.includes(obraSocialId)) {
            selectedObrasSocialIds.value.push(obraSocialId);
        }
        openNewClienteOS.value = false;
    }
};

const newReceta = ref<{
    tipoReceta: TipoReceta,
    oftalmologo: undefined | string,
    cristal: undefined | TipoCristal,
    color: undefined | ColorCristal,
    tratamiento: undefined | TratamientoCristal,
    armazon: undefined | string,
    observaciones: undefined | string,
    fecha: Date | undefined,
    cliente: { id: undefined | number },
    precioArmazon: number | undefined,
    precioCristales: number | undefined,
    senia: number | undefined,
    dnp: number | undefined,
    od_alt_pelicula: number | undefined,
    oi_alt_pelicula: number | undefined,
}>({
    tipoReceta: TipoReceta.Lejos,
    oftalmologo: undefined,
    cristal: undefined,
    color: undefined,
    armazon: undefined,
    tratamiento: undefined,
    observaciones: undefined,
    fecha: undefined,
    cliente: { id: undefined },
    precioArmazon: undefined,
    precioCristales: undefined,
    senia: undefined,
    dnp: undefined,
    od_alt_pelicula: undefined,
    oi_alt_pelicula: undefined,
})

const currentDetalleCerca = ref<{
    tipo_detalle: TipoReceta,
    od_esferico: number | undefined,
    od_cilindrico: number | undefined,
    od_grados: number | undefined,
    oi_esferico: number | undefined,
    oi_cilindrico: number | undefined,
    oi_grados: number | undefined,
    dnp: number | undefined,
}>({
    tipo_detalle: TipoReceta.Cerca,
    od_esferico: undefined,
    od_cilindrico: undefined,
    od_grados: undefined,
    oi_esferico: undefined,
    oi_cilindrico: undefined,
    oi_grados: undefined,
    dnp: undefined,
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

const _today = new Date()
const fechaReceta = ref({
    day: String(_today.getDate()).padStart(2, '0'),
    month: String(_today.getMonth() + 1).padStart(2, '0'),
    year: String(_today.getFullYear()),
})

onMounted(async () => {
    try {
        loader.show();
        const query = route.query
        if (query.cliente) {
            const foundCliente = await clientesApi.getOne(Number(query.cliente))
            if (foundCliente) handleSelectCliente(foundCliente)
        }
        loader.hide();
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    }
})

const onSubmit = async () => {
    try {
        loader.show();
        let newRecetaObj
        switch (newReceta.value.tipoReceta) {
            case TipoReceta.Lejos:
                newRecetaObj = { ...newReceta.value, detallesRecetaLentesAereos: [currentDetalleLejos.value] }
                break;
            case TipoReceta.Cerca:
                newRecetaObj = { ...newReceta.value, detallesRecetaLentesAereos: [currentDetalleCerca.value] }
                break;
            case TipoReceta.Multifocal:
                newRecetaObj = { ...newReceta.value, detallesRecetaLentesAereos: [currentDetalleCerca.value, currentDetalleLejos.value] }
                break;
            case TipoReceta.Bifocal:
                newRecetaObj = { ...newReceta.value, detallesRecetaLentesAereos: [currentDetalleCerca.value, currentDetalleLejos.value] }
                break;
        }
        newRecetaObj.fecha = new Date(parseInt(fechaReceta.value.year), parseInt(fechaReceta.value.month) - 1, parseInt(fechaReceta.value.day))
        const createdReceta = await recetasApi.createRecetaAereos({ ...newRecetaObj!, obrasSociales: selectedObrasSocialIds.value.map(id => ({ id })) });
        loader.hide();
        toast({ title: 'Receta registrada con éxito' })
        if (selectedCliente.value) {
            generateFichaRecetaAereosPDF(createdReceta, {
                nombreCliente: nombreCliente.value,
                nroDocumento: selectedCliente.value.nroDocumento,
                tipoDocumento: selectedCliente.value.tipoDocumento,
                telefono: selectedCliente.value.telefono,
                domicilio: selectedCliente.value.domicilio,
                email: selectedCliente.value.email,
            }).catch(() => { /* no se pudo generar la ficha automáticamente */ });
        }
        router.push(`/recetas/${newReceta.value.cliente.id}?tab=recetados&recetaId=${createdReceta.id}`)
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    };
}

const handleSelectCliente = (cliente: Cliente) => {
    selectedCliente.value = cliente;
    newReceta.value.cliente.id = cliente.id;
    searchClienteOpen.value = false;
    selectedObrasSocialIds.value = [];
}

const validateAndSubmit = async () => {
    loader.show();
    const validDetalle = validateDetalles()
    const resultReceta = createRecetaAereosCustomValidator(newReceta.value, fechaReceta.value);
    isValidReceta.value = resultReceta.isValid
    if (validDetalle && resultReceta.success) {
        await onSubmit();
    }
    loader.hide();
}

const validateDetalles = () => {
    let resultCerca, resultLejos
    switch (newReceta.value.tipoReceta) {
        case TipoReceta.Cerca:
            resultCerca = createDetalleAereosCustomValidator(currentDetalleCerca.value)
            isValidDetalleCerca.value = resultCerca.isValid
            return resultCerca.success
        case TipoReceta.Lejos:
            resultLejos = createDetalleAereosCustomValidator(currentDetalleLejos.value)
            isValidDetalleLejos.value = resultLejos.isValid
            return resultLejos.success
        case TipoReceta.Multifocal:
            resultLejos = createDetalleAereosCustomValidator(currentDetalleLejos.value)
            resultCerca = createDetalleAereosCustomValidator(currentDetalleCerca.value)
            isValidDetalleLejos.value = resultLejos.isValid
            isValidDetalleCerca.value = resultCerca.isValid
            return resultCerca.success && resultLejos.success
        case TipoReceta.Bifocal:
            resultLejos = createDetalleAereosCustomValidator(currentDetalleLejos.value)
            resultCerca = createDetalleAereosCustomValidator(currentDetalleCerca.value)
            isValidDetalleLejos.value = resultLejos.isValid
            isValidDetalleCerca.value = resultCerca.isValid
            return resultCerca.success && resultLejos.success
    }
}

const nombreCliente = computed(() => selectedCliente.value?.apellido + ", " + selectedCliente.value?.nombre)

const redirectCancel = () => {
    if (previousRoute) {
        router.push(previousRoute);
    } else {
        if (selectedCliente.value) {
            router.push(`/clientes/dashboard/${selectedCliente.value.id}`);
        }
    }
}

const showLejos = computed(() =>
    newReceta.value.tipoReceta === TipoReceta.Lejos ||
    newReceta.value.tipoReceta === TipoReceta.Multifocal ||
    newReceta.value.tipoReceta === TipoReceta.Bifocal
)

const showCerca = computed(() =>
    newReceta.value.tipoReceta === TipoReceta.Cerca ||
    newReceta.value.tipoReceta === TipoReceta.Multifocal ||
    newReceta.value.tipoReceta === TipoReceta.Bifocal
)

const totalReceta = computed(() => {
    const armazon = Number(newReceta.value.precioArmazon) || 0
    const cristales = Number(newReceta.value.precioCristales) || 0
    return armazon + cristales
})

const restoReceta = computed(() => {
    const senia = Number(newReceta.value.senia) || 0
    return totalReceta.value - senia
})
</script>

<template>
<div class="page">
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
            <BreadcrumbItem v-if="selectedCliente">
                <BreadcrumbLink :href="`/clientes/dashboard/${selectedCliente?.id}`">
                    {{ nombreCliente }}
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="selectedCliente"><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem v-if="selectedCliente">
                <BreadcrumbLink :href="`/recetas/${selectedCliente?.id}`">Recetas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="selectedCliente"><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbPage>Nueva receta anteojos recetados</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4">
        <form @submit.prevent="validateAndSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-stretch justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-lg bg-primary text-primary-foreground">
                        <GlassesIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Nueva Receta · Anteojos Recetados</h2>
                        <p class="text-lg text-zinc-400">
                            {{ selectedCliente ? nombreCliente : 'Sin cliente seleccionado' }} · {{ fechaReceta.day }}/{{ fechaReceta.month }}/{{ fechaReceta.year }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Grid principal: contenido + sidebar Precios -->
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start w-full">

                <!-- COLUMNA IZQUIERDA -->
                <div class="flex flex-col gap-6 min-w-0">

                    <!-- Datos de la receta -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Datos de la receta</h4>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            <!-- Cliente -->
                            <div class="flex flex-col gap-1 xl:col-span-2">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Cliente</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Input
                                        type="text"
                                        class="h-9 w-full"
                                        readonly
                                        :value="selectedCliente ? `${selectedCliente.apellido}, ${selectedCliente.nombre}` : ''"
                                        placeholder="Buscar cliente..."
                                        @click="searchClienteOpen = true"
                                    />
                                    <SelectClienteDialog
                                        v-model="searchClienteOpen"
                                        title="Nueva Receta: Seleccionar Cliente"
                                        @select-cliente="handleSelectCliente"
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidReceta.cliente }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Seleccionar cliente</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <!-- Fecha Receta -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Fecha</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Input type="text" v-model="fechaReceta.day"   placeholder="DD"   class="h-9 w-12 text-center" maxlength="2" />
                                    <Input type="text" v-model="fechaReceta.month" placeholder="MM"   class="h-9 w-12 text-center" maxlength="2" />
                                    <Input type="text" v-model="fechaReceta.year"  placeholder="AAAA" class="h-9 w-16 text-center" maxlength="4" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidReceta.fecha }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Ingresar una fecha válida</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <!-- Tipo Receta -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Tipo receta</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Select v-model="newReceta.tipoReceta" @update:model-value="(value) => newReceta.tipoReceta = value as TipoReceta">
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
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Oftalmólogo</Label>
                                <Input class="h-9 w-full" v-model="newReceta.oftalmologo" />
                            </div>
                        </div>
                    </div>

                    <!-- Graduación -->
                    <div v-if="showLejos || showCerca" class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden w-full">
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Graduación</h4>
                        </div>
                        <div class="p-6 overflow-x-auto">
                            <div class="grid grid-cols-[4.5rem_2.75rem_5.5rem_5.5rem_5.5rem] gap-x-6 gap-y-2 items-center justify-center">
                                <span></span>
                                <span></span>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Esférico</Label>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Cilíndrico</Label>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Eje (°)</Label>

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
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Medidas</h4>
                        </div>
                        <div class="p-8">
                            <div class="flex items-stretch gap-0">

                                <!-- DNP -->
                                <div class="flex flex-col gap-1 justify-center pr-4">
                                    <Label class="text-[10px] font-medium  text-zinc-400 uppercase">DNP</Label>
                                    <div class="flex items-center gap-2">
                                        <Input type="decimal" class="h-10 w-16 text-base" v-model="newReceta.dnp" />
                                        <span class="text-xs text-zinc-400 shrink-0">mm.</span>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.dnp }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Requerido. DNP mayor a 0mm</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>

                                <Separator orientation="vertical" class="mx-2 h-auto self-stretch" />

                                <!-- Alt. película OD / OI apilados -->
                                <div class="flex flex-col gap-1 justify-center pl-4">
                                    <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Alt. película <span class="normal-case text-zinc-400">mm.</span></Label>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-medium text-[#1a1a1a] w-6 shrink-0">O.D.</span>
                                        <Input type="decimal" class="h-9 w-16" v-model="newReceta.od_alt_pelicula" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_alt_pelicula }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 50</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-medium text-[#1a1a1a] w-6 shrink-0">O.I.</span>
                                        <Input type="decimal" class="h-9 w-16" v-model="newReceta.oi_alt_pelicula" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_alt_pelicula }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 50</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- Obras sociales -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden flex-1 flex flex-col">
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Obras sociales</h4>
                        </div>
                        <div class="p-6 flex-1">
                            <div v-if="selectedObrasSocialIds.length > 0" class="flex flex-col items-start gap-2 mb-4">
                                <div v-for="id in selectedObrasSocialIds" :key="id"
                                     class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm max-w-full">
                                    <span class="truncate">{{ selectedCliente?.clienteObrasSociales?.find(cos => cos.obraSocial.id === id)?.obraSocial.nombre }}</span>
                                    <Button type="button" variant="ghost" size="icon" @click="removeObraSocial(id)" class="h-4 w-4 p-0 text-[#aaa] hover:text-destructive hover:bg-transparent shrink-0">
                                        <Cross2Icon class="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div v-if="(selectedCliente?.clienteObrasSociales?.length ?? 0) > 0 || selectedObrasSocialIds.length > 0">
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
                                <p class="text-sm text-[#888]">
                                    {{ selectedCliente ? 'Sin cobertura asignada' : 'Seleccioná un cliente para gestionar sus obras sociales' }}
                                </p>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <span>
                                                <Button type="button" size="sm" variant="outline" :disabled="!selectedCliente" @click="handleAddObraSocialClick">
                                                    Registrar obra social
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent v-if="!selectedCliente">
                                            <p>Seleccionar un cliente primero</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Dialog v-model:open="openNewClienteOS">
                                <DialogContent class="max-w-[33rem]">
                                    <AddObraSocialClienteForm v-if="selectedCliente" :cliente="selectedCliente" @handle-add-obra-social-cliente="handleAddObraSocialCliente" />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    </div>

                    <!-- COLUMNA DERECHA -->
                    <div class="flex flex-col min-[580px]:flex-row lg:flex-col min-[580px]:items-stretch gap-6 w-full flex-1 min-w-0">

                    <!-- Cristales y armazón -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden min-[580px]:flex-1 min-[580px]:min-w-0">
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Cristales y armazón</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Tipo de cristal</Label>
                                <Select v-model="newReceta.cristal" @update:model-value="(value) => newReceta.cristal = value as TipoCristal">
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
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Color</Label>
                                <Select v-model="newReceta.color" @update:model-value="(value) => newReceta.color = value as ColorCristal">
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
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Tratamiento</Label>
                                <Select v-model="newReceta.tratamiento" @update:model-value="(value) => newReceta.tratamiento = value as TratamientoCristal">
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
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Armazón</Label>
                                <Input class="h-9 w-full" v-model="newReceta.armazon" placeholder="Modelo o código" />
                            </div>
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden min-[580px]:flex-1 min-[580px]:min-w-0">
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Observaciones</h4>
                        </div>
                        <div class="p-6">
                            <Textarea class="resize-none w-full min-h-[6rem]" v-model="newReceta.observaciones" />
                        </div>
                    </div>

                    </div>

                    </div>


                </div>

                <!-- COLUMNA DERECHA: Precios -->
                <div class="lg:sticky lg:top-4 flex flex-col gap-6">
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#f0f0f0]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Precios</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Precio armazón</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="newReceta.precioArmazon" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.precioArmazon }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Precio cristales</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="newReceta.precioCristales" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.precioCristales }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Seña recibida</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="newReceta.senia" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.senia }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5 pt-3 border-t border-[#f0f0f0] text-sm">
                                <div class="flex justify-between text-zinc-500">
                                    <span>Armazón</span>
                                    <span>{{ newReceta.precioArmazon ? '$ ' + Number(newReceta.precioArmazon).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                                <div class="flex justify-between text-zinc-500">
                                    <span>+ Cristales</span>
                                    <span>{{ newReceta.precioCristales ? '$ ' + Number(newReceta.precioCristales).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                                <div class="flex justify-between text-zinc-500">
                                    <span>− Seña</span>
                                    <span>{{ newReceta.senia ? '- $ ' + Number(newReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between rounded-xl bg-[#1a1a1a] px-4 py-3 text-white">
                                <span class="text-[10px] font-medium  uppercase">Total</span>
                                <span class="text-base font-bold">{{ totalReceta > 0 ? '$ ' + totalReceta.toLocaleString('es-AR') : '$ —' }}</span>
                            </div>

                            <div class="flex items-center justify-between rounded-xl border px-4 py-3 bg-secondary">
                                <span class="text-[10px] font-medium  uppercase">Resto a pagar</span>
                                <span class="text-base font-bold">{{ totalReceta > 0 ? '$ ' + restoReceta.toLocaleString('es-AR') : '$ —' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#f0f0f0] mt-2">
                <div class="flex flex-row items-center justify-between gap-6 py-3">
                    <div class="flex items-center gap-6 text-sm">
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium  text-zinc-400 uppercase">Total</span>
                            <span class="font-semibold text-[#1a1a1a]">{{ totalReceta > 0 ? '$ ' + totalReceta.toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium  text-zinc-400 uppercase">Seña</span>
                            <span class="font-semibold text-[#1a1a1a]">{{ newReceta.senia ? '$ ' + Number(newReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium  text-zinc-400 uppercase">Resto</span>
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
</template>

<style>
</style>