import { Cliente, TipoDocumento } from '@/api/entities/clientes';
import { h } from 'vue'
import { ColumnDef } from '@tanstack/vue-table';
import Button from '@/components/ui/button/Button.vue';
import { router } from '@/router';
import { ChevronRightIcon } from 'lucide-vue-next';

export const columns: ColumnDef<Cliente>[] = [
  {
    accessorKey: 'nombre',
    header: () => h('div', 'Apellido y Nombre'),
    cell: ({row})=> `${row.original.apellido}, ${row.original.nombre} `
  },
  {
    accessorKey: 'documento',
    header: () => h('div', 'Tipo y Nro Documento'),
    cell: ({row})=>
      (row.original.tipoDocumento || row.original.nroDocumento)
        ? `${TipoDocumento[row.original.tipoDocumento] ?? ''}  ${row.original.nroDocumento ?? ''}`
        : '-'
  }, 
  {
    accessorKey: 'telefono',
    header: () => h('div', 'Teléfono'),
    cell: ({ row }) =>
      row.original.telefono ?? '-'
  },
  {
    accessorKey: 'localidad',
    header: () => h('div', 'Localidad'),
    cell: ({ row }) =>
      row.original.localidad
        ? `${row.original.localidad.localidad}, ${row.original.localidad.provincia.provincia}`
        : '-'
  },  
  {
    accessorKey: 'actions',
    header: () => h('div', ''),
    cell: ({ row }) =>
      h(Button, {
        variant: 'outline',
        size: 'icon',
        onClick: () => {
         router.push( `/clientes/dashboard/${row.original.id}`)
        }
      }, h(ChevronRightIcon, { class: 'w-4 h-4' }))
  }
]