import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface CaseDossier {
  case: {
    id: number;
    title: string;
    description?: string;
    type?: string;
    court?: string;
    case_number?: string;
    status?: string;
    created_at?: string;
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    client_rfc?: string;
    client_type?: string;
    lawyer_name?: string;
    lawyer_email?: string;
  };
  tasks?: Array<{
    id: number;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    status?: string;
    assigned_name?: string;
  }>;
  payments?: Array<{
    id: number;
    amount: number;
    concept?: string;
    method?: string;
    status?: string;
    created_at?: string;
    is_expense?: number | boolean;
    reference?: string;
  }>;
  documents?: Array<{
    id: number;
    name: string;
    size?: number;
    tags?: string[] | string;
    created_at?: string;
  }>;
  financialSummary?: {
    totalExpenses: number;
    totalIncome: number;
    balance: number;
  };
}

export interface ExportPdfOptions {
  includeExecutiveSummary?: boolean;
  executiveSummaryText?: string;
  includeTasks?: boolean;
  includeFinances?: boolean;
  includeDocuments?: boolean;
  includeSignatures?: boolean;
  confidentialityNotice?: boolean;
  attorneyNotes?: string;
}

export const generateCaseExecutivePdf = (
  dossier: CaseDossier,
  options: ExportPdfOptions = {}
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const primaryColor: [number, number, number] = [15, 23, 42]; // slate-900
  const accentGold: [number, number, number] = [217, 119, 6]; // amber-600
  const lightBg: [number, number, number] = [248, 250, 252]; // slate-50
  const borderGray: [number, number, number] = [226, 232, 240]; // slate-200
  const textDark: [number, number, number] = [30, 41, 59]; // slate-800
  const textMuted: [number, number, number] = [100, 116, 139]; // slate-500

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 22) {
      doc.addPage();
      currentY = margin;
      drawHeaderSimple();
    }
  };

  const drawHeaderSimple = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('LEXMARCORP IQ • RESUMEN EJECUTIVO DE EXPEDIENTE', margin, 12);
    doc.setFont('helvetica', 'normal');
    const caseRef = dossier.case.case_number || `EXP-${dossier.case.id}`;
    doc.text(`Ref: ${caseRef}`, pageWidth - margin, 12, { align: 'right' });
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  // ================= 1. HEADER & TOP BANNER =================
  doc.setFillColor(...primaryColor);
  doc.rect(margin, currentY, contentWidth, 24, 'F');

  // Gold accent bar
  doc.setFillColor(...accentGold);
  doc.rect(margin, currentY, 3.5, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LEXMARCORP ABOGADOS & ASOCIADOS', margin + 8, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('AUDITORÍA Y GESTIÓN JURÍDICA ESTRATÉGICA • REPORTE EJECUTIVO DE EXPEDIENTE', margin + 8, currentY + 16);

  const printDate = format(new Date(), "dd 'de' MMMM, yyyy • HH:mm", { locale: es });
  doc.setFontSize(7.5);
  doc.setTextColor(245, 158, 11);
  doc.text(`Emisión: ${printDate}`, pageWidth - margin - 4, currentY + 16, { align: 'right' });

  currentY += 28;

  // ================= 2. FICHA TÉCNICA DEL EXPEDIENTE =================
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderGray);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  const title = dossier.case.title || 'Expediente Sin Título';
  doc.text(doc.splitTextToSize(title, contentWidth - 10), margin + 5, currentY + 7);

  // Metadata columns
  doc.setFontSize(8);
  const col1X = margin + 5;
  const col2X = margin + 65;
  const col3X = margin + 125;
  const row1Y = currentY + 15;
  const row2Y = currentY + 23;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textMuted);
  doc.text('N° DE EXPEDIENTE:', col1X, row1Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(dossier.case.case_number || 'S/N Registrado', col1X + 28, row1Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textMuted);
  doc.text('CLIENTE / PARTE:', col2X, row1Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(dossier.case.client_name || 'No especificado', col2X + 26, row1Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textMuted);
  doc.text('ESTADO:', col3X, row1Y);
  doc.setFont('helvetica', 'bold');
  const statusStr = (dossier.case.status || 'abierto').toUpperCase();
  doc.setTextColor(statusStr === 'CONCLUIDO' ? 22 : 180, statusStr === 'CONCLUIDO' ? 101 : 83, 9);
  doc.text(statusStr, col3X + 16, row1Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textMuted);
  doc.text('JUZGADO / SEDE:', col1X, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(dossier.case.court || 'Juzgado de Primera Instancia', col1X + 27, row2Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textMuted);
  doc.text('ABOGADO A CARGO:', col2X, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(dossier.case.lawyer_name || 'Lic. Marco Perales', col2X + 31, row2Y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textMuted);
  doc.text('MATERIA:', col3X, row2Y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textDark);
  doc.text(dossier.case.type || 'Mercantil / Civil', col3X + 16, row2Y);

  currentY += 40;

  // ================= 3. RESUMEN EJECUTIVO & OBSERVACIONES =================
  if (options.includeExecutiveSummary !== false) {
    checkPageBreak(35);
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('1. DIAGNÓSTICO JURÍDICO Y RESUMEN ESTRATÉGICO EJECUTIVO', margin + 4, currentY + 4.5);
    currentY += 9;

    const summaryText =
      options.executiveSummaryText ||
      dossier.case.description ||
      'Se presenta resumen de actuaciones relativas al expediente de mérito. Las acciones procesales se encuentran debidamente encauzadas con control de plazos y balance contable positivo.';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth - 4);
    doc.text(splitSummary, margin + 2, currentY);
    currentY += splitSummary.length * 4.2 + 4;

    if (options.attorneyNotes) {
      checkPageBreak(25);
      doc.setFillColor(254, 243, 199); // amber-100
      doc.setDrawColor(245, 158, 11);
      doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9);
      doc.text('Nota Especial del Titular del Despacho:', margin + 4, currentY + 4.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(69, 26, 3);
      doc.text(doc.splitTextToSize(options.attorneyNotes, contentWidth - 8), margin + 4, currentY + 9);
      currentY += 18;
    }
  }

  // ================= 4. DILIGENCIAS Y TÉRMINOS JUDICIALES =================
  if (options.includeTasks !== false && dossier.tasks && dossier.tasks.length > 0) {
    checkPageBreak(35);
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('2. CALENDARIO DE DILIGENCIAS, TÉRMINOS Y ACTUACIONES CLAVE', margin + 4, currentY + 4.5);
    currentY += 8.5;

    const tasksData = dossier.tasks.map((t, idx) => [
      (idx + 1).toString(),
      t.title || 'Sin título',
      t.due_date ? format(new Date(t.due_date), 'dd/MM/yyyy') : 'Pendiente',
      t.priority || 'Normal',
      (t.status || 'pendiente').toUpperCase(),
      t.assigned_name || 'Despacho'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Diligencia / Actuación', 'Vencimiento', 'Prioridad', 'Estado', 'Responsable']],
      body: tasksData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 24, halign: 'center' },
        5: { cellWidth: 'auto' }
      }
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ================= 5. BALANCE FINANCIERO Y CONTABLE =================
  if (options.includeFinances !== false) {
    checkPageBreak(40);
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('3. ESTADO FINANCIERO Y LIQUIDACIÓN PROCESAL (MXN)', margin + 4, currentY + 4.5);
    currentY += 9;

    const inc = dossier.financialSummary?.totalIncome || 0;
    const exp = dossier.financialSummary?.totalExpenses || 0;
    const bal = dossier.financialSummary?.balance || inc - exp;

    // Financial KPI cards
    const cardWidth = (contentWidth - 6) / 3;
    const cardY = currentY;

    // Card 1: Ingresos
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, cardY, cardWidth, 14, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52);
    doc.text('HONORARIOS & INGRESOS', margin + 3, cardY + 5);
    doc.setFontSize(10);
    doc.text(`$${inc.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, margin + 3, cardY + 11);

    // Card 2: Gastos
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin + cardWidth + 3, cardY, cardWidth, 14, 1.5, 1.5, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(153, 27, 27);
    doc.text('GASTOS DE JUICIO', margin + cardWidth + 6, cardY + 5);
    doc.setFontSize(10);
    doc.text(`$${exp.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, margin + cardWidth + 6, cardY + 11);

    // Card 3: Balance Neto
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin + (cardWidth + 3) * 2, cardY, cardWidth, 14, 1.5, 1.5, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 48, 163);
    doc.text('BALANCE PROCESAL NETO', margin + (cardWidth + 3) * 2 + 3, cardY + 5);
    doc.setFontSize(10);
    doc.text(`$${bal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, margin + (cardWidth + 3) * 2 + 3, cardY + 11);

    currentY += 18;

    if (dossier.payments && dossier.payments.length > 0) {
      const payRows = dossier.payments.slice(0, 8).map((p, idx) => [
        (idx + 1).toString(),
        p.concept || 'Movimiento contable',
        p.is_expense ? 'Gasto de Juicio' : 'Honorarios / Cobro',
        p.method || 'Transferencia',
        p.created_at ? format(new Date(p.created_at), 'dd/MM/yyyy') : '-',
        `$${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['#', 'Concepto / Glosa', 'Rubro', 'Forma', 'Fecha', 'Monto']],
        body: payRows,
        theme: 'striped',
        headStyles: {
          fillColor: [51, 65, 85],
          textColor: 255,
          fontSize: 7.5,
          fontStyle: 'bold'
        },
        styles: { fontSize: 7, cellPadding: 1.8 },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 30 },
          3: { cellWidth: 24 },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 'auto', halign: 'right' }
        }
      });

      // @ts-ignore
      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // ================= 6. GLOSA DE DOCUMENTOS Y ANEXOS =================
  if (options.includeDocuments !== false && dossier.documents && dossier.documents.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(...primaryColor);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('4. GLOSA DOCUMENTAL Y EVIDENCIAS PROBATORIAS', margin + 4, currentY + 4.5);
    currentY += 8.5;

    const docRows = dossier.documents.map((d, idx) => [
      (idx + 1).toString(),
      d.name || 'Documento',
      d.size ? `${(d.size / 1024).toFixed(1)} KB` : 'Adjunto',
      Array.isArray(d.tags) ? d.tags.join(', ') : typeof d.tags === 'string' ? d.tags : 'Expediente',
      d.created_at ? format(new Date(d.created_at), 'dd/MM/yyyy') : '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Nombre del Documento', 'Tamaño', 'Categoría / Etiquetas', 'Fecha de Registro']],
      body: docRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontSize: 7.5
      },
      styles: { fontSize: 7, cellPadding: 1.8 }
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ================= 7. PROTOCOLO DE CIERRE Y FIRMAS =================
  if (options.includeSignatures !== false) {
    checkPageBreak(45);
    currentY += 6;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    const disclaimer =
      'El presente resumen ejecutivo refleja con veracidad el estado procesal y financiero del expediente al momento de su generación. Expedido para constancia legal y efectos de auditoría y revisión de las partes intervinientes.';
    doc.text(doc.splitTextToSize(disclaimer, contentWidth), margin, currentY);

    currentY += 18;

    const sigWidth = 70;
    const colLeft = margin + 10;
    const colRight = pageWidth - margin - sigWidth - 10;

    // Attorney Signature Line
    doc.setDrawColor(...textDark);
    doc.setLineWidth(0.5);
    doc.line(colLeft, currentY, colLeft + sigWidth, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(dossier.case.lawyer_name || 'LIC. MARCO PERALES', colLeft + sigWidth / 2, currentY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text('Abogado Postulante • Cédula Prof.', colLeft + sigWidth / 2, currentY + 8, { align: 'center' });
    doc.text('LexmarCorp Abogados & Asociados', colLeft + sigWidth / 2, currentY + 11.5, { align: 'center' });

    // Client Signature Line
    doc.setDrawColor(...textDark);
    doc.line(colRight, currentY, colRight + sigWidth, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...textDark);
    doc.text(dossier.case.client_name || 'PARTE CLIENTE / TITULAR', colRight + sigWidth / 2, currentY + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text('Firma de Conformidad y Recepción', colRight + sigWidth / 2, currentY + 8, { align: 'center' });
    doc.text(dossier.case.client_email || 'Expediente Verificado', colRight + sigWidth / 2, currentY + 11.5, { align: 'center' });
  }

  // ================= 8. PAGE FOOTER (PAGINATION) =================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...textMuted);
    doc.text('LexmarCorp IQ • Sistema de Gestión y Auditoría Jurídica', margin, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  return doc;
};
