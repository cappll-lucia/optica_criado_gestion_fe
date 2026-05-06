<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Separator } from '@/components/ui/separator';
import { ChevronRightIcon, DownloadIcon, PlusIcon, ValueNoneIcon, Pencil1Icon } from '@radix-icons/vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import DetalleHistoriaClinicaContacto from '@/components/HistoriaClinicaContacto.vue';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { formatDate, generateRecetasContactoPDF } from '@/lib/utils.recetas';
import Input from './ui/input/Input.vue';
import { RecetaContacto } from '@/api/entities/recetasContacto';
import { HistoriaClinica } from '@/api/entities/historiaClinica';
import { router } from '@/router';

const printOpen = ref<boolean>(false);
const props = defineProps<{
    historiaClinica: HistoriaClinica | undefined,
    recetas: RecetaContacto[] | undefined,
    nombreCliente: string,
    idCliente: number,
    selectedId: string | undefined,
}>();

const currentRec = ref<RecetaContacto | undefined>();
const selectedHistoriaClinica = ref(false);
const selectedToPrint = ref<RecetaContacto[]>([])

onMounted(() => {
    if (props.selectedId) {
        if (props.selectedId == 'hc') {
            selectedHistoriaClinica.value = true;
            currentRec.value = undefined;
        } else {
            currentRec.value = props.recetas ? props.recetas.find(r => r.id == Number(props.selectedId)) : undefined
        }
    } else {
        currentRec.value = props.recetas ? props.recetas[0] : undefined
    }
    if (props.historiaClinica && !props.recetas?.length) {
        selectedHistoriaClinica.value = true
    }
})

const handleCheckboxChange = (receta: RecetaContacto) => {
    const index = selectedToPrint.value.findIndex((selected) => selected.id === receta.id);
    index !== -1
        ? selectedToPrint.value.splice(index, 1)
        : selectedToPrint.value.push(receta);
};

const printRecetas = () => {
    if (selectedToPrint.value.length === 0) {
        alert("Por favor, selecciona al menos una receta para imprimir.");
        return;
    }
    generateRecetasContactoPDF(selectedToPrint.value, props.nombreCliente);
    printOpen.value = false;
};
</script>

<template>
    <div class="panel w-full flex flex-row h-full">

        <!-- Sidebar -->
        <div class="w-[23%] p-2 pt-0 h-full">
            <div class="flex justify-between mr-2 gap-2">
                <button
                    class="flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                    @click="router.push(`/recetas/contacto/new?cliente=${props.idCliente}`)">
                    <PlusIcon class="w-3.5 h-3.5" />
                    Nueva
                </button>
                <Dialog v-model:open="printOpen">
                    <DialogTrigger as-child>
                        <button class="flex items-center gap-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors">
                            <DownloadIcon class="w-3.5 h-3.5" />
                            Imprimir
                        </button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Imprimir Recetas Lentes de Contacto</DialogTitle>
                            <DialogDescription>Cliente: {{ nombreCliente }}</DialogDescription>
                        </DialogHeader>
                        <div v-if="recetas?.length" class="flex flex-col items-start justify-center">
                            <div v-for="receta in recetas" class="flex items-center space-x-2 mb-4">
                                <Checkbox :id="`${receta.id}`" @update:checked="handleCheckboxChange(receta)" />
                                <label :for="`${receta.id}`" class="text-sm font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {{ formatDate(receta.fecha.toString()) }}
                                </label>
                            </div>
                        </div>
                        <div v-else class="flex flex-col items-start justify-center">
                            <p class="text-sm text-zinc-500">El cliente no tiene recetas registradas</p>
                        </div>
                        <DialogFooter class="sm:justify-end">
                            <button v-if="recetas?.length"
                                class="text-sm px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                                @click="printRecetas()">
                                Imprimir Recetas
                            </button>
                            <button v-else
                                class="text-sm px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                                @click="printOpen = false">
                                Cerrar
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator class="my-4 w-[95%]" />

            <!-- Historia Clínica -->
            <div class="mr-2 mb-1">
                <div
                    class="px-3 py-3 flex flex-row justify-between items-center rounded-md cursor-pointer transition-colors"
                    :class="selectedHistoriaClinica ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'"
                    @click="() => { selectedHistoriaClinica = true; currentRec = undefined }">
                    <span class="text-sm font-medium">Historia Clínica</span>
                    <ChevronRightIcon class="w-4 h-4 shrink-0" :class="selectedHistoriaClinica ? 'text-zinc-300' : 'text-zinc-400'" />
                </div>
            </div>
            <Separator class="my-1 w-[95%]" />

            <!-- Recetas -->
            <div v-for="receta in recetas" :key="receta.id" class="mr-2">
                <div
                    class="px-3 py-3 flex flex-row justify-between items-center rounded-md cursor-pointer transition-colors"
                    :class="currentRec === receta ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'"
                    @click="() => { selectedHistoriaClinica = false; currentRec = receta; }">
                    <div class="flex flex-col flex-1">
                        <span class="text-sm font-medium">{{ formatDate(receta.fecha.toString()) }}</span>
                    </div>
                    <ChevronRightIcon class="w-4 h-4 shrink-0" :class="currentRec === receta ? 'text-zinc-300' : 'text-zinc-400'" />
                </div>
                <Separator class="my-1" />
            </div>
        </div>

        <Separator orientation="vertical" />

        <!-- Historia Clínica view -->
        <div v-if="selectedHistoriaClinica" class="w-[75%] h-full px-8">
            <DetalleHistoriaClinicaContacto :historiaClinica="props.historiaClinica" :cliente-id="idCliente" />
        </div>

        <!-- Receta detail view -->
        <div v-else class="w-[75%] h-full px-8">
            <div v-if="currentRec">

                <!-- Header -->
                <div class="flex flex-row justify-between items-start mb-1">
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-zinc-400 w-24">Fecha Receta</span>
                        <span class="text-sm">{{ formatDate(currentRec.fecha.toString()) }}</span>
                    </div>
                    <button
                        class="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="router.push(`/recetas/contacto/edit/${currentRec?.id}`)">
                        <Pencil1Icon class="w-3.5 h-3.5" />
                        Editar
                    </button>
                </div>

                <Separator class="my-5" />

                <!-- Lentes Definitivas -->
                <div class="flex flex-row justify-start items-center gap-8">
                    <h2 class="text-xl font-bold w-36 text-zinc-900 shrink-0">Lentes Definitivas</h2>
                    <div class="flex flex-col gap-1">
                        <!-- OD -->
                        <div class="flex h-9 items-center gap-3">
                            <span class="font-semibold text-sm w-10 text-zinc-500">O.D.</span>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">C.B.</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.od_cb.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">Esf.</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.od_esferico.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">Cil.</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.od_cilindrico.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">Eje</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.od_eje.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <ValueNoneIcon class="h-3.5 w-3.5 text-zinc-400" />
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.od_diametro.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>

                        <Separator class="my-1" />

                        <!-- OI -->
                        <div class="flex h-9 items-center gap-3">
                            <span class="font-semibold text-sm w-10 text-zinc-500">O.I.</span>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">C.B.</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.oi_cb.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">Esf.</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.oi_esferico.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">Cil.</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.oi_cilindrico.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-zinc-400 w-8">Eje</span>
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.oi_eje.toFixed(2) }}</span>
                                </div>
                                <Separator orientation="vertical" class="h-5" />
                                <div class="flex items-center gap-1">
                                    <ValueNoneIcon class="h-3.5 w-3.5 text-zinc-400" />
                                    <span class="text-sm font-medium w-14 text-right tabular-nums">{{ currentRec.oi_diametro.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator class="my-5" />

                <!-- Marcas + Observaciones -->
                <div class="flex flex-row gap-12">
                    <div class="flex flex-col gap-2">
                        <span class="text-xs text-zinc-400">Marcas</span>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-zinc-500 w-8">O.D.</span>
                            <span class="text-sm">{{ currentRec.od_marca }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-zinc-500 w-8">O.I.</span>
                            <span class="text-sm">{{ currentRec.oi_marca }}</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 flex-1">
                        <span class="text-xs text-zinc-400">Observaciones</span>
                        <span class="text-sm">{{ currentRec.observaciones ?? '—' }}</span>
                    </div>
                </div>

                <Separator class="my-6" />

                <!-- Queratometría + Evaluación General -->
                <div class="flex flex-row items-start gap-12">

                    <!-- Queratometría -->
                    <div class="flex flex-col gap-3 w-52">
                        <h3 class="text-sm font-semibold text-zinc-900">Queratometría</h3>
                        <div v-if="currentRec.quet_m1_oi" class="flex flex-col gap-1">
                            <div class="flex h-9 items-center gap-3">
                                <span class="text-sm text-zinc-500 w-10">O.D.</span>
                                <span class="text-sm tabular-nums">{{ currentRec.quet_m1_od.toFixed(2) }}</span>
                                <Separator orientation="vertical" class="h-5" />
                                <span class="text-sm tabular-nums">{{ currentRec.quet_m2_od.toFixed(2) }}</span>
                            </div>
                            <Separator class="my-1" />
                            <div class="flex h-9 items-center gap-3">
                                <span class="text-sm text-zinc-500 w-10">O.I.</span>
                                <span class="text-sm tabular-nums">{{ currentRec.quet_m1_oi.toFixed(2) }}</span>
                                <Separator orientation="vertical" class="h-5" />
                                <span class="text-sm tabular-nums">{{ currentRec.quet_m2_oi.toFixed(2) }}</span>
                            </div>
                            <div class="mt-3 flex flex-col gap-0.5">
                                <span class="text-xs text-zinc-400">Notas</span>
                                <span class="text-sm min-h-[3rem]">{{ currentRec.observaciones_queterometria ?? '—' }}</span>
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-xs text-zinc-400">Sin registros de queratometría</p>
                        </div>
                    </div>

                    <!-- Evaluación General -->
                    <div class="flex flex-col gap-3 flex-1">
                        <h3 class="text-sm font-semibold text-zinc-900">Evaluación General</h3>
                        <div class="flex flex-row flex-wrap gap-y-3 gap-x-0">
                            <div class="items-center w-48 flex gap-x-2 min-h-[1.5rem]">
                                <Checkbox v-model:checked="currentRec.maquillaje" class="pointer-events-none" />
                                <label class="text-sm font-light leading-none">Maquillaje</label>
                            </div>
                            <div class="items-center w-48 flex gap-x-2 min-h-[1.5rem]">
                                <Checkbox v-model:checked="currentRec.tonicidad" class="pointer-events-none" />
                                <label class="text-sm font-light leading-none">Tonicidad</label>
                            </div>
                            <div class="items-center w-48 flex gap-x-2 min-h-[1.5rem]">
                                <Checkbox v-model:checked="currentRec.hendidura_palpebral" class="pointer-events-none" />
                                <label class="text-sm font-light leading-none">Hendidura Palpebral</label>
                            </div>
                            <div class="items-center w-48 flex gap-x-2 min-h-[1.5rem]">
                                <Checkbox v-model:checked="currentRec.altura_palpebral" class="pointer-events-none" />
                                <label class="text-sm font-light leading-none">Altura Palpebral</label>
                            </div>
                            <div class="items-center w-48 flex gap-x-2 min-h-[1.5rem]">
                                <Checkbox v-model:checked="currentRec.buen_parpadeo_amplitud" class="pointer-events-none" />
                                <label class="text-sm font-light leading-none">Parpadeo: Buena Amplitud</label>
                            </div>
                            <div class="items-center w-48 flex gap-x-2 min-h-[1.5rem]">
                                <Checkbox v-model:checked="currentRec.buen_parpadeo_ritmo" class="pointer-events-none" />
                                <label class="text-sm font-light leading-none">Parpadeo: Buen Ritmo</label>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 mt-2">
                            <span class="text-xs text-zinc-400 w-28">Estesiometría</span>
                            <Input
                                type="text"
                                class="text-zinc-900 bg-transparent pointer-events-none cursor-not-allowed w-48 text-xs h-8"
                                :model-value="currentRec.estesiometria" />
                        </div>
                    </div>
                </div>

                <Separator class="my-6" />

                <!-- Pruebas -->
                <div class="flex flex-row items-start gap-8">
                    <h3 class="text-sm font-semibold text-zinc-900 mt-1 w-20 shrink-0">Pruebas</h3>
                    <div class="flex flex-col flex-1" v-if="currentRec?.pruebasLentesContacto?.length">
                        <Accordion type="single" collapsible class="w-full" v-for="prueba, index in currentRec.pruebasLentesContacto" :key="index">
                            <AccordionItem value="item-1">
                                <AccordionTrigger class="text-sm">Prueba {{ prueba.numeroPrueba }}</AccordionTrigger>
                                <AccordionContent>
                                    <!-- OD -->
                                    <div class="flex h-9 items-center gap-3 mb-1">
                                        <span class="font-semibold text-sm w-10 text-zinc-500">O.D.</span>
                                        <div class="flex items-center gap-3">
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">C.B.</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_cb.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">Esf.</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_esferico.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">Cil.</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_cilindrico.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">Eje</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_eje.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <ValueNoneIcon class="h-3.5 w-3.5 text-zinc-400" />
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_cilindrico.toFixed(2) }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator class="my-2" />

                                    <!-- OI -->
                                    <div class="flex h-9 items-center gap-3 mb-3">
                                        <span class="font-semibold text-sm w-10 text-zinc-500">O.I.</span>
                                        <div class="flex items-center gap-3">
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">C.B.</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_cb.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">Esf.</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_esferico.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">Cil.</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_cilindrico.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <span class="text-xs text-zinc-400 w-8">Eje</span>
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_eje.toFixed(2) }}</span>
                                            </div>
                                            <Separator orientation="vertical" class="h-5" />
                                            <div class="flex items-center gap-1">
                                                <ValueNoneIcon class="h-3.5 w-3.5 text-zinc-400" />
                                                <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_cilindrico.toFixed(2) }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Checkboxes -->
                                    <div class="flex flex-row flex-wrap gap-y-3 mb-4">
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.confort" />
                                            <label class="text-sm font-light leading-none">Confort</label>
                                        </div>
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.movilidad" />
                                            <label class="text-sm font-light leading-none">Movilidad</label>
                                        </div>
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.centraje" />
                                            <label class="text-sm font-light leading-none">Centraje</label>
                                        </div>
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.hiperemia" />
                                            <label class="text-sm font-light leading-none">Hiperemia</label>
                                        </div>
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.agudeza_visual" />
                                            <label class="text-sm font-light leading-none">Agudeza visual</label>
                                        </div>
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.od_edema" />
                                            <label class="text-sm font-light leading-none">OD Edema</label>
                                        </div>
                                        <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                            <Checkbox class="pointer-events-none" v-model:checked="prueba.oi_edema" />
                                            <label class="text-sm font-light leading-none">OI Edema</label>
                                        </div>
                                    </div>

                                    <!-- Marcas prueba -->
                                    <div class="flex items-center gap-4">
                                        <span class="text-xs text-zinc-400 w-14">Marcas</span>
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-zinc-500 font-medium">OD:</span>
                                            <span class="text-sm w-28">{{ prueba.od_marca }}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs text-zinc-500 font-medium">OI:</span>
                                            <span class="text-sm w-28">{{ prueba.oi_marca }}</span>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <div v-else>
                        <p class="text-xs text-zinc-400 mt-1">No hay pruebas registradas para esta receta</p>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>