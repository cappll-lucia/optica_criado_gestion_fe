<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { router } from "@/router";
import { SlashIcon } from "@radix-icons/vue";
import {  ShieldPlusIcon } from "lucide-vue-next";
import { onMounted } from "vue";

const loadData = async () => {};

onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div class="page lg:px-60">
    <div class="oc-container">

      <Breadcrumb class="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Parámetros</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 class="oc-title">Parámetros</h1>

      <div class="oc-grid">

        <!-- <div @click="router.push('marcas')" class="oc-card c-blue wide">
          <div class="oc-icon">
            <BuildingIcon :size="20" />
          </div>
          <div class="oc-card-body">
            <p class="oc-card-label">Marcas</p>
          </div>
          <span class="oc-arrow">→</span>
        </div> -->

        <div @click="router.push('obras-sociales')" class="oc-card c-green wide">
          <div class="oc-icon">
            <ShieldPlusIcon :size="20" />
          </div>
          <div class="oc-card-body">
            <p class="oc-card-label">Obras Sociales</p>
          </div>
          <span class="oc-arrow">→</span>
        </div>

        <!-- <div @click="router.push('proveedores')" class="oc-card c-amber wide">
          <div class="oc-icon">
            <TruckIcon :size="20" />
          </div>
          <div class="oc-card-body">
            <p class="oc-card-label">Proveedores</p>
          </div>
          <span class="oc-arrow">→</span>
        </div> -->

      </div>
    </div>
  </div>
</template>

<style scoped>

.oc-container {
    max-width: 820px;
    margin: 0 auto;
    padding: 3rem 1.5rem 2rem;
}

.oc-title {
    font-size: 22px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 0 0 1.5rem;
    letter-spacing: -0.3px;
}

/* ── Grid ── */
.oc-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

/* ── Card base ── */
.oc-card {
    background: #ffffff;
    border: 0.5px solid #e5e5e5;
    border-radius: 18px;
    padding: 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
}

.oc-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 18px 18px 0 0;
    opacity: 0;
    transition: opacity 0.2s;
}

.oc-card:hover {
    transform: translateY(-2px);
    border-color: #ccc;
}

.oc-card:hover::after { opacity: 1; }
.oc-card:active { transform: scale(0.985); }

/* ── Wide card ── */
.oc-card.wide {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    min-height: 80px;
    gap: 16px;
}

.oc-card-body { flex: 1; }

/* ── Color variants ── */
/* .c-green::after { background: #1D9E75; }
.c-blue::after  { background: #185FA5; }
.c-amber::after { background: #BA7517; } */
.c-green::after { background: #000; }
.c-blue::after  { background: #000; }
.c-amber::after { background: #000; }

/* ── Icon ── */
.oc-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

/* .c-green .oc-icon { background: #E1F5EE; color: #0F6E56; }
.c-blue  .oc-icon { background: #E6F1FB; color: #185FA5; }
.c-amber .oc-icon { background: #FAEEDA; color: #854F0B; }
  */

.c-green .oc-icon { background: #F1EFE8; color: #000; }
.c-blue  .oc-icon { background: #F1EFE8; color: #000; }
.c-amber .oc-icon { background: #F1EFE8; color: #000; }


/* ── Text ── */
.oc-card-label {
    font-size: 16px;
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1.3;
    margin: 0;
}

.oc-card-sub {
    font-size: 13px;
    color: #626161;
    margin: 1px 0 0;
}

/* ── Arrow ── */
.oc-arrow {
    margin-left: auto;
    color: #bbb;
    font-size: 18px;
    flex-shrink: 0;
    transition: transform 0.15s, color 0.15s;
}

.oc-card:hover .oc-arrow {
    transform: translateX(3px);
    color: #888;
}
</style>