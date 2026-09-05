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
    <div class="page">
        <div class="inter-page">

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

            <CreateClienteForm
                @handle-create-cliente="handleCreateCliente"
                @handle-cancel="router.push('/clientes')"
            />

        </div>
    </div>
</template>