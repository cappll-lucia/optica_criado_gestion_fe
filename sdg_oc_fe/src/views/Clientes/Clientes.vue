<script lang="ts" setup>
import { Cliente, EstadoCliente } from "@/api/entities/clientes";
import { Localidad } from "@/api/entities/localidad";
import { clientesApi } from "@/api/libs/clientes";
import { localidadesApi } from "@/api/libs/localidades";
import AlertError from "@/components/AlertError.vue";
import { columns } from "@/components/tables/clientes/columns";
import DataTable from "@/components/tables/clientes/data-table.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { router } from "@/router";
import { useLoaderStore } from "@/stores/LoaderStore";
import { SlashIcon } from "@radix-icons/vue";
import { ChevronLeft, ChevronRight, PlusIcon, RotateCcwIcon, UserIcon } from "lucide-vue-next";
import { onMounted, ref } from "vue";

const ESTADO_TODOS = "todos";

const loader = useLoaderStore();
const clientes = ref<Cliente[]>([]);
const localidades = ref<Localidad[]>([]);
const selectedLocalidadId = ref<string>("");
const selectedSexo = ref<string>("");
const selectedEstado = ref<string>(EstadoCliente.Activo);
const txtSearch = ref<string>("");
const currentLimit = ref<string>("10");
const currentOffset = ref<number>(0);
const nextPage = ref<number | null>(null);
const previousPage = ref<number | null>(null);

const showError = ref<boolean>(false);
const errorMessage = ref<string>("");

const loadData = async () => {
  await handleFilterClientes();
  localidades.value = await localidadesApi.getAll();
};

onMounted(async () => {
  loader.show();
  await loadData();
  loader.hide();
});

const clearFilters = async () => {
  txtSearch.value = "";
  selectedSexo.value = "";
  selectedLocalidadId.value = "";
  selectedEstado.value = EstadoCliente.Activo;
  currentOffset.value = 0;
  currentLimit.value = "10";
  await handleFilterClientes();
};

const handleSearchClientes = async () => {
  try {
    const res = await clientesApi.getAll({
      filtro: txtSearch.value,
      sexo: selectedSexo.value,
      localidadId: selectedLocalidadId.value,
      estado: selectedEstado.value === ESTADO_TODOS ? "" : selectedEstado.value,
      offset: currentOffset.value,
      limit: currentLimit.value,
    });
    clientes.value = res.items.filter((c) => c.id != 0);
    nextPage.value = res.nextPage;
    previousPage.value = res.previousPage;
  } catch (err: any) {
    errorMessage.value = err.message as string;
    showError.value = true;
  }finally{
    loader.hide();
  }
};

const handleFilterClientes = async () => {
  loader.show();
  await handleSearchClientes();
  loader.hide();
}
const handlePageChange = async (targetOffset: number | null) => {
  if (targetOffset == null) return;
  currentOffset.value = targetOffset;
  await handleFilterClientes();
};

const handleLimitChange = async (newLimit: string) => {
  currentLimit.value = newLimit;
  currentOffset.value = 0;
  await handleFilterClientes();
};
</script>

<template>
  <div class="page">
    <div class="inter-page">
      <Breadcrumb class="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/"> Inicio </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Clientes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <!-- Header -->
      <div class="flex flex-row items-center justify-between gap-4 pb-5 border-b border-[#e5e5e5]">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-14 h-14 shrink-0 rounded-lg bg-[#1a1a1a] text-white">
            <UserIcon :size="28" />
          </div>
          <div>
            <h2 class="page-title">Clientes</h2>
          </div>
        </div>
        <Button
          class="h-9 px-4 gap-2 text-sm font-medium"
          @click="router.push('/clientes/create')"
        >
          <PlusIcon class="w-3.5 h-3.5" />
          Registrar Cliente
        </Button>
      </div>

      <!-- Filtros -->
      <div class="flex flex-row flex-wrap items-center gap-3 py-5">
        <Input
          class="h-9 w-96 text-sm"
          placeholder="Buscar por nombre, apellido o documento"
          v-model="txtSearch"
          @input="(e: any) => e.target.value.length >= 0 && handleSearchClientes()"
        />
        <Select
          v-model="selectedLocalidadId"
          @update:model-value="handleFilterClientes"
        >
          <SelectTrigger class="h-9 w-52 text-sm">
            <SelectValue placeholder="Localidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem
                v-for="localidad in localidades"
                :key="localidad.id"
                :value="localidad.id.toString()"
                >{{ localidad.localidad }}
                </SelectItem
              >
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select v-model="selectedEstado" @update:model-value="handleFilterClientes">
          <SelectTrigger class="h-9 w-40 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem :value="EstadoCliente.Activo">Activos</SelectItem>
              <SelectItem :value="EstadoCliente.Inactivo">Inactivos</SelectItem>
              <SelectItem :value="ESTADO_TODOS">Todos</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          @click="clearFilters"
          class="h-9 px-3 gap-1.5 text-xs text-[#888] hover:border-[#ccc]"
        >
          <RotateCcwIcon class="w-3.5 h-3.5" />
          Limpiar filtros
        </Button>
      </div>

      <DataTable :columns="columns" :data="clientes" />

      <!-- Paginación -->
      <div class="mt-4 flex w-full justify-center">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            class="hover:border-[#ccc]"
            :disabled="previousPage === null"
            @click="handlePageChange(previousPage)"
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>
          <Select v-model="currentLimit" @update:model-value="handleLimitChange">
            <SelectTrigger class="h-9 w-20 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            class="hover:border-[#ccc]"
            :disabled="nextPage === null"
            @click="handlePageChange(nextPage)"
          >
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <AlertError
      v-model="showError"
      title="Error"
      :message="errorMessage"
      button="Aceptar"
      :action="
        () => {
          showError = false;
        }
      "
    />
  </div>
</template>
