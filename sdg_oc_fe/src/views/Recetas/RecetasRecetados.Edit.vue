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
import { AsteriskIcon, PlusCircleIcon } from 'lucide-vue-next';
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
};

const handleShowNewObraSocialCliente = () => {
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
</script>

<template>
<div class="page" v-if="currentReceta">
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

    <div class="pt-2 mb-4">
        <form @submit.prevent="validateAndEdit" class="forms-wide flex flex-col justify-between items-start px-[5rem] !bg-white">

            <!-- Header -->
            <div class="w-full">
                <h3 class="page-subtitle text-center">Editar Receta - Anteojos Recetados</h3>
                <Separator class="my-6 w-full" />
            </div>

            <!-- Fila 1: Cliente / Fecha / Tipo Receta -->
            <div class="flex flex-row w-full justify-between items-end gap-6 mt-4">

                <!-- Cliente (solo lectura) -->
                <div class="flex flex-col gap-1  w-[35%] pr-16  text-[#888]">
                    <Label class="text-xs ">Cliente</Label>
                    <div class="h-9 flex items-center px-3 rounded-md border border-[#e5e5e5] bg-muted cursor-not-allowed  text-sm">
                        {{ currentReceta.cliente.apellido }}, {{ currentReceta.cliente.nombre }}
                    </div>
                </div>

                <!-- Fecha Receta -->
                <div class="flex flex-col gap-1 w-[30%] ml-24">
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

            <!-- Medidas adicionales -->
            <div class="flex flex-row gap-6 w-full mt-6">
                <div class="flex flex-col gap-1 w-[15%]">
                    <Label class="text-xs text-[#888]">DNP</Label>
                    <Input type="decimal" class="h-9 w-full" v-model="currentReceta.dnp" />
                </div>
                <div class="flex flex-col gap-1 w-[15%]">
                    <Label class="text-xs text-[#888]">Alt. Película O.D.</Label>
                    <Input type="decimal" class="h-9 w-full" v-model="currentReceta.od_alt_pelicula" />
                </div>
                <div class="flex flex-col gap-1 w-[15%]">
                    <Label class="text-xs text-[#888]">Alt. Película O.I.</Label>
                    <Input type="decimal" class="h-9 w-full" v-model="currentReceta.oi_alt_pelicula" />
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
                        </div>

                        <!-- Color -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Color</Label>
                            <div class="flex items-center gap-2">
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
                        </div>

                        <!-- Tratamiento -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Tratamiento</Label>
                            <div class="flex items-center gap-2">
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
                        </div>

                    </div>

                    <!-- Columna derecha: armazón + oftalmólogo + observaciones + precios -->
                    <div class="flex flex-col gap-5 flex-1">

                        <div class="flex flex-row gap-6">
                            <!-- Armazón -->
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Armazón</Label>
                                <Input class="h-9 w-full" v-model="currentReceta.armazon" />
                            </div>

                            <!-- Oftalmólogo -->
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Oftalmólogo</Label>
                                <Input class="h-9 w-full" v-model="currentReceta.oftalmologo" />
                            </div>
                        </div>

                        <!-- Precios -->
                        <div class="flex flex-row gap-6">
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Precio Armazón</Label>
                                <Input type="decimal" class="h-9 w-full" v-model="currentReceta.precioArmazon" />
                            </div>
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Precio Cristales</Label>
                                <Input type="decimal" class="h-9 w-full" v-model="currentReceta.precioCristales" />
                            </div>
                            <div class="flex flex-col gap-1 flex-1">
                                <Label class="text-xs text-[#888]">Seña</Label>
                                <Input type="decimal" class="h-9 w-full" v-model="currentReceta.senia" />
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div class="flex flex-col gap-1">
                            <Label class="text-xs text-[#888]">Observaciones</Label>
                            <Textarea class="resize-none w-full h-[7.5rem]" v-model="currentReceta.observaciones" />
                        </div>

                    </div>
                </div>
            </div>

            <!-- Obras Sociales -->
            <div class="w-full rounded-2xl border border-[#e5e5e5] p-6 mt-2">
                <p class="font-bold text-base mb-4 text-[#1a1a1a]">Obras Sociales</p>
                <div v-if="currentObrasSociales.length > 0" class="flex flex-wrap gap-2 mb-4">
                    <div v-for="asoc in currentObrasSociales" :key="asoc.id"
                         class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm">
                        <span>{{ asoc.obraSocial?.nombre ?? clienteForOS?.clienteObrasSociales?.find(cos => cos.obraSocial.id === asoc.obraSocialId)?.obraSocial.nombre }}</span>
                        <button type="button" @click="removeObraSocial(asoc.id)" class="text-[#aaa] hover:text-destructive">
                            <Cross2Icon class="h-3 w-3" />
                        </button>
                    </div>
                </div>
                <div v-if="clienteForOS && (clienteForOS.clienteObrasSociales.length > 0 || currentObrasSociales.length > 0)">
                    <Select @update:model-value="(val) => addObraSocial(val)">
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
                <div v-else-if="clienteForOS">
                    <p class="py-4">No hay obras sociales registradas para el cliente</p>
                    <Button type="button" @click="handleShowNewObraSocialCliente()">Registrar Obra Social</Button>
                </div>
                <Dialog v-model:open="openNewClienteOS">
                    <DialogContent class="max-w-[33rem]">
                        <AddObraSocialClienteForm v-if="clienteForOS" :cliente="clienteForOS" @handle-add-obra-social-cliente="handleAddObraSocialCliente" />
                    </DialogContent>
                </Dialog>
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