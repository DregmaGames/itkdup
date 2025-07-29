import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DJCTemplate } from '../types/djc';

export class DJCPdfGenerator {
  private static readonly PAGE_WIDTH = 595;
  private static readonly PAGE_HEIGHT = 842;
  private static readonly MARGIN = 50;
  private static readonly LINE_HEIGHT = 20;

  static async generateDJC(template: DJCTemplate): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    
    // Fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    let yPosition = this.PAGE_HEIGHT - this.MARGIN;

    // Header
    page.drawText('DECLARACIÓN JURADA DE CONFORMIDAD', {
      x: this.MARGIN,
      y: yPosition,
      size: 18,
      font: titleFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Empresa
    page.drawText('EMPRESA SOLICITANTE:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= this.LINE_HEIGHT;
    page.drawText(template.empresa, {
      x: this.MARGIN + 20,
      y: yPosition,
      size: 11,
      font: normalFont,
    });
    yPosition -= 30;

    // Información del Producto
    page.drawText('INFORMACIÓN DEL PRODUCTO:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= this.LINE_HEIGHT;

    const productInfo = [
      { label: 'Producto:', value: template.producto },
      { label: 'Modelo:', value: template.modelo },
      { label: 'Marca:', value: template.marca },
      { label: 'Fabricante:', value: template.fabricante },
      { label: 'Domicilio del Fabricante:', value: template.domicilioFabricante },
      { label: 'Identificación:', value: template.identificacion },
    ];

    for (const info of productInfo) {
      page.drawText(`${info.label} ${info.value}`, {
        x: this.MARGIN + 20,
        y: yPosition,
        size: 10,
        font: normalFont,
      });
      yPosition -= this.LINE_HEIGHT;
    }

    yPosition -= 10;

    // Características Técnicas
    page.drawText('CARACTERÍSTICAS TÉCNICAS:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= this.LINE_HEIGHT;
    
    const characteristics = this.wrapText(template.caracteristicasTecnicas, 80);
    for (const line of characteristics) {
      page.drawText(line, {
        x: this.MARGIN + 20,
        y: yPosition,
        size: 10,
        font: normalFont,
      });
      yPosition -= this.LINE_HEIGHT;
    }

    yPosition -= 10;

    // Capacidades y Limitaciones
    page.drawText('CAPACIDADES Y LIMITACIONES:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= this.LINE_HEIGHT;
    
    const limitations = this.wrapText(template.capacidadesLimitaciones, 80);
    for (const line of limitations) {
      page.drawText(line, {
        x: this.MARGIN + 20,
        y: yPosition,
        size: 10,
        font: normalFont,
      });
      yPosition -= this.LINE_HEIGHT;
    }

    yPosition -= 10;

    // Materiales
    page.drawText('MATERIALES:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= this.LINE_HEIGHT;
    
    const materials = this.wrapText(template.materiales, 80);
    for (const line of materials) {
      page.drawText(line, {
        x: this.MARGIN + 20,
        y: yPosition,
        size: 10,
        font: normalFont,
      });
      yPosition -= this.LINE_HEIGHT;
    }

    yPosition -= 30;

    // Declaración
    page.drawText('DECLARACIÓN:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= this.LINE_HEIGHT;

    const declaration = [
      'Por la presente, declaro bajo juramento que el producto descrito cumple',
      'con todas las normativas y reglamentaciones técnicas vigentes aplicables.',
      'Esta declaración se efectúa de conformidad con las disposiciones legales',
      'correspondientes y bajo plena responsabilidad del declarante.'
    ];

    for (const line of declaration) {
      page.drawText(line, {
        x: this.MARGIN + 20,
        y: yPosition,
        size: 10,
        font: normalFont,
      });
      yPosition -= this.LINE_HEIGHT;
    }

    yPosition -= 40;

    // Firma Section
    page.drawText('FIRMA DEL RESPONSABLE:', {
      x: this.MARGIN,
      y: yPosition,
      size: 12,
      font: titleFont,
    });
    yPosition -= 30;

    // Embed signature if provided
    if (template.firmaUrl) {
      try {
        const signatureResponse = await fetch(template.firmaUrl);
        const signatureBytes = await signatureResponse.arrayBuffer();
        const signatureImage = await pdfDoc.embedPng(new Uint8Array(signatureBytes));
        
        const signatureDims = signatureImage.scale(0.3);
        page.drawImage(signatureImage, {
          x: this.MARGIN + 20,
          y: yPosition - signatureDims.height,
          width: signatureDims.width,
          height: signatureDims.height,
        });
        
        yPosition -= signatureDims.height + 10;
      } catch (error) {
        console.error('Error embedding signature:', error);
      }
    }

    // Nombre del firmante
    page.drawText(`Nombre: ${template.nombreFirmante}`, {
      x: this.MARGIN + 20,
      y: yPosition,
      size: 10,
      font: normalFont,
    });
    yPosition -= this.LINE_HEIGHT;

    // Fecha
    page.drawText(`Fecha: ${template.fechaFirma}`, {
      x: this.MARGIN + 20,
      y: yPosition,
      size: 10,
      font: normalFont,
    });

    // Footer
    const footerY = 50;
    page.drawText('Este documento es generado automáticamente por el Sistema ModularApp', {
      x: this.MARGIN,
      y: footerY,
      size: 8,
      font: normalFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    return await pdfDoc.save();
  }

  private static wrapText(text: string, maxLength: number): string[] {
    if (!text) return ['No especificado'];
    
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : ['No especificado'];
  }
}