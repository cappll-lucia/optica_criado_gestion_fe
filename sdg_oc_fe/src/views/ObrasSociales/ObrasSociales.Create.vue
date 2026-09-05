<script lang="ts" setup>
import CreateObrasSocialForm from '@/components/CreateObrasSocial.Form.vue';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from '@/components/ui/toast';
import { useRouter } from 'vue-router';
import { SlashIcon } from '@radix-icons/vue';
import { ShieldPlusIcon } from "lucide-vue-next";

const router = useRouter();

const handleCreateObraSocial = async () => {
    router.push('/obras-sociales');
    toast({ title: 'Obra Social registrada con éxito' });
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
                    <BreadcrumbItem><BreadcrumbPage>Nueva Obra Social</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <!-- Header -->
            <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5] mb-6">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-lg bg-[#1a1a1a] text-white">
                        <ShieldPlusIcon :size="28" />
                    </div>
                    <div>
                        <h2 class="page-title">Nueva Obra Social</h2>
                    </div>
                </div>
            </div>

            <CreateObrasSocialForm
                :show-header="false"
                @handle-create-obra-social="handleCreateObraSocial"
                @handle-cancel="router.push('/obras-sociales')"
            />

        </div>
    </div>
</template>