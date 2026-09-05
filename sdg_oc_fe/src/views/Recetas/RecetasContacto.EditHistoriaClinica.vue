<script setup lang="ts">
import { Cliente } from '@/api/entities/clientes';
import { HistoriaClinica } from '@/api/entities/historiaClinica';
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

const currentHistoriaClinica = ref<HistoriaClinica>();

const showError = ref<boolean>(false);
const errorMessage =ref<string>('');




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
        currentHistoriaClinica.value = await recetasApi.getHistoriaClinica(Number(route.params.id))
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
        if(!currentHistoriaClinica.value ) return;
        if(!selectedCliente.value ) return;
        loader.show();
        await recetasApi.editHistoriaClinica(currentHistoriaClinica.value)
        loader.hide();
        router.push(`/recetas/${selectedCliente.value.id}?tab=contacto&recetaId=hc`)
        toast({
            title: 'Historia actualizada con éxito',
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
                <BreadcrumbPage>Historia clínica lentes de contacto</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4" v-if="currentHistoriaClinica">
        <form @submit.prevent="onSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-lg bg-primary text-primary-foreground">
                        <FileClock :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Editar Historia Clínica · Lentes de Contacto</h2>
                        <p class="text-lg text-zinc-400">
                            {{ selectedCliente ? nombreCliente : 'Sin cliente seleccionado' }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-6 w-full">

                <!-- Antecedentes Oculares -->
                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#f0f0f0]">
                        <h4 class="font-bold text-sm text-[#1a1a1a]">Antecedentes Oculares</h4>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3">
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.patologicas" />
                                <Label class="text-sm font-light leading-none">Patológicos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.traumaticas" />
                                <Label class="text-sm font-light leading-none">Traumáticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sensLuzNatural" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Luz Natural</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sensLuzArtificial" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Luz Artificial</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sensPolvo" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Polvo</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sensFrio" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Frío</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sensHumo" />
                                <Label class="text-sm font-light leading-none">Sensibilidad Humo</Label>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-5 pt-4 border-t border-zinc-100">
                            <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Observaciones</Label>
                            <Textarea v-model="currentHistoriaClinica.observacionesSens" class="resize-none h-[3rem]" />
                        </div>
                    </div>
                </div>

                <!-- Antecedentes Generales -->
                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#f0f0f0]">
                        <h4 class="font-bold text-sm text-[#1a1a1a]">Antecedentes Generales</h4>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3">
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.transtornosNeurologicos" />
                                <Label class="text-sm font-light leading-none">Trastornos Neurológicos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.regimenEventual" />
                                <Label class="text-sm font-light leading-none">Régimen Eventual</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.glandulasEndocinas" />
                                <Label class="text-sm font-light leading-none">Glándulas Endócrinas</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sistemaCardiovascular" />
                                <Label class="text-sm font-light leading-none">Sistema Cardiovascular</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.embarazo" />
                                <Label class="text-sm font-light leading-none">Embarazo</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.estomatologia" />
                                <Label class="text-sm font-light leading-none">Estomatología</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.caries" />
                                <Label class="text-sm font-light leading-none">Caries</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.digestivo" />
                                <Label class="text-sm font-light leading-none">Digestivos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.alergiaDigestiva" />
                                <Label class="text-sm font-light leading-none">Alergia Digestiva</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.alergiaRespiratoria" />
                                <Label class="text-sm font-light leading-none">Alergia Respiratoria</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.alergiaCutanea" />
                                <Label class="text-sm font-light leading-none">Alergia Cutánea</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.alergiaOtras" />
                                <Label class="text-sm font-light leading-none">Otras Alergias</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.rinitisPrimaveral" />
                                <Label class="text-sm font-light leading-none">Rinitis Primaveral</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.sinusitisCronica" />
                                <Label class="text-sm font-light leading-none">Sinusitis Crónica</Label>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-5 pt-4 border-t border-zinc-100">
                            <Label class="text-[10px] font-medium  text-zinc-400 uppercase">Observaciones</Label>
                            <Textarea v-model="currentHistoriaClinica.observacionesAntecedentes" class="resize-none h-[3rem]" />
                        </div>
                    </div>
                </div>

                <!-- Tratamientos Recientes o En Curso -->
                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-4 border-b border-[#f0f0f0]">
                        <h4 class="font-bold text-sm text-[#1a1a1a]">Tratamientos Recientes o En Curso</h4>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-y-3">
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.antibioticos" />
                                <Label class="text-sm font-light leading-none">Antibióticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.antiestaminicos" />
                                <Label class="text-sm font-light leading-none">Antiestamínicos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.pildoraContraceptiva" />
                                <Label class="text-sm font-light leading-none">Píldora Contraceptiva</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.anorexigenos" />
                                <Label class="text-sm font-light leading-none">Anorexígenos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.neurolepticos" />
                                <Label class="text-sm font-light leading-none">Neurolépticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.tratamientoDigestivo" />
                                <Label class="text-sm font-light leading-none">Tratamiento Digestivo</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.tranquilizantes" />
                                <Label class="text-sm font-light leading-none">Tranquilizantes</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.dirueticos" />
                                <Label class="text-sm font-light leading-none">Diuréticos</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.corticoides" />
                                <Label class="text-sm font-light leading-none">Corticoides</Label>
                            </div>
                            <div class="flex items-center gap-2">
                                <Checkbox v-model:checked="currentHistoriaClinica.parasimpaticoliticos" />
                                <Label class="text-sm font-light leading-none">Parasimpaticolíticos</Label>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#f0f0f0] mt-2">
                <div class="flex flex-row items-center justify-end gap-3 py-3">
                    <Button type="button" variant="outline" @click="router.push(`/recetas/${selectedCliente?.id}?tab=contacto&recetaId=hc`)">Cancelar</Button>
                    <Button type="submit">Guardar</Button>
                </div>
            </div>

        </form>
    </div>

    <div class="pt-4 mb-4" v-else>
        <div class="flex flex-col justify-between items-start">
            <div class="w-full">
                <h3 class="page-subtitle text-center">Historia clínica con id={{ route.params.id }} no encontrada</h3>
            </div>
        </div>
    </div>

    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>
</template>
