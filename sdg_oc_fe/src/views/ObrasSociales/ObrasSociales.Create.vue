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
    <div class="page lg:px-60">
        <div class="max-w-[900px] mx-auto px-6 py-10">

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

            <div class="flex items-center gap-3 mb-6">
                <!-- <div class="w-10 h-10 rounded-[10px] bg-[#F1EFE8] flex items-center justify-center flex-shrink-0">
                    <ShieldPlusIcon :size="20" class="text-[#444441]" />
                </div> -->
                <h1 class="page-title">Obras Sociales</h1>
            </div>

            <CreateObrasSocialForm
                @handle-create-obra-social="handleCreateObraSocial"
                @handle-cancel="router.push('/obras-sociales')"
            />

        </div>
    </div>
</template>