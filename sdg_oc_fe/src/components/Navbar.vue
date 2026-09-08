<script setup lang="ts">
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { router } from '@/router';
import { useUserStore } from '@/stores/UsersStore';
import { computed } from 'vue';
import { HomeIcon, LogOutIcon, Settings2Icon, UserIcon } from 'lucide-vue-next';
import { QuestionMarkCircledIcon } from '@radix-icons/vue';


const userStore = useUserStore();

const userData = computed(() => userStore.getMe);



</script>

<template>
    <NavigationMenu v-if="$route.name!='login'" class="max-w-none border-y py-2 h-[3.5rem] px-4 fixed top-0 w-full z-50 bg-white ">
        <div class="flex items-center w-full max-w-[1200px] mx-auto">
            <div class="w-40 flex items-center">
                <img src="/src/assets/oc_logo_no_bg.png" alt="Óptica Criado" class="h-8 w-auto" />
            </div>
            <div class="flex-1 flex justify-center">
                <NavigationMenuList>
                    <NavigationMenuItem class="mr-[1rem] ">
                        <NavigationMenuLink href="/" :class="navigationMenuTriggerStyle()">
                            <HomeIcon class="w-4 h-4 mr-2" />
                            Inicio
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem class="mr-[1rem] " >
                        <NavigationMenuLink href="/clientes" :class="navigationMenuTriggerStyle()">
                            <UserIcon class="w-4 h-4 mr-2"  />
                            Clientes
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink href="/parametros" :class="navigationMenuTriggerStyle()">
                            <Settings2Icon  class="w-4 h-4 mr-2" />
                            Parámetros
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </div>
            <div class="w-40 flex items-center justify-end">
                <DropdownMenu :modal="false">
                    <DropdownMenuTrigger>
                        <Avatar class="h-8 w-8 bg-[#EAF2FA] border-[#2b5b88]">
                            <AvatarFallback><UserIcon class="w-5 h-5 text-primary" /></AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="px-4 w-[15rem]">
                        <DropdownMenuLabel>{{ userData?.username }}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="router.push('/preguntas')" ><QuestionMarkCircledIcon /> Preguntas frecuentes</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem @click="router.push('/parametros')" > <Settings2Icon />Parámetros</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="font-bold" @click="userStore.signOut()"> <LogOutIcon/> Cerrar sesión</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    </NavigationMenu>
</template>

<style>
.item-venta:fi{
    background-color: yellowgreen;
    position: absolute;
    left: 3rem;
}
</style>