<script setup lang="ts">
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SlashIcon } from '@radix-icons/vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { computed, onMounted, ref} from 'vue';
import ListadoRecetasRecetados from '@/components/ListadoRecetasRecetados.vue'
import ListadoRecetasContacto from '@/components/ListadoRecetasContacto.vue';
import { Cliente } from '@/api/entities/clientes';
import { RecetasAereos } from '@/api/entities/recetasAereos';
import { useRoute } from 'vue-router';
import { clientesApi } from '@/api/libs/clientes';
import { HistoriaClinica } from '@/api/entities/historiaClinica';
import { RecetaContacto } from '@/api/entities/recetasContacto';
import { router } from '@/router';
import { useLoaderStore } from '@/stores/LoaderStore';
import AlertError from '@/components/AlertError.vue';

const route = useRoute();
const loader = useLoaderStore();

const openTab=ref<string>('recetados')

const selectedRecetaId=ref<string>();
const selectedContactoId=ref<string>();

const currentCliente = ref<Cliente>();
const recetasClienteAereos = ref<RecetasAereos[]>();
const recetasClienteContacto = ref<RecetaContacto[]>();
const historiaClinicaCliente = ref<HistoriaClinica>();

const showError = ref<boolean>(false);
const errorMessage =ref<string>('');

onMounted(async()=>{
    const query=route.query;
    const tab =query.tab ? query.tab.toString() : 'recetados';
    if(tab=='recetados' || tab=='contacto'){
        openTab.value=tab
    }else{
        openTab.value='recetados'
    }
    if(query.recetaId){
        if(openTab.value=='recetados'){
            selectedRecetaId.value=query.recetaId.toString()
        }else{
            selectedContactoId.value=query.recetaId.toString()
        }
    }
    await loadData();
})

const loadData = async ()=>{
    try{
        loader.show();
        const id = Number(route.params.idCliente);
        if(id==0){
            loader.hide();
            return;
        }
        currentCliente.value = await clientesApi.getOne(id)
        if(currentCliente){
            const res = await clientesApi.getRecetasByCliente(currentCliente.value.id);
            recetasClienteAereos.value = res.recetasLentesAereos;
            recetasClienteContacto.value = res.recetasLentesContacto;
            historiaClinicaCliente.value = res.historiaClinicaContacto;
        }
        loader.hide();
    }catch(err: any){
        errorMessage.value=err.message as string
        showError.value = true;
        loader.hide();
    }
}

const nombreCliente = computed(()=> currentCliente.value?.apellido +", "+currentCliente.value?.nombre)

</script>


<template>
    <div class="page" v-if="currentCliente">
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
                <BreadcrumbItem>
                    <BreadcrumbLink :href="`/clientes/dashboard/${currentCliente?.id}`">
                        {{ nombreCliente }}
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>Recetas</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        </div>

        <div class="inter-page">
        <div class="flex flex-row justify-between items-center w-full mb-4 mt-2">
            <h1 class="page-title">Recetas: {{ nombreCliente }}</h1>
            <div class="flex gap-2">
                <button
                    class="text-xs px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                    @click="router.push(`/recetas/recetados/new?cliente=${currentCliente?.id}`)">
                    + Nueva Receta Anteojos Recetados
                </button>
                <button
                    class="text-xs px-3 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                    @click="router.push(`/recetas/contacto/new?cliente=${currentCliente?.id}`)">
                    + Nueva Receta Lentes de Contacto
                </button>
            </div>
        </div>

        <div class="pt-2">
            <Tabs :default-value="openTab" class="w-full">
                <TabsList class="w-full bg-zinc-100 rounded-md p-1 border  border-zinc-200">
                    <TabsTrigger
                        class="w-1/2 text-sm  data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-500"
                        value="recetados">
                        Anteojos Recetados
                    </TabsTrigger>
                    <TabsTrigger
                        class="w-1/2 text-sm  data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm text-zinc-500"
                        value="contacto">
                        Lentes de Contacto
                    </TabsTrigger>
                </TabsList>

                <TabsContent class="bg-zinc-50 min-h-[60rem] px-2 py-6 rounded-md border  border-zinc-200" value="recetados">
                        <ListadoRecetasRecetados
                            v-if="recetasClienteAereos && recetasClienteAereos.length > 0"
                            :recetas="recetasClienteAereos"
                            :nombreCliente="nombreCliente"
                            :id-cliente="Number(currentCliente?.id)"
                            :selectedId="selectedRecetaId"
                            :nroDocumento="currentCliente?.nroDocumento"
                            :tipoDocumento="currentCliente?.tipoDocumento" />
                    <div v-else class="flex min-h-[20rem] flex-col w-full justify-center items-center gap-4">
                        <p class="text-sm text-zinc-500">
                            El cliente no tiene recetas de <span class="font-semibold text-zinc-700">anteojos recetados</span>
                        </p>
                        <button
                            class="text-xs px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors"
                            @click="router.push(`/recetas/recetados/new?cliente=${currentCliente?.id}`)">
                            Registrar receta
                        </button>
                    </div>
                </TabsContent>

                <TabsContent class="bg-zinc-50 min-h-[60rem] px-2 py-6 rounded-md border border-zinc-200" value="contacto">
                    <ListadoRecetasContacto
                        v-if="(recetasClienteContacto && recetasClienteContacto.length > 0) || historiaClinicaCliente"
                        :nombreCliente="nombreCliente"
                        :id-cliente="Number(currentCliente?.id)"
                        :recetas="recetasClienteContacto"
                        :historiaClinica="historiaClinicaCliente"
                        :selectedId="selectedContactoId" />
                    <div v-else class="flex min-h-[20rem] flex-col w-full justify-center items-center gap-3">
                        <p class="text-sm text-zinc-500">
                            El cliente no tiene recetas de <span class="font-semibold text-zinc-700">lentes de contacto</span>
                        </p>
                        <button
                            class="text-xs px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-700 transition-colors w-52"
                            @click="router.push(`/recetas/contacto/new?cliente=${currentCliente?.id}`)">
                            Registrar receta
                        </button>
                        <button
                            class="text-xs px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 hover:bg-zinc-100 transition-colors w-52"
                            @click="router.push(`/recetas/contacto/historia-clinica/new?cliente=${currentCliente?.id}`)">
                            Registrar historia clínica
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
    </div>

    <!-- Cliente no encontrado -->
    <div class="page" v-else>
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
                <BreadcrumbItem>
                    <BreadcrumbPage>Recetas</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div class="pt-8 flex justify-center">
            <h3 class="page-subtitle text-center text-zinc-500">
                Cliente con id={{ route.params.idCliente }} no encontrado
            </h3>
        </div>
    </div>
    </div>

    <AlertError v-model="showError" title="Error" :message="errorMessage" button="Aceptar"
        :action="()=>{showError=false}" />
</template>