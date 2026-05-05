<script lang="ts" setup>
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SlashIcon } from '@radix-icons/vue';
import { router } from '@/router';
import { toast } from '@/components/ui/toast';
import EditClienteForm from '@/components/EditCliente.Form.vue';

const handleEditCliente = async(id: number)=>{
    router.push(`/clientes/dashboard/${id}#dashboard`)
    toast({
        title: 'Cliente actualizado con éxito',
    })
}

const hanldeCancel = async(id: number)=>{
    router.push(`/clientes/dashboard/${id}#dashboard`)
}


</script>

<template>
    <div class="page lg:px-60">
        <div class="max-w-[900px] mx-auto px-6 py-10">

            <Breadcrumb class="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">
                        Inicio
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <SlashIcon />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/clientes">
                        Clientes
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                    <SlashIcon />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Editar</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        

        <h1 class="page-title">Editar Cliente</h1>

        <EditClienteForm
            @handle-edit-cliente="handleEditCliente"
            @hanlde-cancel="hanldeCancel"
        />
    
    </div>
    </div>
</template>


<style>
#add-os{
    color: gray;
}
</style>