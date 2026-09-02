<script setup lang="ts">
import { Cliente } from '@/api/entities/clientes';
import { createDetalleAereosCustomValidator } from '@/api/entities/detalleRecetaAereos';
import { ColorCristal, TipoCristal, TipoReceta, TratamientoCristal, createRecetaAereosCustomValidator } from '@/api/entities/recetasAereos';
import { clientesApi } from '@/api/libs/clientes';
import { recetasApi } from '@/api/libs/recetas';
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
import { AsteriskIcon, PlusCircleIcon } from 'lucide-vue-next';
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

const availableObrasSociales = computed(() =>
    selectedCliente.value?.clienteObrasSociales?.filter(cos => !selectedObrasSocialIds.value.includes(cos.obraSocial.id)) ?? []
);

const addObraSocial = (id: string) => {
    const numId = Number(id);
    if (numId && !selectedObrasSocialIds.value.includes(numId)) {
        selectedObrasSocialIds.value.push(numId);
    }
};

const removeObraSocial = (id: number) => {
    const idx = selectedObrasSocialIds.value.indexOf(id);
    if (idx !== -1) selectedObrasSocialIds.value.splice(idx, 1);
};

const handleShowNewObraSocialCliente = () => {
    if (!selectedCliente.value) return;
    obraSocialSelectOpen.value = false;
    openNewClienteOS.value = true;
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

    <div class="pt-2 mb-4">
        <form @submit.prevent="validateAndSubmit" class="forms-wide flex flex-col justify-between items-start px-[5rem] !bg-white">

            <!-- Header -->
            <div class="w-full">
                <h3 class="page-subtitle text-center">Nueva Receta - Anteojos Recetados</h3>
                <Separator class="my-6 w-full" />
            </div>

            <!-- Fila 1: Cliente / Fecha / Tipo Receta / Oftalmólogo -->
            <div class="flex flex-row w-full items-end gap-6 mt-4">

                <!-- Cliente -->
                <div class="flex flex-col gap-1 flex-[2]">
                    <Label class="text-xs text-[#888]">Cliente</Label>
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
                <div class="flex flex-col gap-1 flex-[1.5]">
                    <Label class="text-xs text-[#888]">Fecha</Label>
                    <div class="flex flex-row items-center gap-2">
                        <Input type="text" v-model="fechaReceta.day"   placeholder="DD"   class="h-9 w-14 text-center" maxlength="2" />
                        <Input type="text" v-model="fechaReceta.month" placeholder="MM"   class="h-9 w-14 text-center" maxlength="2" />
                        <Input type="text" v-model="fechaReceta.year"  placeholder="AAAA" class="h-9 w-20 text-center" maxlength="4" />
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
                <div class="flex flex-col gap-1 flex-1">
                    <Label class="text-xs text-[#888]">Tipo receta</Label>
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
                <div class="flex flex-col gap-1 flex-1">
                    <Label class="text-xs text-[#888]">Oftalmólogo</Label>
                    <Input class="h-9 w-full" v-model="newReceta.oftalmologo" placeholder="Opcional" />
                </div>
            </div>

            <Separator class="my-8 w-full" />

            <!-- Sección detalles ópticos -->
            <div class="flex flex-col w-full gap-0 rounded-2xl border border-[#e5e5e5]">

                <!-- LEJOS -->
                <div v-if="showLejos" class="rounded-2xl p-6">
                    <div class="flex flex-row items-center justify-center">

                        <span class="font-bold text-xl text-[#1a1a1a] w-16 pr-24 shrink-0">Lejos</span>

                        <div class="flex flex-col gap-3 items-center">

                            <!-- OD -->
                            <div class="flex flex-row items-center gap-3">
                                <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>

                                <Label class="text-xs text-[#888]">Esf.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleLejos.od_esferico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                
                                <Label class="text-xs text-[#888]">Cil.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleLejos.od_cilindrico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                
                                <Label class="text-xs text-[#888]">A</Label>
                                <Input type="decimal" class="h-9 w-20" v-model="currentDetalleLejos.od_grados" />
                                <span class="text-sm text-[#888]">°</span>
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.od_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>

                            <!-- OI -->
                            <div class="flex flex-row items-center gap-3">
                                <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                
                                <Label class="text-xs text-[#888]">Esf.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleLejos.oi_esferico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                <Label class="text-xs text-[#888]">Cil.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleLejos.oi_cilindrico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                <Label class="text-xs text-[#888]">A</Label>
                                <Input type="decimal" class="h-9 w-20" v-model="currentDetalleLejos.oi_grados" />
                                <span class="text-sm text-[#888]">°</span>
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.oi_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>

                        </div>

                    </div>
                </div>

                <Separator v-if="showCerca && showLejos" class="my-4 w-[80%] ml-[10%]" />

                <!-- CERCA -->
                <div v-if="showCerca" class="rounded-2xl p-6">
                    <div class="flex flex-row items-center justify-center">

                        <span class="font-bold text-xl text-[#1a1a1a] w-16 pr-24 shrink-0">Cerca</span>

                        <div class="flex flex-col gap-3 items-center">

                            <!-- OD -->
                            <div class="flex flex-row items-center gap-3">
                                <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                
                                <Label class="text-xs text-[#888]">Esf.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleCerca.od_esferico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                
                                <Label class="text-xs text-[#888]">Cil.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleCerca.od_cilindrico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                <Label class="text-xs text-[#888]">A</Label>
                                <Input type="decimal" class="h-9 w-20" v-model="currentDetalleCerca.od_grados" />
                                <span class="text-sm text-[#888]">°</span>
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.od_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>

                            <!-- OI -->
                            <div class="flex flex-row items-center gap-3">
                                <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                
                                <Label class="text-xs text-[#888]">Esf.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleCerca.oi_esferico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                
                                <Label class="text-xs text-[#888]">Cil.</Label>
                                <Input type="decimal" class="h-9 w-24" v-model="currentDetalleCerca.oi_cilindrico" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                                
                                <Label class="text-xs text-[#888]">A</Label>
                                <Input type="decimal" class="h-9 w-20" v-model="currentDetalleCerca.oi_grados" />
                                <span class="text-sm text-[#888]">°</span>
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.oi_grados }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0° a 180°</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>

                        </div>

                    </div>
                </div>
            </div>

            <!-- Medidas + Obras Sociales -->
            <div class="flex flex-row gap-6 w-full mt-6">

                <!-- Medidas -->
                <div class="rounded-2xl border border-[#e5e5e5] p-6 shrink-0">
                    <p class="font-bold text-base mb-4 text-[#1a1a1a]">Medidas</p>
                    <div class="flex items-stretch gap-0">

                        <!-- DNP destacado -->
                        <div class="flex flex-col gap-1 justify-center pr-8">
                            <Label class="text-xs text-[#888]">DNP</Label>
                            <div class="flex items-center gap-2">
                                <Input type="decimal" class="h-10 w-24 text-base" v-model="newReceta.dnp" />
                                <span class="text-xs text-zinc-400">mm.</span>
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.dnp }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Requerido. DNP mayor a 0mm</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </div>

                        <Separator orientation="vertical" class="mx-2 h-auto self-stretch" />

                        <!-- Alt. película OD / OI apilados -->
                        <div class="flex flex-col gap-3 justify-center pl-8">
                            <div class="flex items-center gap-3">
                                <span class="text-xs font-medium text-[#1a1a1a] w-6 shrink-0">O.D.</span>
                                <div class="flex flex-col gap-1">
                                    <Label class="text-xs text-[#888]">Alt. película <span class="text-[10px] text-zinc-400">mm.</span></Label>
                                    <div class="flex items-center gap-2">
                                        <Input type="decimal" class="h-9 w-24" v-model="newReceta.od_alt_pelicula" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_alt_pelicula }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 50</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-xs font-medium text-[#1a1a1a] w-6 shrink-0">O.I.</span>
                                <div class="flex flex-col gap-1">
                                    <div class="flex items-center gap-2">
                                        <Input type="decimal" class="h-9 w-24" v-model="newReceta.oi_alt_pelicula" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_alt_pelicula }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 50</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Obras Sociales -->
                <div  class="rounded-2xl border border-[#e5e5e5] p-6 flex-1">
                    <p class="font-bold text-base mb-4 text-[#1a1a1a]">Obras Sociales</p>
                    <div v-if="selectedObrasSocialIds.length > 0" class="flex flex-wrap gap-2 mb-4">
                        <div v-for="id in selectedObrasSocialIds" :key="id"
                             class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm">
                            <span>{{ selectedCliente?.clienteObrasSociales?.find(cos => cos.obraSocial.id === id)?.obraSocial.nombre }}</span>
                            <button type="button" @click="removeObraSocial(id)" class="text-[#aaa] hover:text-destructive">
                                <Cross2Icon class="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                    <div v-if="(selectedCliente?.clienteObrasSociales?.length ?? 0) > 0 || selectedObrasSocialIds.length > 0">
                        <Select v-model:open="obraSocialSelectOpen" @update:model-value="(val) => addObraSocial(val)">
                            <SelectTrigger class="h-9 w-72">
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
                    <div v-else>
                        <p class="py-4">No hay obras sociales registradas para el cliente</p>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <span>
                                        <Button type="button" :disabled="!selectedCliente" @click="handleShowNewObraSocialCliente()">Registrar Obra Social</Button>
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

            <!-- Cristales + Precios -->
            <div class="flex flex-row gap-6 w-full mt-6">

                <!-- Card Cristales -->
                <div class="rounded-2xl border border-[#e5e5e5] p-6 flex flex-col gap-5 w-[32%]">
                    <p class="font-bold text-base text-[#1a1a1a]">Cristales</p>

                    <!-- Tipo cristal -->
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-[#888]">Tipo</Label>
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

                    <!-- Color -->
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-[#888]">Color</Label>
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

                    <!-- Tratamiento -->
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-[#888]">Tratamiento</Label>
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

                    <!-- Armazón -->
                    <div class="flex flex-col gap-1">
                        <Label class="text-xs text-[#888]">Armazón</Label>
                        <Input class="h-9 w-full" v-model="newReceta.armazon" />
                    </div>
                </div>

                <!-- Card Precios -->
                <div class="rounded-2xl border border-[#e5e5e5] p-6 flex flex-col gap-5 flex-1">
                    <p class="font-bold text-base text-[#1a1a1a]">Precios</p>

                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Precio armazón</Label>
                            <div class="flex flex-row items-center gap-2">
                                <Label class="text-xs text-[#888]">$</Label>
                                <Input type="decimal" class="h-9 w-full" v-model="newReceta.precioArmazon" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.precioArmazon }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Precio cristales</Label>
                            <div class="flex flex-row items-center gap-2">
                                <Label class="text-xs text-[#888]">$</Label>
                                <Input type="decimal" class="h-9 w-full" v-model="newReceta.precioCristales" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.precioCristales }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="flex flex-col gap-0.5 border-t border-[#e5e5e5] pt-3">
                            <Label class="text-[11px] text-zinc-400">Total</Label>
                            <div class="flex items-baseline gap-1.5 px-1">
                                <span class="text-xs text-zinc-400">$</span>
                                <span class="text-sm font-medium text-[#1a1a1a]">{{ totalReceta > 0 ? totalReceta.toLocaleString('es-AR') : '—' }}</span>
                            </div>
                        </div>

                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Seña</Label>
                            <div class="flex flex-row items-center gap-2">
                                <Label class="text-xs text-[#888]">$</Label>
                                <Input type="decimal" class="h-9 w-full" v-model="newReceta.senia" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.senia }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar monto mayor a 0</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </div>

                        <!-- Resto -->
                        <div class="flex flex-col gap-0.5 border-t border-[#e5e5e5] pt-3">
                            <Label class="text-[11px] text-zinc-400">Resto</Label>
                            <div class="flex items-baseline gap-1.5 px-1">
                                <span class="text-xs text-zinc-400">$</span>
                                <span class="text-sm font-medium" :class="restoReceta < 0 ? 'text-destructive' : 'text-[#1a1a1a]'">{{ totalReceta > 0 ? restoReceta.toLocaleString('es-AR') : '—' }}</span>
                            </div>
                        </div>
                    </div>

                </div>
                
            </div>
                              <!-- Observaciones -->
                <!-- <div class="flex w-full flex-row flex-1"> -->
                <div class="rounded-2xl mt-6 border border-[#e5e5e5] p-6 flex flex-col w-full flex-1">
                    <p class="font-bold text-base text-[#1a1a1a]">Observaciones</p>
                    <Textarea class="resize-none w-full flex-1 min-h-[7rem]" v-model="newReceta.observaciones" />
                </div>
            

            <!-- Footer -->
            <div class="form-footer w-full flex flex-row justify-end mt-8 mb-6 gap-4">
                <Button type="button" variant="outline" class="w-[15%]" @click="redirectCancel">Cancelar</Button>
                <Button type="submit" class="w-[15%]">Guardar</Button>
            </div>

            

        </form>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>
</template>

<style>
</style>