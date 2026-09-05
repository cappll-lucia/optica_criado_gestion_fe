<script setup lang="ts">
import { Cliente } from '@/api/entities/clientes';
import { clientesApi } from '@/api/libs/clientes';
import { recetasApi } from '@/api/libs/recetas';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Button from '@/components/ui/button/Button.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Label from '@/components/ui/label/Label.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { toast } from '@/components/ui/toast';
import { router } from '@/router';
import { useLoaderStore } from '@/stores/LoaderStore';
import { SlashIcon } from '@radix-icons/vue';
import { FileClock } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AlertError from '@/components/AlertError.vue';


const route = useRoute();
const loader = useLoaderStore();

const selectedCliente = ref<Cliente| null>(null);


const showError = ref<boolean>(false);
const errorMessage =ref<string>('');

const newHistoriaClinica = ref<{
    patologicas: boolean;
    traumaticas: boolean;
    sensLuzNatural: boolean;
    sensLuzArtificial: boolean;
    sensHumo: boolean;
    sensFrio: boolean;
    sensPolvo: boolean;
    observacionesSens: string;
    transtornosNeurologicos: boolean;
    regimenEventual: boolean;
    glandulasEndocinas: boolean;
    sistemaCardiovascular: boolean;
    embarazo: boolean;
    estomatologia: boolean;
    caries: boolean;
    digestivo: boolean;
    alergiaDigestiva: boolean;
    alergiaRespiratoria: boolean;
    alergiaCutanea: boolean;
    alergiaOtras: boolean;
    rinitisPrimaveral: boolean;
    sinusitisCronica: boolean;
    observacionesAntecedentes: string;
    antibioticos: boolean;
    antiestaminicos: boolean;
    pildoraContraceptiva: boolean;
    anorexigenos: boolean;
    neurolepticos: boolean;
    tratamientoDigestivo: boolean;
    dirueticos: boolean;
    tranquilizantes: boolean;
    corticoides: boolean;
    parasimpaticoliticos: boolean;
}>({
    patologicas: false,
    traumaticas: false,
    sensLuzNatural: false,
    sensLuzArtificial: false,
    sensHumo: false,
    sensFrio: false,
    sensPolvo: false,
    observacionesSens: '',
    transtornosNeurologicos: false,
    regimenEventual: false,
    glandulasEndocinas: false,
    sistemaCardiovascular: false,
    embarazo: false,
    estomatologia: false,
    caries: false,
    digestivo: false,
    alergiaDigestiva: false,
    alergiaRespiratoria: false,
    alergiaCutanea: false,
    alergiaOtras: false,
    rinitisPrimaveral: false,
    sinusitisCronica: false,
    observacionesAntecedentes: '',
    antibioticos: false,
    antiestaminicos: false,
    pildoraContraceptiva: false,
    anorexigenos: false,
    neurolepticos: false,
    tratamientoDigestivo: false,
    dirueticos: false,
    tranquilizantes: false,
    corticoides: false,
    parasimpaticoliticos: false,
})



onMounted(async()=>{
    try{
        loader.show();
        const query = route.query
        if(query.cliente){
            const foundCliente = await clientesApi.getOne(Number(query.cliente))
            if(foundCliente){
                selectedCliente.value=foundCliente
            }
        }
        loader.hide();
    }catch(err: any){
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    }
})
const nombreCliente = computed(()=> selectedCliente.value?.apellido +", "+selectedCliente.value?.nombre)


const onSubmit = async()=>{
    try{
        if(!selectedCliente.value) return
        loader.show();
        const hc = {
            ...newHistoriaClinica.value,
            cliente: {id: selectedCliente.value.id}
        }
        await recetasApi.createHistoriaClinica(hc)
        loader.hide();
        router.push(`/recetas/${selectedCliente.value.id}?tab=contacto&recetaId=hc`)
        toast({
            title: 'Historia clínica registrada con éxito',
        })
    }catch(err: any){
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    }
}


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
                <BreadcrumbLink :href="`/clientes/dashboard/${selectedCliente?.id}`">{{ nombreCliente }}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="selectedCliente"><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem v-if="selectedCliente">
                <BreadcrumbLink :href="`/recetas/${selectedCliente?.id}`">Recetas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator v-if="selectedCliente"><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbPage>Nueva historia clínica lentes de contacto</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4">
        <form @submit.prevent="onSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-[10px] bg-[#1a1a1a] text-white">
                        <FileClock :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Nueva Historia Clínica · Lentes de Contacto</h2>
                        <p class="text-xl text-zinc-400 mt-1">
                            {{ selectedCliente ? nombreCliente : 'Sin cliente seleccionado' }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-6 w-full">

                <!-- Antecedentes Oculares -->
                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#e5e5e5]">
                        <h4 class="font-bold text-sm text-[#1a1a1a]">Antecedentes Oculares</h4>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3">
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.patologicas" />
                                <Label class="text-sm font-light leading-none">Patológicos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.traumaticas" />
                                <Label class="text-sm font-light leading-none">Traumáticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sensLuzNatural" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Luz Natural</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sensLuzArtificial" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Luz Artificial</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sensPolvo" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Polvo</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sensFrio" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Frío</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sensHumo" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Humo</Label>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-5 pt-4 border-t border-zinc-100">
                            <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Observaciones</Label>
                            <Textarea v-model="newHistoriaClinica.observacionesSens" class="resize-none h-[3rem]" />
                        </div>
                    </div>
                </div>

                <!-- Antecedentes Generales -->
                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#e5e5e5]">
                        <h4 class="font-bold text-sm text-[#1a1a1a]">Antecedentes Generales</h4>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3">
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.transtornosNeurologicos" />
                                <Label class="text-sm font-light leading-none">Trastornos Neurológicos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.regimenEventual" />
                                <Label class="text-sm font-light leading-none">Régimen Eventual</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.glandulasEndocinas" />
                                <Label class="text-sm font-light leading-none">Glándulas Endócrinas</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sistemaCardiovascular" />
                                <Label class="text-sm font-light leading-none">Sistema Cardiovascular</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.embarazo" />
                                <Label class="text-sm font-light leading-none">Embarazo</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.estomatologia" />
                                <Label class="text-sm font-light leading-none">Estomatología</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.caries" />
                                <Label class="text-sm font-light leading-none">Caries</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.digestivo" />
                                <Label class="text-sm font-light leading-none">Digestivos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.alergiaDigestiva" />
                                <Label class="text-sm font-light leading-none">Alergia Digestiva</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.alergiaRespiratoria" />
                                <Label class="text-sm font-light leading-none">Alergia Respiratoria</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.alergiaCutanea" />
                                <Label class="text-sm font-light leading-none">Alergia Cutánea</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.alergiaOtras" />
                                <Label class="text-sm font-light leading-none">Otras Alergias</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.rinitisPrimaveral" />
                                <Label class="text-sm font-light leading-none">Rinitis Primaveral</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.sinusitisCronica" />
                                <Label class="text-sm font-light leading-none">Sinusitis Crónica</Label>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-5 pt-4 border-t border-zinc-100">
                            <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Observaciones</Label>
                            <Textarea v-model="newHistoriaClinica.observacionesAntecedentes" class="resize-none h-[3rem]" />
                        </div>
                    </div>
                </div>

                <!-- Tratamientos Recientes o En Curso -->
                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#e5e5e5]">
                        <h4 class="font-bold text-sm text-[#1a1a1a]">Tratamientos Recientes o En Curso</h4>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3">
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.antibioticos" />
                                <Label class="text-sm font-light leading-none">Antibióticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.antiestaminicos" />
                                <Label class="text-sm font-light leading-none">Antiestamínicos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.pildoraContraceptiva" />
                                <Label class="text-sm font-light leading-none">Píldora Contraceptiva</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.anorexigenos" />
                                <Label class="text-sm font-light leading-none">Anorexígenos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.neurolepticos" />
                                <Label class="text-sm font-light leading-none">Neurolépticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.tratamientoDigestivo" />
                                <Label class="text-sm font-light leading-none">Tratamiento Digestivo</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.tranquilizantes" />
                                <Label class="text-sm font-light leading-none">Tranquilizantes</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.dirueticos" />
                                <Label class="text-sm font-light leading-none">Diuréticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.corticoides" />
                                <Label class="text-sm font-light leading-none">Corticoides</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="newHistoriaClinica.parasimpaticoliticos" />
                                <Label class="text-sm font-light leading-none">Parasimpaticolíticos</Label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#e5e5e5] mt-2">
                <div class="flex flex-row items-center justify-end gap-3 py-3">
                    <Button type="button" variant="outline" @click="router.push(`/recetas/${selectedCliente?.id}?tab=contacto&recetaId=hc`)">Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </div>

        </form>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>
</template>