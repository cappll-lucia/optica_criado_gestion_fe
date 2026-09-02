<script setup lang="ts">
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AsteriskIcon, PlusCircleIcon, PlusIcon } from 'lucide-vue-next';
import { Separator } from '@/components/ui/separator';
import { computed, onMounted, ref } from 'vue';
import Label from '@/components/ui/label/Label.vue';
import { RecetaContacto, recetaContactoCustomValidator } from '@/api/entities/recetasContacto';
import { useRoute } from 'vue-router';
import { recetasApi } from '@/api/libs/recetas';
import { Cliente } from '@/api/entities/clientes';
import { clientesApi } from '@/api/libs/clientes';
import { RecetaLentesContactoObraSocial } from '@/api/entities/recetaLentesContactoObraSocial';
import { recetaLentesContactoObraSocialApi } from '@/api/libs/recetaLentesContactoObraSocial';
import Input from '@/components/ui/input/Input.vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import AddObraSocialClienteForm from '@/components/AddObraSocialCliente.Form.vue';
import Accordion from '@/components/ui/accordion/Accordion.vue';
import AccordionItem from '@/components/ui/accordion/AccordionItem.vue';
import AccordionTrigger from '@/components/ui/accordion/AccordionTrigger.vue';
import AccordionContent from '@/components/ui/accordion/AccordionContent.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Button from '@/components/ui/button/Button.vue';
import { previousRoute, router } from '@/router';
import AlertError from '@/components/AlertError.vue';
import { PruebaLentesContacto, pruebaLentesContactoCustomValidator } from '@/api/entities/pruebasLentesContacto';
import { toast } from '@/components/ui/toast';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { Cross2Icon, ValueNoneIcon, SlashIcon } from '@radix-icons/vue';
import { useLoaderStore } from '@/stores/LoaderStore';

const route = useRoute();
const loader = useLoaderStore();

const fechaReceta = ref({ day: '', month: '', year: '' })

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

const currentReceta = ref<RecetaContacto>();
const clienteForOS = ref<Cliente>();
const currentObrasSociales = ref<RecetaLentesContactoObraSocial[]>([]);
const openNewClienteOS = ref<boolean>(false);
const obraSocialSelectOpen = ref<boolean>(false);
const obraSocialSelectValue = ref<string | undefined>(undefined);
const obraSocialSelectKey = ref(0);

const availableObrasSociales = computed(() =>
    clienteForOS.value?.clienteObrasSociales?.filter(cos =>
        !currentObrasSociales.value.some(a => a.obraSocialId === cos.obraSocial.id || a.obraSocial?.id === cos.obraSocial.id)
    ) ?? []
);

const addObraSocial = async (id: string) => {
    if (!currentReceta.value || !id) return;
    try {
        const created = await recetaLentesContactoObraSocialApi.create({
            recetaLentesContacto: { id: currentReceta.value.id },
            obraSocial: { id: Number(id) },
        });
        currentObrasSociales.value.push(created);
    } catch (err: any) {
        errorMessage.value = err.message;
        showError.value = true;
    }
    obraSocialSelectValue.value = undefined;
};

const removeObraSocial = async (asociacionId: number) => {
    try {
        await recetaLentesContactoObraSocialApi.remove(asociacionId);
        const idx = currentObrasSociales.value.findIndex(a => a.id === asociacionId);
        if (idx !== -1) currentObrasSociales.value.splice(idx, 1);
    } catch (err: any) {
        errorMessage.value = err.message;
        showError.value = true;
    }
    obraSocialSelectValue.value = undefined;
    obraSocialSelectKey.value++;
};

const handleShowNewObraSocialCliente = () => {
    obraSocialSelectOpen.value = false;
    openNewClienteOS.value = true;
};

const handleAddObraSocialCliente = async (obraSocialId: number) => {
    if (clienteForOS.value?.id) {
        clienteForOS.value = await clientesApi.getOne(clienteForOS.value.id);
        await addObraSocial(String(obraSocialId));
        openNewClienteOS.value = false;
    }
};

const currentPruebas = ref<{
    od_diametro: number | undefined,
    od_eje: number | undefined,
    od_cilindrico: number | undefined,
    od_esferico: number | undefined,
    od_cb: number | undefined,
    od_marca: string,
    oi_diametro: number | undefined,
    oi_eje: number | undefined,
    oi_cilindrico: number | undefined,
    oi_esferico: number | undefined,
    oi_cb: number | undefined,
    oi_marca: string,
    confort: boolean,
    movilidad: boolean,
    centraje: boolean,
    hiperemia: boolean,
    agudeza_visual: boolean,
    oi_edema: boolean,
    od_edema: boolean,
    observaciones: string,
}[]>([])

const isValidReceta = ref<{
    quet_m1_od: boolean,
    quet_m2_od: boolean,
    quet_m1_oi: boolean,
    quet_m2_oi: boolean,
    estesiometria: boolean,
    od_cb: boolean,
    od_esferico: boolean,
    od_cilindrico: boolean,
    od_eje: boolean,
    od_diametro: boolean,
    od_marca: boolean,
    oi_cb: boolean,
    oi_esferico: boolean,
    oi_cilindrico: boolean,
    oi_eje: boolean,
    oi_diametro: boolean,
    oi_marca: boolean,
    fecha: boolean,
    cliente: boolean
}>({
    quet_m1_od: true,
    quet_m2_od: true,
    quet_m1_oi: true,
    quet_m2_oi: true,
    estesiometria: true,
    od_cb: true,
    od_esferico: true,
    od_cilindrico: true,
    od_eje: true,
    od_diametro: true,
    od_marca: true,
    oi_cb: true,
    oi_esferico: true,
    oi_cilindrico: true,
    oi_eje: true,
    oi_diametro: true,
    oi_marca: true,
    fecha: true,
    cliente: true
})

const isValidPrueba = ref<{
    od_cb: boolean,
    od_esferico: boolean,
    od_cilindrico: boolean,
    od_eje: boolean,
    od_diametro: boolean,
    oi_cb: boolean,
    oi_esferico: boolean,
    oi_cilindrico: boolean,
    oi_eje: boolean,
    oi_diametro: boolean,
}[]>([])

onMounted(async () => {
    try {
        loader.show();
        currentReceta.value = await recetasApi.getOneContacto(Number(route.params.id))
        currentPruebas.value = currentReceta.value.pruebasLentesContacto.map((p: PruebaLentesContacto) => {
            const { numeroPrueba: numero, ...prueba } = p;
            return prueba
        });
        isValidPrueba.value.push({
            od_cb: true, od_esferico: true, od_cilindrico: true, od_eje: true, od_diametro: true,
            oi_cb: true, oi_esferico: true, oi_cilindrico: true, oi_eje: true, oi_diametro: true,
        })
        fechaReceta.value.day = currentReceta.value.fecha.getDate().toString()
        fechaReceta.value.month = (currentReceta.value.fecha.getMonth() + 1).toString()
        fechaReceta.value.year = currentReceta.value.fecha.getFullYear().toString()
        const [obrasSociales, clienteFetched] = await Promise.all([
            recetaLentesContactoObraSocialApi.getAll({ idRecetaLentesContacto: currentReceta.value.id }),
            clientesApi.getOne(currentReceta.value.cliente.id),
        ]);
        currentObrasSociales.value = obrasSociales;
        clienteForOS.value = clienteFetched;
        loader.hide();
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    }
})

const addPrueba = () => {
    currentPruebas.value.push({
        od_diametro: undefined, od_eje: undefined, od_cilindrico: undefined,
        od_esferico: undefined, od_cb: undefined, od_marca: '',
        oi_diametro: undefined, oi_eje: undefined, oi_cilindrico: undefined,
        oi_esferico: undefined, oi_cb: undefined, oi_marca: '',
        confort: false, movilidad: false, centraje: false, hiperemia: false,
        agudeza_visual: false, oi_edema: false, od_edema: false, observaciones: ''
    })
    isValidPrueba.value.push({
        od_cb: true, od_esferico: true, od_cilindrico: true, od_eje: true, od_diametro: true,
        oi_cb: true, oi_esferico: true, oi_cilindrico: true, oi_eje: true, oi_diametro: true,
    })
}

const validateAndSubmit = async () => {
    if (currentReceta.value) {
        loader.show();
        const resultReceta = recetaContactoCustomValidator(currentReceta.value, fechaReceta.value)
        isValidReceta.value = resultReceta.isValid;
        const resultPruebas = pruebaLentesContactoCustomValidator(currentPruebas.value)
        isValidPrueba.value = resultPruebas.isValid;
        if (resultPruebas.success && resultReceta.success) {
            await onSubmit();
        }
        loader.hide();
    }
}

const onSubmit = async () => {
    try {
        if (currentReceta.value) {
            const recetaObj = { ...currentReceta.value, pruebasLentesContacto: currentPruebas.value }
            recetaObj.fecha = new Date(parseInt(fechaReceta.value.year), parseInt(fechaReceta.value.month) - 1, parseInt(fechaReceta.value.day))
            await recetasApi.editRecetaContacto(recetaObj)
            loader.hide();
            toast({ title: 'Receta editada con éxito' })
            router.push(`/recetas/${currentReceta.value.cliente.id}?tab=contacto&recetaId=${currentReceta.value.id}`)
        }
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    };
}

const nombreCliente = computed(() => currentReceta.value?.cliente.apellido + ", " + currentReceta.value?.cliente.nombre);

const totalContacto = computed(() => Number(currentReceta.value?.precio) || 0)

const restoContacto = computed(() => totalContacto.value - (Number(currentReceta.value?.senia) || 0))

const redirectCancel = () => {
    if (previousRoute) {
        router.push(previousRoute);
    } else {
        if (currentReceta.value?.cliente) {
            router.push(`/clientes/dashboard/${currentReceta.value?.cliente.id}`);
        }
    }
}
</script>

<template>
<div class="page" v-if="currentReceta">
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
                <BreadcrumbLink :href="`/clientes/dashboard/${currentReceta?.cliente.id}`">{{ nombreCliente }}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbLink :href="`/recetas/${currentReceta?.cliente.id}`">Recetas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
            <BreadcrumbItem>
                <BreadcrumbPage>Editar Receta</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4">
        <form @submit.prevent="validateAndSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-start justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div>
                    <h1 class="text-2xl font-extrabold text-[#1a1a1a]">Editar Receta - Lentes de Contacto</h1>
                    <p class="text-sm text-zinc-400 mt-1">{{ nombreCliente }}</p>
                </div>
                <div class="flex gap-3 shrink-0">
                    <Button type="button" variant="outline" @click="redirectCancel">Cancelar</Button>
                    <Button type="submit">Guardar receta</Button>
                </div>
            </div>

            <!-- Grid principal: contenido + sidebar Precios -->
            <div class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start w-full">

                <!-- COLUMNA IZQUIERDA -->
                <div class="flex flex-col gap-6 min-w-0">

                    <!-- Datos de la receta -->
                    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Datos de la receta</h4>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                            <!-- Cliente -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Cliente</Label>
                                <div class="h-9 flex items-center px-3 rounded-md border border-[#e5e5e5] bg-muted cursor-not-allowed text-sm">
                                    {{ currentReceta.cliente.apellido }}, {{ currentReceta.cliente.nombre }}
                                </div>
                            </div>

                            <!-- Fecha -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Fecha</Label>
                                <div class="h-9 flex items-center px-3 rounded-md border border-[#e5e5e5] bg-muted cursor-not-allowed text-sm">
                                    {{ fechaReceta.day.padStart(2, '0') }}/{{ fechaReceta.month.padStart(2, '0') }}/{{ fechaReceta.year }}
                                </div>
                            </div>

                            <!-- Oftalmólogo -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Oftalmólogo</Label>
                                <Input class="h-9 w-full" v-model="currentReceta.oftalmologo" placeholder="Opcional" />
                            </div>
                        </div>
                    </div>

                    <!-- Lentes Definitivas -->
                    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden w-full">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Lentes Definitivas</h4>
                        </div>
                        <div class="p-6 overflow-x-auto">
                            <div class="grid grid-cols-[2.75rem_5rem_5rem_5rem_5rem_5rem] gap-x-6 gap-y-3 items-center justify-center">
                                <span></span>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">C.B.</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Esférico</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Cilíndrico</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Eje</Label>
                                <Label class="block w-full text-[10px] font-medium tracking-wide text-zinc-400 uppercase text-center">Diámetro</Label>

                                <!-- OD -->
                                <span class="font-bold text-xs text-[#1a1a1a]">O.D.</span>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.od_cb" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.od_esferico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.od_cilindrico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.od_eje" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.od_diametro" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>

                                <!-- OI -->
                                <span class="font-bold text-xs text-[#1a1a1a]">O.I.</span>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.oi_cb" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.oi_esferico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.oi_cilindrico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.oi_eje" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="currentReceta.oi_diametro" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Queratometría/Evaluación General + Marcas/Obras sociales/Observaciones -->
                    <div class="flex flex-col lg:flex-row gap-6 w-full items-stretch">

                    <!-- COLUMNA IZQUIERDA -->
                    <div class="flex flex-col gap-6 w-full lg:w-[22rem] lg:shrink-0">

                        <!-- Queratometría -->
                        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Queratometría</h4>
                            </div>
                            <div class="p-6 flex flex-col gap-3">

                                <!-- OD -->
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m1_od" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m1_od }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                    <Separator orientation="vertical" class="h-6 mx-1" />
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m2_od" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m2_od }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>

                                <Separator class="w-full" />

                                <!-- OI -->
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m1_oi" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m1_oi }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                    <Separator orientation="vertical" class="h-6 mx-1" />
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m2_oi" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m2_oi }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>

                                <!-- Notas queterom -->
                                <div class="flex flex-col gap-1 mt-2">
                                    <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Notas</Label>
                                    <Textarea class="resize-none h-20" v-model="currentReceta.observaciones_queterometria" />
                                </div>
                            </div>
                        </div>

                        <!-- Evaluación General -->
                        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Evaluación General</h4>
                            </div>
                            <div class="p-6">
                                <!-- Estesiometría -->
                                <div class="flex flex-col gap-1">
                                    <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Estesiometría</Label>
                                    <div class="flex items-center gap-2">
                                        <Select v-model="currentReceta.estesiometria" @update:model-value="(value) => currentReceta && (currentReceta.estesiometria = value)">
                                            <SelectTrigger class="h-9 w-full">
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="Hiperestésico">Hiperestésico</SelectItem>
                                                    <SelectItem value="Normoestésico">Normoestésico</SelectItem>
                                                    <SelectItem value="Hipoestésico">Hipoestésico</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="14" :class="{ 'invisible': isValidReceta.estesiometria }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Seleccionar estesiometría</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>

                                <!-- check box -->
                                <div class="flex flex-col gap-3 mt-5">
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="currentReceta.tonicidad" />
                                        <label class="text-sm font-light">Tonicidad</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="currentReceta.maquillaje" />
                                        <label class="text-sm font-light">Maquillaje</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="currentReceta.hendidura_palpebral" />
                                        <label class="text-sm font-light">Hendidura Palpebral</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="currentReceta.altura_palpebral" />
                                        <label class="text-sm font-light">Altura Palpebral</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="currentReceta.buen_parpadeo_amplitud" />
                                        <label class="text-sm font-light">Parpadeo: Buena amplitud</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="currentReceta.buen_parpadeo_ritmo" />
                                        <label class="text-sm font-light">Parpadeo: Buen ritmo</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- COLUMNA DERECHA -->
                    <div class="flex flex-col gap-6 w-full flex-1 min-w-0">

                        <!-- Marcas -->
                        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Marcas</h4>
                            </div>
                            <div class="p-6 flex flex-col gap-3">
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                    <Input type="text" class="h-9 flex-1" v-model="currentReceta.od_marca" placeholder="Marca" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                    <Input type="text" class="h-9 flex-1" v-model="currentReceta.oi_marca" placeholder="Marca" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>
                        </div>

                        <!-- Obras sociales -->
                        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Obras sociales</h4>
                            </div>
                            <div class="p-6">
                                <div v-if="currentObrasSociales.length > 0" class="flex flex-col items-start gap-2 mb-4">
                                    <div v-for="asoc in currentObrasSociales" :key="asoc.id"
                                         class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm max-w-full">
                                        <span class="truncate">{{ asoc.obraSocial?.nombre ?? clienteForOS?.clienteObrasSociales?.find(cos => cos.obraSocial.id === asoc.obraSocialId)?.obraSocial.nombre }}</span>
                                        <button type="button" @click="removeObraSocial(asoc.id)" class="text-[#aaa] hover:text-destructive shrink-0">
                                            <Cross2Icon class="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div v-if="(clienteForOS?.clienteObrasSociales?.length ?? 0) > 0 || currentObrasSociales.length > 0">
                                    <Select :key="obraSocialSelectKey" :model-value="obraSocialSelectValue" v-model:open="obraSocialSelectOpen" @update:model-value="(val) => addObraSocial(val)">
                                        <SelectTrigger class="h-9 w-full">
                                            <SelectValue placeholder="Agregar obra social..." />
                                        </SelectTrigger>
                                        <SelectContent class="max-h-[20rem] w-[15rem] pr-1">
                                            <SelectGroup class="max-h-[20rem] w-[16rem] m-0 p-0 overflow-scroll">
                                                <SelectItem
                                                    v-for="cos in availableObrasSociales"
                                                    :key="cos.obraSocial.id"
                                                    :value="String(cos.obraSocial.id)"
                                                >
                                                    {{ cos.obraSocial.nombre }}
                                                </SelectItem>
                                                <Button
                                                    @click="handleShowNewObraSocialCliente()"
                                                    variant="ghost"
                                                    type="button"
                                                    class="w-full h-max p-2 bg-secondary rounded-none flex-row items-center justify-start text-sm"
                                                >
                                                    <PlusCircleIcon />
                                                    <span class="w-[9rem] text-wrap text-left">Asociar nueva obra social al cliente</span>
                                                </Button>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div v-else class="flex flex-col items-start gap-2">
                                    <p class="text-sm text-[#888]">Sin cobertura asignada</p>
                                    <Button type="button" size="sm" variant="outline" @click="handleShowNewObraSocialCliente">
                                        Registrar obra social
                                    </Button>
                                </div>
                                <Dialog v-model:open="openNewClienteOS">
                                    <DialogContent class="max-w-[33rem]">
                                        <AddObraSocialClienteForm v-if="clienteForOS" :cliente="clienteForOS" @handle-add-obra-social-cliente="handleAddObraSocialCliente" />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden flex-1 flex flex-col">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Observaciones</h4>
                            </div>
                            <div class="p-6 flex-1">
                                <Textarea class="resize-none w-full h-full min-h-[6rem]" v-model="currentReceta.observaciones" />
                            </div>
                        </div>

                    </div>

                    </div>

                    <!-- Pruebas -->
                    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Pruebas</h4>
                        </div>
                        <div class="p-6">
                            <div class="flex flex-col gap-2">
                                <div v-for="(prueba, index) in currentPruebas" :key="index" class="flex flex-row items-start gap-2">
                                    <Accordion type="single" collapsible class="flex-1">
                                        <AccordionItem :value="`item-${index + 1}`">
                                            <AccordionTrigger>Prueba {{ index + 1 }}</AccordionTrigger>
                                            <AccordionContent class="px-2 pt-2">

                                                <!-- OD prueba -->
                                                <div class="flex flex-row flex-wrap items-center gap-2 mb-3">
                                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                                    <Label class="text-xs text-[#888]">C.B.</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.od_cb" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.od_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <Label class="text-xs text-[#888]">Esf.</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.od_esferico" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <Label class="text-xs text-[#888]">Cil.</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.od_cilindrico" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <Label class="text-xs text-[#888]">Eje</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.od_eje" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.od_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <ValueNoneIcon class="h-3 w-3 text-[#888]" />
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.od_diametro" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.od_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                                                </div>

                                                <!-- OI prueba -->
                                                <div class="flex flex-row flex-wrap items-center gap-2 mb-4">
                                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                                    <Label class="text-xs text-[#888]">C.B.</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.oi_cb" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.oi_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <Label class="text-xs text-[#888]">Esf.</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.oi_esferico" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <Label class="text-xs text-[#888]">Cil.</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.oi_cilindrico" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <Label class="text-xs text-[#888]">Eje</Label>
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.oi_eje" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.oi_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                                                    <Separator orientation="vertical" class="h-5 mx-1" />
                                                    <ValueNoneIcon class="h-3 w-3 text-[#888]" />
                                                    <Input type="decimal" class="h-8 w-16 text-xs" v-model="prueba.oi_diametro" />
                                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidPrueba[index]?.oi_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                                                </div>

                                                <!-- Checkboxes -->
                                                <div class="flex flex-row flex-wrap gap-x-6 gap-y-3 mb-4">
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.confort" /><label class="text-sm font-light">Confort</label></div>
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.movilidad" /><label class="text-sm font-light">Movilidad</label></div>
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.centraje" /><label class="text-sm font-light">Centraje</label></div>
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.hiperemia" /><label class="text-sm font-light">Hiperemia</label></div>
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.agudeza_visual" /><label class="text-sm font-light">Agudeza visual</label></div>
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.od_edema" /><label class="text-sm font-light">OD Edema</label></div>
                                                    <div class="flex items-center gap-2"><Checkbox v-model:checked="prueba.oi_edema" /><label class="text-sm font-light">OI Edema</label></div>
                                                </div>

                                                <!-- Marcas prueba -->
                                                <div class="flex flex-row gap-6">
                                                    <div class="flex items-center gap-2">
                                                        <Label class="text-xs text-[#888]">Marcas O.D.</Label>
                                                        <Input type="decimal" class="h-8 w-32 text-xs" v-model="prueba.od_marca" />
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <Label class="text-xs text-[#888]">Marcas O.I.</Label>
                                                        <Input type="decimal" class="h-8 w-32 text-xs" v-model="prueba.oi_marca" />
                                                    </div>
                                                </div>

                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    <Button variant="ghost" type="button" size="icon" class="mt-2 text-red-400" @click="currentPruebas.splice(index, 1)">
                                        <Cross2Icon />
                                    </Button>
                                </div>
                            </div>

                            <Button variant="outline" type="button" size="sm" class="mt-4 w-36" @click="addPrueba()">
                                <PlusIcon class="mr-1" /> Nueva Prueba
                            </Button>
                        </div>
                    </div>

                </div>

                <!-- COLUMNA DERECHA: Precios -->
                <div class="lg:sticky lg:top-4 flex flex-col gap-6">
                    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Precios</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Precio</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="currentReceta.precio" />
                                </div>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Seña recibida</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="currentReceta.senia" />
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5 pt-3 border-t border-[#e5e5e5] text-sm">
                                <div class="flex justify-between text-zinc-500">
                                    <span>Precio</span>
                                    <span>{{ currentReceta.precio ? '$ ' + Number(currentReceta.precio).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                                <div class="flex justify-between text-zinc-500">
                                    <span>− Seña</span>
                                    <span>{{ currentReceta.senia ? '- $ ' + Number(currentReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                            </div>

                            <div class="flex items-center justify-between rounded-xl bg-[#1a1a1a] px-4 py-3 text-white">
                                <span class="text-[10px] font-medium tracking-wide uppercase">Total</span>
                                <span class="text-base font-bold">{{ totalContacto > 0 ? '$ ' + totalContacto.toLocaleString('es-AR') : '$ —' }}</span>
                            </div>

                            <div class="flex items-center justify-between rounded-xl border px-4 py-3 bg-secondary">
                                <span class="text-[10px] font-medium tracking-wide uppercase">Resto a pagar</span>
                                <span class="text-base font-bold">{{ totalContacto > 0 ? '$ ' + restoContacto.toLocaleString('es-AR') : '$ —' }}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer sticky -->
            <div class="sticky bottom-0 z-10 -mx-[5rem] px-[5rem] bg-white/95 backdrop-blur border-t border-[#e5e5e5] mt-2">
                <div class="flex flex-row items-center justify-between gap-6 py-3">
                    <div class="flex items-center gap-6 text-sm">
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Total</span>
                            <span class="font-semibold text-[#1a1a1a]">{{ totalContacto > 0 ? '$ ' + totalContacto.toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Seña</span>
                            <span class="font-semibold text-[#1a1a1a]">{{ currentReceta.senia ? '$ ' + Number(currentReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                        <div class="flex flex-col leading-tight">
                            <span class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Resto</span>
                            <span class="font-semibold" :class="restoContacto < 0 ? 'text-destructive' : 'text-[#1a1a1a]'">{{ totalContacto > 0 ? '$ ' + restoContacto.toLocaleString('es-AR') : '$ —' }}</span>
                        </div>
                    </div>
                    <div class="flex gap-3">
                        <Button type="button" variant="outline" @click="redirectCancel">Cancelar</Button>
                        <Button type="submit">Guardar receta</Button>
                    </div>
                </div>
            </div>

        </form>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>

<div v-else class="page">
    <div class="pt-2 mb-4">
        <div class="forms-wide flex flex-col justify-between items-start px-[5rem]">
            <div class="w-full">
                <h3 class="page-subtitle text-center">Receta con id {{ route.params.id }} no encontrada</h3>
            </div>
        </div>
    </div>
</div>
</template>
