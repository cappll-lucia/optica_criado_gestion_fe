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
import { AsteriskIcon } from 'lucide-vue-next';
import { SlashIcon } from '@radix-icons/vue';
import { computed, onMounted, ref } from 'vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import AlertError from '@/components/AlertError.vue';
import { useRoute } from 'vue-router';
import { useLoaderStore } from '@/stores/LoaderStore';

const route = useRoute();
const loader = useLoaderStore();

const selectedCliente = ref<Cliente | null>(null);
const searchClienteOpen = ref<boolean>(false);

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

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
    dnp: number | undefined,
}>({
    tipo_detalle: TipoReceta.Lejos,
    od_esferico: undefined,
    od_cilindrico: undefined,
    od_grados: undefined,
    oi_esferico: undefined,
    oi_cilindrico: undefined,
    oi_grados: undefined,
    dnp: undefined,
})

const isValidReceta = ref<{
    tipoReceta: boolean,
    fecha: boolean,
    cliente: boolean,
}>({
    tipoReceta: true,
    fecha: true,
    cliente: true,
})

const isValidDetalleCerca = ref<{
    tipo_detalle: boolean,
    od_esferico: boolean,
    od_cilindrico: boolean,
    od_grados: boolean,
    oi_esferico: boolean,
    oi_cilindrico: boolean,
    oi_grados: boolean,
    dnp: boolean,
}>({
    tipo_detalle: true,
    od_esferico: true,
    od_cilindrico: true,
    od_grados: true,
    oi_esferico: true,
    oi_cilindrico: true,
    oi_grados: true,
    dnp: true,
})

const isValidDetalleLejos = ref<{
    tipo_detalle: boolean,
    od_esferico: boolean,
    od_cilindrico: boolean,
    od_grados: boolean,
    oi_esferico: boolean,
    oi_cilindrico: boolean,
    oi_grados: boolean,
    dnp: boolean,
}>({
    tipo_detalle: true,
    od_esferico: true,
    od_cilindrico: true,
    od_grados: true,
    oi_esferico: true,
    oi_cilindrico: true,
    oi_grados: true,
    dnp: true,
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
        const createdReceta = await recetasApi.createRecetaAereos(newRecetaObj);
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
</script>

<template>
<div class="page">
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

            <!-- Fila 1: Cliente / Fecha / Tipo Receta -->
            <div class="flex flex-row w-full justify-between items-end gap-6 mt-4">

                <!-- Cliente -->
                <div class="flex flex-col gap-1 w-[35%]">
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
                <div class="flex flex-col gap-1 w-[30%]">
                    <Label class="text-xs text-[#888]">Fecha Receta</Label>
                    <div class="flex flex-row items-center gap-2">
                        <Input type="text" v-model="fechaReceta.day"   placeholder="DD"   class="h-9 w-16 text-center" maxlength="2" />
                        <Input type="text" v-model="fechaReceta.month" placeholder="MM"   class="h-9 w-16 text-center" maxlength="2" />
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
                <div class="flex flex-col gap-1 w-[30%]">
                    <Label class="text-xs text-[#888]">Tipo Receta</Label>
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

                        <Separator orientation="vertical" class="h-20 mx-4" />

                        <!-- DNP -->
                        <div class="flex flex-col items-center gap-1 pl-6">
                            <Label class="text-xs text-[#888] mr-2">DNP</Label>
                            <div class="flex items-center gap-1">
                                <Input type="decimal" class="h-9 w-20" v-model="currentDetalleLejos.dnp" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleLejos.dnp }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Campo requerido</p></TooltipContent></Tooltip></TooltipProvider>
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

                        <Separator orientation="vertical" class="h-20 mx-4" />

                        <!-- DNP -->
                        <div class="flex flex-col items-center gap-1 pl-6">
                            <Label class="text-xs text-[#888] mr-2">DNP</Label>
                            <div class="flex items-center gap-1">
                                <Input type="decimal" class="h-9 w-20" v-model="currentDetalleCerca.dnp" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidDetalleCerca.dnp }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Campo requerido</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Separator class="my-8 w-full" />

            <!-- Sección Cristales -->
            <div class="w-full rounded-2xl border border-[#e5e5e5] p-6">
                <p class="font-bold text-base mb-6 text-[#1a1a1a]">Cristales</p>

                <div class="flex flex-row gap-8 w-full">

                    <!-- Columna izquierda: selectores -->
                    <div class="flex flex-col gap-5 w-[35%]">

                        <!-- Tipo cristal -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Tipo</Label>
                            <div class="flex items-center gap-2">
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
                        </div>

                        <!-- Color -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Color</Label>
                            <div class="flex items-center gap-2">
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
                        </div>

                        <!-- Tratamiento -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Tratamiento</Label>
                            <div class="flex items-center gap-2">
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
                        </div>

                    </div>

                    <!-- Columna derecha: armazón + oftalmólogo + observaciones -->
                    <div class="flex flex-col gap-5 flex-1">

                        <div class="flex flex-row gap-6">
                            <!-- Armazón -->
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Armazón</Label>
                                <Input class="h-9 w-full" v-model="newReceta.armazon" />
                            </div>

                            <!-- Oftalmólogo -->
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Oftalmólogo</Label>
                                <Input class="h-9 w-full" v-model="newReceta.oftalmologo" />
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Observaciones</Label>
                            <Textarea class="resize-none w-full h-[7.5rem]" v-model="newReceta.observaciones" />
                        </div>

                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="form-footer w-full flex flex-row justify-end mt-8 mb-6 gap-4">
                <Button type="button" variant="outline" class="w-[15%]" @click="redirectCancel">Cancelar</Button>
                <Button type="submit" class="w-[15%]">Guardar</Button>
            </div>

        </form>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>
</template>

<style>
</style>