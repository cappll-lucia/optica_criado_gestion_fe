<script setup lang="ts">
import { RecetasAereos } from '@/api/entities/recetasAereos';
import { DetalleRecetaAereos } from '@/api/entities/detalleRecetaAereos';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils.recetas';

defineProps<{
    receta: RecetasAereos;
}>();

const sign = (n: number) => n > 0 ? `+${n.toFixed(2)}` : n.toFixed(2);

const formatDetalle = (det: DetalleRecetaAereos) => {
    return `O.D.Esf.${sign(det.od_esferico)}  Cil.${sign(det.od_cilindrico)}  A.${det.od_grados}°\n` +
           `O.I.Esf.${sign(det.oi_esferico)}  Cil.${sign(det.oi_cilindrico)}  A.${det.oi_grados}°\n` +
           `DNP ${sign(det.dnp)}`;
}
</script>

<template>
    <div class="mb-6">
        <p class="font-bold text-zinc-900 mb-1">
            ** ANTEOJOS {{ receta.tipoReceta.toUpperCase() }}
            <span class="font-normal ml-4 text-zinc-500">---> {{ formatDate(receta.fecha.toString()) }}</span>
        </p>
        <template v-for="det in receta.detallesRecetaLentesAereos" :key="det.tipo_detalle">
            <p>{{ formatDetalle(det) }}</p>
        </template>
        <p v-if="receta.cristal || receta.color || receta.armazon" class="mt-1">
            <span v-if="receta.cristal">Cristal: {{ receta.cristal }}</span><span v-if="receta.cristal && (receta.color || receta.armazon)">  |  </span>
            <span v-if="receta.color">Color: {{ receta.color }}</span><span v-if="receta.color && receta.armazon">  |  </span>
            <span v-if="receta.armazon">Armazón: {{ receta.armazon }}</span>
        </p>
        <p v-if="receta.tratamiento">Tratamiento: {{ receta.tratamiento }}</p>
        <p v-if="receta.observaciones" class="text-zinc-500">{{ receta.observaciones }}</p>
        <Separator class="mt-4" />
    </div>
</template>