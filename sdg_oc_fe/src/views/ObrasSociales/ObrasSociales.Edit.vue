<script lang="ts" setup>
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { SlashIcon } from '@radix-icons/vue';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import AlertError from '@/components/AlertError.vue';
import { router } from '@/router/index';
import { obrasSocialesApi } from '@/api/libs/obrasSociales';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useLoaderStore } from '@/stores/LoaderStore';
import Label from '@/components/ui/label/Label.vue';
import { ObraSocial } from '@/api/entities/obraSocial';
import { AsteriskIcon, ShieldPlusIcon } from 'lucide-vue-next';


const route = useRoute();
const loader = useLoaderStore();

const currentObraSocial = ref<ObraSocial>();
const isValidObraSocial = ref<boolean>(true);

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

onMounted(async () => {
    currentObraSocial.value = await obrasSocialesApi.getOne(Number(route.params.id));
});

const onSubmit = async () => {
    loader.show();
    try {
        if (!currentObraSocial.value) {
            isValidObraSocial.value = false;
            return;
        }
        await obrasSocialesApi.edit(currentObraSocial.value.id, currentObraSocial.value);
        router.push('/obras-sociales');
        toast({ title: 'Obra Social registrada con éxito' });
        loader.hide();
    } catch (err: any) {
        errorMessage.value = err.message as string;
        showError.value = true;
        loader.hide();
    }
};

const validateAndSubmit = async () => {
    if (currentObraSocial.value && currentObraSocial.value.nombre.length > 2) {
        await onSubmit();
    } else {
        isValidObraSocial.value = false;
    }
};
</script>

<template>
    <div class="page">
        <div class="inter-page">

            <Breadcrumb class="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem><BreadcrumbLink href="/">Inicio</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
                    <BreadcrumbItem><BreadcrumbLink href="/parametros">Parámetros</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
                    <BreadcrumbItem><BreadcrumbLink href="/obras-sociales">Obras Sociales</BreadcrumbLink></BreadcrumbItem>
                    <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
                    <BreadcrumbItem><BreadcrumbPage>Editar</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <form
                v-if="currentObraSocial"
                :key="currentObraSocial.id"
                @submit.prevent="validateAndSubmit"
                class="flex flex-col gap-5"
            >
                <!-- Header -->
                <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                    <div class="flex items-center gap-3">
                        <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-[10px] bg-[#1a1a1a] text-white">
                            <ShieldPlusIcon :size="28" />
                        </div>
                        <div>
                            <h2 class="page-title">Editar Obra Social</h2>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
                    <div class="px-6 py-5">
                        <div class="flex flex-col gap-1.5">
                            <Label class="text-xs text-[#888]">Nombre</Label>
                            <div class="flex items-center gap-2">
                                <Input
                                    type="text"
                                    class="h-9 text-sm flex-1"
                                    :class="!isValidObraSocial ? 'border-destructive' : ''"
                                    v-model="currentObraSocial.nombre"
                                    @input="isValidObraSocial = true"
                                />
                                <TooltipProvider v-if="!isValidObraSocial">
                                    <Tooltip>
                                        <TooltipTrigger class="text-destructive">
                                            <AsteriskIcon :size="14" />
                                        </TooltipTrigger>
                                        <TooltipContent class="text-destructive border-destructive text-xs font-thin">
                                            <p>Ingresar nombre de la Obra Social</p>
                                            <p>Al menos dos caracteres</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-1">
                    <button
                        type="button"
                        @click="router.push('/obras-sociales')"
                        class="h-9 px-5 rounded-lg border border-[#e5e5e5] text-sm text-[#1a1a1a] hover:border-[#ccc] hover:bg-[#fafafa] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        class="h-9 px-5 rounded-lg bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-[#333] transition-colors"
                    >
                        Guardar
                    </button>
                </div>
            </form>

        </div>

        <AlertError
            v-model="showError"
            title="Error"
            :message="errorMessage"
            button="Aceptar"
            :action="() => { showError = false; }"
        />
    </div>
</template>