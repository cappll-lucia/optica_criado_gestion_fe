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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { router } from '@/router';
import { useUserStore } from '@/stores/UsersStore';
import { computed } from 'vue';
import { HomeIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-vue-next';
import { QuestionMarkCircledIcon } from '@radix-icons/vue';


const userStore = useUserStore();

const userData = computed(() => userStore.getMe);



</script>

<template>
    <NavigationMenu v-if="$route.name!='login'" class="border-y max-w-100 py-2 justify-between h-[3.5rem] px-4 fixed top-0 w-full z-50 bg-white ">
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
            <NavigationMenuItem class="mr-[1rem] ">
                <NavigationMenuLink href="/parametros" :class="navigationMenuTriggerStyle()">
                    <SettingsIcon  class="w-4 h-4 mr-2" />
                    Parámetros
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList> 
        <div class="px-2 flex justify-end w-[13rem] items-center z-40 ">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar class="border border-gray-950">
                        <AvatarImage src="/favicon.svg" alt="@radix-vue" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="px-4 w-[15rem]">
                    <DropdownMenuLabel>{{ userData?.username }}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="router.push('/preguntas')" ><QuestionMarkCircledIcon /> Preguntas frecuentes</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="router.push('/parametros')" > <SettingsIcon />Parámetros</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem class="font-bold" @click="userStore.signOut()"> <LogOutIcon/> Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
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