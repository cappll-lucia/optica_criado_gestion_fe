<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AsteriskIcon } from 'lucide-vue-next';
import AlertError from '@/components/AlertError.vue';
import { obrasSocialesApi } from '@/api/libs/obrasSociales';
import { ref } from 'vue';
import Label from '@/components/ui/label/Label.vue';
import LoaderForm from './LoaderForm.vue';

const newObraSocial = ref<string>();
const isValidNewObraSocial = ref<boolean>(true);
const loadingForm = ref<boolean>(false);

const showError = ref<boolean>(false);
const errorMessage = ref<string>('');

const emit = defineEmits(['handleCreateObraSocial', 'handleCancel']);

const onSubmit = async () => {
    loadingForm.value = true;
    try {
        if (!newObraSocial.value) {
            isValidNewObraSocial.value = false;
            return;
        }
        const createdObraSocial = await obrasSocialesApi.create({ nombre: newObraSocial.value });
        emit('handleCreateObraSocial', createdObraSocial);
        loadingForm.value = false;
        newObraSocial.value = undefined;
    } catch (err: any) {
        errorMessage.value = err.message as string;
        showError.value = true;
        loadingForm.value = false;
        newObraSocial.value = undefined;
    }
};

const validateAndSubmit = async () => {
    if (newObraSocial.value && newObraSocial.value.length > 2) {
        await onSubmit();
    } else {
        isValidNewObraSocial.value = false;
    }
};

const handleCancel = () => {
    emit('handleCancel');
};
</script>

<template>
    <div class="w-100%">

        <form @submit.prevent="validateAndSubmit" v-if="!loadingForm" class="flex flex-col gap-5">

            <div class="flex flex-col gap-1">
                <h2 class="text-[17px] font-bold text-[#1a1a1a]">Nueva Obra Social</h2>
                <p class="text-sm text-[#aaa]">Completá el nombre para registrarla</p>
            </div>

            <div class="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden">
                <div class="px-6 py-5">
                    <div class="flex flex-col gap-1.5">
                        <Label class="text-xs text-[#888]">Nombre</Label>
                        <div class="flex items-center gap-2">
                            <Input
                                type="text"
                                class="h-9 text-sm flex-1"
                                :class="!isValidNewObraSocial ? 'border-destructive' : ''"
                                v-model="newObraSocial"
                                @input="isValidNewObraSocial = true"
                            />
                            <TooltipProvider v-if="!isValidNewObraSocial">
                                <Tooltip>
                                    <TooltipTrigger class="text-destructive">
                                        <AsteriskIcon :size="14" />
                                    </TooltipTrigger>
                                    <TooltipContent class="text-destructive border-destructive text-xs font-thin">
                                        <p>Ingresar nombre de la obra social</p>
                                        <p>Al menos dos caracteres</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-1">
                <button
                    type="button"
                    @click="handleCancel"
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

        <div v-else class="flex w-full justify-center items-center h-32">
            <LoaderForm />
        </div>

    </div>

    <AlertError
        v-model="showError"
        title="Error"
        :message="errorMessage"
        button="Aceptar"
        :action="() => { showError = false; }"
    />
</template>