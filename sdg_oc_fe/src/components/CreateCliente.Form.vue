<script lang="ts" setup>
import {
  TipoDocumento,
} from "@/api/entities/clientes";
import { Localidad } from "@/api/entities/localidad";
import { ObraSocial } from "@/api/entities/obraSocial";
import { CondicionIva } from "@/api/entities/venta";
import { clientesApi } from "@/api/libs/clientes";
import { localidadesApi } from "@/api/libs/localidades";
import { obrasSocialesApi } from "@/api/libs/obrasSociales";
import AlertError from "@/components/AlertError.vue";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Label from "@/components/ui/label/Label.vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { condicionIvaDisplay } from "@/lib/utils";
import { useLoaderStore } from "@/stores/LoaderStore";
import { AsteriskIcon, PlusCircleIcon, PlusIcon, XIcon } from "lucide-vue-next";
import { computed, onMounted, ref } from "vue";
import CreateObrasSocialForm from "./CreateObrasSocial.Form.vue";

const tipoDocumentoOptions = [
  { value: TipoDocumento.CUIT, label: "CUIT" },
  { value: TipoDocumento.DNI, label: "DNI" },
];

const emit = defineEmits(["handleCreateCliente", "handleCancel"]);

const loader = useLoaderStore();

const showError = ref<boolean>(false);
const errorMessage = ref<string>("");

const localidades = ref<Localidad[]>([]);
const obrasSociales = ref<ObraSocial[]>([]);
const openSelectOS = ref<boolean>(false);
const openNewOS = ref<boolean>(false);
const newOsIndex = ref<number>();

const fechaNac = ref({ day: "", month: "", year: "" });

const newCliente = ref<{
  nroDocumento: number | undefined;
  tipoDocumento: TipoDocumento | undefined;
  categoriaFiscal: CondicionIva | undefined;
  nombre: string | undefined;
  apellido: string | undefined;
  email: string | undefined;
  sexo: string | undefined;
  telefono: string | undefined;
  domicilio: string | undefined;
  fechaNac: Date | undefined;
  observaciones: string | undefined;
  localidad: { id: number | undefined };
}>({
  nroDocumento: undefined,
  tipoDocumento: undefined,
  categoriaFiscal: undefined,
  nombre: undefined,
  apellido: undefined,
  email: undefined,
  sexo: undefined,
  telefono: undefined,
  domicilio: undefined,
  fechaNac: undefined,
  observaciones: undefined,
  localidad: { id: undefined },
});

const clienteObrasSociales = ref<{ obraSocial: { id: number | undefined }; numeroSocio: string }[]>([]);

const isValidCliente = ref<{
  nombre: boolean; apellido: boolean; sexo: boolean; localidad: boolean;
}>({
  nombre: true, apellido: true, sexo: true, localidad: true,
});

const isValidClienteObraSocial = ref<{ obraSocial: boolean }[]>([]);

onMounted(async () => {
  localidades.value = await localidadesApi.getAll();
  obrasSociales.value = await obrasSocialesApi.getAll();
});

const addObraSocial = () => {
  clienteObrasSociales.value.push({ obraSocial: { id: undefined }, numeroSocio: "" });
  isValidClienteObraSocial.value.push({ obraSocial: true });
};

const removeObraSocial = (index: number) => {
  clienteObrasSociales.value.splice(index, 1);
  isValidClienteObraSocial.value.splice(index, 1);
};

const condicionIvaOptions = Object.values(CondicionIva)
  .filter((value) => typeof value === "number")
  .map((value) => value);

const validateAndSubmit = async () => {
  // campos obligatorios: nombre, apellido, sexo, localidad
  const valid = {
    nombre: !!newCliente.value.nombre?.trim(),
    apellido: !!newCliente.value.apellido?.trim(),
    sexo: !!newCliente.value.sexo,
    localidad: !!newCliente.value.localidad.id,
  };
  isValidCliente.value = valid;

  // OS: numeroSocio es opcional
  let osValid = true;
  if (clienteObrasSociales.value.length) {
    const osValidation = clienteObrasSociales.value.map((os) => ({
      obraSocial: !!os.obraSocial.id,
    }));
    isValidClienteObraSocial.value = osValidation;
    osValid = osValidation.every((v) => v.obraSocial);
  }

  const clienteValid = Object.values(valid).every(Boolean);
  if (clienteValid && osValid) {
    await onSubmit();
  }
};

const onSubmit = async () => {
  loader.show();
  try {
    if (fechaNac.value.day && fechaNac.value.month && fechaNac.value.year) {
      newCliente.value.fechaNac = new Date(
        parseInt(fechaNac.value.year),
        parseInt(fechaNac.value.month) - 1,
        parseInt(fechaNac.value.day)
      );
    }
    const createdCliente = await clientesApi.create(newCliente.value, clienteObrasSociales.value);
    emit("handleCreateCliente", createdCliente);
    loader.hide();
  } catch (err: any) {
    errorMessage.value = err.message.split(",")[0] as string;
    loader.hide();
    showError.value = true;
  }
};

const availableObrasSociales = computed(() => {
  const assignedIds = new Set(
    clienteObrasSociales.value.map((item) => item.obraSocial?.id).filter((id) => id !== undefined)
  );
  return obrasSociales.value.filter((os) => !assignedIds.has(os.id)).map((os) => ({ id: os.id, nombre: os.nombre }));
});

const handleCreateObraSocial = async (newObraSocial: ObraSocial) => {
  openNewOS.value = false;
  obrasSociales.value.push(newObraSocial);
  const idx = newOsIndex.value;
  if (idx !== undefined && idx >= 0) {
    setObraSocialIdAtIndex(idx, newObraSocial.id);
  }
};

const setObraSocialIdAtIndex = (index: number, id: number) => {
  if (clienteObrasSociales.value[index]) {
    clienteObrasSociales.value[index].obraSocial.id = id;
  }
};
</script>

<template>
  <form @submit.prevent="validateAndSubmit" class="flex flex-col gap-5">

    <!-- ── Datos personales ── -->
    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden pb-[0.5rem] mb-[1rem]">
      <div class="px-6 py-4 border-b border-[#f0f0f0]">
        <span class="text-sm font-bold text-[#1a1a1a]">Datos personales</span>
      </div>
      <div class="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-5">

        <!-- Tipo Documento -->
        <div class="flex flex-col gap-1.5 ml-[1rem]">
          <Label class="text-xs text-[#888]">Tipo de documento</Label>
          <div class="flex items-center gap-2">
            <Select
              :v-model="newCliente.tipoDocumento"
              @update:model-value="(value) => newCliente.tipoDocumento = Number(value) as TipoDocumento"
            >
              <SelectTrigger class="h-9 text-sm flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="tipo in tipoDocumentoOptions" :key="tipo.value" :value="tipo.value.toString()">
                    {{ tipo.label }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <span class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Número Documento -->
        <div class="flex flex-col gap-1.5">
          <Label class="text-xs text-[#888]">Número de documento</Label>
          <div class="flex items-center gap-2">
            <Input type="number" class="h-9 text-sm flex-1" v-model="newCliente.nroDocumento" />
            <span class="w-[1em] shrink-0"/>
          </div>
        </div>

        <!-- Nombre -->
        <div class="flex flex-col gap-1.5  ml-[1rem]">
          <Label class="text-xs text-[#888]">Nombre</Label>
          <div class="flex items-center gap-2">
            <Input type="text" class="h-9 text-sm flex-1" v-model="newCliente.nombre" :class="!isValidCliente.nombre ? 'border-destructive' : ''" />
            <TooltipProvider v-if="!isValidCliente.nombre">
              <Tooltip>
                <TooltipTrigger class="text-destructive"><AsteriskIcon :size="14" /></TooltipTrigger>
                <TooltipContent class="text-destructive border-destructive text-xs font-thin"><p>Ingresar nombre</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span v-else class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Apellido -->
        <div class="flex flex-col gap-1.5">
          <Label class="text-xs text-[#888]">Apellido</Label>
          <div class="flex items-center gap-2">
            <Input type="text" class="h-9 text-sm flex-1" v-model="newCliente.apellido" :class="!isValidCliente.apellido ? 'border-destructive' : ''" />
            <TooltipProvider v-if="!isValidCliente.apellido">
              <Tooltip>
                <TooltipTrigger class="text-destructive"><AsteriskIcon :size="14" /></TooltipTrigger>
                <TooltipContent class="text-destructive border-destructive text-xs font-thin"><p>Ingresar apellido</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span v-else class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Sexo -->
        <div class="flex flex-col gap-1.5  ml-[1rem]">
          <Label class="text-xs text-[#888]">Sexo</Label>
          <div class="flex items-center gap-2">
            <Select :v-model="newCliente.sexo" @update:model-value="(value) => (newCliente.sexo = value)">
              <SelectTrigger class="h-9 text-sm flex-1" :class="!isValidCliente.sexo ? 'border-destructive' : ''">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Femenino">Femenino</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <TooltipProvider v-if="!isValidCliente.sexo">
              <Tooltip>
                <TooltipTrigger class="text-destructive"><AsteriskIcon :size="14" /></TooltipTrigger>
                <TooltipContent class="text-destructive border-destructive text-xs font-thin"><p>Seleccionar sexo</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span v-else class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Fecha Nacimiento -->
        <div class="flex flex-col gap-1.5">
          <Label class="text-xs text-[#888]">Fecha de nacimiento</Label>
          <div class="flex items-center gap-2">
            <Input type="text" v-model="fechaNac.day" placeholder="DD" class="h-9 text-sm w-16 text-center" maxlength="2" />
            <Input type="text" v-model="fechaNac.month" placeholder="MM" class="h-9 text-sm w-16 text-center" maxlength="2" />
            <Input type="text" v-model="fechaNac.year" placeholder="AAAA" class="h-9 text-sm w-20 text-center" maxlength="4" />
            <span class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Categoría Fiscal -->
        <div class="flex flex-col gap-1.5  ml-[1rem]">
          <Label class="text-xs text-[#888]">Categoría fiscal</Label>
          <div class="flex items-center gap-2">
            <Select :v-model="newCliente.categoriaFiscal" @update:model-value="(value) => (newCliente.categoriaFiscal = Number(value))">
              <SelectTrigger class="h-9 text-sm flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="condicion in condicionIvaOptions" :key="condicion" :value="condicion.toString()">
                    {{ condicionIvaDisplay(Number(condicion)) }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <span class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <Label class="text-xs text-[#888]">Email</Label>
          <div class="flex items-center gap-2">
            <Input type="text" class="h-9 text-sm flex-1" v-model="newCliente.email" />
            <span class="w-[1em] shrink-0" />
          </div>
        </div>

      </div>
    </div>

    <!-- ── Contacto y ubicación ── -->
    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden pb-[0.5rem] mb-[1rem]">
      <div class="px-6 py-4 border-b border-[#f0f0f0]">
        <span class="text-sm font-bold text-[#1a1a1a]">Contacto y ubicación</span>
      </div>
      <div class="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-5">

        <!-- Teléfono -->
        <div class="flex flex-col gap-1.5  ml-[1rem]">
          <Label class="text-xs text-[#888]">Teléfono</Label>
          <div class="flex items-center gap-2">
            <Input type="number" v-decimal class="h-9 text-sm flex-1" v-model="newCliente.telefono" />
          </div>
        </div>

        <!-- Localidad -->
        <div class="flex flex-col gap-1.5">
          <Label class="text-xs text-[#888]">Localidad</Label>
          <div class="flex items-center gap-2">
            <Select :v-model="newCliente.localidad.id" @update:model-value="(value) => (newCliente.localidad.id = Number(value))">
              <SelectTrigger class="h-9 text-sm flex-1" :class="!isValidCliente.localidad ? 'border-destructive' : ''">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="loc in localidades" :key="loc.id" :value="loc.id.toString()">
                    {{ loc.localidad }}, {{ loc.provincia.provincia }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <TooltipProvider v-if="!isValidCliente.localidad">
              <Tooltip>
                <TooltipTrigger class="text-destructive"><AsteriskIcon :size="14" /></TooltipTrigger>
                <TooltipContent class="text-destructive border-destructive text-xs font-thin"><p>Seleccionar localidad</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span v-else class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Domicilio -->
        <div class="flex flex-col gap-1.5 col-span-2  ml-[1rem]">
          <Label class="text-xs text-[#888]">Domicilio</Label>
          <div class="flex items-center gap-2">
            <Input type="text" class="h-9 text-sm flex-1 mr-[1.5rem] " v-model="newCliente.domicilio" />
            <span class="w-[1em] shrink-0" />
          </div>
        </div>

        <!-- Observaciones -->
        <div class="flex flex-col gap-1.5 col-span-2  ml-[1rem]">
          <Label class="text-xs text-[#888]">Observaciones</Label>
          <div class="flex items-start gap-2">
            <Textarea class="text-sm resize-none h-24 flex-1" v-model="newCliente.observaciones" />
            <span class="w-[1em] shrink-0" />
          </div>
        </div>

      </div>
    </div>

    <!-- ── Obras Sociales ── -->
    <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
      <div class="px-6 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
        <span class="text-sm font-bold text-[#1a1a1a]">Obras Sociales</span>
        <button
          type="button"
          @click="addObraSocial"
          class="h-7 px-3 flex items-center gap-1.5 rounded-lg border border-[#e5e5e5] text-xs text-[#1a1a1a] hover:border-[#ccc] hover:bg-[#fafafa] transition-colors"
        >
          <PlusIcon class="w-3 h-3" />
          Agregar
        </button>
      </div>

      <div class="px-6 py-5">
        <div v-if="!clienteObrasSociales.length" class="flex items-center justify-center py-6">
          <p class="text-sm text-[#aaa]">Sin obras sociales asignadas</p>
        </div>

        <div
          v-for="(osItem, index) in clienteObrasSociales"
          :key="index"
          class="flex items-center gap-4 mb-4 last:mb-0 p-4 rounded-xl border border-[#f0f0f0] bg-[#fafafa] mx-[1rem]"
        >
          <!-- Obra Social -->
          <div class="flex flex-col gap-1.5 flex-1">
            <Label class="text-xs text-[#888]">Obra Social</Label>
            <div class="flex items-center gap-2">
              <Select
                :model-value="osItem.obraSocial.id?.toString()"
                v-model:open="openSelectOS"
                @update:model-value="(value: string) => {
                  const id = parseInt(value, 10);
                  osItem.obraSocial.id = isNaN(id) ? undefined : id;
                }"
              >
                <SelectTrigger class="h-9 text-sm" :class="!isValidClienteObraSocial[index]?.obraSocial ? 'border-destructive' : ''">
                  <SelectValue>
                    {{ obrasSociales.find((os) => os.id === osItem.obraSocial.id)?.nombre || "Seleccione obra social" }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent class="max-h-80">
                  <SelectGroup class="overflow-scroll">
                    <SelectItem v-for="os in availableObrasSociales" :key="os.id" :value="os.id.toString()">
                      {{ os.nombre }}
                    </SelectItem>
                    <Button
                      @click="() => { openSelectOS = false; openNewOS = true; newOsIndex = index; }"
                      variant="ghost"
                      class="w-full px-4 mb-2 bg-[#fafafa] rounded-none items-start justify-start text-sm gap-2"
                    >
                      <PlusCircleIcon class="w-4 h-4" /> Nueva obra social
                    </Button>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <TooltipProvider v-if="!isValidClienteObraSocial[index]?.obraSocial">
                <Tooltip>
                  <TooltipTrigger class="text-destructive"><AsteriskIcon :size="14" /></TooltipTrigger>
                  <TooltipContent class="text-destructive border-destructive text-xs font-thin"><p>Seleccionar obra social</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span v-else class="w-[1em] shrink-0" />
            </div>
          </div>

          <!-- Número socio -->
          <div class="flex flex-col gap-1.5 w-44">
            <Label class="text-xs text-[#888]">Número de socio</Label>
            <div class="flex items-center gap-2 pr-[1em]">
              <Input type="text" class="h-9 text-sm flex-1" v-model="osItem.numeroSocio" />
            </div>
          </div>

          <!-- Eliminar -->
          <button
            type="button"
            @click="removeObraSocial(index)"
            class="mt-5 h-7 w-7 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#aaa] hover:text-destructive hover:border-destructive transition-colors flex-shrink-0"
          >
            <XIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Footer ── -->
    <div class="flex justify-end gap-3 pt-2 pb-4">
      <button
        type="button"
        @click="emit('handleCancel')"
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

  <!-- Dialog nueva OS -->
  <Dialog v-model:open="openNewOS">
    <DialogContent class="max-w-[45rem]">
      <CreateObrasSocialForm
        @handle-create-obra-social="handleCreateObraSocial"
        @handle-cancel="openNewOS = false"
      />
    </DialogContent>
  </Dialog>

  <AlertError
    v-model="showError"
    title="Error"
    :message="errorMessage"
    button="Aceptar"
    :action="() => { showError = false; }"
  />
</template>