<script lang="ts" setup>
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import CreateClienteForm from '@/components/CreateCliente.Form.vue';
import { SlashIcon } from '@radix-icons/vue';
import { router } from '@/router';
import { toast } from '@/components/ui/toast';
import { Cliente } from '@/api/entities/clientes';

const handleCreateCliente = async (newCliente: Cliente) => {
    router.push(`/clientes/dashboard/${newCliente.id}#dashboard`);
    toast({ title: 'Cliente registrado con éxito' });
};
</script>

<template>
    <div class="page lg:px-60">
        <div class="max-w-[900px] mx-auto px-6 py-10">

            <Breadcrumb class="mb-8">
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
                        <BreadcrumbPage>Nuevo Cliente</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <h1 class="page-title">Nuevo Cliente</h1>

            <CreateClienteForm
                @handle-create-cliente="handleCreateCliente"
                @handle-cancel="router.push('/clientes')"
            />

        </div>
    </div>
</template>