<script setup lang="ts">
import { RecetasAereos } from '@/api/entities/recetasAereos';
import { Separator } from '@/components/ui/separator'
import { DownloadIcon, Pencil1Icon } from '@radix-icons/vue'
import { onMounted, ref, computed } from 'vue';
import ItemDetalleReceta from '@/components/ItemDetalleRecetaRecetados.vue'
import ItemResumenReceta from '@/components/ItemResumenRecetaRecetados.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, generateRecetasRecetadosPDF } from '@/lib/utils.recetas';
import { DetalleRecetaAereos } from '@/api/entities/detalleRecetaAereos';
import { PlusIcon } from 'lucide-vue-next';
import { router } from '@/router';
import { TipoDocumento } from '@/api/entities/clientes';

const props = defineProps<{
    recetas: RecetasAereos[],
    nombreCliente: string,
    idCliente: number,
    selectedId: string | undefined,
    nroDocumento: number | undefined,
    tipoDocumento: TipoDocumento | undefined,
}>();

const currentRec = ref<RecetasAereos | undefined>();
const detalleCerca = ref<DetalleRecetaAereos | undefined>();
const detalleLejos = ref<DetalleRecetaAereos | undefined>();
const selectedToPrint = ref<RecetasAereos[]>([]);
const printOpen = ref<boolean>(false);
const viewMode = ref<'detalle' | 'historial'>('detalle');

onMounted(() => {
    if (props.selectedId) {
        currentRec.value = props.recetas.find(r => r.id == Number(props.selectedId))
    } else {
        currentRec.value = props.recetas[0]
    }
    detalleCerca.value = currentRec.value?.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Cerca')
    detalleLejos.value = currentRec.value?.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Lejos')
})

const allSelected = computed(() => selectedToPrint.value.length === props.recetas.length)

const toggleSelectAll = () => {
    if (allSelected.value) {
        selectedToPrint.value = []
    } else {
        selectedToPrint.value = [...props.recetas]
    }
}

const handleCheckboxChange = (receta: RecetasAereos) => {
    const index = selectedToPrint.value.findIndex((selected) => selected.id === receta.id);
    index !== -1
        ? selectedToPrint.value.splice(index, 1)
        : selectedToPrint.value.push(receta);
};

const isChecked = (receta: RecetasAereos) => selectedToPrint.value.some(r => r.id === receta.id);

const printRecetas = () => {
    if (selectedToPrint.value.length === 0) {
        alert("Por favor, selecciona al menos una receta para imprimir.");
        return;
    }
    generateRecetasRecetadosPDF(selectedToPrint.value, props.nombreCliente)
    printOpen.value = false
};

const sign = (n: number) => n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);

const buildResumenText = (recetas: RecetasAereos[]): string => {
    return recetas.map(receta => {
        const lines: string[] = [];
        lines.push(`** ANTEOJOS ${receta.tipoReceta.toUpperCase()}  --->  ${formatDate(receta.fecha.toString())}`);
        receta.detallesRecetaLentesAereos.forEach(det => {
            lines.push(`   O.D.Esf.${sign(det.od_esferico)}  Cil.${sign(det.od_cilindrico)}  A.${det.od_grados}°`);
            lines.push(`   O.I.Esf.${sign(det.oi_esferico)}  Cil.${sign(det.oi_cilindrico)}  A.${det.oi_grados}°`);
            lines.push(`   DNP ${sign(det.dnp)}`);
        });
        const extras: string[] = [];
        if (receta.cristal) extras.push(`Cristal: ${receta.cristal}`);
        if (receta.color) extras.push(`Color: ${receta.color}`);
        if (receta.armazon) extras.push(`Armazón: ${receta.armazon}`);
        if (extras.length) lines.push('   ' + extras.join('  |  '));
        if (receta.tratamiento) lines.push(`   Tratamiento: ${receta.tratamiento}`);
        if (receta.observaciones) lines.push(`   ${receta.observaciones}`);
        return lines.join('\n');
    }).join('\n\n');
};

const printResumenJPG = () => {
    if (selectedToPrint.value.length === 0) {
        alert("Por favor, selecciona al menos una receta.");
        return;
    }
    const texto = buildResumenText(selectedToPrint.value);
    const lines = texto.split('\n');

    const canvas = document.createElement('canvas');
    const lineHeight = 18;
    const padding = 32;
    const fontSize = 13;
    const headerLines = 3; // nombre, documento, separador

    canvas.width = 600;
    canvas.height = lines.length * lineHeight + padding * 2 + headerLines * lineHeight + 10;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111111';

    // Header: nombre y documento
    const tipoDoc = props.tipoDocumento === TipoDocumento.CUIT ? 'CUIT' : 'DNI';
    const docLine = props.nroDocumento ? `${tipoDoc}: ${props.nroDocumento}` : '';

    ctx.font = `bold 15px "Courier New", monospace`;
    ctx.fillText(props.nombreCliente, padding, padding + fontSize);
    if (docLine) {
        ctx.font = `normal ${fontSize}px "Courier New", monospace`;
        ctx.fillText(docLine, padding, padding + fontSize + lineHeight);
    }

    // Separador
    const sepY = padding + fontSize + lineHeight * (docLine ? 2 : 1) + 6;
    ctx.fillRect(padding, sepY, canvas.width - padding * 2, 1);

    // Recetas
    const startY = sepY + lineHeight;
    lines.forEach((line, i) => {
        const isBold = line.startsWith('**');
        ctx.font = `${isBold ? 'bold' : 'normal'} ${fontSize}px "Courier New", monospace`;
        ctx.fillText(line, padding, startY + i * lineHeight + fontSize);
    });

    const link = document.createElement('a');
    link.download = `Resumen_${props.nombreCliente}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    printOpen.value = false;
};

const handleChangeReceta = (receta: RecetasAereos) => {
    currentRec.value = receta;
    viewMode.value = 'detalle';
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
                    class=" flex-1 flex items-center justify-center gap-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                    @click="router.push(`/recetas/recetados/new?cliente=${props.idCliente}`)">
                    <PlusIcon class="w-3.5 h-3.5" />
                    Nueva
                </button>
                <Dialog v-model:open="printOpen">
                    <DialogTrigger as-child>
                        <button class=" flex items-center justify-center gap-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors">
                            <DownloadIcon class="w-3.5 h-3.5" />
                            Imprimir
                        </button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Imprimir Recetas</DialogTitle>
                            <DialogDescription>{{ nombreCliente }}</DialogDescription>
                        </DialogHeader>

                        <!-- Selección -->
                        <div class="flex flex-col gap-3">
                            <!-- Seleccionar todas -->
                            <div class="flex items-center justify-between pb-2 border-b border-zinc-100">
                                <span class="text-xs text-zinc-500 font-medium">Seleccionar todas</span>
                                <Checkbox
                                    :checked="allSelected"
                                    @update:checked="toggleSelectAll" />
                            </div>
                            <!-- Lista -->
                            <div v-for="receta in recetas" :key="receta.id" class="flex items-center justify-between">
                                <div class="flex flex-col">
                                    <span class="text-sm font-medium">{{ formatDate(receta.fecha.toString()) }}</span>
                                    <span class="text-xs text-zinc-400">{{ receta.tipoReceta }}</span>
                                </div>
                                <Checkbox
                                    :checked="isChecked(receta)"
                                    @update:checked="handleCheckboxChange(receta)" />
                            </div>
                        </div>

                        <Separator class="my-2" />

                        <!-- Acciones -->
                        <div class="flex flex-col gap-2">
                            <p class="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Formato</p>
                            <div class="flex gap-2">
                                <button
                                    class="flex-1 text-xs px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                                    @click="printRecetas()">
                                    PDF
                                </button>
                                <button
                                    class="flex-1 text-xs px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                                    @click="printResumenJPG()">
                                    JPG Resumen
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div class="flex items-center justify-center mr-2 mt-6 mb-2 gap-2 space-x-7 tracking-widest">
                <span class="text-[10px] font-semibold uppercase transition-colors"
                    :class="viewMode === 'detalle' ? 'text-zinc-900' : 'text-zinc-400'">
                    Detalle
                </span>
                <button
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                    :class="viewMode === 'historial' ? 'bg-zinc-900' : 'bg-zinc-300'"
                    @click="() => { viewMode = viewMode === 'historial' ? 'detalle' : 'historial'; viewMode === 'historial' ? currentRec = undefined : currentRec = recetas[0] }">
                    <span
                        class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                        :class="viewMode === 'historial' ? 'translate-x-4' : 'translate-x-0'" />
                </button>
                <span class="text-[10px] font-semibold uppercase transition-colors"
                    :class="viewMode === 'historial' ? 'text-zinc-900' : 'text-zinc-400'">
                    Resumen
                </span>
            </div>

            <!-- Timeline -->
            <div class="relative mr-2 pl-4">
                <div class="absolute left-[1.35rem] top-2 bottom-2 w-px bg-zinc-200" />

                <div
                    v-for="(receta, index) in recetas"
                    :key="receta.id"
                    class="relative flex items-center gap-3 py-2.5 cursor-pointer group"
                    @click="handleChangeReceta(receta)">

                    <div class="relative z-10  shrink-0 w-3 h-3 rounded-full border-2 transition-all"
                        :class="currentRec === receta
                            ? 'bg-[#000] border-black'
                            : 'bg-white border-zinc-300 group-hover:bg-zinc-300'" />

                    <div class="flex flex-col gap-0.5 flex-1 min-w-0 py-3 px-3 rounded-2xl border-2 border-transparent"
                        :class="currentRec === receta ? 'bg-zinc-900 text-white' : 'hover:border-zinc-300'">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-sm font-semibold">
                                {{ formatDate(receta.fecha.toString()) }}
                            </span>
                            <span v-if="index === 0"
                                class="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-50">
                                Vigente
                            </span>
                        </div>
                        <span class="text-xs" :class="currentRec === receta ? 'text-white' : 'text-zinc-900'">{{ receta.tipoReceta }}</span>
                    </div>
                </div>
            </div>
        </div>

        <Separator orientation="vertical" />

        <!-- Detail / Resumen view -->
        <div class="w-[72%] h-full px-8">

            <!-- MODO RESUMEN -->
            <div v-if="viewMode === 'historial'" class="font-mono text-xs text-zinc-800 leading-relaxed whitespace-pre">
                <ItemResumenReceta
                    v-for="receta in recetas"
                    :key="receta.id"
                    :receta="receta" />
            </div>

            <!-- MODO DETALLE -->
            <div v-else-if="currentRec">
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