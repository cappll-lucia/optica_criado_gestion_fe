<script setup lang="ts" generic="TData, TValue">
import {ref, watch} from 'vue';
import type {ColumnDef, ColumnFiltersState, PaginationState} from '@tanstack/vue-table';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    getFilteredRowModel,
    getPaginationRowModel,
} from '@tanstack/vue-table';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { valueUpdater } from '@/lib/utils.recetas';

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    search?: string;
}>();

const columnFilters = ref <ColumnFiltersState> ([]);
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 });

const table = useVueTable({
    get data() { return props.data; },
    get columns() { return props.columns; },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: updaterOrValue => valueUpdater(updaterOrValue, pagination),
    state: {
        get columnFilters() { return columnFilters.value; },
        get pagination() { return pagination.value; }
    }
});

watch(() => props.search, (value) => {
    table.getColumn('nombre')?.setFilterValue(value);
    pagination.value = { ...pagination.value, pageIndex: 0 };
}, { immediate: true });
</script>

<template>
    <div class="rounded-lg border border-[#e5e5e5] bg-white overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="border-[#f0f0f0] hover:bg-transparent">
                    <TableHead
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        class="h-10 bg-[#fafafa] text-[10px] font-semibold uppercase tracking-wide text-[#888]"
                    >
                        <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                            :props="header.getContext()" />
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <template v-if="table.getRowModel().rows?.length">
                    <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
                        :data-state="row.getIsSelected() ? 'selected' : undefined"
                        class="border-[#f0f0f0] hover:bg-[#fafafa]">
                        <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="py-3 text-sm text-[#1a1a1a]">
                            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                        </TableCell>
                    </TableRow>
                </template>
                <template v-else>
                    <TableRow class="border-[#f0f0f0] hover:bg-transparent">
                        <TableCell :colspan="columns.length" class="h-24 text-center text-sm text-[#aaa]">
                            Obra Social no encontrada
                        </TableCell>
                    </TableRow>
                </template>
            </TableBody>
        </Table>
    </div>

    <div class="mt-4 flex w-full justify-center">
        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                class="hover:border-[#ccc]"
                :disabled="!table.getCanPreviousPage()"
                @click="table.previousPage()"
            >
                <ChevronLeft class="w-4 h-4" />
            </Button>
            <Select :model-value="pagination.pageSize.toString()" @update:model-value="(value) => table.setPageSize(Number(value))">
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
                :disabled="!table.getCanNextPage()"
                @click="table.nextPage()"
            >
                <ChevronRight class="w-4 h-4" />
            </Button>
        </div>
    </div>
</template>
