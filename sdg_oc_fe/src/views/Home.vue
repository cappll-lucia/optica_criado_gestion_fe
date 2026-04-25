<script setup lang="ts">
import { EarIcon, EyeIcon, SettingsIcon, Users2Icon, GlassesIcon } from 'lucide-vue-next';
import { router } from '@/router';
</script>

<template>
    <div class="page lg:px-60">
        <div class="oc-container">

            <!-- Header / Logo -->
            <div class="oc-header">
                <img src="/oc_logo_no_bg.png" class="oc-logo-img" alt="Óptica Criado" />
                <p class="oc-tagline">Sistema de gestión</p>
            </div>

            <!-- Grid -->
            <div class="oc-grid">

                <!-- Clientes — wide -->
                <div @click="router.push('/clientes')" class="oc-card c-green wide">
                    <div class="oc-icon">
                        <Users2Icon :size="20" />
                    </div>
                    <div class="oc-card-body">
                        <p class="oc-card-label">Clientes</p>
                        <p class="oc-card-sub">Listado de Clientes</p>
                    </div>
                    <span class="oc-arrow">→</span>
                </div>

                <!-- Anteojos Recetados -->
                <div @click="router.push('/recetas/recetados/new')" class="oc-card c-blue">
                    <div class="oc-icon">
                        <GlassesIcon :size="20" />
                    </div>
                    <div>
                        <p class="oc-card-label">Anteojos Recetados</p>
                        <p class="oc-card-sub">Nueva Receta</p>
                    </div>
                </div>

                <!-- Lentes de Contacto -->
                <div @click="router.push('/recetas/contacto/new')" class="oc-card c-blue">
                    <div class="oc-icon">
                        <EyeIcon :size="20" />
                    </div>
                    <div>
                        <p class="oc-card-label">Lentes de Contacto</p>
                        <p class="oc-card-sub">Nueva Receta</p>
                    </div>
                </div>

                <!-- Audiometría -->
                <div @click="router.push('/audiometrias/create')" class="oc-card c-amber">
                    <div class="oc-icon">
                        <EarIcon :size="20" />
                    </div>
                    <div>
                        <p class="oc-card-label">Audiometrías</p>
                        <p class="oc-card-sub">Nueva Audiometría</p>
                    </div>
                </div>

                <!-- Parámetros -->
                <div @click="router.push('/parametros')" class="oc-card c-slate">
                    <div class="oc-icon">
                        <SettingsIcon :size="20" />
                    </div>
                    <p class="oc-card-label">Parámetros</p>
                </div>

            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');

.oc-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 1.5rem 2rem;
}

/* ── Header ── */
.oc-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 2.5rem;
}

.oc-logo-img {
    height: 80px;
    width: auto;
}

.oc-tagline {
    font-size: 20px;
    color: #999;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 0 2px;
}

/* ── Grid ── */
.oc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
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
    min-height: 120px;
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
    min-height: 120px;
    gap: 16px;
}

.oc-card-body { flex: 1; }

/* ── Color variants ── */
.c-green::after { background: #000; }
.c-blue::after  { background: #000; }
.c-amber::after { background: #000; }
.c-slate::after { background: #000; }

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

.c-green .oc-icon { background: #F1EFE8; color: #000; }
.c-blue  .oc-icon { background: #F1EFE8; color: #000; }
.c-amber .oc-icon { background: #F1EFE8; color: #000; }
.c-slate .oc-icon { background: #F1EFE8; color: #000; }

/* ── Text ── */
.oc-card-label {
    font-size: 16px;
    color: #1a1a1a;
    line-height: 1.3;
    margin: 0;
    font-weight: 800;
}

.oc-card-sub {
    font-size: 13px;
    color: #626161;
    margin: 1px 0 0;
}

/* ── Arrow (wide card) ── */
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
