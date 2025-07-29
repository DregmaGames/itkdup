// Servicio para conectar con Google Spreadsheet real
export interface SpreadsheetProduct {
  nombre: string;
  fabricante: string;
  fecha: string;
  producto_id: string; // Columna C - ID único del producto
  qr_code_url?: string;
  djc_url?: string;
  certificado_url?: string;
  cliente_id: string;
  consultor_id?: string;
  // Campos para validación
  isValid: boolean;
  errors: string[];
  isNew: boolean; // Indica si es un producto nuevo (no existe en Supabase)
  exists: boolean; // Indica si ya existe en Supabase
  rowNumber: number; // Número de fila en el spreadsheet para debugging
}

export interface ValidationResult {
  valid: number;
  invalid: number;
  existing: number;
  new: number;
  products: SpreadsheetProduct[];
  validationLog: string[];
  structureErrors: string[];
}

export class SpreadsheetService {
  private static readonly SPREADSHEET_ID = '1atceKFdedpkDGV2ikhaxpfxj-2sS2Z723-jJ-Scw9H4';
  private static readonly SHEET_NAME = 'CERT. LOCALES Y EXTENDIDOS';
  private static readonly API_KEY = 'AIzaSyB0p8fJYaNxuddMKaKmu_N-OVNRwP9CXtM';
  private static readonly DEMO_CLIENT_ID = '00000000-0000-4000-8000-000000000001';
  
  // Mapeo de columnas del spreadsheet (usando notación A1)
  private static readonly COLUMNS = 'A:AK'; // Rango que incluye todas las columnas necesarias
  
  // Estructura esperada del archivo
  private static readonly REQUIRED_COLUMNS = {
    A: 'NOMBRE PRODUCTO',
    B: 'FABRICANTE', 
    C: 'PRODUCTO_ID',
    Y: 'FECHA'
  };
  
  static async fetchSpreadsheetData(): Promise<SpreadsheetProduct[]> {
    try {
      // Construir URL de la API de Google Sheets
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/${encodeURIComponent(this.SHEET_NAME)}!${this.COLUMNS}?key=${this.API_KEY}`;
      
      console.log('Fetching data from Google Sheets:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Sheets API Error:', errorText);
        throw new Error(`Error de Google Sheets API: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length < 2) {
        throw new Error('No se encontraron datos en el spreadsheet o faltan filas');
      }
      
      // Validar estructura del archivo
      this.validateFileStructure(data.values[0]);
      
      // Convertir datos del spreadsheet al formato requerido
      // Omitir la primera fila (headers) y procesar las filas de datos
      const rows = data.values.slice(1);
      
      return rows.map((row: string[], index: number) => {
        const rowNumber = index + 2; // +2 porque omitimos header y index empieza en 0
        
        // Mapear columnas específicas según el diseño
        const product: SpreadsheetProduct = {
          nombre: this.cleanValue(row[0]) || '', // Columna A
          fabricante: this.cleanValue(row[1]) || '', // Columna B
          producto_id: this.cleanValue(row[2]) || '', // Columna C - ID único
          fecha: this.cleanValue(row[24]) || '', // Columna Y (índice 24)
          qr_code_url: this.cleanValue(row[32]) || undefined, // Columna AG (índice 32)
          djc_url: this.cleanValue(row[33]) || undefined, // Columna AH (índice 33)
          certificado_url: this.cleanValue(row[34]) || undefined, // Columna AI (índice 34)
          cliente_id: this.DEMO_CLIENT_ID, // Usar cliente DEMO123 por defecto
          consultor_id: this.cleanValue(row[36]) || undefined, // Columna AK (índice 36)
          rowNumber,
          isValid: false,
          errors: [],
          isNew: false,
          exists: false
        };
        
        // Log para debugging (solo las primeras 3 filas)
        if (index < 3) {
          console.log(`Row ${rowNumber}:`, {
            nombre: product.nombre,
            fabricante: product.fabricante,
            producto_id: product.producto_id,
            fecha: product.fecha,
            cliente_id: product.cliente_id + ' (DEMO)',
            consultor_id: product.consultor_id
          });
        }
        
        return product;
      }).filter(product => 
        // Filtrar filas que tengan al menos nombre y fabricante
        product.nombre.trim() && product.fabricante.trim() && product.producto_id.trim()
      );

    } catch (error) {
      console.error('Error fetching spreadsheet data:', error);
      throw new Error(`No se pudo obtener los datos del spreadsheet: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private static validateFileStructure(headerRow: string[]) {
    const structureErrors: string[] = [];
    
    // Verificar que existan las columnas mínimas requeridas
    const requiredIndices = {
      A: 0,  // nombre
      B: 1,  // fabricante  
      C: 2,  // producto_id
      Y: 24  // fecha
    };
    
    Object.entries(requiredIndices).forEach(([column, index]) => {
      if (!headerRow[index] || headerRow[index].trim() === '') {
        structureErrors.push(`Columna ${column} (${this.REQUIRED_COLUMNS[column as keyof typeof this.REQUIRED_COLUMNS]}) faltante o vacía`);
      }
    });
    
    if (structureErrors.length > 0) {
      throw new Error(`Estructura del archivo inválida:\n${structureErrors.join('\n')}`);
    }
    
    console.log('✅ Estructura del archivo validada correctamente');
  }
  private static cleanValue(value: string | undefined): string | undefined {
    if (!value || value.trim() === '') return undefined;
    return value.trim();
  }

  static async validateProducts(
    products: SpreadsheetProduct[], 
    existingClientes: string[], 
    existingConsultores: string[],
    existingProductIds: string[],
    onProgress?: (progress: number, message: string) => void
  ): Promise<ValidationResult> {
    let validCount = 0;
    let invalidCount = 0;
    let existingCount = 0;
    let newCount = 0;
    const validationLog: string[] = [];
    const structureErrors: string[] = [];
    
    const totalProducts = products.length;
    
    // Log del cliente demo usado
    validationLog.push(`🏷️ Usando cliente DEMO: ${this.DEMO_CLIENT_ID}`);
    validationLog.push(`📊 Validando ${totalProducts} productos del spreadsheet`);

    const validatedProducts = products.map((product, index) => {
      const errors: string[] = [];
      
      // Actualizar progreso
      const progress = Math.round(((index + 1) / totalProducts) * 100);
      const message = `Validando fila ${product.rowNumber}: ${product.nombre || 'Sin nombre'}`;
      onProgress?.(progress, message);

      // Validar campos obligatorios
      if (!product.producto_id.trim()) {
        errors.push(`Fila ${product.rowNumber}, Columna C: Producto ID es requerido`);
      }
      if (!product.nombre.trim()) {
        errors.push(`Fila ${product.rowNumber}, Columna A: Nombre del producto es requerido`);
      }
      if (!product.fabricante.trim()) {
        errors.push(`Fila ${product.rowNumber}, Columna B: Fabricante es requerido`);
      }
      if (!product.fecha) {
        errors.push(`Fila ${product.rowNumber}, Columna Y: Fecha es requerida`);
      } else {
        // Validar formato de fecha - aceptar varios formatos comunes
        const dateFormats = [
          /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
          /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
          /^\d{1,2}\/\d{1,2}\/\d{4}$/, // D/M/YYYY o DD/M/YYYY etc
        ];
        
        const isValidDate = dateFormats.some(format => format.test(product.fecha)) ||
                           !isNaN(Date.parse(product.fecha));
        
        if (!isValidDate) {
          errors.push(`Fila ${product.rowNumber}, Columna Y: Formato de fecha inválido (${product.fecha})`);
        } else {
          // Intentar convertir a formato ISO
          try {
            const date = new Date(product.fecha);
            if (isNaN(date.getTime())) {
              errors.push(`Fila ${product.rowNumber}, Columna Y: Fecha inválida (${product.fecha})`);
            } else {
              // Convertir a formato YYYY-MM-DD para Supabase
              product.fecha = date.toISOString().split('T')[0];
            }
          } catch {
            errors.push(`Fila ${product.rowNumber}, Columna Y: Error al procesar la fecha (${product.fecha})`);
          }
        }
      }
      
      if (!product.cliente_id) {
      }
      // Note: cliente_id es DEMO123, no requiere validación UUID
      // Solo log informativo
      if (index === 0) {
        validationLog.push(`ℹ️ Todos los productos se asignarán al cliente: ${product.cliente_id}`);
      }

      // Validar consultor_id si está presente
      if (product.consultor_id) {
        if (!this.isValidUUID(product.consultor_id)) {
          errors.push(`Fila ${product.rowNumber}, Columna AK: Consultor ID no es un UUID válido (${product.consultor_id})`);
        } else if (!existingConsultores.includes(product.consultor_id)) {
          errors.push(`Fila ${product.rowNumber}, Columna AK: Consultor ID no existe en la base de datos (${product.consultor_id})`);
        }
      }

      // Validar URLs si están presentes
      if (product.qr_code_url && !this.isValidUrl(product.qr_code_url)) {
        errors.push(`Fila ${product.rowNumber}, Columna AG: URL del QR Code es inválida (${product.qr_code_url})`);
      }
      if (product.djc_url && !this.isValidUrl(product.djc_url)) {
        errors.push(`Fila ${product.rowNumber}, Columna AH: URL del DJC es inválida (${product.djc_url})`);
      }
      if (product.certificado_url && !this.isValidUrl(product.certificado_url)) {
        errors.push(`Fila ${product.rowNumber}, Columna AI: URL del Certificado es inválida (${product.certificado_url})`);
      }

      // Verificar si el producto ya existe
      const exists = existingProductIds.includes(product.producto_id);
      product.exists = exists;
      product.isNew = !exists;
      
      if (exists) {
        existingCount++;
        validationLog.push(`⚠️ Fila ${product.rowNumber}: Producto ya existe - ${product.producto_id} (${product.nombre})`);
      } else {
        newCount++;
        validationLog.push(`✅ Fila ${product.rowNumber}: Producto nuevo - ${product.producto_id} (${product.nombre})`);
      }

      const isValid = errors.length === 0;
      if (isValid && !exists) { // Solo contar como válido si es nuevo
        validCount++;
      } else if (!isValid) {
        invalidCount++;
        validationLog.push(`❌ Fila ${product.rowNumber}: ${errors.join(' | ')}`);
      }

      return {
        ...product,
        isValid,
        errors
      };
    });

    // Agregar resumen al log
    validationLog.push('');
    validationLog.push('📋 RESUMEN DE VALIDACIÓN:');
    validationLog.push(`✅ Productos nuevos válidos: ${validCount}`);
    validationLog.push(`⚠️ Productos ya existentes: ${existingCount}`);
    validationLog.push(`❌ Productos con errores: ${invalidCount}`);
    validationLog.push(`📊 Total procesados: ${totalProducts}`);
    return {
      valid: validCount,
      invalid: invalidCount,
      existing: existingCount,
      new: newCount,
      products: validatedProducts,
      validationLog,
      structureErrors
    };
  }

  static generateValidationReport(validation: ValidationResult): string {
    const timestamp = new Date().toISOString();
    let report = `REPORTE DE VALIDACIÓN E IMPORTACIÓN - ${timestamp}\n`;
    report += `=====================================\n\n`;
    report += `CLIENTE DEMO UTILIZADO: ${this.DEMO_CLIENT_ID}\n\n`;
    report += `RESUMEN:\n`;
    report += `- Total productos procesados: ${validation.products.length}\n`;
    report += `- Productos nuevos válidos: ${validation.valid}\n`;
    report += `- Productos con errores: ${validation.invalid}\n`;
    report += `- Productos ya existentes: ${validation.existing}\n\n`;
    
    if (validation.structureErrors.length > 0) {
      report += `ERRORES DE ESTRUCTURA:\n`;
      validation.structureErrors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += `\n`;
    }
    
    report += `DETALLE:\n`;
    report += `=====================================\n`;
    
    validation.validationLog.forEach(log => {
      report += `${log}\n`;
    });
    
    report += `\n=====================================\n`;
    report += `Reporte generado por ModularApp - Sistema de Importación\n`;
    report += `Cliente Demo: ${this.DEMO_CLIENT_ID}\n`;
    
    return report;
  }

  static downloadReport(content: string, filename: string = 'validation-report.txt') {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  }
}