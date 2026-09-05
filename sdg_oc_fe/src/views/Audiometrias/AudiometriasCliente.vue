<script lang="ts" setup>
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Pencil1Icon, SlashIcon } from '@radix-icons/vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { clientesApi } from '@/api/libs/clientes';
import { Audiometria } from '@/api/entities/audiometrias';
import { Cliente } from '@/api/entities/clientes';
import { formatDate } from '@/lib/utils.recetas';
import { EarIcon } from 'lucide-vue-next';
import { uploadsApi } from '@/api/libs/uploads';
import { router } from '@/router';
import { useLoaderStore } from '@/stores/LoaderStore';
import AlertError from '@/components/AlertError.vue';

const route = useRoute();
const loader = useLoaderStore();

const selectedAudiom = ref<undefined | Audiometria>();
const currentCliente = ref<Cliente>();
const audiometriasCliente = ref<Audiometria[]>([]);
const filePDF = ref();

const showError = ref<boolean>(false);
const errorMessage =ref<string>('');


onMounted(async () => {
    await loadData();
})

const loadData = async()=> {
    try{
        loader.show();
        const id = Number(route.params.idCliente);
        if(id==0){
            loader.hide();
            return;
        }
        currentCliente.value = await clientesApi.getOne(id)
        if(!currentCliente.value){
            loader.hide();
            return;
        }
        audiometriasCliente.value = await clientesApi.getAudiometriasByCliente(Number(route.params.idCliente));
        selectedAudiom.value = audiometriasCliente.value[0];
        if(selectedAudiom.value){
            filePDF.value = await uploadsApi.getFile(`audiometrias/${selectedAudiom.value.linkPDF}`);
        }
        loader.hide();
    }catch(err: any){
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    }
}

const changeSelectedAudiom = async(audiometria: Audiometria) =>{
    try{
        loader.show();
        selectedAudiom.value=audiometria;
        filePDF.value = await uploadsApi.getFile(`audiometrias/${selectedAudiom.value?.linkPDF}`)
        loader.hide()
    }catch(err: any){
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    }
}

const nombreCliente = computed(()=> currentCliente.value?.apellido +", "+currentCliente.value?.nombre)

</script>

<template>
    <div class="page" v-if="currentCliente">
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
                    <BreadcrumbLink :href="`/clientes/dashboard/${currentCliente?.id}`">
                        {{ nombreCliente }}
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Audiometrías</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        </div>

        <div class="inter-page">
        <div class="flex flex-row justify-between items-center w-full mb-4 mt-2">
            <h1 class="page-title">Audiometrías: {{ nombreCliente }}</h1>
            <Button
                class="text-xs px-3 py-2 h-auto"
                @click="router.push(`/audiometrias/create?cliente=${currentCliente?.id}`)">
                + Nueva Audiometría
            </Button>
        </div>

        <div class="pt-2">
            <div v-if="audiometriasCliente.length > 0" class="bg-zinc-50 min-h-[60rem] px-2 py-6 rounded-lg border border-zinc-200">
                <div class="w-full flex flex-row h-full">

                    <!-- Sidebar timeline -->
                    <div class="w-[30%] p-2 pt-0 h-full">
                        <div class="relative mr-2 pl-4">
                            <div class="absolute left-[1.35rem] top-2 bottom-2 w-px bg-zinc-200" />

                            <div
                                v-for="(audiom, index) in audiometriasCliente"
                                :key="audiom.id"
                                class="relative flex items-center gap-3 py-2.5 cursor-pointer group"
                                @click="changeSelectedAudiom(audiom)">

                                <div class="relative z-10 shrink-0 w-3 h-3 rounded-full border-2 transition-all"
                                    :class="selectedAudiom === audiom
                                        ? 'bg-[#000] border-black'
                                        : 'bg-white border-zinc-300 group-hover:bg-zinc-300'" />

                                <div class="flex flex-col gap-0.5 flex-1 min-w-0 py-3 px-3 rounded-lg border-2 border-transparent"
                                    :class="selectedAudiom === audiom ? 'bg-zinc-900 text-white' : 'hover:border-zinc-300'">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <span class="text-sm font-semibold">
                                            {{ formatDate(audiom.fechaInforme.toString()) }}
                                        </span>
                                        <span v-if="index === 0"
                                            class="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-50">
                                            Última
                                        </span>
                                    </div>
                                    <span class="text-xs" :class="selectedAudiom === audiom ? 'text-white' : 'text-zinc-900'">Audiometría</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator orientation="vertical" />

                    <!-- Detail -->
                    <div class="w-[72%] h-full px-8" v-if="selectedAudiom">
                        <div class="flex flex-row justify-between items-center mb-4">
                            <div class="flex flex-row items-center gap-2">
                                <div class="flex items-center justify-center p-2">
                                    <EarIcon :size="25" />
                                </div>
                                <h4 class="font-bold text-xl text-zinc-900">Audiometría</h4>
                            </div>

                            <Button
                                variant="outline"
                                class="gap-1.5 text-xs px-3 py-2.5 h-auto"
                                @click="router.push(`/audiometrias/edit/${selectedAudiom?.id}`)">
                                <Pencil1Icon class="w-3.5 h-3.5" />
                                Editar
                            </Button>
                        </div>

                        <div class="flex flex-col gap-6">

                            <!-- Datos de la audiometría -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Datos de la audiometría</h4>
                                </div>
                                <div class="p-6 grid grid-cols-3 gap-y-5">
                                    <div class="flex flex-col gap-0.5">
                                        <span class="text-xs text-zinc-400">Fecha informe</span>
                                        <span class="text-sm font-medium">{{ formatDate(selectedAudiom.fechaInforme.toString()) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Observaciones -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Observaciones</h4>
                                </div>
                                <div class="p-6">
                                    <span class="text-sm">{{ selectedAudiom.observaciones || '—' }}</span>
                                </div>
                            </div>

                            <!-- Informe PDF -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Informe PDF</h4>
                                </div>
                                <div class="p-6">
                                    <div v-if="selectedAudiom.linkPDF" class="h-[32rem] rounded-lg border border-zinc-200 overflow-hidden">
                                        <iframe :src="filePDF" class="w-full h-full border-none" frameborder="0" allowfullscreen></iframe>
                                    </div>
                                    <div v-else class="h-[10rem] flex items-center justify-center rounded-lg border border-dashed border-zinc-200">
                                        <span class="text-sm text-zinc-400">No hay PDF registrado</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex min-h-[20rem] flex-col w-full justify-center items-center gap-4 bg-zinc-50 rounded-lg border border-zinc-200">
                <p class="text-sm text-zinc-500">El cliente no tiene audiometrías registradas</p>
                <Button
                    class="text-xs px-4 py-2 h-auto"
                    @click="router.push(`/audiometrias/create?cliente=${currentCliente?.id}`)">
                    Registrar audiometría
                </Button>
            </div>
        </div>
        </div>
    </div>

    <!-- Cliente no encontrado -->
    <div class="page" v-else>
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
                    <BreadcrumbPage>Audiometrías</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div class="pt-8 flex justify-center">
            <h3 class="page-subtitle text-center text-zinc-500">
                Cliente con id={{ route.params.idCliente }} no encontrado
            </h3>
        </div>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar"
            :action="()=>{showError=false}" />
</template>


<style scoped>
iframe {
    background-color: #fff;
}
</style>
