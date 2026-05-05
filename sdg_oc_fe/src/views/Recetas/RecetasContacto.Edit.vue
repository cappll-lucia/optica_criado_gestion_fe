<script setup lang="ts">
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AsteriskIcon, PlusIcon } from 'lucide-vue-next';
import { Separator } from '@/components/ui/separator';
import { computed, onMounted, ref } from 'vue';
import Label from '@/components/ui/label/Label.vue';
import { RecetaContacto, recetaContactoCustomValidator } from '@/api/entities/recetasContacto';
import { useRoute } from 'vue-router';
import { recetasApi } from '@/api/libs/recetas';
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

    <div class="pt-2 mb-4">
        <form @submit.prevent="validateAndSubmit" class="forms-wide flex flex-col justify-start items-start px-[5rem] !bg-white">

            <!-- Header -->
            <div class="w-full">
                <h3 class="page-subtitle text-center">Editar Receta - Lentes de Contacto</h3>
                <Separator class="my-6 w-full" />
            </div>

            <!-- Fila 1: Cliente (solo lectura) / Fecha / Oftalmólogo -->
            <div class="flex flex-row w-full justify-between items-end gap-6 mt-4">

                <!-- Cliente -->
                <div class="flex flex-col gap-1 w-[35%] pr-16 text-[#888]">
                    <Label class="text-xs ">Cliente</Label>
                    <div class="h-9 flex items-center px-3 rounded-md border border-[#e5e5e5] bg-muted text-sm  cursor-not-allowed ">
                        {{ currentReceta.cliente.apellido }}, {{ currentReceta.cliente.nombre }}
                    </div>
                </div>

                <!-- Fecha -->
                <div class="flex flex-col gap-1 w-[30%] ml-24">
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
                <div class="flex flex-col gap-1 w-[30%]">
                    <Label class="text-xs text-[#888]">Oftalmólogo</Label>
                    <Input class="h-9 w-full" v-model="currentReceta.oftalmologo" />
                </div>
            </div>

            <Separator class="my-8 w-full" />

            <!-- Lentes Definitivas -->
            <div class="w-full rounded-2xl border border-[#e5e5e5] p-6">
                <div class="flex flex-row items-center justify-center">
 
                    <span class="font-bold text-xl text-[#1a1a1a] w-[9rem] text-left pr-20  ">Lentes Definitivas</span>
 
                    <div class="flex flex-col gap-3 items-center">
 
                        <!-- OD -->
                        <div class="flex flex-row items-center gap-3">
                            <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                            
                            <Label class="text-xs text-[#888]">C.B.</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.od_cb" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Esf.</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.od_esferico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Cil.</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.od_cilindrico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Eje</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.od_eje" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <ValueNoneIcon class="h-4 w-4 text-[#888]" />
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.od_diametro" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                        </div>
 
                        <!-- OI -->
                        <div class="flex flex-row items-center gap-3">
                            <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                            
                            <Label class="text-xs text-[#888]">C.B.</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.oi_cb" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cb }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 20</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Esf.</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.oi_esferico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_esferico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -35 a 35</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Cil.</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.oi_cilindrico" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_cilindrico }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: -10 a 10</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <Label class="text-xs text-[#888]">Eje</Label>
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.oi_eje" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_eje }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 180</p></TooltipContent></Tooltip></TooltipProvider>
                            <Separator orientation="vertical" class="h-6 mr-4 ml-2" />
                            
                            <ValueNoneIcon class="h-4 w-4 text-[#888]" />
                            <Input type="decimal" class="h-9 w-20" v-model="currentReceta.oi_diametro" />
                            <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_diametro }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 30</p></TooltipContent></Tooltip></TooltipProvider>
                        </div>
 
                    </div>
                </div>
            </div>

            <Separator class="my-8 w-full" />

            <!--  Queratometría + Evaluación General | Marcas + Observaciones + Pruebas -->
            <div class="flex flex-row w-full gap-8">

                <!-- Columna izquierda -->
                <div class="flex flex-col gap-6 w-[22rem] shrink-0">

                    <!-- Queratometría -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <p class="font-bold text-base mb-5 text-[#1a1a1a]">Queratometría</p>
                        <div class="flex flex-col gap-3">

                            <div class="flex flex-row items-center gap-2">
                                <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                
                                <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m1_od" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m1_od }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mx-1" />
                                
                                <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m2_od" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m2_od }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>

                            <Separator class="w-full" />

                            <div class="flex flex-row items-center gap-2">
                                <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                
                                <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m1_oi" />
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m1_oi }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                                
                                <Separator orientation="vertical" class="h-6 mx-1" />
                                <Input type="decimal" class="h-9 w-20 ml-4" v-model="currentReceta.quet_m2_oi" />
                                
                                <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.quet_m2_oi }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Rango: 0 a 90</p></TooltipContent></Tooltip></TooltipProvider>
                            </div>

                            <div class="flex flex-col gap-1 mt-2">
                                <Label class="text-xs text-[#888]">Notas</Label>
                                <Textarea class="resize-none h-20" v-model="currentReceta.observaciones_queterometria" />
                            </div>
                        </div>
                    </div>

                    <!-- Evaluación General -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <p class="font-bold text-base mb-5 text-[#1a1a1a]">Evaluación General</p>

                        <!-- Estesiometría primero -->
                        <div class="flex flex-col gap-1 mb-5">
                            <Label class="text-xs text-[#888]">Estesiometría</Label>
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

                        <!-- Checkboxes -->
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-2"><Checkbox v-model:checked="currentReceta.tonicidad" /><label class="text-sm font-light">Tonicidad</label></div>
                            <div class="flex items-center gap-2"><Checkbox v-model:checked="currentReceta.maquillaje" /><label class="text-sm font-light">Maquillaje</label></div>
                            <div class="flex items-center gap-2"><Checkbox v-model:checked="currentReceta.hendidura_palpebral" /><label class="text-sm font-light">Hendidura Palpebral</label></div>
                            <div class="flex items-center gap-2"><Checkbox v-model:checked="currentReceta.altura_palpebral" /><label class="text-sm font-light">Altura Palpebral</label></div>
                            <div class="flex items-center gap-2"><Checkbox v-model:checked="currentReceta.buen_parpadeo_amplitud" /><label class="text-sm font-light">Parpadeo: Buena amplitud</label></div>
                            <div class="flex items-center gap-2"><Checkbox v-model:checked="currentReceta.buen_parpadeo_ritmo" /><label class="text-sm font-light">Parpadeo: Buen ritmo</label></div>
                        </div>
                    </div>

                </div>

                <!-- Columna derecha -->
                <div class="flex flex-col gap-6 flex-1">

                    <!-- Marcas + Observaciones -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <div class="flex flex-row gap-8">

                            <div class="flex flex-col gap-4 w-[40%]">
                                <p class="font-bold text-base text-[#1a1a1a]">Marcas</p>
                                <div class="flex flex-col gap-3">
                                    <div class="flex flex-row items-center gap-2">
                                        <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.D.</span>
                                        <Input type="decimal" class="h-9 flex-1" v-model="currentReceta.od_marca" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.od_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                    <div class="flex flex-row items-center gap-2">
                                        <span class="font-bold text-sm w-8 text-[#1a1a1a]">O.I.</span>
                                        <Input type="decimal" class="h-9 flex-1" v-model="currentReceta.oi_marca" />
                                        <TooltipProvider><Tooltip><TooltipTrigger class="bg-transparent text-destructive"><AsteriskIcon :size="12" :class="{ 'invisible': isValidReceta.oi_marca }" /></TooltipTrigger><TooltipContent class="text-destructive border-destructive font-thin text-xs"><p>Ingresar marca</p></TooltipContent></Tooltip></TooltipProvider>
                                    </div>
                                </div>
                            </div>

                            <Separator orientation="vertical" class="h-auto" />

                            <div class="flex flex-col gap-1 flex-1">
                                <p class="font-bold text-base text-[#1a1a1a] mb-1">Observaciones</p>
                                <Textarea class="resize-none w-full h-[7rem]" v-model="currentReceta.observaciones" />
                            </div>
                        </div>
                    </div>

                    <!-- Pruebas -->
                    <div class="rounded-2xl border border-[#e5e5e5] p-6">
                        <p class="font-bold text-base mb-4 text-[#1a1a1a]">Pruebas</p>

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
                                <Button variant="ghost" type="button" size="icon" class="mt-2" @click="currentPruebas.splice(index, 1)">
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

            <!-- Footer -->
            <div class="form-footer w-full flex flex-row justify-end mt-8 mb-6 gap-4">
                <Button type="button" variant="outline" class="w-[15%]" @click="redirectCancel">Cancelar</Button>
                <Button type="button" variant="outline" class="w-[15%]" @click="console.log(currentReceta)">pritn</Button>
                <Button type="submit" class="w-[15%]">Guardar</Button>
            </div>

        </form>
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