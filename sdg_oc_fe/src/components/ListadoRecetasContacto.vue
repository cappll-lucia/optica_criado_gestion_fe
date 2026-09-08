<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DownloadIcon, PlusIcon, ValueNoneIcon, Pencil1Icon } from '@radix-icons/vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import Label from '@/components/ui/label/Label.vue';
import DetalleHistoriaClinicaContacto from '@/components/HistoriaClinicaContacto.vue';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate, getLogoDataUrl, generateFichaRecetaContactoPDF } from '@/lib/utils.recetas';
import { jsPDF } from 'jspdf';
import { RecetaContacto } from '@/api/entities/recetasContacto';
import { HistoriaClinica } from '@/api/entities/historiaClinica';
import { router } from '@/router';
import { TipoDocumento } from '@/api/entities/clientes';
import { Eye } from 'lucide-vue-next';

const printOpen = ref<boolean>(false);
const props = defineProps<{
    historiaClinica: HistoriaClinica | undefined,
    recetas: RecetaContacto[] | undefined,
    nombreCliente: string,
    idCliente: number,
    selectedId: string | undefined,
    nroDocumento: number | undefined,
    tipoDocumento: TipoDocumento | undefined,
    telefono: string | undefined,
    email: string | undefined,
    domicilio: string | undefined,
}>();

const currentRec = ref<RecetaContacto | undefined>();
const selectedHistoriaClinica = ref(false);
const selectedToPrint = ref<RecetaContacto[]>([]);
const viewMode = ref<'detalle' | 'resumen'>('detalle');

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

const allSelected = computed(() => selectedToPrint.value.length === (props.recetas?.length ?? 0));
const toggleSelectAll = () => { selectedToPrint.value = allSelected.value ? [] : [...(props.recetas ?? [])]; };
const isChecked = (receta: RecetaContacto) => selectedToPrint.value.some(r => r.id === receta.id);

const handleCheckboxChange = (receta: RecetaContacto) => {
    const index = selectedToPrint.value.findIndex((selected) => selected.id === receta.id);
    index !== -1 ? selectedToPrint.value.splice(index, 1) : selectedToPrint.value.push(receta);
};

const sign = (n: number) => n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);

const puedeImprimirFicha = computed(() => selectedToPrint.value.length === 1);
const puedeImprimirResumen = computed(() => selectedToPrint.value.length >= 1);

const printResumenPDF = async () => {
    if (selectedToPrint.value.length === 0) { alert("Seleccioná al menos una receta."); return; }
    const recetas = selectedToPrint.value;
    const lines: string[] = [];
    recetas.forEach(receta => {
        lines.push(`** LENTES DE CONTACTO  --->  ${formatDate(receta.fecha.toString())}`);
        lines.push(`   O.D.  CB:${receta.od_cb.toFixed(2)}  Esf.:${sign(receta.od_esferico)}  Cil.:${sign(receta.od_cilindrico)}  Eje:${receta.od_eje.toFixed(2)}  Diám.:${receta.od_diametro.toFixed(2)}`);
        lines.push(`   O.I.  CB:${receta.oi_cb.toFixed(2)}  Esf.:${sign(receta.oi_esferico)}  Cil.:${sign(receta.oi_cilindrico)}  Eje:${receta.oi_eje.toFixed(2)}  Diám.:${receta.oi_diametro.toFixed(2)}`);
        if (receta.od_marca || receta.oi_marca) lines.push(`   Marcas  OD: ${receta.od_marca ?? '—'}  |  OI: ${receta.oi_marca ?? '—'}`);
        if (receta.observaciones) lines.push(`   Obs.: ${receta.observaciones}`);
        if (receta.quet_m1_od || receta.quet_m1_oi) {
            lines.push('');
            lines.push(`   Queratometría:`);
            lines.push(`     OD: ${receta.quet_m1_od?.toFixed(2) ?? '—'} / ${receta.quet_m2_od?.toFixed(2) ?? '—'}`);
            lines.push(`     OI: ${receta.quet_m1_oi?.toFixed(2) ?? '—'} / ${receta.quet_m2_oi?.toFixed(2) ?? '—'}`);
            if (receta.observaciones_queterometria) lines.push(`     Notas: ${receta.observaciones_queterometria}`);
            lines.push('');
        }
        const evalItems: string[] = [];
        if (receta.maquillaje) evalItems.push('Maquillaje');
        if (receta.tonicidad) evalItems.push('Tonicidad');
        if (receta.hendidura_palpebral) evalItems.push('Hendidura Palpebral');
        if (receta.altura_palpebral) evalItems.push('Altura Palpebral');
        if (receta.buen_parpadeo_amplitud) evalItems.push('Parpadeo Amplitud');
        if (receta.buen_parpadeo_ritmo) evalItems.push('Parpadeo Ritmo');
        if (evalItems.length) lines.push(`   Evaluación: ${evalItems.join(', ')}`);
        if (receta.estesiometria) lines.push(`   Estesiometría: ${receta.estesiometria}`);
        receta.pruebasLentesContacto?.forEach(p => {
            lines.push(`   Prueba ${p.numeroPrueba}:`);
            lines.push(`     OD  CB:${p.od_cb.toFixed(2)}  Esf.:${sign(p.od_esferico)}  Cil.:${sign(p.od_cilindrico)}  Eje:${p.od_eje.toFixed(2)}`);
            lines.push(`     OI  CB:${p.oi_cb.toFixed(2)}  Esf.:${sign(p.oi_esferico)}  Cil.:${sign(p.oi_cilindrico)}  Eje:${p.oi_eje.toFixed(2)}`);
            if (p.od_marca || p.oi_marca) lines.push(`     Marcas  OD: ${p.od_marca ?? '—'}  OI: ${p.oi_marca ?? '—'}`);
        });
        lines.push('');
    });

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

    doc.save(`ResumenContacto_${props.nombreCliente}.pdf`);
    printOpen.value = false;
};

const printFichaPDF = async () => {
    if (selectedToPrint.value.length !== 1) {
        alert("Por favor, selecciona exactamente 1 receta para imprimir la ficha.");
        return;
    }
    await generateFichaRecetaContactoPDF(selectedToPrint.value[0]!, {
        nombreCliente: props.nombreCliente,
        nroDocumento: props.nroDocumento,
        tipoDocumento: props.tipoDocumento,
        telefono: props.telefono,
        domicilio: props.domicilio,
        email: props.email,
    });
    printOpen.value = false;
};
</script>

<template>
    <div class="panel w-full flex flex-row h-full">

        <!-- Sidebar -->
        <div class="w-[30%] p-2 pt-0 h-full">
            <div class="flex mr-2 h-10 gap-2">
                <Button
                    variant="outline"
                    class="flex-1 gap-1 text-xs px-3 py-1.5 h-auto"
                    @click="router.push(`/recetas/contacto/new?cliente=${props.idCliente}`)">
                    <PlusIcon class="w-3.5 h-3.5" />
                    Nueva
                </Button>
                <Dialog v-model:open="printOpen">
                    <DialogTrigger as-child>
                        <Button variant="outline" class="gap-1 text-xs px-3 py-1.5 h-auto">
                            <DownloadIcon class="w-3.5 h-3.5" />
                            Imprimir
                        </Button>
                    </DialogTrigger>
                    <DialogContent class="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Imprimir Recetas Lentes de Contacto</DialogTitle>
                            <DialogDescription>{{ nombreCliente }}</DialogDescription>
                        </DialogHeader>
                        <div v-if="recetas?.length" class="flex flex-col gap-3">
                            <div class="flex items-center justify-between pb-2 border-b border-zinc-100">
                                <span class="text-xs text-zinc-500 font-medium">Seleccionar todas</span>
                                <Checkbox :checked="allSelected" @update:checked="toggleSelectAll" />
                            </div>
                            <div v-for="receta in recetas" :key="receta.id" class="flex items-center justify-between">
                                <span class="text-sm font-medium">{{ formatDate(receta.fecha.toString()) }}</span>
                                <Checkbox :checked="isChecked(receta)" @update:checked="handleCheckboxChange(receta)" />
                            </div>
                        </div>
                        <div v-else>
                            <p class="text-sm text-zinc-500">El cliente no tiene recetas registradas</p>
                        </div>
                        <Separator class="my-2" />
                        <div class="flex flex-col gap-2">
                            <p class="text-[10px] text-zinc-400 uppercase st font-semibold">Formato</p>
                            <div class="flex gap-2">
                                <template v-if="recetas?.length">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <span class="flex-1 inline-flex">
                                                    <Button
                                                        class="w-full text-xs px-3 py-2 h-auto"
                                                        :disabled="!puedeImprimirFicha"
                                                        @click="printFichaPDF()">
                                                        Imprimir Ficha
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent v-if="!puedeImprimirFicha">
                                                <p>Solo se puede seleccionar 1 receta para imprimir ficha</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <span class="flex-1 inline-flex">
                                                    <Button
                                                        class="w-full text-xs px-3 py-2 h-auto"
                                                        :disabled="!puedeImprimirResumen"
                                                        @click="printResumenPDF()">
                                                        PDF Resumen
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent v-if="!puedeImprimirResumen">
                                                <p>Selecciona al menos 1 receta para imprimir el resumen</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </template>
                                <Button v-else
                                    variant="outline"
                                    class="flex-1 text-xs px-3 py-2 h-auto"
                                    @click="printOpen = false">Cerrar</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <!-- Toggle Detalle / Resumen (solo si hay recetas) -->
            <div class="flex items-center justify-center mr-2 mt-6 mb-2 gap-2 space-x-7 st">
                <span class="text-[10px] font-semibold uppercase transition-colors"
                    :class="viewMode === 'detalle' ? 'text-zinc-900' : 'text-zinc-400'">Detalle</span>
                <button
                    class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                    :class="viewMode === 'resumen' ? 'bg-primary' : 'bg-zinc-300'"
                    @click="() => { viewMode = viewMode === 'resumen' ? 'detalle' : 'resumen'; if (viewMode === 'resumen') { currentRec = undefined; selectedHistoriaClinica = false; } else { currentRec = recetas?.[0]; } }">
                    <span class="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200"
                        :class="viewMode === 'resumen' ? 'translate-x-4' : 'translate-x-0'" />
                </button>
                <span class="text-[10px] font-semibold uppercase transition-colors"
                    :class="viewMode === 'resumen' ? 'text-zinc-900' : 'text-zinc-400'">Resumen</span>
            </div>

            <!-- Timeline -->
            <div class="relative mr-2 pl-4">
                <!-- vertical line -->
                <div class="absolute left-[1.35rem] top-2 bottom-2 w-px bg-zinc-200" />


                <!-- Recetas -->
                <div
                    v-for="(receta, index) in recetas"
                    :key="receta.id"
                    class="relative flex items-center gap-3 mb-2 py-2.5 cursor-pointer group"
                    @click="() => { selectedHistoriaClinica = false; currentRec = receta; }">
                    <div class="relative z-10 shrink-0 w-3 h-3 rounded-full border-2 transition-all"
                        :class="currentRec === receta ? 'bg-primary border-primary' : 'bg-white border-zinc-300 group-hover:border-zinc-500'" />
                    <div class="flex flex-col gap-0.5 flex-1 min-w-0 py-3 px-3 rounded-lg border-2 border-transparent  min-h-[4.1rem] justify-center"
                        :class="currentRec === receta ? 'bg-primary' : 'hover:border-zinc-300'">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-sm font-semibold" :class="currentRec === receta ? 'text-white' : 'text-zinc-700'">
                                {{ formatDate(receta.fecha.toString()) }}
                            </span>
                            <span v-if="index === 0"
                                class="text-[10px] font-semibold r uppercase px-1.5 py-0.5 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-50">
                                Última
                            </span>
                        </div>
                    </div>
                </div>

                                <!-- Historia Clínica item -->
                <div
                    class="relative flex items-center gap-3 mb-2 py-2.5 cursor-pointer group"
                    @click="() => { selectedHistoriaClinica = true; currentRec = undefined }">
                    <div class="relative z-10 shrink-0 w-3 h-3 rounded-full border-2 transition-all"
                        :class="selectedHistoriaClinica ? 'bg-primary border-primary' : 'bg-white border-zinc-300 group-hover:border-zinc-500'" />
                    <div class="flex flex-col gap-0.5 flex-1 min-w-0 py-3 px-3 rounded-lg border-2 border-transparent  min-h-[4rem] justify-center"
                        :class="selectedHistoriaClinica ? 'bg-primary' : 'hover:border-zinc-300'">
                        <span class="text-sm font-semibold" :class="selectedHistoriaClinica ? 'text-white' : 'text-zinc-700'">
                            Historia Clínica
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <Separator orientation="vertical" />

        <!-- Panel derecho - ancho fijo siempre -->
        <div class="w-[72%] h-full px-8">

            <!-- MODO RESUMEN -->
            <div v-if="viewMode === 'resumen'" class="font-mono text-xs text-zinc-800 leading-relaxed whitespace-pre">
                <div v-for="receta in recetas" :key="receta.id" class="mb-6">
                    <p class="font-bold text-zinc-900 mb-1">** LENTES DE CONTACTO <span class="font-normal text-zinc-500">---> {{ formatDate(receta.fecha.toString()) }}</span></p>
                    <p>   O.D.  CB:{{ receta.od_cb.toFixed(2) }}  Esf.:{{ sign(receta.od_esferico) }}  Cil.:{{ sign(receta.od_cilindrico) }}  Eje:{{ receta.od_eje.toFixed(2) }}  Diám.:{{ receta.od_diametro.toFixed(2) }}</p>
                    <p>   O.I.  CB:{{ receta.oi_cb.toFixed(2) }}  Esf.:{{ sign(receta.oi_esferico) }}  Cil.:{{ sign(receta.oi_cilindrico) }}  Eje:{{ receta.oi_eje.toFixed(2) }}  Diám.:{{ receta.oi_diametro.toFixed(2) }}</p>
                    <p v-if="receta.od_marca || receta.oi_marca">   Marcas  OD: {{ receta.od_marca ?? '—' }}  |  OI: {{ receta.oi_marca ?? '—' }}</p>
                    <p v-if="receta.observaciones" class="text-zinc-500">   Obs.: {{ receta.observaciones }}</p>
                    <template v-if="receta.quet_m1_od || receta.quet_m1_oi">
                        <p>&nbsp;</p>
                        <p>   Queratometría</p>
                        <p>     OD: {{ receta.quet_m1_od?.toFixed(2) ?? '—' }} / {{ receta.quet_m2_od?.toFixed(2) ?? '—' }}</p>
                        <p>     OI: {{ receta.quet_m1_oi?.toFixed(2) ?? '—' }} / {{ receta.quet_m2_oi?.toFixed(2) ?? '—' }}</p>
                        <p v-if="receta.observaciones_queterometria">     Notas querato.: {{ receta.observaciones_queterometria }}</p>
                        <p>&nbsp;</p>
                    </template>
                    <div v-for="p in receta.pruebasLentesContacto" :key="p.numeroPrueba">
                        <p class="font-bold">   Prueba {{ p.numeroPrueba }}:</p>
                        <p>     OD  CB:{{ p.od_cb.toFixed(2) }}  Esf.:{{ sign(p.od_esferico) }}  Cil.:{{ sign(p.od_cilindrico) }}  Eje:{{ p.od_eje.toFixed(2) }}</p>
                        <p>     OI  CB:{{ p.oi_cb.toFixed(2) }}  Esf.:{{ sign(p.oi_esferico) }}  Cil.:{{ sign(p.oi_cilindrico) }}  Eje:{{ p.oi_eje.toFixed(2) }}</p>
                        <p v-if="p.od_marca || p.oi_marca">     Marcas  OD: {{ p.od_marca ?? '—' }}  OI: {{ p.oi_marca ?? '—' }}</p>
                    </div>
                    <Separator class="mt-4" />
                </div>
            </div>

            <!-- Historia Clínica view -->
            <div v-else-if="selectedHistoriaClinica">
                <DetalleHistoriaClinicaContacto :historiaClinica="props.historiaClinica" :cliente-id="idCliente" />
            </div>

            <!-- Receta detail view -->
            <div v-else-if="currentRec">
                
                <!-- Header -->
                <div class="flex flex-row justify-between items-center mb-4">
                    <div class="flex flex-row items-center gap-2">
                        <div class="flex items-center justify-center p-2">
                            <Eye :size="25" />
                        </div>
                        <h4 class="font-bold text-xl text-zinc-900">Receta Lentes de Contacto</h4>
                    </div>
                    <Button
                        variant="outline"
                        class="gap-1.5 text-xs px-3 py-2.5 h-auto"
                        @click="router.push(`/recetas/contacto/edit/${currentRec?.id}`)">
                        <Pencil1Icon class="w-3.5 h-3.5" />
                        Editar
                    </Button>
                    
                </div>

                <div class="flex flex-col gap-6">

                    <!-- Datos de la receta -->
                    <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Datos de la receta</h4>
                        </div>
                        <div class="p-6 grid grid-cols-3 gap-y-5">
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

                    <!-- Lentes Definitivas -->
                    <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Lentes Definitivas</h4>
                        </div>
                        <div class="p-6 overflow-x-auto">
                            <div class="grid grid-cols-[2.75rem_5rem_5rem_5rem_5rem_5rem] gap-x-6 gap-y-2 items-center justify-center">
                                <span></span>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">C.B.</Label>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Esférico</Label>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Cilíndrico</Label>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Eje</Label>
                                <Label class="block w-full text-[10px] font-medium  text-zinc-400 uppercase text-center">Diámetro</Label>

                                <span class="font-bold text-xs text-zinc-900">O.D.</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.od_cb.toFixed(2) }}</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.od_esferico > 0 ? '+' + currentRec.od_esferico.toFixed(2) : currentRec.od_esferico.toFixed(2) }}</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.od_cilindrico > 0 ? '+' + currentRec.od_cilindrico.toFixed(2) : currentRec.od_cilindrico.toFixed(2) }}</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.od_eje.toFixed(2) }}°</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.od_diametro.toFixed(2) }}</span>

                                <span class="font-bold text-xs text-zinc-900">O.I.</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.oi_cb.toFixed(2) }}</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.oi_esferico > 0 ? '+' + currentRec.oi_esferico.toFixed(2) : currentRec.oi_esferico.toFixed(2) }}</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.oi_cilindrico > 0 ? '+' + currentRec.oi_cilindrico.toFixed(2) : currentRec.oi_cilindrico.toFixed(2) }}</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.oi_eje.toFixed(2) }}°</span>
                                <span class="text-sm text-center tabular-nums">{{ currentRec.oi_diametro.toFixed(2) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Queratometría/Evaluación General + Marcas/Observaciones -->
                    <div class="flex flex-col lg:flex-row gap-6 items-stretch">

                        <!-- COLUMNA IZQUIERDA -->
                        <div class="flex flex-col gap-6 w-full lg:w-[22rem] lg:shrink-0">

                            <!-- Queratometría -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Queratometría</h4>
                                </div>
                                <div class="p-6">
                                    <div v-if="currentRec.quet_m1_oi" class="flex flex-col justify-center items-center gap-1">
                                        <div class="flex h-9 items-center justify-center  gap-3">
                                            <span class="text-sm text-zinc-500 w-12">O.D.</span>
                                            <span class="text-sm tabular-nums w-12">{{ currentRec.quet_m1_od.toFixed(2) }}</span>
                                            <Separator orientation="vertical" class="h-5" />
                                            <span class="text-sm tabular-nums w-12">{{ currentRec.quet_m2_od.toFixed(2) }}</span>
                                        </div>
                                        <Separator class="my-1 w-60" />
                                        <div class="flex h-9 items-center  justify-center  gap-3">
                                            <span class="text-sm text-zinc-500 w-12">O.I.</span>
                                            <span class="text-sm tabular-nums w-12">{{ currentRec.quet_m1_oi.toFixed(2) }}</span>
                                            <Separator orientation="vertical" class="h-5" />
                                            <span class="text-sm tabular-nums w-12">{{ currentRec.quet_m2_oi.toFixed(2) }}</span>
                                        </div>
                                        <div class="mt-4 flex w-full justify-start flex-col gap-0.5">
                                            <span class="text-xs text-zinc-400">Notas</span>
                                            <span class="text-sm min-h-[3rem]">{{ currentRec.observaciones_queterometria ?? '—' }}</span>
                                        </div>
                                    </div>
                                    <p v-else class="text-sm text-zinc-400">Sin registros de queratometría</p>
                                </div>
                            </div>

                            <!-- Evaluación General -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Evaluación General</h4>
                                </div>
                                <div class="p-6">
                                    <div class="flex flex-col gap-0.5 mb-5">
                                        <span class="text-xs text-zinc-400">Estesiometría</span>
                                        <span class="text-sm font-medium">{{ currentRec.estesiometria ?? '—' }}</span>
                                    </div>
                                    <div class="flex flex-col gap-3">
                                        <div class="flex items-center gap-2">
                                            <Checkbox v-model:checked="currentRec.tonicidad" class="pointer-events-none border-black" />
                                            <label class="text-sm font-light">Tonicidad</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Checkbox v-model:checked="currentRec.maquillaje" class="pointer-events-none border-black" />
                                            <label class="text-sm font-light">Maquillaje</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Checkbox v-model:checked="currentRec.hendidura_palpebral" class="pointer-events-none border-black" />
                                            <label class="text-sm font-light">Hendidura Palpebral</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Checkbox v-model:checked="currentRec.altura_palpebral" class="pointer-events-none border-black" />
                                            <label class="text-sm font-light">Altura Palpebral</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Checkbox v-model:checked="currentRec.buen_parpadeo_amplitud" class="pointer-events-none border-black" />
                                            <label class="text-sm font-light">Parpadeo: Buena amplitud</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Checkbox v-model:checked="currentRec.buen_parpadeo_ritmo" class="pointer-events-none border-black" />
                                            <label class="text-sm font-light">Parpadeo: Buen ritmo</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <!-- COLUMNA DERECHA -->
                        <div class="flex flex-col gap-6 w-full flex-1 min-w-0">

                            <!-- Marcas -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Marcas</h4>
                                </div>
                                <div class="p-6 grid grid-cols-1 gap-y-5">
                                    <div class="flex flex-col gap-0.5">
                                        <span class="text-xs text-zinc-400">O.D.</span>
                                        <span class="text-sm">{{ currentRec.od_marca ?? '—' }}</span>
                                    </div>
                                    <div class="flex flex-col gap-0.5">
                                        <span class="text-xs text-zinc-400">O.I.</span>
                                        <span class="text-sm">{{ currentRec.oi_marca ?? '—' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Observaciones -->
                            <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden flex-1 flex flex-col">
                                <div class="px-6 py-4 border-b border-zinc-200">
                                    <h4 class="font-bold text-sm text-zinc-900">Observaciones</h4>
                                </div>
                                <div class="p-6 flex-1">
                                    <span class="text-sm">{{ currentRec.observaciones ?? '—' }}</span>
                                </div>
                            </div>

                        </div>

                    </div>

                    <!-- Pruebas -->
                    <div class="rounded-lg border border-zinc-200 bg-white overflow-hidden">
                        <div class="px-6 py-4 border-b border-zinc-200">
                            <h4 class="font-bold text-sm text-zinc-900">Pruebas</h4>
                        </div>
                        <div class="p-6">
                            <div v-if="currentRec?.pruebasLentesContacto?.length" class="flex flex-col">
                                <Accordion type="single" collapsible class="w-full" v-for="prueba, index in currentRec.pruebasLentesContacto" :key="index">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger class="text-sm">Prueba {{ prueba.numeroPrueba }}</AccordionTrigger>
                                        <AccordionContent>
                                            <!-- OD -->
                                            <div class="flex h-9 items-center gap-3 mb-1">
                                                <span class="font-semibold text-sm w-10 text-zinc-500">O.D.</span>
                                                <div class="flex items-center gap-3">
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">C.B.</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_cb.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">Esf.</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_esferico.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">Cil.</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_cilindrico.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">Eje</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_eje.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <ValueNoneIcon class="h-3.5 w-3.5 text-zinc-400" />
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.od_diametro.toFixed(2) }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator class="my-2" />

                                            <!-- OI -->
                                            <div class="flex h-9 items-center gap-3 mb-3">
                                                <span class="font-semibold text-sm w-10 text-zinc-500">O.I.</span>
                                                <div class="flex items-center gap-3">
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">C.B.</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_cb.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">Esf.</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_esferico.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">Cil.</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_cilindrico.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-sm text-zinc-400 bold w-8">Eje</span>
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_eje.toFixed(2) }}</span>
                                                    </div>
                                                    <Separator orientation="vertical" class="h-5" />
                                                    <div class="flex items-center gap-1">
                                                        <ValueNoneIcon class="h-3.5 w-3.5 text-zinc-400" />
                                                        <span class="text-sm tabular-nums w-12 text-right">{{ prueba.oi_diametro.toFixed(2) }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Checkboxes -->
                                            <div class="flex flex-row flex-wrap gap-y-3 mb-4">
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.confort" />
                                                    <label class="text-sm font-light leading-none">Confort</label>
                                                </div>
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.movilidad" />
                                                    <label class="text-sm font-light leading-none">Movilidad</label>
                                                </div>
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.centraje" />
                                                    <label class="text-sm font-light leading-none">Centraje</label>
                                                </div>
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.hiperemia" />
                                                    <label class="text-sm font-light leading-none">Hiperemia</label>
                                                </div>
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.agudeza_visual" />
                                                    <label class="text-sm font-light leading-none">Agudeza visual</label>
                                                </div>
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.od_edema" />
                                                    <label class="text-sm font-light leading-none">OD Edema</label>
                                                </div>
                                                <div class="items-center w-44 flex gap-x-2 min-h-[1.5rem]">
                                                    <Checkbox class="pointer-events-none border-black " v-model:checked="prueba.oi_edema" />
                                                    <label class="text-sm font-light leading-none">OI Edema</label>
                                                </div>
                                            </div>

                                            <!-- Marcas prueba -->
                                            <div class="flex items-center gap-4">
                                                <span class="text-sm text-zinc-400 bold w-14">Marcas</span>
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
                            <p v-else class="text-sm text-zinc-400">No hay pruebas registradas para esta receta</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>