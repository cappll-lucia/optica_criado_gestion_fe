<script setup lang="ts">
import type { ObraSocial } from '@/api/entities/obraSocial';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlashIcon } from '@radix-icons/vue';
import { PlusIcon, ShieldPlusIcon } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import { columns } from '@/components/tables/obrasSociales/columns';
import DataTable from '@/components/tables/obrasSociales/data-table.vue';
import { obrasSocialesApi } from '@/api/libs/obrasSociales';
import AlertError from '@/components/AlertError.vue';
import { router } from '@/router';
import { useLoaderStore } from '@/stores/LoaderStore';


const loader = useLoaderStore();

const showError = ref<boolean>(false);
const errorMessage =ref<string>('');

const data = ref<ObraSocial[]>([]);
const txtSearch = ref<string>('');

const loadData = async()=>{
    try{
        loader.show();
        data.value = await obrasSocialesApi.getAll();
        loader.hide();
    }catch(err: any){
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    }
}

onMounted(async () => {
    await loadData()
});

</script>

<template>
    <div class="page">
        <div class="inter-page">
            <Breadcrumb class="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <SlashIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/parametros">Parámetros</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator>
                        <SlashIcon />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Obras Sociales</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <!-- Header -->
            <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-lg bg-[#1a1a1a] text-white">
                        <ShieldPlusIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Obras Sociales</h2>
                    </div>
                </div>
                <Button
                    class="h-9 px-4 gap-2 text-sm font-medium"
                    @click="router.push('/obras-sociales/create')"
                >
                    <PlusIcon class="w-3.5 h-3.5" />
                    Nueva Obra Social
                </Button>
            </div>

            <!-- Filtros -->
            <div class="flex flex-row flex-wrap items-center gap-3 py-5">
                <Input
                    class="h-9 w-96 text-sm"
                    placeholder="Buscar obra social"
                    v-model="txtSearch"
                />
            </div>

            <DataTable :columns="columns" :data="data" :search="txtSearch" />
        </div>
    </div>
    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar"
            :action="()=>{showError=false}" />
</template>
