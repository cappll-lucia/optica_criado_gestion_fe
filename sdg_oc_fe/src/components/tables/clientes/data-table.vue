<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    FlexRender,
    getCoreRowModel,
    useVueTable,
    getFilteredRowModel, 
} from '@tanstack/vue-table'


const props = defineProps<{
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}>();


const table = useVueTable({
    get data() { return props.data; },
    get columns() { return props.columns; },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
})
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
                            Ningún cliente coincide con los criterios de búsqueda
                        </TableCell>
                    </TableRow>
                </template>
            </TableBody>
        </Table>
    </div>
</template>