<script setup lang="ts">
import { RecetasAereos } from '@/api/entities/recetasAereos';
import { Separator } from '@/components/ui/separator'
import { DownloadIcon, Pencil1Icon } from '@radix-icons/vue'
import { onMounted, ref } from 'vue';
import ItemDetalleReceta from '@/components/ItemDetalleRecetaRecetados.vue'
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
import { formatDate, generateRecetasRecetadosPDF } from '@/lib/utils.recetas';
import { DetalleRecetaAereos } from '@/api/entities/detalleRecetaAereos';
import { PlusIcon } from 'lucide-vue-next';
import { router } from '@/router';

const props = defineProps<{
    recetas: RecetasAereos[],
    nombreCliente: string,
    idCliente: number,
    selectedId: string | undefined
}>();

const currentRec = ref<RecetasAereos | undefined>();
const detalleCerca = ref<DetalleRecetaAereos | undefined>();
const detalleLejos = ref<DetalleRecetaAereos | undefined>();
const selectedToPrint = ref<RecetasAereos[]>([]);
const printOpen = ref<boolean>(false);

onMounted(() => {
    if (props.selectedId) {
        currentRec.value = props.recetas.find(r => r.id == Number(props.selectedId))
    } else {
        currentRec.value = props.recetas[0]
    }
    detalleCerca.value = currentRec.value?.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Cerca')
    detalleLejos.value = currentRec.value?.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Lejos')
})

const handleCheckboxChange = (receta: RecetasAereos) => {
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
    generateRecetasRecetadosPDF(selectedToPrint.value, props.nombreCliente)
    printOpen.value = false
};

const handleChangeReceta = (receta: RecetasAereos) => {
    currentRec.value = receta;
    detalleCerca.value = currentRec.value?.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Cerca')
    detalleLejos.value = currentRec.value?.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Lejos')
}
</script>

<template>
    <div class="panel w-full flex flex-row h-full">

        <!-- Sidebar -->
        <div class="w-[30%] p-2 pt-0 h-full">
            <div class="flex mr-2 h-10 gap-2">
                <button
                    class="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                    @click="router.push(`/recetas/recetados/new?cliente=${props.idCliente}`)">
                    <PlusIcon class="w-3.5 h-3.5" />
                    Nueva
                </button>
                <Dialog v-model:open="printOpen">
                    <DialogTrigger as-child>
                        <button class="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors">
                            <DownloadIcon class="w-3.5 h-3.5" />
                            Imprimir
                        </button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Imprimir Recetas Anteojos Recetados</DialogTitle>
                            <DialogDescription>Cliente: {{ nombreCliente }}</DialogDescription>
                        </DialogHeader>
                        <div class="flex flex-col items-start justify-center">
                            <div v-for="receta in recetas" class="flex items-center space-x-2 mb-4">
                                <Checkbox :id="`${receta.id}`" @update:checked="handleCheckboxChange(receta)" />
                                <label :for="`${receta.id}`" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {{ formatDate(receta.fecha.toString()) }}
                                </label>
                                <label class="text-xs text-zinc-500">{{ receta.tipoReceta }}</label>
                            </div>
                        </div>
                        <DialogFooter class="sm:justify-end">
                            <button
                                class="text-sm px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                                @click="printRecetas()">
                                Imprimir Recetas
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div class="flex items-center justify-between mr-2 mt-4 mb-3 px-1">
                <span class="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">Historial</span>
                <span class="text-[10px] font-semibold text-zinc-400">{{ recetas.length }}</span>
            </div>

            <!-- Timeline -->
            <div class="relative mr-2 pl-4">
                <!-- vertical line -->
                <div class="absolute left-[1.35rem] top-2 bottom-2 w-px bg-zinc-200" />

                <div
                    v-for="(receta, index) in recetas"
                    :key="receta.id"
                    class="relative flex items-center gap-3 py-2.5 cursor-pointer group  "
                    @click="handleChangeReceta(receta)">

                    <!-- dot -->
                    <div class="relative z-10 mb-2 shrink-0 w-3 h-3 rounded-full border-2 transition-all"
                        :class="currentRec === receta
                            ? 'bg-[#000] border-black'
                            : 'bg-white border-zinc-300  group-hover:bg-zinc-300'" />

                    <!-- content -->
                    <div class="flex flex-col gap-0.5 flex-1 min-w-0 py-3 px-3 rounded-2xl border-2 border-transparent " 
                        :class="currentRec === receta ? 'bg-zinc-900 text-white' : 'hover:border-zinc-300'"
                        
                        >
                        <div class="flex items-center gap-2 flex-wrap  ">
                            <span class="text-sm font-semibold">
                                <!-- :class="currentRec === receta ? 'text-zinc-900' : 'text-zinc-700'"> -->
                                {{ formatDate(receta.fecha.toString()) }}
                            </span>
                            <span v-if="index === 0"
                                class="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-50">
                                Vigente
                            </span>
                        </div>
                        <span class="text-xs" :class="currentRec === receta ?  'text-white' : 'text-zinc-900'"" >{{ receta.tipoReceta }}</span>
                    </div>
                </div>
            </div>
        </div>

        <Separator orientation="vertical" />

        <!-- Detail view -->
        <div class="w-[72%] h-full px-8">
            <div v-if="currentRec">
                <!-- Header -->
                <div class="flex flex-row justify-between items-start mb-1">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-zinc-400 w-20">Tipo</span>
                            <span class="text-sm font-medium">{{ currentRec.tipoReceta }}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-zinc-400 w-20">Fecha</span>
                            <span class="text-sm">{{ formatDate(currentRec.fecha.toString()) }}</span>
                        </div>
                    </div>
                    <button
                        class="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="router.push(`/recetas/recetados/edit/${currentRec?.id}`)">
                        <Pencil1Icon class="w-3.5 h-3.5" />
                        Editar
                    </button>
                </div>

                <Separator class="my-5" />

                <!-- Detalles ópticos -->
                <div v-if="currentRec?.tipoReceta == 'Lejos' && detalleLejos">
                    <ItemDetalleReceta :detalleReceta="detalleLejos" title="Lejos" />
                </div>
                <div v-else-if="currentRec?.tipoReceta == 'Cerca' && detalleCerca">
                    <ItemDetalleReceta :detalleReceta="detalleCerca" title="Cerca" />
                </div>
                <div v-else-if="(currentRec?.tipoReceta == 'Multifocal' || currentRec?.tipoReceta == 'Bifocal') && detalleLejos && detalleCerca">
                    <ItemDetalleReceta :detalleReceta="detalleLejos" title="Lejos" />
                    <Separator class="my-6" />
                    <ItemDetalleReceta :detalleReceta="detalleCerca" title="Cerca" />
                </div>

                <Separator class="my-6" />

                <!-- Datos adicionales -->
                <div class="grid grid-cols-3 gap-y-5">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-xs text-zinc-400">Cristal</span>
                        <span class="text-sm">{{ currentRec.cristal ?? '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <span class="text-xs text-zinc-400">Color</span>
                        <span class="text-sm">{{ currentRec.color ?? '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <span class="text-xs text-zinc-400">Tratamiento</span>
                        <span class="text-sm">{{ currentRec.tratamiento ?? '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <span class="text-xs text-zinc-400">Oftalmólogo</span>
                        <span class="text-sm">{{ currentRec.oftalmologo ?? '—' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <span class="text-xs text-zinc-400">Armazón</span>
                        <span class="text-sm">{{ currentRec.armazon ?? '—' }}</span>
                    </div>
                </div>

                <Separator class="my-6" />

                <div class="flex flex-col gap-1">
                    <span class="text-xs text-zinc-400">Observaciones</span>
                    <span class="text-sm min-h-[4rem]">{{ currentRec.observaciones ?? '—' }}</span>
                </div>
            </div>
        </div>
    </div>
</template>