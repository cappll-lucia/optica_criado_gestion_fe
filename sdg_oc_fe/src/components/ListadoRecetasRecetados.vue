<script setup lang="ts">
import { RecetasAereos } from '@/api/entities/recetasAereos';
import { Separator } from '@/components/ui/separator'
import { DownloadIcon, Pencil1Icon } from '@radix-icons/vue'
import { onMounted, ref, computed } from 'vue';
import Label from '@/components/ui/label/Label.vue';
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
import { formatDate, generateRecetasRecetadosPDF, getLogoDataUrl } from '@/lib/utils.recetas';
import { jsPDF } from 'jspdf';
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
    telefono: string | undefined,
    email: string | undefined,
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

const showLejosDetalle = computed(() =>
    !!detalleLejos.value && ['Lejos', 'Multifocal', 'Bifocal'].includes(currentRec.value?.tipoReceta ?? ''));
const showCercaDetalle = computed(() =>
    !!detalleCerca.value && ['Cerca', 'Multifocal', 'Bifocal'].includes(currentRec.value?.tipoReceta ?? ''));

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

const sign = (n: number | string | undefined | null) => {
    if (n == null) return '-';
    const num = Number(n);
    return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
};

const buildResumenText = (recetas: RecetasAereos[]): string => {
    return recetas.map(receta => {
        const lines: string[] = [];
        lines.push(`** ANTEOJOS ${receta.tipoReceta.toUpperCase()}  --->  ${formatDate(receta.fecha.toString())}`);
        receta.detallesRecetaLentesAereos.forEach(det => {
            lines.push(`   O.D.Esf.${sign(det.od_esferico)}  Cil.${sign(det.od_cilindrico)}  A.${det.od_grados}°`);
            lines.push(`   O.I.Esf.${sign(det.oi_esferico)}  Cil.${sign(det.oi_cilindrico)}  A.${det.oi_grados}°`);
        });
        const medidas: string[] = [];
        if (receta.dnp != null) medidas.push(`DNP ${sign(receta.dnp)}mm.`);
        if (receta.od_alt_pelicula != null) medidas.push(`Alt. película O.D. ${receta.od_alt_pelicula}mm.`);
        if (receta.oi_alt_pelicula != null) medidas.push(`Alt. película O.I. ${receta.oi_alt_pelicula}mm.`);
        if (medidas.length) lines.push('   ' + medidas.join('  |  '));
        const extras: string[] = [];
        if (receta.cristal) extras.push(`Cristal: ${receta.cristal}`);
        if (receta.color) extras.push(`Color: ${receta.color}`);
        if (receta.armazon) extras.push(`Armazón: ${receta.armazon}`);
        if (extras.length) lines.push('   ' + extras.join('  |  '));
        if (receta.tratamiento) lines.push(`   Tratamiento: ${receta.tratamiento}`);
        if (receta.observaciones) lines.push(`   Obs.:  ${receta.observaciones}`);
        const obrasSociales = receta.recetaLentesAereosObrasSociales?.map(ros => ros.obraSocial.nombre) ?? [];
        if (obrasSociales.length) lines.push(`   Obras sociales: ${obrasSociales.join(', ')}`);
        return lines.join('\n');
    }).join('\n\n');
};

const printResumenPDF = async () => {
    if (selectedToPrint.value.length === 0) {
        alert("Por favor, selecciona al menos una receta.");
        return;
    }
    const texto = buildResumenText(selectedToPrint.value);
    const lines = texto.split('\n');

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const lineHeight = 16;
    const fontSize = 10;
    let y = margin;

    try {
        const logo = await getLogoDataUrl();
        const logoWidth = 180;
        const logoHeight = logoWidth / (1090 / 229);
        doc.addImage(logo, 'PNG', margin, y, logoWidth, logoHeight);
        y += logoHeight + 26;
    } catch {
        // logo no disponible, se continúa sin él
    }

    const tipoDoc = props.tipoDocumento === TipoDocumento.CUIT ? 'CUIT' : 'DNI';
    const docLine = props.nroDocumento ? `${tipoDoc}: ${props.nroDocumento}` : '';

    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    doc.text(props.nombreCliente, margin, y);
    y += lineHeight;

    doc.setFont('courier', 'normal');
    doc.setFontSize(fontSize);
    if (docLine) {
        doc.text(docLine, margin, y);
        y += lineHeight;
    }
    if (props.telefono) {
        doc.text(`Tel.: ${props.telefono}`, margin, y);
        y += lineHeight;
    }
    if (props.email) {
        doc.text(`Email: ${props.email}`, margin, y);
        y += lineHeight;
    }

    y += 4;
    doc.setDrawColor(180);
    doc.line(margin, y, pageWidth - margin, y);
    y += lineHeight;

    doc.setFontSize(fontSize);
    lines.forEach(line => {
        const isBold = line.startsWith('**');
        doc.setFont('courier', isBold ? 'bold' : 'normal');
        const cleanLine = isBold ? line.slice(2) : line;
        doc.text(cleanLine, margin, y);
        y += lineHeight;
    });

    doc.save(`Resumen_${props.nombreCliente}.pdf`);
    printOpen.value = false;
};

const totalReceta = (receta: RecetasAereos) => (Number(receta.precioArmazon) || 0) + (Number(receta.precioCristales) || 0);
const restoReceta = (receta: RecetasAereos) => totalReceta(receta) - (Number(receta.senia) || 0);
const formatMonto = (n: number) => n > 0 ? '$ ' + n.toLocaleString('es-AR') : '$ —';

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
                                    PDF Tabular
                                </button>
                                <button
                                    class="flex-1 text-xs px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                                    @click="printResumenPDF()">
                                    PDF Resumen
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
                                Última
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
                <div class="flex flex-row justify-end items-center mb-4">
                    <button
                        class="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="router.push(`/recetas/recetados/edit/${currentRec?.id}`)">
                        <Pencil1Icon class="w-3.5 h-3.5" />
                        Editar
                    </button>
                </div>

                <div class="flex flex-col gap-6">

                    <!-- Datos de la receta -->
                    <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Datos de la receta</h4>
                        </div>
                        <div class="p-6 grid grid-cols-3 gap-y-5">
                            <div class="flex flex-col gap-1">
                                <span class="text-xs text-zinc-400">Tipo</span>
                                <span class="w-fit text-sm font-semibold px-2.5 py-1 rounded-md border border-zinc-300 bg-zinc-100 text-zinc-900">{{ currentRec.tipoReceta }}</span>
                            </div>
                            <div class="flex flex-col gap-0.5">
                                <span class="text-xs text-zinc-400">Fecha</span>
                                <span class="text-sm font-medium">{{ formatDate(currentRec.fecha.toString()) }}</span>
                            </div>
                            <div class="flex flex-col gap-0.5">
                                <span class="text-xs text-zinc-400">Oftalmólogo</span>
                                <span class="text-sm text-zinc-500">{{ currentRec.oftalmologo ?? '—' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Graduación -->
                    <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Graduación</h4>
                        </div>
                        <div class="p-6 overflow-x-auto">
                            <div class="grid grid-cols-[4.5rem_2.75rem_5.5rem_5.5rem_5.5rem] gap-x-6 gap-y-2 items-center justify-center">
                                <span></span>
                                <span></span>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Esférico</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Cilíndrico</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Eje (°)</Label>

                                <template v-if="showLejosDetalle && detalleLejos">
                                    <span class="row-span-2 self-center font-bold text-base text-zinc-900">Lejos</span>

                                    <span class="font-bold text-xs text-zinc-900">O.D.</span>
                                    <span class="text-sm text-center">{{ sign(detalleLejos.od_esferico) }}</span>
                                    <span class="text-sm text-center">{{ sign(detalleLejos.od_cilindrico) }}</span>
                                    <span class="text-sm text-center">{{ detalleLejos.od_grados }}°</span>

                                    <span class="font-bold text-xs text-zinc-900">O.I.</span>
                                    <span class="text-sm text-center">{{ sign(detalleLejos.oi_esferico) }}</span>
                                    <span class="text-sm text-center">{{ sign(detalleLejos.oi_cilindrico) }}</span>
                                    <span class="text-sm text-center">{{ detalleLejos.oi_grados }}°</span>
                                </template>

                                <div v-if="showLejosDetalle && showCercaDetalle" class="col-span-5 border-t border-zinc-100 my-2"></div>

                                <template v-if="showCercaDetalle && detalleCerca">
                                    <span class="row-span-2 self-center font-bold text-base text-zinc-900">Cerca</span>

                                    <span class="font-bold text-xs text-zinc-900">O.D.</span>
                                    <span class="text-sm text-center">{{ sign(detalleCerca.od_esferico) }}</span>
                                    <span class="text-sm text-center">{{ sign(detalleCerca.od_cilindrico) }}</span>
                                    <span class="text-sm text-center">{{ detalleCerca.od_grados }}°</span>

                                    <span class="font-bold text-xs text-zinc-900">O.I.</span>
                                    <span class="text-sm text-center">{{ sign(detalleCerca.oi_esferico) }}</span>
                                    <span class="text-sm text-center">{{ sign(detalleCerca.oi_cilindrico) }}</span>
                                    <span class="text-sm text-center">{{ detalleCerca.oi_grados }}°</span>
                                </template>
                            </div>
                        </div>
                    </div>

                    <!-- Medidas -->
                    <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Medidas</h4>
                        </div>
                        <div class="p-6 grid grid-cols-3 gap-y-5">
                            <div class="flex flex-col gap-0.5">
                                <span class="text-xs text-zinc-400">DNP</span>
                                <span class="text-sm">{{ currentRec.dnp != null ? `${currentRec.dnp} mm.` : '—' }}</span>
                            </div>
                            <div class="flex flex-col gap-0.5">
                                <span class="text-xs text-zinc-400">Alt. película O.D.</span>
                                <span class="text-sm">{{ currentRec.od_alt_pelicula != null ? `${currentRec.od_alt_pelicula} mm.` : '—' }}</span>
                            </div>
                            <div class="flex flex-col gap-0.5">
                                <span class="text-xs text-zinc-400">Alt. película O.I.</span>
                                <span class="text-sm">{{ currentRec.oi_alt_pelicula != null ? `${currentRec.oi_alt_pelicula} mm.` : '—' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Cristales y armazón -->
                    <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Cristales y armazón</h4>
                        </div>
                        <div class="p-6 grid grid-cols-3 gap-y-5">
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
                                <span class="text-xs text-zinc-400">Armazón</span>
                                <span class="text-sm">{{ currentRec.armazon ?? '—' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Obras sociales + Precios -->
                    <div class="flex flex-col lg:flex-row gap-6 items-stretch">
                        <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden flex-1 flex flex-col">
                            <div class="px-6 py-4 border-b border-zinc-200">
                                <h4 class="font-bold text-sm text-zinc-900">Obras sociales</h4>
                            </div>
                            <div class="p-6 flex-1">
                                <div v-if="currentRec.recetaLentesAereosObrasSociales && currentRec.recetaLentesAereosObrasSociales.length > 0"
                                    class="flex flex-col items-start gap-2">
                                    <span v-for="ros in currentRec.recetaLentesAereosObrasSociales" :key="ros.obraSocial.id"
                                        class="bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1 text-sm">
                                        {{ ros.obraSocial.nombre }}
                                    </span>
                                </div>
                                <span v-else class="text-sm text-zinc-400">No se registró cobertura</span>
                            </div>
                        </div>

                        <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden flex-1 flex flex-col">
                            <div class="px-6 py-4 border-b border-zinc-200">
                                <h4 class="font-bold text-sm text-zinc-900">Precios</h4>
                            </div>
                            <div class="p-6 flex flex-col gap-1.5 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Armazón</span>
                                    <span>{{ formatMonto(Number(currentRec.precioArmazon) || 0) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Cristales</span>
                                    <span>{{ formatMonto(Number(currentRec.precioCristales) || 0) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-zinc-400">Seña</span>
                                    <span>{{ Number(currentRec.senia) > 0 ? '- ' + formatMonto(Number(currentRec.senia)) : '$ —' }}</span>
                                </div>
                                <Separator class="my-1" />
                                <div class="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>{{ formatMonto(totalReceta(currentRec)) }}</span>
                                </div>
                                <div class="flex justify-between font-semibold">
                                    <span>Resto a pagar</span>
                                    <span>{{ formatMonto(restoReceta(currentRec)) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Observaciones -->
                    <div class="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Observaciones</h4>
                        </div>
                        <div class="p-6">
                            <span class="text-sm">{{ currentRec.observaciones ?? '—' }}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>