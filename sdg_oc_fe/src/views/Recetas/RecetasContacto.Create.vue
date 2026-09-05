<script setup lang="ts">
import { Cliente } from '@/api/entities/clientes';
import { clientesApi } from '@/api/libs/clientes';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { computed, onMounted, ref } from 'vue';
import { Separator } from '@/components/ui/separator';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { toast } from '@/components/ui/toast';
import { router, previousRoute } from '@/router';
import SelectClienteDialog from '@/components/SelectClienteDialog.vue';
import { AsteriskIcon, PlusCircleIcon, PlusIcon, EyeIcon } from 'lucide-vue-next';
import { SlashIcon, ValueNoneIcon, Cross2Icon } from '@radix-icons/vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import AddObraSocialClienteForm from '@/components/AddObraSocialCliente.Form.vue';
import Input from '@/components/ui/input/Input.vue';
import Label from '@/components/ui/label/Label.vue';
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import Button from '@/components/ui/button/Button.vue';
import Accordion from '@/components/ui/accordion/Accordion.vue';
import AccordionItem from '@/components/ui/accordion/AccordionItem.vue';
import AccordionTrigger from '@/components/ui/accordion/AccordionTrigger.vue';
import AccordionContent from '@/components/ui/accordion/AccordionContent.vue';
import { recetaContactoCustomValidator } from '@/api/entities/recetasContacto';
import { pruebaLentesContactoCustomValidator } from '@/api/entities/pruebasLentesContacto';
import { recetasApi } from '@/api/libs/recetas';
import { useRoute } from 'vue-router';
import { useLoaderStore } from '@/stores/LoaderStore';
import AlertError from '@/components/AlertError.vue';

const route = useRoute();
const loader = useLoaderStore();

const selectedCliente = ref<Cliente | null>(null);
const searchClienteOpen = ref<boolean>(false);

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

const selectedObrasSocialIds = ref<number[]>([]);
const openNewClienteOS = ref<boolean>(false);
const obraSocialSelectOpen = ref<boolean>(false);
const obraSocialSelectValue = ref<string | undefined>(undefined);
const obraSocialSelectKey = ref(0);

const availableObrasSociales = computed(() =>
    selectedCliente.value?.clienteObrasSociales?.filter(cos => !selectedObrasSocialIds.value.includes(cos.obraSocial.id)) ?? []
);

const addObraSocial = (id: string) => {
    const numId = Number(id);
    if (numId && !selectedObrasSocialIds.value.includes(numId)) {
        selectedObrasSocialIds.value.push(numId);
    }
    obraSocialSelectValue.value = undefined;
};

const removeObraSocial = (id: number) => {
    const idx = selectedObrasSocialIds.value.indexOf(id);
    if (idx !== -1) selectedObrasSocialIds.value.splice(idx, 1);
    obraSocialSelectValue.value = undefined;
    obraSocialSelectKey.value++;
};

const handleShowNewObraSocialCliente = () => {
    if (!selectedCliente.value) return;
    obraSocialSelectOpen.value = false;
    openNewClienteOS.value = true;
};

const handleAddObraSocialClick = () => {
    if (!selectedCliente.value) return;
    const hasAny = (selectedCliente.value.clienteObrasSociales?.length ?? 0) > 0 || selectedObrasSocialIds.value.length > 0;
    if (hasAny) {
        obraSocialSelectOpen.value = true;
    } else {
        handleShowNewObraSocialCliente();
    }
};

const handleAddObraSocialCliente = async (obraSocialId: number) => {
    if (selectedCliente.value?.id) {
        selectedCliente.value = await clientesApi.getOne(selectedCliente.value.id);
        if (!selectedObrasSocialIds.value.includes(obraSocialId)) {
            selectedObrasSocialIds.value.push(obraSocialId);
        }
        openNewClienteOS.value = false;
    }
};

const newReceta = ref<{
    cliente: { id: undefined | number },
    fecha: Date | undefined;
    oftalmologo: string | undefined,
    quet_m1_od: number | undefined,
    quet_m2_od: number | undefined,
    quet_m1_oi: number | undefined,
    quet_m2_oi: number | undefined,
    observaciones_queterometria: string | undefined,
    maquillaje: boolean;
    tonicidad: boolean;
    hendidura_palpebral: boolean;
    altura_palpebral: boolean;
    buen_parpadeo_ritmo: boolean;
    buen_parpadeo_amplitud: boolean;
    estesiometria: string | undefined,
    od_cb: number | undefined,
    od_esferico: number | undefined,
    od_cilindrico: number | undefined,
    od_eje: number | undefined,
    od_diametro: number | undefined,
    od_marca: string | undefined,
    oi_cb: number | undefined,
    oi_esferico: number | undefined,
    oi_cilindrico: number | undefined,
    oi_eje: number | undefined,
    oi_diametro: number | undefined,
    oi_marca: string | undefined,
    observaciones: string | undefined,
    senia: number | undefined,
    precio: number | undefined,
}>({
    cliente: { id: undefined },
    fecha: undefined,
    oftalmologo: undefined,
    quet_m1_od: undefined,
    quet_m2_od: undefined,
    quet_m1_oi: undefined,
    quet_m2_oi: undefined,
    observaciones_queterometria: undefined,
    maquillaje: false,
    tonicidad: false,
    hendidura_palpebral: false,
    altura_palpebral: false,
    buen_parpadeo_ritmo: false,
    buen_parpadeo_amplitud: false,
    estesiometria: undefined,
    od_cb: undefined,
    od_esferico: undefined,
    od_cilindrico: undefined,
    od_eje: undefined,
    od_diametro: undefined,
    od_marca: undefined,
    oi_cb: undefined,
    oi_esferico: undefined,
    oi_cilindrico: undefined,
    oi_eje: undefined,
    oi_diametro: undefined,
    oi_marca: undefined,
    observaciones: undefined,
    senia: undefined,
    precio: undefined,
})

const newPruebas = ref<{
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

const _today = new Date()
const fechaReceta = ref({ day: String(_today.getDate()).padStart(2, '0'), month: String(_today.getMonth() + 1).padStart(2, '0'), year: String(_today.getFullYear()) })

onMounted(async () => {
    try {
        loader.show();
        const query = route.query
        if (query.cliente) {
            const foundCliente = await clientesApi.getOne(Number(query.cliente))
            if (foundCliente) handleSelectCliente(foundCliente)
        }
        loader.hide();
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    }
})

const handleSelectCliente = (cliente: Cliente) => {
    selectedCliente.value = cliente;
    newReceta.value.cliente.id = cliente.id;
    searchClienteOpen.value = false;
    selectedObrasSocialIds.value = [];
}

const addPrueba = () => {
    newPruebas.value.push({
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
};

const validateAndSubmit = async () => {
    loader.show()
    const resultReceta = recetaContactoCustomValidator(newReceta.value, fechaReceta.value)
    isValidReceta.value = resultReceta.isValid;
    const resultPruebas = pruebaLentesContactoCustomValidator(newPruebas.value)
    isValidPrueba.value = resultPruebas.isValid;
    console.log(isValidReceta.value)
    console.log(isValidPrueba.value)
    if (resultPruebas.success && resultReceta.success) {
        await onSubmit();
    }
    loader.hide();
}

const onSubmit = async () => {
    try {
        loader.show();
        const recetaObj = { ...newReceta.value, pruebasLentesContacto: newPruebas.value }
        recetaObj.fecha = new Date(parseInt(fechaReceta.value.year), parseInt(fechaReceta.value.month) - 1, parseInt(fechaReceta.value.day))
        const createdReceta = await recetasApi.createRecetaContacto({ ...recetaObj, obrasSociales: selectedObrasSocialIds.value.map(id => ({ id })) })
        loader.hide();
        toast({ title: 'Receta registrada con éxito' })
        router.push(`/recetas/${newReceta.value.cliente.id}?tab=contacto&recetaId=${createdReceta.id}`)
    } catch (err: any) {
        errorMessage.value = err.message as string
        showError.value = true;
        loader.hide();
    };
}

const nombreCliente = computed(() => selectedCliente.value?.apellido + ", " + selectedCliente.value?.nombre)

const totalContacto = computed(() => Number(newReceta.value.precio) || 0)

const restoContacto = computed(() => totalContacto.value - (Number(newReceta.value.senia) || 0))

const redirectCancel = () => {
    if (previousRoute) {
        router.push(previousRoute);
    } else {
        if (selectedCliente.value) {
            router.push(`/clientes/dashboard/${selectedCliente.value.id}`);
        }
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
                <BreadcrumbPage>Nueva receta lentes de contacto</BreadcrumbPage>
            </BreadcrumbItem>
        </BreadcrumbList>
    </Breadcrumb>

    <div class="pt-4 mb-4">
        <form @submit.prevent="validateAndSubmit" class="w-full flex flex-col gap-6">

            <!-- Header -->
            <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-[10px] bg-[#1a1a1a] text-white">
                        <EyeIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Nueva Receta · Lentes de Contacto</h2>
                        <p class="text-xl text-zinc-400 mt-1">
                            {{ selectedCliente ? nombreCliente : 'Sin cliente seleccionado' }} · {{ fechaReceta.day }}/{{ fechaReceta.month }}/{{ fechaReceta.year }}
                        </p>
                    </div>
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
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Datos de la receta</h4>
                        </div>
                        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                            <!-- Cliente -->
                            <div class="flex flex-col gap-1 xl:col-span-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Cliente</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Input
                                        type="text"
                                        class="h-9 w-full"
                                        readonly
                                        :value="selectedCliente ? `${selectedCliente.apellido}, ${selectedCliente.nombre}` : ''"
                                        placeholder="Buscar cliente..."
                                        @click="searchClienteOpen = true"
                                    />
                                    <SelectClienteDialog
                                        v-model="searchClienteOpen"
                                        title="Nueva Receta: Seleccionar Cliente"
                                        @select-cliente="handleSelectCliente"
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidReceta.cliente }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Seleccionar cliente</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <!-- Fecha -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Fecha</Label>
                                <div class="flex flex-row items-center gap-2">
                                    <Input type="text" v-model="fechaReceta.day"   placeholder="DD"   class="h-9 w-12 text-center" maxlength="2" />
                                    <Input type="text" v-model="fechaReceta.month" placeholder="MM"   class="h-9 w-12 text-center" maxlength="2" />
                                    <Input type="text" v-model="fechaReceta.year"  placeholder="AAAA" class="h-9 w-16 text-center" maxlength="4" />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger class="bg-transparent text-xs text-destructive">
                                                <AsteriskIcon :size="14" :class="{ 'invisible': isValidReceta.fecha }" />
                                            </TooltipTrigger>
                                            <TooltipContent class="text-destructive border-destructive font-thin text-xs">
                                                <p>Ingresar una fecha válida</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>

                            <!-- Oftalmólogo -->
                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Oftalmólogo</Label>
                                <Input class="h-9 w-full" v-model="newReceta.oftalmologo" />
                            </div>
                        </div>
                    </div>

                    <!-- Lentes Definitivas -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden w-full">
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
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.od_cb" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.od_esferico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.od_cilindrico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.od_eje" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.od_diametro" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-[-5px] bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>

                                <!-- OI -->
                                <span class="font-bold text-xs text-[#1a1a1a]">O.I.</span>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.oi_cb" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.oi_esferico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.oi_cilindrico" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.oi_eje" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="relative flex items-center justify-center gap-1">
                                    <Input type="decimal" class="h-9 w-16 text-center text-sm" v-model="newReceta.oi_diametro" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="absolute left-full ml-2 bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Queratometría/Evaluación General + Marcas/Observaciones/Pruebas -->
                    <div class="flex flex-col lg:flex-row gap-6 w-full items-stretch">

                    <!-- COLUMNA IZQUIERDA -->
                    <div class="flex flex-col gap-6 w-full lg:w-[22rem] lg:shrink-0">

                        <!-- Queratometría -->
                        <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Queratometría</h4>
                            </div>
                            <div class="p-6 flex flex-col gap-3">

                                <!-- OD -->
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="newReceta.quet_m1_od" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m1_od }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                    <Separator orientation="vertical" class="h-6 mx-1" />
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="newReceta.quet_m2_od" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m2_od }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>

                                <Separator class="w-full" />

                                <!-- OI -->
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="newReceta.quet_m1_oi" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m1_oi }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                    <Separator orientation="vertical" class="h-6 mx-1" />
                                    <Input type="decimal" class="h-9 w-20 ml-4" v-model="newReceta.quet_m2_oi" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m2_oi }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>

                                <!-- Notas queterom -->
                                <div class="flex flex-col gap-1 mt-2">
                                    <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Notas</Label>
                                    <Textarea class="resize-none h-20" v-model="newReceta.observaciones_queterometria" />
                                </div>
                            </div>
                        </div>

                        <!-- Evaluación General -->
                        <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Evaluación General</h4>
                            </div>
                            <div class="p-6">
                                <!-- Estesiometría -->
                                <div class="flex flex-col gap-1">
                                    <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Estesiometría</Label>
                                    <div class="flex items-center gap-2">
                                        <Select v-model="newReceta.estesiometria" @update:model-value="(value) => newReceta.estesiometria = value">
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
                                        <Checkbox v-model:checked="newReceta.tonicidad" />
                                        <label class="text-sm font-light">Tonicidad</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="newReceta.maquillaje" />
                                        <label class="text-sm font-light">Maquillaje</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="newReceta.hendidura_palpebral" />
                                        <label class="text-sm font-light">Hendidura Palpebral</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="newReceta.altura_palpebral" />
                                        <label class="text-sm font-light">Altura Palpebral</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="newReceta.buen_parpadeo_amplitud" />
                                        <label class="text-sm font-light">Parpadeo: Buena amplitud</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Checkbox v-model:checked="newReceta.buen_parpadeo_ritmo" />
                                        <label class="text-sm font-light">Parpadeo: Buen ritmo</label>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- COLUMNA DERECHA -->
                    <div class="flex flex-col gap-6 w-full flex-1 min-w-0">

                        <!-- Marcas -->
                        <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Marcas</h4>
                            </div>
                            <div class="p-6 flex flex-col gap-3">
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                    <Input type="text" class="h-9 flex-1" v-model="newReceta.od_marca" placeholder="Marca" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                                <div class="flex flex-row items-center gap-2">
                                    <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                    <Input type="text" class="h-9 flex-1" v-model="newReceta.oi_marca" placeholder="Marca" />
                                    <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                </div>
                            </div>
                        </div>

                        <!-- Obras sociales -->
                        <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Obras sociales</h4>
                            </div>
                            <div class="p-6">
                                <div v-if="selectedObrasSocialIds.length > 0" class="flex flex-col items-start gap-2 mb-4">
                                    <div v-for="id in selectedObrasSocialIds" :key="id"
                                         class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm max-w-full">
                                        <span class="truncate">{{ selectedCliente?.clienteObrasSociales?.find(cos => cos.obraSocial.id === id)?.obraSocial.nombre }}</span>
                                        <button type="button" @click="removeObraSocial(id)" class="text-[#aaa] hover:text-destructive shrink-0">
                                            <Cross2Icon class="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                                <div v-if="(selectedCliente?.clienteObrasSociales?.length ?? 0) > 0 || selectedObrasSocialIds.length > 0">
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
                                    <p class="text-sm text-[#888]">
                                        {{ selectedCliente ? 'Sin cobertura asignada' : 'Seleccioná un cliente para gestionar sus obras sociales' }}
                                    </p>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger as-child>
                                                <span>
                                                    <Button type="button" size="sm" variant="outline" :disabled="!selectedCliente" @click="handleAddObraSocialClick">
                                                        Registrar obra social
                                                    </Button>
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent v-if="!selectedCliente">
                                                <p>Seleccionar un cliente primero</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Dialog v-model:open="openNewClienteOS">
                                    <DialogContent class="max-w-[33rem]">
                                        <AddObraSocialClienteForm v-if="selectedCliente" :cliente="selectedCliente" @handle-add-obra-social-cliente="handleAddObraSocialCliente" />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden flex-1 flex flex-col">
                            <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                                <h4 class="font-bold text-sm text-[#1a1a1a]">Observaciones</h4>
                            </div>
                            <div class="p-6 flex-1">
                                <Textarea class="resize-none w-full h-full min-h-[6rem]" v-model="newReceta.observaciones" />
                            </div>
                        </div>

                    </div>

                    </div>

                    <!-- Pruebas -->
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Pruebas</h4>
                        </div>
                        <div class="p-6">
                            <div class="flex flex-col gap-2">
                                <div v-for="(prueba, index) in newPruebas" :key="index" class="flex flex-row items-start gap-2">
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
                                    <Button variant="ghost" type="button" size="icon" class="mt-2 text-red-400" @click="newPruebas.splice(index, 1)">
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
                    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                        <div class="flex items-center px-6 py-4 border-b border-[#e5e5e5]">
                            <h4 class="font-bold text-sm text-[#1a1a1a]">Precios</h4>
                        </div>
                        <div class="p-6 flex flex-col gap-4">

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Precio</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="newReceta.precio" />
                                </div>
                            </div>

                            <div class="flex flex-col gap-1">
                                <Label class="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">Seña recibida</Label>
                                <div class="relative w-full">
                                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
                                    <Input type="decimal" class="h-10 pl-6 pr-8" v-model="newReceta.senia" />
                                </div>
                            </div>

                            <div class="flex flex-col gap-1.5 pt-3 border-t border-[#e5e5e5] text-sm">
                                <div class="flex justify-between text-zinc-500">
                                    <span>Precio</span>
                                    <span>{{ newReceta.precio ? '$ ' + Number(newReceta.precio).toLocaleString('es-AR') : '$ —' }}</span>
                                </div>
                                <div class="flex justify-between text-zinc-500">
                                    <span>− Seña</span>
                                    <span>{{ newReceta.senia ? '- $ ' + Number(newReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
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
                            <span class="font-semibold text-[#1a1a1a]">{{ newReceta.senia ? '$ ' + Number(newReceta.senia).toLocaleString('es-AR') : '$ —' }}</span>
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
</template>