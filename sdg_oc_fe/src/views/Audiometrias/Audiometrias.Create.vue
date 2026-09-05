<script lang="ts" setup>
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

import { SlashIcon, AsteriskIcon, EarIcon } from 'lucide-vue-next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {Textarea} from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { audiometriaCustomValidator } from '@/api/entities/audiometrias';
import { audiometriasApi } from '@/api/libs/audiometrias';
import AlertError from '@/components/AlertError.vue';
import { previousRoute, router } from '@/router/index';
import {computed, onMounted, ref } from 'vue'
import { Cliente } from '@/api/entities/clientes';
import { clientesApi } from '@/api/libs/clientes';
import SelectClienteDialog from '@/components/SelectClienteDialog.vue';
import { useLoaderStore } from '@/stores/LoaderStore';
import { useRoute } from 'vue-router';

const loader = useLoaderStore();
const route = useRoute()

const showError = ref<boolean>(false);
const errorMessage =ref<string>('');
const errorPDF =ref<string>('');
const searchClienteOpen = ref<boolean>(false);
const selectedCliente = ref<Cliente | null>(null);
const audiometriaFile = ref<any>(null);
const audiometriaURL = ref(); //TODO REMOVE


const _today = new Date()
const fechaInforme = ref({
  day: String(_today.getDate()).padStart(2, '0'),
  month: String(_today.getMonth() + 1).padStart(2, '0'),
  year: String(_today.getFullYear())
})

const newAudiometria = ref<{
    cliente: {
        id: undefined | number
    },
    observaciones: string | undefined,
    fechaInforme: Date | undefined,
}>({
    cliente: {
        id: undefined
    },
    fechaInforme: undefined,
    observaciones: undefined
})

const isValidAudiometria = ref<{
    cliente: boolean,
    fechaInforme: boolean,
    file: boolean
}>({
    cliente: true,
    fechaInforme: true,
    file: true
})


onMounted(async()=>{
    try{
        loader.show();
        const query = route.query
        if(query.cliente){
            const foundCliente = await clientesApi.getOne(Number(query.cliente))
            if(foundCliente) handleSelectCliente(foundCliente)
        }
        loader.hide();
    } catch (err: any) {
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    };
})

const onSubmit = async () => {
    loader.show()
    try {
        newAudiometria.value.fechaInforme = new Date(parseInt(fechaInforme.value.year), parseInt(fechaInforme.value.month)-1, parseInt(fechaInforme.value.day))
        await audiometriasApi.create(newAudiometria.value, audiometriaFile.value )
        router.push(`/clientes/dashboard/${newAudiometria.value.cliente.id}`)
        toast({
            title: 'Audiometría registrada con éxito',
        })
        loader.hide();
    } catch (err: any) {
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    };
}

const validateAndSubmit = async () => {
    errorPDF.value = '';
    const resultAudiometria = audiometriaCustomValidator(newAudiometria.value, fechaInforme.value, audiometriaFile.value);
    isValidAudiometria.value = resultAudiometria.isValid;
    if(resultAudiometria.success){
        await onSubmit();
    }else {
        if(!isValidAudiometria.value.file){
            if (!audiometriaFile.value) {
                errorPDF.value = 'Suba el archivo del informe';
                audiometriaFile.value = null;
                return;
            }
            if (audiometriaFile.value?.type !== 'application/pdf') {
                errorPDF.value = 'Archivo inválido, debe ser un PDF';
                audiometriaFile.value = null;
                return;
            }
        }
    }
    loader.hide()
};


const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file?.type !== 'application/pdf') {
            errorPDF.value = 'Archivo inválido, debe ser un PDF';
            audiometriaFile.value = null;
        } else {
            errorPDF.value = '';
            audiometriaFile.value = file;
            audiometriaURL.value = URL.createObjectURL(file);

        }
    }
};

const handleSelectCliente = (cliente:Cliente)=>{
    selectedCliente.value=cliente;
    newAudiometria.value.cliente.id = cliente.id;
    searchClienteOpen.value=false;
}

const redirectCancel = ()=>{
    if (previousRoute) {
        router.push(previousRoute);
    } else {
        selectedCliente.value
        ? router.push(`/clientes/dashboard/${selectedCliente.value.id}`)
        : router.push(`/`)
    }
}
const nombreCliente = computed(()=>  selectedCliente.value?.apellido +", "+ selectedCliente.value?.nombre);


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
                <BreadcrumbLink :href="`/audiometrias/${selectedCliente?.id}`">Audiometrias</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="selectedCliente"><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbPage>Nueva audiometría</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4">
        <form @submit.prevent="validateAndSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-stretch justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-[10px] bg-[#1a1a1a] text-white">
                        <EarIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Nueva Audiometría</h2>
                        <p class="text-xl text-zinc-400 mt-1">
                            {{ selectedCliente ? nombreCliente : 'Sin cliente seleccionado' }} · {{ fechaInforme.day }}/{{ fechaInforme.month }}/{{ fechaInforme.year }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Grid principal: contenido + sidebar PDF -->
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start w-full">

                <!-- COLUMNA IZQUIERDA -->
                <div class="flex flex-col gap-6 min-w-0">

                    <!-- Datos de la audiometría -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Datos de la audiometría</h4>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                            <!-- Cliente -->
                            <div class="flex flex-col gap-1 sm:col-span-2">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Cliente</Label>
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
                                        title="Nueva Audiometría: Seleccionar Cliente"
                                        @select-cliente="handleSelectCliente"
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidAudiometria.cliente }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Seleccionar cliente</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <!-- Fecha Informe -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Fecha informe</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Input type="text" v-model="fechaInforme.day"   placeholder="DD"   class="h-9 w-12 text-center" maxlength="2" />
                                    <Input type="text" v-model="fechaInforme.month" placeholder="MM"   class="h-9 w-12 text-center" maxlength="2" />
                                    <Input type="text" v-model="fechaInforme.year"  placeholder="AAAA" class="h-9 w-16 text-center" maxlength="4" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidAudiometria.fechaInforme }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Ingresar una fecha válida</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Observaciones</h4>
                        </div>
                        <div class="p-6">
                            <Textarea class="resize-none w-full min-h-[10rem]" v-model="newAudiometria.observaciones" />
                        </div>
                    </div>

                </div>

                <!-- COLUMNA DERECHA: Informe PDF -->
                <div class="lg:sticky lg:top-4 flex flex-col gap-6">
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Informe PDF</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">
                            <div class="flex flex-col gap-1">
                                <div class="flex flex-row items-center gap-2">
                                    <Input type="file" class="h-9 w-full" accept=".pdf" @change="handleFileUpload" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidAudiometria.file }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>{{ errorPDF || 'Suba el archivo del informe' }}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <div v-if="audiometriaURL" class="h-[26rem] rounded-lg border border-[#e5e5e5] overflow-hidden">
                                <iframe :src="audiometriaURL" class="w-full h-full border-none" frameborder="0" allowfullscreen></iframe>
                            </div>
                            <div v-else class="h-[26rem] flex items-center justify-center rounded-lg border border-dashed border-[#e5e5e5]">
                                <span class="text-sm text-zinc-400">Ningún PDF seleccionado</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#e5e5e5] mt-2">
                <div class="flex flex-row items-center justify-end gap-3 py-3">
                    <Button type="button" variant="outline" @click="redirectCancel">Cancelar</Button>
                    <Button type="submit">Guardar audiometría</Button>
                </div>
            </div>

        </form>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>
</template>
