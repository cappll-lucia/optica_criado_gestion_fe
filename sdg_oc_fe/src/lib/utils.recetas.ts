import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'
import { TipoDocumento } from '@/api/entities/clientes';
import { RecetasAereos } from '@/api/entities/recetasAereos';
import { RecetaContacto } from '@/api/entities/recetasContacto';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

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

const sign = (n: number | string | undefined | null) => {
  if (n == null) return '-';
  const num = Number(n);
  return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
};

const formatMonto = (n: number) => n > 0 ? '$ ' + n.toLocaleString('es-AR') : '$ —';

// Genera y descarga la ficha (1/3 de hoja A4) de una receta de anteojos recetados.
export async function generateFichaRecetaAereosPDF(receta: RecetasAereos, cliente: FichaHeaderData): Promise<void> {
  const detLejos = receta.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Lejos');
  const detCerca = receta.detallesRecetaLentesAereos.find(det => det.tipo_detalle == 'Cerca');
  const verLejos = !!detLejos && ['Lejos', 'Multifocal', 'Bifocal'].includes(receta.tipoReceta);
  const verCerca = !!detCerca && ['Cerca', 'Multifocal', 'Bifocal'].includes(receta.tipoReceta);

  const totalReceta = (Number(receta.precioArmazon) || 0) + (Number(receta.precioCristales) || 0);
  const restoReceta = totalReceta - (Number(receta.senia) || 0);

  // Hoja A4 completa: la ficha ocupa solo el primer tercio (alto/3)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight() / 3;
  const margin = 6;
  const colDividerX = pageWidth / 2;
  const leftX = margin;
  const leftWidth = colDividerX - 3 - leftX;
  const rightX = colDividerX + 3;
  const rightWidth = pageWidth - margin - rightX;

  const colTopY = await drawFichaHeader(doc, margin, cliente);

  // Columna izquierda: datos de la receta + graduación tabular
  let yLeft = colTopY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`ANTEOJOS ${receta.tipoReceta.toUpperCase()}`, leftX, yLeft);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(receta.fecha.toString()), colDividerX - 3, yLeft, { align: 'right' });
  yLeft += 4.5;

  if (receta.oftalmologo) {
    doc.setFontSize(7);
    doc.text(`Oftalmólogo: ${receta.oftalmologo}`, leftX, yLeft);
    yLeft += 4.5;
  }

  const graduacionRows: (string | number)[][] = [];
  if (verLejos && detLejos) {
    graduacionRows.push(['Lejos', 'O.D.', sign(detLejos.od_esferico), sign(detLejos.od_cilindrico), `${detLejos.od_grados}°`]);
    graduacionRows.push(['', 'O.I.', sign(detLejos.oi_esferico), sign(detLejos.oi_cilindrico), `${detLejos.oi_grados}°`]);
  }
  if (verCerca && detCerca) {
    graduacionRows.push(['Cerca', 'O.D.', sign(detCerca.od_esferico), sign(detCerca.od_cilindrico), `${detCerca.od_grados}°`]);
    graduacionRows.push(['', 'O.I.', sign(detCerca.oi_esferico), sign(detCerca.oi_cilindrico), `${detCerca.oi_grados}°`]);
  }

  autoTable(doc, {
    startY: yLeft,
    head: [['', 'Ojo', 'Esf.', 'Cil.', 'Eje']],
    body: graduacionRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, halign: 'center', lineColor: [180, 180, 180] },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold', halign: 'left' },
      1: { cellWidth: 12, fontStyle: 'bold' },
      2: { cellWidth: (leftWidth - 26) / 3 },
      3: { cellWidth: (leftWidth - 26) / 3 },
      4: { cellWidth: (leftWidth - 26) / 3 },
    },
    margin: { left: leftX, right: pageWidth - leftX - leftWidth },
  });
  yLeft = (doc as any).lastAutoTable.finalY + 4;

  const medidas: string[] = [];
  if (receta.dnp != null) medidas.push(`DNP ${receta.dnp}mm.`);
  if (receta.od_alt_pelicula != null) medidas.push(`Alt. pelíc. O.D. ${receta.od_alt_pelicula}mm.`);
  if (receta.oi_alt_pelicula != null) medidas.push(`Alt. pelíc. O.I. ${receta.oi_alt_pelicula}mm.`);
  if (medidas.length) {
    doc.setFontSize(7);
    doc.text(medidas.join('   |   '), leftX, yLeft);
    yLeft += 4.5;
  }

  // Observaciones, debajo de la grilla de graduación
  if (receta.observaciones) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Observaciones:', leftX, yLeft);
    yLeft += 3.6;
    doc.setFont('helvetica', 'normal');
    const maxY = pageHeight - margin;
    const wrapped = doc.splitTextToSize(receta.observaciones, leftWidth) as string[];
    const disponibles = Math.max(0, Math.floor((maxY - yLeft) / 3.4) + 1);
    const lineasAMostrar = wrapped.slice(0, disponibles);
    const ultima = lineasAMostrar[lineasAMostrar.length - 1];
    if (wrapped.length > lineasAMostrar.length && ultima != null) {
      lineasAMostrar[lineasAMostrar.length - 1] = ultima.length > 3 ? ultima.slice(0, -3) + '...' : ultima;
    }
    lineasAMostrar.forEach((l, i) => doc.text(l, leftX, yLeft + i * 3.4));
  }

  // Columna derecha: cristales/armazón, obras sociales y precios
  let yRight = colTopY;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  const cristales: string[] = [];
  if (receta.cristal) cristales.push(`Cristal: ${receta.cristal}`);
  if (receta.color) cristales.push(`Color: ${receta.color}`);
  if (receta.armazon) cristales.push(`Armazón: ${receta.armazon}`);
  if (receta.tratamiento) cristales.push(`Tratamiento: ${receta.tratamiento}`);
  cristales.forEach(linea => {
    const wrapped = doc.splitTextToSize(linea, rightWidth) as string[];
    wrapped.forEach(l => { doc.text(l, rightX, yRight); yRight += 3.6; });
  });

  const obrasSociales = receta.recetaLentesAereosObrasSociales?.map(ros => ros.obraSocial.nombre) ?? [];
  if (obrasSociales.length) {
    const wrapped = doc.splitTextToSize(`Obras sociales: ${obrasSociales.join(', ')}`, rightWidth) as string[];
    wrapped.forEach(l => { doc.text(l, rightX, yRight); yRight += 3.6; });
  }

  yRight += 1.5;
  doc.setDrawColor(210);
  doc.line(rightX, yRight, pageWidth - margin, yRight);
  yRight += 4;

  doc.setFontSize(7);
  doc.text(`Armazón: ${formatMonto(Number(receta.precioArmazon) || 0)}`, rightX, yRight);
  yRight += 3.8;
  doc.text(`Cristales: ${formatMonto(Number(receta.precioCristales) || 0)}`, rightX, yRight);
  yRight += 3.8;
  doc.text(`Total: ${formatMonto(totalReceta)}`, rightX, yRight);
  yRight += 3.8;
  doc.text(`Seña: ${Number(receta.senia) > 0 ? '- ' + formatMonto(Number(receta.senia)) : '$ —'}`, rightX, yRight);
  yRight += 3.8;
  doc.setFont('helvetica', 'bold');
  doc.text(`Resto a pagar: ${formatMonto(restoReceta)}`, rightX, yRight);
  doc.setFont('helvetica', 'normal');

  doc.setDrawColor(210);
  doc.line(colDividerX, colTopY - 3, colDividerX, pageHeight - margin);

  drawFichaCutGuides(doc, pageWidth);

  doc.save(`Ficha_${receta.tipoReceta}_${cliente.nombreCliente}.pdf`);
}

// Genera y descarga la ficha (1/3 de hoja A4) de una receta de lentes de contacto.
export async function generateFichaRecetaContactoPDF(receta: RecetaContacto, cliente: FichaHeaderData): Promise<void> {
  const totalReceta = Number(receta.precio) || 0;
  const restoReceta = totalReceta - (Number(receta.senia) || 0);

  // Hoja A4 completa: la ficha ocupa solo el primer tercio (alto/3)
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight() / 3;
  const margin = 6;
  // Columna derecha angosta: solo precios. El resto de la info va a la izquierda.
  const rightWidth = 42;
  const rightX = pageWidth - margin - rightWidth;
  const colDividerX = rightX - 3;
  const leftX = margin;
  const leftWidth = colDividerX - 3 - leftX;

  const colTopY = await drawFichaHeader(doc, margin, cliente);

  // Columna izquierda: datos de la receta, graduación tabular, marcas, queratometría, evaluación y observaciones
  let yLeft = colTopY;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('LENTES DE CONTACTO', leftX, yLeft);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(receta.fecha.toString()), colDividerX - 3, yLeft, { align: 'right' });
  yLeft += 4.5;

  if (receta.oftalmologo) {
    doc.setFontSize(7);
    doc.text(`Oftalmólogo: ${receta.oftalmologo}`, leftX, yLeft);
    yLeft += 4.5;
  }

  autoTable(doc, {
    startY: yLeft,
    head: [['Ojo', 'C.B.', 'Esf.', 'Cil.', 'Eje', 'Diám.']],
    body: [
      ['O.D.', receta.od_cb.toFixed(2), sign(receta.od_esferico), sign(receta.od_cilindrico), `${receta.od_eje.toFixed(2)}°`, receta.od_diametro.toFixed(2)],
      ['O.I.', receta.oi_cb.toFixed(2), sign(receta.oi_esferico), sign(receta.oi_cilindrico), `${receta.oi_eje.toFixed(2)}°`, receta.oi_diametro.toFixed(2)],
    ],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1, halign: 'center', lineColor: [180, 180, 180] },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold', halign: 'left' },
      1: { cellWidth: (leftWidth - 14) / 5 },
      2: { cellWidth: (leftWidth - 14) / 5 },
      3: { cellWidth: (leftWidth - 14) / 5 },
      4: { cellWidth: (leftWidth - 14) / 5 },
      5: { cellWidth: (leftWidth - 14) / 5 },
    },
    margin: { left: leftX, right: pageWidth - leftX - leftWidth },
  });
  yLeft = (doc as any).lastAutoTable.finalY + 5;

  if (receta.od_marca || receta.oi_marca) {
    doc.setFontSize(7);
    doc.text(`Marca   O.D.: ${receta.od_marca ?? '—'}`, leftX, yLeft);
    yLeft += 3.5;
    doc.text(`Marca   O.I.: ${receta.oi_marca ?? '—'}`, leftX, yLeft);
    yLeft += 5;
  }

  if (receta.quet_m1_od || receta.quet_m1_oi) {
    doc.setFontSize(7);
    doc.text(`Queratometría   O.D.: ${receta.quet_m1_od?.toFixed(2) ?? '—'} / ${receta.quet_m2_od?.toFixed(2) ?? '—'}   O.I.: ${receta.quet_m1_oi?.toFixed(2) ?? '—'} / ${receta.quet_m2_oi?.toFixed(2) ?? '—'}`, leftX, yLeft);
    yLeft += 3.6;
    if (receta.observaciones_queterometria) {
      const wrapped = doc.splitTextToSize(`Notas querato.: ${receta.observaciones_queterometria}`, leftWidth) as string[];
      wrapped.forEach(l => { doc.text(l, leftX, yLeft); yLeft += 3.6; });
    }
    yLeft += 1;
  }

  const evalItems: string[] = [];
  if (receta.maquillaje) evalItems.push('Maquillaje');
  if (receta.tonicidad) evalItems.push('Tonicidad');
  if (receta.hendidura_palpebral) evalItems.push('Hendidura Palpebral');
  if (receta.altura_palpebral) evalItems.push('Altura Palpebral');
  if (receta.buen_parpadeo_amplitud) evalItems.push('Parpadeo Amplitud');
  if (receta.buen_parpadeo_ritmo) evalItems.push('Parpadeo Ritmo');
  if (evalItems.length) {
    doc.setFontSize(7);
    const wrapped = doc.splitTextToSize(`Evaluación: ${evalItems.join(', ')}`, leftWidth) as string[];
    wrapped.forEach(l => { doc.text(l, leftX, yLeft); yLeft += 3.6; });
  }
  if (receta.estesiometria) {
    doc.setFontSize(7);
    doc.text(`Estesiometría: ${receta.estesiometria}`, leftX, yLeft);
    yLeft += 3.6;
  }
  if (receta.pruebasLentesContacto?.length) {
    doc.setFontSize(7);
    doc.text(`Pruebas registradas: ${receta.pruebasLentesContacto.length}`, leftX, yLeft);
    yLeft += 3.6;
  }

  if (receta.observaciones) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('Observaciones:', leftX, yLeft);
    yLeft += 3.6;
    doc.setFont('helvetica', 'normal');
    const maxY = pageHeight - margin;
    const wrapped = doc.splitTextToSize(receta.observaciones, leftWidth) as string[];
    const disponibles = Math.max(0, Math.floor((maxY - yLeft) / 3.4) + 1);
    const lineasAMostrar = wrapped.slice(0, disponibles);
    const ultima = lineasAMostrar[lineasAMostrar.length - 1];
    if (wrapped.length > lineasAMostrar.length && ultima != null) {
      lineasAMostrar[lineasAMostrar.length - 1] = ultima.length > 3 ? ultima.slice(0, -3) + '...' : ultima;
    }
    lineasAMostrar.forEach((l, i) => doc.text(l, leftX, yLeft + i * 3.4));
  }

  // Columna derecha: solo precios
  let yRight = colTopY;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`Precio: ${formatMonto(totalReceta)}`, rightX, yRight);
  yRight += 3.8;
  doc.text(`Seña: ${Number(receta.senia) > 0 ? '- ' + formatMonto(Number(receta.senia)) : '$ —'}`, rightX, yRight);
  yRight += 3.8;
  doc.setFont('helvetica', 'bold');
  doc.text(`Resto a pagar: ${formatMonto(restoReceta)}`, rightX, yRight);
  doc.setFont('helvetica', 'normal');

  doc.setDrawColor(210);
  doc.line(colDividerX, colTopY - 3, colDividerX, pageHeight - margin);

  drawFichaCutGuides(doc, pageWidth);

  doc.save(`FichaContacto_${cliente.nombreCliente}.pdf`);
}

export function isCuit(_cuit: string){
    if (typeof _cuit !== 'string') return false;
          return /^\d{2}-\d{8}-\d{1}$/.test(_cuit);
}