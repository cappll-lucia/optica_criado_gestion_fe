<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Pencil1Icon } from '@radix-icons/vue';

import { Checkbox } from '@/components/ui/checkbox';
import { HistoriaClinica } from '@/api/entities/historiaClinica';
import { router } from '@/router';
import { FileClock, HistoryIcon } from 'lucide-vue-next';


const props = defineProps<{
    historiaClinica: HistoriaClinica | undefined,
    clienteId: number
}>();
// TODO inicializar en primera receta


</script>


<template>
    <div class="datos flex flex-col justify-center items-center mt-10" v-if="!props.historiaClinica">
        <span class="text-lg text-center mb-4 font-bold">Historia clinica no registrada para el cliente </span>
        <Button class="w-[20rem]" @click="router.push(`/recetas/contacto/historia-clinica/new?cliente=${clienteId}`)" >Registrar historia clínica</Button>
    </div>
    <div class="datos flex flex-col" v-if="props.historiaClinica">
        <div class="flex flex-row justify-between items-center mb-4">
            <div class="flex flex-row items-center gap-2">
                        <div class="flex items-center justify-center p-2">
                            <FileClock :size="25" />
                        </div>
                        <h4 class="font-bold text-xl text-zinc-900">Historia Clínica</h4>
                    </div>
            <Button
                variant="outline"
                class="gap-1.5 text-xs px-3 py-2.5 h-auto"
                @click="() => router.push(`/recetas/contacto/historia-clinica/edit/${props.historiaClinica?.id}?cliente=${clienteId}`)">
                <Pencil1Icon class="w-3.5 h-3.5" />
                Editar
            </Button>
        </div>

        <div class="flex flex-col gap-6">
            
            <!-- Antecedentes Oculares -->
            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                <div class="px-6 py-4 border-b border-zinc-200">
                    <h4 class="font-bold text-sm text-zinc-900 ">Antecedentes Oculares</h4>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-4 gap-y-3">
                        <div class="flex items-center gap-2">
                            <Checkbox class="pointer-events-none" v-model:checked="props.historiaClinica.patologicas" />
                            <label class="text-sm font-light leading-none">Patológicos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.traumaticas" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Traumáticos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.sensLuzNatural" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Sensibilidad Luz Natural</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.sensLuzArtificial" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Sensibilidad Luz Artificial</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.sensPolvo" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Sensibilidad Polvo</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.sensFrio" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Sensibilidad Frío</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.sensHumo" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Sensibilidad Humo</label>
                        </div>
                    </div>
                    <div class="flex flex-col gap-0.5 mt-5 pt-4 border-t border-zinc-100">
                        <span class="text-xs text-zinc-400">Observaciones</span>
                        <span class="text-sm">{{ props.historiaClinica.observacionesSens || '—' }}</span>
                    </div>
                </div>
            </div>

            <!-- Antecedentes Generales -->
            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                <div class="px-6 py-4 border-b border-zinc-200">
                    <h4 class="font-bold text-sm text-zinc-900">Antecedentes Generales</h4>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-4 gap-y-3">
                        <div class="flex items-center gap-2">
                            <Checkbox class="pointer-events-none" v-model:checked="props.historiaClinica.transtornosNeurologicos" />
                            <label class="text-sm font-light leading-none">Trastornos Neurológicos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox class="pointer-events-none" v-model:checked="props.historiaClinica.regimenEventual" />
                            <label class="text-sm font-light leading-none">Régimen Eventual</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox class="pointer-events-none" v-model:checked="props.historiaClinica.glandulasEndocinas" />
                            <label class="text-sm font-light leading-none">Glándulas Endócrinas</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox class="pointer-events-none" v-model:checked="props.historiaClinica.sistemaCardiovascular" />
                            <label class="text-sm font-light leading-none">Sistema Cardiovascular</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.embarazo" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Embarazo</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.estomatologia" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Estomatología</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.caries" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Caries</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.digestivo" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Digestivos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.alergiaDigestiva" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Alergia Digestiva</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.alergiaRespiratoria" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Alergia Respiratoria</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.alergiaCutanea" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Alergia Cutánea</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.alergiaOtras" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Otras Alergias</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.rinitisPrimaveral" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Rinitis Primaveral</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.sinusitisCronica" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Sinusitis Crónica</label>
                        </div>
                    </div>
                    <div class="flex flex-col gap-0.5 mt-5 pt-4 border-t border-zinc-100">
                        <span class="text-xs text-zinc-400">Observaciones</span>
                        <span class="text-sm">{{ props.historiaClinica.observacionesAntecedentes || '—' }}</span>
                    </div>
                </div>
            </div>

            <!-- Tratamientos Recientes o En Curso -->
            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                <div class="px-6 py-4 border-b border-zinc-200">
                    <h4 class="font-bold text-sm text-zinc-900">Tratamientos Recientes o En Curso</h4>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-4 gap-y-3">
                        <div class="flex items-center gap-2">
                            <Checkbox class="pointer-events-none" v-model:checked="props.historiaClinica.antibioticos" />
                            <label class="text-sm font-light leading-none">Antibióticos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.antiestaminicos" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Antiestamínicos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.pildoraContraceptiva" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Píldora Contraceptiva</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.anorexigenos" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Anorexígenos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.neurolepticos" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Neurolépticos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.tratamientoDigestivo" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Tratamiento Digestivo</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.tranquilizantes" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Tranquilizantes</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.dirueticos" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Diuréticos</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.corticoides" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Corticoides</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <Checkbox v-model:checked="props.historiaClinica.parasimpaticoliticos" class="pointer-events-none" />
                            <label class="text-sm font-light leading-none">Parasimpaticolíticos</label>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>