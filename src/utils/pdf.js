import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// A4 PDF 출력 (HTML 요소 → PDF)
export async function printToPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgRatio = canvas.height / canvas.width;
  const imgHeight = pdfWidth * imgRatio;

  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
  } else {
    // 여러 페이지 처리
    let position = 0;
    let remainHeight = imgHeight;
    while (remainHeight > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      remainHeight -= pdfHeight;
      position -= pdfHeight;
      if (remainHeight > 0) pdf.addPage();
    }
  }

  return pdf;
}

// 저장
export async function savePDF(elementId, filename) {
  const pdf = await printToPDF(elementId, filename);
  if (pdf) pdf.save(filename);
}

// 인쇄
export async function printPDF(elementId) {
  const pdf = await printToPDF(elementId, 'print');
  if (pdf) {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.onload = () => {
        win.print();
        URL.revokeObjectURL(url);
      };
    }
  }
}
