<script lang="ts" setup>
import { Audiometria } from "@/api/entities/audiometrias";
import { Cliente, TipoDocumento } from "@/api/entities/clientes";
import { CuentaCorriente } from "@/api/entities/cuentaCorriente";
import { RedDePago, TipoMedioDePagoEnum } from "@/api/entities/mediosDePago";
import {
  createMovimientoCtaCte,
  TipoMovimiento,
} from "@/api/entities/movimiento";
import { TipoReceta } from "@/api/entities/recetasAereos";
import { Venta } from "@/api/entities/venta";
import { clientesApi } from "@/api/libs/clientes";
import { comprobantesApi } from "@/api/libs/comprobantes";
import { cuentaCorrienteApi } from "@/api/libs/cuentaCorriente";
import { ventasApi } from "@/api/libs/ventas";
import AlertError from "@/components/AlertError.vue";
import LoaderForm from "@/components/LoaderForm.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Button from "@/components/ui/button/Button.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  condicionIvaDisplay,
  tipoComprobanteDisplay,
  tipoFactura,
} from "@/lib/utils";
import { formatDate } from "@/lib/utils.recetas";
import { router } from "@/router";
import { useCajaStore } from "@/stores/CajaStore";
import { useLoaderStore } from "@/stores/LoaderStore";
import { Pencil1Icon, SlashIcon } from "@radix-icons/vue";
import {
  AsteriskIcon,
  CircleDot,
  Eye,
  Fingerprint,
  HandCoinsIcon,
  IdCard,
  InspectIcon,
  Mail,
  MapPin,
  Phone,
  PlusIcon,
  PrinterIcon,
  User,
  Wallet,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const loader = useLoaderStore();
const route = useRoute();
const cajaStore = useCajaStore();

const currentCliente = ref<Cliente>();
const ctaCorriente = ref<CuentaCorriente>();
const recetasCliente = ref<
  { id: number; clase: string; tipo?: TipoReceta; fecha: Date }[]
>([]);
const audiometriasCliente = ref<Audiometria[]>([]);
const ventasCliente = ref<Venta[]>([]);
const openDialog = ref<boolean>(false);
const loadingForm = ref<boolean>(false);

const showError = ref<boolean>(false);
const errorMessage = ref<string>("");
const openDialogClosedCaja = ref<boolean>(false);

const newMovimiento = ref<{
  tipoMovimiento: TipoMovimiento | undefined;
  importe: number;
  formaPago: TipoMedioDePagoEnum | undefined;
  redDePago: RedDePago | undefined;
  entidadBancaria: string | undefined;
}>({
  tipoMovimiento: undefined,
  importe: 0,
  formaPago: undefined,
  redDePago: undefined,
  entidadBancaria: undefined,
});

const isValidNewMovimiento = ref<{
  tipoMovimiento: boolean;
  redDePago: boolean;
  importe: boolean;
  formaPago: boolean;
  entidadBancaria: boolean;
}>({
  tipoMovimiento: true,
  importe: true,
  formaPago: true,
  redDePago: true,
  entidadBancaria: true,
});

onMounted(async () => {
  loader.show();
  await loadData();
  loader.hide();
});

const loadData = async () => {
  try {
    const id = Number(route.params.id);
    if (id == 0) { loader.hide(); return; }
    currentCliente.value = await clientesApi.getOne(id);
    if (!currentCliente.value) return;
    recetasCliente.value = await clientesApi.getRecetasSummaryByCliente(currentCliente.value.id);
    audiometriasCliente.value = await clientesApi.getAudiometriasByCliente(currentCliente.value.id);
    ctaCorriente.value = await cuentaCorrienteApi.getOneByCliente(currentCliente.value.id);
    ventasCliente.value = await ventasApi.getAllByCliente(currentCliente.value.id);
  } catch (err: any) {
    errorMessage.value = err.message as string;
    showError.value = true;
    loader.hide();
  }
};

const printComprobante = async (id: string, tipoComprobante: number, fecha: Date, duplicado: number) => {
  try {
    const date = new Date(fecha);
    const resp = await comprobantesApi.print(id, duplicado);
    const uint8Array = new Uint8Array(resp.data);
    const pdfBlob = new Blob([uint8Array], { type: "application/pdf" });
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentCliente.value?.apellido}_${tipoComprobanteDisplay(tipoComprobante)?.nombre}_${date.toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    errorMessage.value = "Ocurrió un error al descargar el archivo PDF";
    showError.value = true;
    loader.hide();
  }
};

const emailComprobante = async (_id: string) => {
  try {
    await comprobantesApi.email(_id);
    toast({ title: "Comprobante enviado por email" });
  } catch (error) {
    errorMessage.value = "Ocurrió un error al enviar el comprobante por email";
    showError.value = true;
    loader.hide();
  }
};

const validateAndSubmit = async () => {
  const resultNewMovimiento = createMovimientoCtaCte(newMovimiento.value);
  isValidNewMovimiento.value = resultNewMovimiento.isValid;
  if (resultNewMovimiento.success) await onSubmit();
};

const onSubmit = async () => {
  try {
    loadingForm.value = true;
    if (currentCliente.value) {
      ctaCorriente.value = await cuentaCorrienteApi.updateSaldo(currentCliente.value?.id, newMovimiento.value);
      toast({ title: "Saldo actualizado con éxito" });
      await loadData();
      openDialog.value = false;
      loadingForm.value = false;
      newMovimiento.value = { tipoMovimiento: undefined, importe: 0, formaPago: undefined, redDePago: undefined, entidadBancaria: undefined };
    }
  } catch (err: any) {
    errorMessage.value = err.message as string;
    openDialog.value = false;
    loadingForm.value = false;
    showError.value = true;
  }
};

const redirectReceta = (receta: { id: number; clase: string; tipo?: TipoReceta; fecha: Date }) => {
  const tab = receta.clase == "Lentes Contacto" ? "contacto" : "recetados";
  router.push(`/recetas/${currentCliente.value?.id}?tab=${tab}&recetaId=${receta.id}`);
};

const handleNewMovimiento = async () => {
  const cierre = await cajaStore.isCajaClosedToday();
  openDialogClosedCaja.value = cierre;
  if (cierre) { openDialogClosedCaja.value = true; loader.hide(); return; }
  else { openDialog.value = true; }
};

const hanldeRedirectVenta = async () => {
  if (!currentCliente.value) return;
  const cierre = await cajaStore.isCajaClosedToday();
  if (cierre) { openDialogClosedCaja.value = true; }
  else { router.push(`/ventas/new?cliente=${currentCliente.value.id}`); }
};

const handleEmitFactura = async (venta: Venta) => {
  try {
    if (!currentCliente.value) return;
    loader.show();
    const newFactura = {
      importeTotal: venta?.importe,
      tipoComprobante: tipoFactura(Number(currentCliente.value.categoriaFiscal)),
      motivo: venta?.observaciones,
      condicionIvaCliente: Number(currentCliente.value.categoriaFiscal),
      transaccionRelacionadaId: { id: venta.id },
    };
    await comprobantesApi.create(newFactura);
    await loadData();
    loader.hide();
    toast({ title: "Factura emitida" });
  } catch (err: any) {
    errorMessage.value = err.message;
    showError.value = true;
  } finally {
    loader.hide();
  }
};
</script>

<template>
  <!-- ── Cliente encontrado ── -->
  <div class="page lg:px-60" v-if="currentCliente">
    <div class="max-w-[900px] mx-auto px-6 py-10">

      <!-- Breadcrumb -->
      <Breadcrumb class="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Inicio</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink href="/clientes">Clientes</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{{ currentCliente.apellido }}, {{ currentCliente.nombre }}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <!-- ── Header cliente ── -->
      <div class="rounded-2xl border border-[#e5e5e5] bg-white p-6 mb-5">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-3">
            <!-- Avatar iniciales -->
            <div class="w-11 h-11 rounded-full bg-[#f0f0f0] flex items-center justify-center text-sm font-bold text-[#999] flex-shrink-0">
              {{ currentCliente.apellido?.slice(0,1) }}{{ currentCliente.nombre?.slice(0,1) }}
            </div>
            <h1 class="text-[20px] font-bold tracking-tight text-[#1a1a1a]">
              {{ currentCliente.apellido }}, {{ currentCliente.nombre }}
            </h1>
          </div>
          <button
            @click="router.push(`/clientes/edit/${currentCliente?.id}`)"
            class="h-9 px-4 flex items-center gap-2 rounded-lg border border-[#e5e5e5] text-sm text-[#1a1a1a] font-medium hover:bg-[#fafafa] hover:border-[#ccc] transition-colors"
          >
            <Pencil1Icon class="w-3.5 h-3.5" />
            Editar
          </button>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 gap-x-8 gap-y-2.5">
          <div class="flex items-center gap-2">
            <IdCard class="w-4 h-4 text-[#aaa] flex-shrink-0" />
            <span class="text-xs text-[#aaa] w-28">{{ TipoDocumento[currentCliente.tipoDocumento] ?? 'Documento' }}</span>
            <span class="text-sm text-[#1a1a1a]">{{ currentCliente.nroDocumento ?? '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4 text-[#aaa] flex-shrink-0" />
            <span class="text-xs text-[#aaa] w-28">Domicilio</span>
            <span class="text-sm text-[#1a1a1a]">
              <template v-if="currentCliente.domicilio && currentCliente.localidad?.localidad">{{ currentCliente.domicilio }}, {{ currentCliente.localidad.localidad }}</template>
              <template v-else-if="currentCliente.localidad?.localidad">{{ currentCliente.localidad.localidad }}</template>
              <template v-else>—</template>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <Wallet class="w-4 h-4 text-[#aaa] flex-shrink-0" />
            <span class="text-xs text-[#aaa] w-28">Cat. Fiscal</span>
            <span class="text-sm text-[#1a1a1a]">{{ condicionIvaDisplay(currentCliente.categoriaFiscal) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Phone class="w-4 h-4 text-[#aaa] flex-shrink-0" />
            <span class="text-xs text-[#aaa] w-28">Teléfono</span>
            <span class="text-sm text-[#1a1a1a]">{{ currentCliente.telefono ?? '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Fingerprint class="w-4 h-4 text-[#aaa] flex-shrink-0" />
            <span class="text-xs text-[#aaa] w-28">Sexo</span>
            <span class="text-sm text-[#1a1a1a]">{{ currentCliente.sexo ?? '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Mail class="w-4 h-4 text-[#aaa] flex-shrink-0" />
            <span class="text-xs text-[#aaa] w-28">Email</span>
            <span class="text-sm text-[#1a1a1a]">{{ currentCliente.email ?? '—' }}</span>
          </div>
          <div class="flex items-start gap-2 col-span-2">
            <HandCoinsIcon class="w-4 h-4 text-[#aaa] flex-shrink-0 mt-0.5" />
            <span class="text-xs text-[#aaa] w-28 mt-0.5">Obras Sociales</span>
            <div class="flex flex-wrap gap-1.5" v-if="currentCliente.clienteObrasSociales.length">
              <span
                v-for="os in currentCliente.clienteObrasSociales"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#e5e5e5] text-xs text-[#1a1a1a] bg-[#fafafa]"
              >{{ os.obraSocial.nombre }}</span>
            </div>
            <span v-else class="text-sm text-[#1a1a1a]">—</span>
          </div>
        </div>
      </div>

      <!-- ── Recetas + Audiometrías ── -->
      <div class="grid grid-cols-2 gap-5 mb-5">

        <!-- Recetas -->
        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <span class="text-sm font-bold text-[#1a1a1a]">Recetas</span>
            <div class="flex items-center gap-1.5">
              <button
                @click="router.push(`/recetas/${currentCliente?.id}`)"
                class="h-7 w-7 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#aaa] hover:text-[#1a1a1a] hover:border-[#ccc] transition-colors"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button class="h-7 w-7 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors">
                    <PlusIcon class="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56 font-normal">
                  <DropdownMenuLabel class="cursor-pointer font-normal" @click="router.push(`/recetas/recetados/new?cliente=${currentCliente?.id}`)">
                    Nueva receta anteojos recetados
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel class="cursor-pointer font-normal" @click="router.push(`/recetas/contacto/new?cliente=${currentCliente?.id}`)">
                    Nueva receta lentes de contacto
                  </DropdownMenuLabel>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <ScrollArea v-if="recetasCliente.length" class="h-64 px-3 py-2">
            <div
              v-for="receta in recetasCliente"
              @click="redirectReceta(receta)"
              class="flex items-center gap-0 mb-2 rounded-xl overflow-hidden border border-[#f0f0f0] cursor-pointer hover:border-[#ccc] transition-colors group"
            >
              <div class="w-[38%] bg-[#fafafa] border-r border-[#f0f0f0] px-3 py-3 flex items-center justify-between">
                <span class="text-xs text-[#888]">{{ formatDate(receta.fecha.toString()) }}</span>
                <CircleDot class="w-2 h-2 text-[#ccc]" />
              </div>
              <div class="flex-1 px-3 py-3">
                <span class="text-xs text-[#1a1a1a]">{{ receta.clase }}<span v-if="receta.tipo"> · {{ receta.tipo }}</span></span>
              </div>
            </div>
          </ScrollArea>
          <div v-else class="h-64 flex flex-col items-center justify-center gap-3 px-4">
            <p class="text-sm text-[#aaa]">Sin recetas registradas</p>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <button class="h-8 px-4 rounded-lg border border-[#e5e5e5] text-xs text-[#1a1a1a] hover:border-[#ccc] hover:bg-[#fafafa] transition-colors">
                  Nueva receta
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56 font-normal">
                <DropdownMenuLabel class="cursor-pointer font-normal" @click="router.push(`/recetas/recetados/new?cliente=${currentCliente?.id}`)">
                  Nueva receta anteojos recetados
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel class="cursor-pointer font-normal" @click="router.push(`/recetas/contacto/new?cliente=${currentCliente?.id}`)">
                  Nueva receta lentes de contacto
                </DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <!-- Audiometrías -->
        <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
            <span class="text-sm font-bold text-[#1a1a1a]">Audiometrías</span>
            <div class="flex items-center gap-1.5">
              <button
                @click="router.push(`/audiometrias/${currentCliente?.id}`)"
                class="h-7 w-7 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#aaa] hover:text-[#1a1a1a] hover:border-[#ccc] transition-colors"
              >
                <Eye class="w-3.5 h-3.5" />
              </button>
              <button
                @click="router.push(`/audiometrias/create?cliente=${currentCliente?.id}`)"
                class="h-7 w-7 flex items-center justify-center rounded-lg bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
              >
                <PlusIcon class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <ScrollArea v-if="audiometriasCliente.length" class="h-64 px-3 py-2">
            <div
              v-for="(audiom, index) in audiometriasCliente"
              @click="router.push(`/audiometrias/${currentCliente?.id}`)"
              class="flex items-center gap-3 mb-2 rounded-xl border border-[#f0f0f0] px-3 py-3 cursor-pointer hover:border-[#ccc] transition-colors"
            >
              <span class="text-xs text-[#888]">{{ formatDate(audiom.fechaInforme.toString()) }}</span>
              <span class="text-xs text-[#1a1a1a]">Audiometría {{ index + 1 }}</span>
            </div>
          </ScrollArea>
          <div v-else class="h-64 flex flex-col items-center justify-center gap-3 px-4">
            <p class="text-sm text-[#aaa]">Sin audiometrías registradas</p>
            <button
              @click="router.push(`/audiometrias/create?cliente=${currentCliente?.id}`)"
              class="h-8 px-4 rounded-lg border border-[#e5e5e5] text-xs text-[#1a1a1a] hover:border-[#ccc] hover:bg-[#fafafa] transition-colors"
            >
              Nueva audiometría
            </button>
          </div>
        </div>
      </div>

      <!-- ── Ventas ── -->
      <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <span class="text-sm font-bold text-[#1a1a1a]">Ventas</span>
          <button
            @click="hanldeRedirectVenta"
            class="h-7 px-3 flex items-center gap-1.5 rounded-lg bg-[#1a1a1a] text-white text-xs font-semibold hover:bg-[#333] transition-colors"
          >
            <PlusIcon class="w-3 h-3" />
            Nueva venta
          </button>
        </div>
        <div v-if="ventasCliente.length">
          <div
            v-for="venta in ventasCliente"
            class="flex items-center gap-4 px-5 py-3.5 border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors"
          >
            <span class="text-xs text-[#aaa] w-24 flex-shrink-0">{{ formatDate(venta.fecha?.toString()) }}</span>
            <span class="text-sm text-[#1a1a1a] flex-1">{{ venta.observaciones ?? '—' }}</span>
            <span class="text-sm font-medium text-[#1a1a1a]">${{ venta.importe?.toFixed(2) }}</span>
            <div class="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <button
                      v-if="!venta.comprobante"
                      @click="handleEmitFactura(venta)"
                      class="h-7 w-7 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#aaa] hover:text-[#1a1a1a] hover:border-[#ccc] transition-colors"
                    >
                      <AsteriskIcon class="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Emitir factura</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <template v-if="venta.comprobante">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        @click="printComprobante(venta.comprobante.id, venta.comprobante.tipoComprobante, venta.comprobante.fecha, 0)"
                        class="h-7 w-7 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#aaa] hover:text-[#1a1a1a] hover:border-[#ccc] transition-colors"
                      >
                        <PrinterIcon class="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Imprimir comprobante</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        @click="emailComprobante(venta.comprobante.id)"
                        class="h-7 w-7 flex items-center justify-center rounded-lg border border-[#e5e5e5] text-[#aaa] hover:text-[#1a1a1a] hover:border-[#ccc] transition-colors"
                      >
                        <Mail class="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Enviar por email</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </template>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-12 gap-3">
          <p class="text-sm text-[#aaa]">Sin ventas registradas</p>
          <button
            @click="hanldeRedirectVenta"
            class="h-8 px-4 rounded-lg border border-[#e5e5e5] text-xs text-[#1a1a1a] hover:border-[#ccc] hover:bg-[#fafafa] transition-colors"
          >
            Nueva venta
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- ── Cliente no encontrado ── -->
  <div class="page lg:px-60" v-else>
    <div class="max-w-[900px] mx-auto px-6 py-10">
      <Breadcrumb class="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Inicio</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink href="/clientes">Clientes</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><SlashIcon /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbPage>Dashboard</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div class="rounded-2xl border border-[#e5e5e5] bg-white p-12 text-center">
        <p class="text-sm text-[#aaa]">Cliente con id={{ route.params.id }} no encontrado</p>
      </div>
    </div>
  </div>

  <!-- ── Dialogs ── -->
  <AlertError
    v-model="showError"
    title="Error"
    :message="errorMessage"
    button="Aceptar"
    :action="() => { showError = false; }"
  />

  <Dialog v-model:open="openDialogClosedCaja">
    <DialogContent class="max-w-[530px] min-h-[15rem] flex justify-center items-center flex-col text-center">
      <DialogHeader>
        <DialogTitle class="text-destructive">Caja cerrada</DialogTitle>
      </DialogHeader>
      <DialogDescription class="text-destructive mb-4">
        No se puede registrar una nueva venta porque la caja del día ya fue cerrada.
      </DialogDescription>
      <Button @click="openDialogClosedCaja = false" type="button">Aceptar</Button>
    </DialogContent>
  </Dialog>
</template>