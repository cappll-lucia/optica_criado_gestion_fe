<script lang="ts" setup>
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { AsteriskIcon, EarIcon, SlashIcon } from 'lucide-vue-next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Audiometria, editAudiometriaCustomValidator } from '@/api/entities/audiometrias';
import { audiometriasApi } from '@/api/libs/audiometrias';
import AlertError from '@/components/AlertError.vue';
import { previousRoute, router } from '@/router/index';
import {computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
import AlertConfirm from '@/components/AlertConfirm.vue';
import { uploadsApi } from '@/api/libs/uploads';
import { useLoaderStore } from '@/stores/LoaderStore';
import Textarea from '@/components/ui/textarea/Textarea.vue';


const currentAudiometria = ref<Audiometria>();
const route = useRoute();
const loader = useLoaderStore();

const showError = ref<boolean>(false);
const errorMessage =ref<string>('');
const editedAudiometriaFile = ref<boolean>(false);
const audiometriaURL = ref();
const audiometriaFile = ref();
const errorPDF =ref<string>('');
const targetUpdate = ref();
const showNewPDFAlert = ref(false);

const fechaInforme = ref({
  day: '',
  month: '',
  year: ''
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
        currentAudiometria.value = await audiometriasApi.getOne(Number(route.params.id));
        if(currentAudiometria.value){
            currentAudiometria.value.fechaInforme = new Date(currentAudiometria.value.fechaInforme)
            fechaInforme.value.day = currentAudiometria.value.fechaInforme.getDate().toString()
            fechaInforme.value.month = (currentAudiometria.value.fechaInforme.getMonth()+1).toString()
            fechaInforme.value.year = currentAudiometria.value.fechaInforme.getFullYear().toString()
            currentAudiometria.value.fechaInforme = new Date(currentAudiometria.value.fechaInforme);
            audiometriaFile.value = await uploadsApi.getFile(`audiometrias/${currentAudiometria.value?.linkPDF}`)
        }
        loader.hide();
    } catch (err: any) {
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    };
})

const onSubmit = async () => {
    try {
        if(currentAudiometria.value){
            currentAudiometria.value.fechaInforme = new Date(parseInt(fechaInforme.value.year), parseInt(fechaInforme.value.month)-1, parseInt(fechaInforme.value.day))
            if(editedAudiometriaFile.value){
                await audiometriasApi.edit( currentAudiometria.value?.id ,currentAudiometria.value, audiometriaFile.value )
            }else{
                await audiometriasApi.edit( currentAudiometria.value?.id ,currentAudiometria.value )
            }
            router.push(`/audiometrias/${currentAudiometria.value.cliente.id}`)
            loader.hide();
            toast({
                title: 'Audiometría registrada con éxito',
            })
        }
    } catch (err: any) {
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    };
}



const validateAndSubmit = async()=>{
    if(currentAudiometria.value){
        loader.show();
        errorPDF.value = '';
        let resultAudiometria
        if(!editedAudiometriaFile.value){
            resultAudiometria = editAudiometriaCustomValidator({cliente: currentAudiometria?.value.cliente, observaciones: currentAudiometria.value?.observaciones }, fechaInforme.value, undefined);
        }else{
            resultAudiometria = editAudiometriaCustomValidator({cliente: currentAudiometria?.value.cliente, observaciones: currentAudiometria.value?.observaciones }, fechaInforme.value, audiometriaFile.value);
        }
        isValidAudiometria.value = resultAudiometria.isValid;
        if(resultAudiometria.success){
            await onSubmit();
        }else {
            if(!isValidAudiometria.value.file){
                if (audiometriaFile.value && audiometriaFile.value?.type !== 'application/pdf') {
                    errorPDF.value = 'Archivo inválido, debe ser un PDF';
                    audiometriaFile.value = null;
                    isValidAudiometria.value.file=false;

                }
            }
        }
        loader.hide();
    }
}

const confirmFileUpload = (event: Event) => {
    targetUpdate.value = event.target as HTMLInputElement;
    showNewPDFAlert.value=true;
};

const handleFileUpload = () => {
    showNewPDFAlert.value=false;
    if (targetUpdate.value.files && targetUpdate.value.files.length > 0) {
        const file = targetUpdate.value.files[0];
        if (file?.type !== 'application/pdf') {
            isValidAudiometria.value.file=false;
            errorPDF.value = 'Archivo inválido, debe ser un PDF';
            audiometriaFile.value = null;
        } else {
            errorPDF.value = '';
            audiometriaFile.value = file;
            audiometriaURL.value = URL.createObjectURL(file);
            editedAudiometriaFile.value = true;
        }
    }
};

const redirectCancel = () => {
    if (previousRoute) {
        router.push(previousRoute);
    } else if (currentAudiometria.value) {
        router.push(`/clientes/dashboard/${currentAudiometria.value.cliente.id}`);
    }
}

const nombreCliente = computed(()=>  currentAudiometria.value?.cliente.apellido +", "+ currentAudiometria.value?.cliente.nombre);

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
            <BreadcrumbItem v-if="currentAudiometria?.cliente">
                <BreadcrumbLink :href="`/clientes/dashboard/${currentAudiometria?.cliente?.id}`">
                    {{ nombreCliente }}
                </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="currentAudiometria?.cliente"><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem v-if="currentAudiometria?.cliente">
                <BreadcrumbLink :href="`/audiometrias/${currentAudiometria?.cliente?.id}`">Audiometrias</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbPage>Editar audiometría</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div v-if="currentAudiometria" class="pt-4 mb-4">
        <form @submit.prevent="validateAndSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-stretch justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-[10px] bg-[#1a1a1a] text-white">
                        <EarIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Editar Audiometría</h2>
                        <p class="text-lg text-zinc-400">
                            {{ nombreCliente }} · {{ fechaInforme.day }}/{{ fechaInforme.month }}/{{ fechaInforme.year }}
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
                                <div class="h-9 w-full flex items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-[#1a1a1a]">
                                    {{ nombreCliente }}
                                </div>
                            </div>

                            <!-- Fecha Informe -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Fecha informe</Label>
                                <div class="h-9 w-fit min-w-[10rem] flex items-center rounded-lg border border-input bg-muted/40 px-3 text-sm text-[#1a1a1a]">
                                    {{ fechaInforme.day.padStart(2, '0') }}/{{ fechaInforme.month.padStart(2, '0') }}/{{ fechaInforme.year }}
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
                            <Textarea class="resize-none w-full min-h-[10rem]" v-model="currentAudiometria.observaciones" />
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
                                    <Input type="file" class="h-9 w-full" accept=".pdf" @change="confirmFileUpload" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidAudiometria.file }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>{{ errorPDF || 'Archivo del informe' }}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <div v-if="!editedAudiometriaFile">
                                <div v-if="audiometriaFile" class="h-[26rem] rounded-lg border border-[#e5e5e5] overflow-hidden">
                                    <iframe :src="audiometriaFile" class="w-full h-full border-none" frameborder="0" allowfullscreen></iframe>
                                </div>
                                <div v-else class="h-[26rem] flex items-center justify-center rounded-lg border border-dashed border-[#e5e5e5]">
                                    <span class="text-sm text-zinc-400">Ningún PDF seleccionado</span>
                                </div>
                            </div>
                            <div v-else>
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

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#e5e5e5] mt-2">
                <div class="flex flex-row items-center justify-end gap-3 py-3">
                    <Button type="button" variant="outline" @click="redirectCancel">Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </div>

        </form>
    </div>
    </div>

    <AlertError
        v-model="showError"
        title="Error"
        :message="errorMessage"
        button="Aceptar"
        :action="()=>{showError=false}"
    />

    <AlertConfirm
        v-model="showNewPDFAlert"
        title="¿Está seguro de actualizar el PDF?"
        message="Al almacenar el nuevo PDF, se eliminará el anterior"
        primary-btn="Aceptar"
        :primary-action="handleFileUpload"
        secondary-btn="Cancelar"
        :secondary-action="()=>showNewPDFAlert=false"
    />

</div>
</template>
