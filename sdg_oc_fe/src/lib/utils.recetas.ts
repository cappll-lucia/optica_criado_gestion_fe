import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { TipoDocumento } from '@/api/entities/clientes';
import { jsPDF } from "jspdf";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}

export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

let logoDataUrlCache: string | null = null;
export async function getLogoDataUrl(): Promise<string> {
  if (logoDataUrlCache) return logoDataUrlCache;
  const response = await fetch('/oc_logo_no_bg.png');
  const blob = await response.blob();
  logoDataUrlCache = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return logoDataUrlCache;
}

export const formatTime = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export interface FichaHeaderData {
  nombreCliente: string;
  nroDocumento: number | undefined;
  tipoDocumento: TipoDocumento | undefined;
  telefono: string | undefined;
  domicilio: string | undefined;
  email: string | undefined;
}

// Dibuja el encabezado (logo + datos del cliente) de una ficha de 1/3 de hoja A4.
// Devuelve el Y desde donde continuar el contenido.
export async function drawFichaHeader(doc: jsPDF, margin: number, data: FichaHeaderData): Promise<number> {
  let headerTextX = margin;
  try {
    const logo = await getLogoDataUrl();
    const logoWidth = 50;
    const logoHeight = logoWidth / (1090 / 229);
    doc.addImage(logo, 'PNG', margin, margin, logoWidth, logoHeight);
    headerTextX = margin + logoWidth + 5;
  } catch {
    // logo no disponible, se continúa sin él
  }

  const tipoDoc = data.tipoDocumento === TipoDocumento.CUIT ? 'CUIT' : 'DNI';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(data.nombreCliente, headerTextX, margin + 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const linea1 = [
    data.nroDocumento ? `${tipoDoc}: ${data.nroDocumento}` : '',
    data.telefono ? `Tel.: ${data.telefono}` : '',
  ].filter(Boolean).join('   |   ');
  if (linea1) doc.text(linea1, headerTextX, margin + 7.5);

  const linea2 = [
    data.domicilio ? `Domicilio: ${data.domicilio}` : '',
    data.email ? `Email: ${data.email}` : '',
  ].filter(Boolean).join('   |   ');
  if (linea2) doc.text(linea2, headerTextX, margin + 11);

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin + 16;
  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  return y;
}

// Dibuja líneas punteadas en los tercios de la hoja A4 para guiar el recorte de la ficha.
export function drawFichaCutGuides(doc: jsPDF, pageWidth: number) {
  const fullPageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(180);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(0, fullPageHeight / 3, pageWidth, fullPageHeight / 3);
  doc.line(0, (fullPageHeight / 3) * 2, pageWidth, (fullPageHeight / 3) * 2);
  doc.setLineDashPattern([], 0);
}

export function isCuit(_cuit: string){
    if (typeof _cuit !== 'string') return false;
          return /^\d{2}-\d{8}-\d{1}$/.test(_cuit);
}