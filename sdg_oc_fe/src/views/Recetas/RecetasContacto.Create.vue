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
import { AsteriskIcon, PlusCircleIcon, PlusIcon } from 'lucide-vue-next';
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

const availableObrasSociales = computed(() =>
    selectedCliente.value?.clienteObrasSociales?.filter(cos => !selectedObrasSocialIds.value.includes(cos.obraSocial.id)) ?? []
);

const addObraSocial = (id: string) => {
    const numId = Number(id);
    if (numId && !selectedObrasSocialIds.value.includes(numId)) {
        selectedObrasSocialIds.value.push(numId);
    }
};

const removeObraSocial = (id: number) => {
    const idx = selectedObrasSocialIds.value.indexOf(id);
    if (idx !== -1) selectedObrasSocialIds.value.splice(idx, 1);
};

const handleShowNewObraSocialCliente = () => {
    openNewClienteOS.value = true;
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

    <div class="pt-2 mb-4">
        <form @submit.prevent="validateAndSubmit" class="forms-wide flex flex-col justify-start items-start px-[5rem] !bg-white">

            <!-- Header -->
            <div class="w-full">
                <h3 class="page-subtitle text-center">Nueva Receta - Lentes de Contacto</h3>
                <Separator class="my-6 w-full" />
            </div>

            <!-- Fila 1: Cliente / Fecha -->
            <div class="flex flex-row w-full justify-between items-end gap-6 mt-4">

                <!-- Cliente -->
                <div class="flex flex-col gap-1 w-[35%]">
                    <Label class="text-xs text-[#888]">Cliente</Label>
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
                                <TooltipTrigger class="bg-transparent text-destructive">
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
                <div class="flex flex-col gap-1 w-[30%]">
                    <Label class="text-xs text-[#888]">Fecha Receta</Label>
                    <div class="flex flex-row items-center gap-2">
                        <Input type="text" v-model="fechaReceta.day"   placeholder="DD"   class="h-9 w-16 text-center" maxlength="2" />
                        <Input type="text" v-model="fechaReceta.month" placeholder="MM"   class="h-9 w-16 text-center" maxlength="2" />
                        <Input type="text" v-model="fechaReceta.year"  placeholder="AAAA" class="h-9 w-20 text-center" maxlength="4" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger class="bg-transparent text-destructive">
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
                <div class="flex flex-col gap-1 flex-1">
                    <Label class="text-xs text-[#888]">Oftalmólogo</Label>
                    <Input class="h-9 w-full" v-model="newReceta.oftalmologo" />
                </div>
            </div>

            <Separator class="my-8 w-full" />

            <!-- Lentes Definitivas -->
            <div class="w-full rounded-2xl border border-[#e5e5e5] p-6">
                <div class="flex flex-row items-center justify-between">
 
                    <span class="font-bold text-xl text-[#1a1a1a] w-[9rem] text-left pr-20  ">Lentes Definitivas</span>
 
                    <div class="flex flex-col gap-3 items-center">
 
                        <!-- OD -->
                        <div class="flex flex-row items-center gap-3">
                            <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                            
                            <Label class="text-xs text-[#888]">C.B.</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.od_cb" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Esf.</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.od_esferico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Cil.</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.od_cilindrico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Eje</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.od_eje" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <ValueNoneIcon class="h-4 w-4 text-[#888]" />
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.od_diametro" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                        </div>
 
                        <!-- OI -->
                        <div class="flex flex-row items-center gap-3">
                            <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                            
                            <Label class="text-xs text-[#888]">C.B.</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.oi_cb" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Esf.</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.oi_esferico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Cil.</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.oi_cilindrico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Eje</Label>
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.oi_eje" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <ValueNoneIcon class="h-4 w-4 text-[#888]" />
                            <Input type="decimal" class="h-9 w-16" v-model="newReceta.oi_diametro" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                        </div>
 
                    </div>
                </div>
            </div>
 

            <Separator class="my-8 w-full" />

            <!-- Queratometría + Evaluación General | Marcas + Observaciones + Pruebas -->
            <div class="flex flex-row w-full gap-8">

                <!-- Columna izquierda -->
                <div class="flex flex-col gap-6 w-[22rem] shrink-0">

                    <!-- Queratometría -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <p class="font-bold text-base mb-5 text-[#1a1a1a]">Queratometría</p>
                        <div class="flex flex-col gap-3">

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
                                <Label class="text-xs text-[#888]">Notas</Label>
                                <Textarea class="resize-none h-20" v-model="newReceta.observaciones_queterometria" />
                            </div>
                        </div>
                    </div>

                    <!-- Evaluación General -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <p class="font-bold text-base mb-5 text-[#1a1a1a]">Evaluación General</p>
                            <!-- Estesiometría -->
                            <div class="flex flex-col gap-1 mt-2">
                                <Label class="text-xs text-[#888]">Estesiometría</Label>
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

                <!-- Columna derecha -->
                <div class="flex flex-col gap-6 flex-1">

                    <!-- Marcas + Observaciones -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <div class="flex flex-row gap-8">

                            <!-- Marcas -->
                            <div class="flex flex-col gap-4 w-[40%]">
                                <p class="font-bold text-base text-[#1a1a1a]">Marcas</p>
                                <div class="flex flex-col gap-3">
                                    <div class="flex flex-row items-center gap-2">
                                        <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                        <Input type="text" class="h-9 flex-1" v-model="newReceta.od_marca" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="flex flex-row items-center gap-2">
                                        <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                        <Input type="text" class="h-9 flex-1" v-model="newReceta.oi_marca" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-3 mt-2">
                                    <div class="flex flex-col gap-1">
                                        <Label class="text-xs text-[#888]">Precio</Label>
                                        <Input type="decimal" class="h-9 w-full" v-model="newReceta.precio" />
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <Label class="text-xs text-[#888]">Seña</Label>
                                        <Input type="decimal" class="h-9 w-full" v-model="newReceta.senia" />
                                    </div>
                                </div>
                            </div>

                            <Separator orientation="vertical" class="h-auto" />

                            <!-- Observaciones -->
                            <div class="flex flex-col gap-1 flex-1">
                                <p class="font-bold text-base text-[#1a1a1a] mb-1">Observaciones</p>
                                <Textarea class="resize-none w-full h-[7rem]" v-model="newReceta.observaciones" />
                            </div>
                        </div>
                    </div>

                    <!-- Pruebas -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <p class="font-bold text-base mb-4 text-[#1a1a1a]">Pruebas</p>

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

            <!-- Obras Sociales -->
            <div v-if="selectedCliente" class="w-full rounded-2xl border border-[#e5e5e5] p-6 mt-8">
                <p class="font-bold text-base mb-4 text-[#1a1a1a]">Obras Sociales</p>
                <div v-if="selectedObrasSocialIds.length > 0" class="flex flex-wrap gap-2 mb-4">
                    <div v-for="id in selectedObrasSocialIds" :key="id"
                         class="flex items-center gap-2 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-3 py-1 text-sm">
                        <span>{{ selectedCliente.clienteObrasSociales.find(cos => cos.obraSocial.id === id)?.obraSocial.nombre }}</span>
                        <button type="button" @click="removeObraSocial(id)" class="text-[#aaa] hover:text-destructive">
                            <Cross2Icon class="h-3 w-3" />
                        </button>
                    </div>
                </div>
                <div v-if="selectedCliente.clienteObrasSociales.length > 0 || selectedObrasSocialIds.length > 0">
                    <Select @update:model-value="(val) => addObraSocial(val)">
                        <SelectTrigger class="h-9 w-72">
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
                <div v-else>
                    <p class="py-4">No hay obras sociales registradas para el cliente</p>
                    <Button type="button" @click="handleShowNewObraSocialCliente()">Registrar Obra Social</Button>
                </div>
                <Dialog v-model:open="openNewClienteOS">
                    <DialogContent class="max-w-[33rem]">
                        <AddObraSocialClienteForm :cliente="selectedCliente" @handle-add-obra-social-cliente="handleAddObraSocialCliente" />
                    </DialogContent>
                </Dialog>
            </div>

            <!-- Footer -->
            <div class="form-footer w-full flex flex-row justify-end mt-8 mb-6 gap-4">
                <Button type="button" variant="outline" class="w-[15%]" @click="redirectCancel">Cancelar</Button>
                <Button type="submit" class="w-[15%]">Guardar</Button>
            </div>

        </form>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar" :action="() => { showError = false }" />
</div>
</template>