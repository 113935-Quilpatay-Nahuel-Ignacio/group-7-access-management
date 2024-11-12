import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { ZXingScannerModule } from '@zxing/ngx-scanner';
//import jsQR from 'jsqr';

@Component({
  selector: 'app-root',
  standalone: true,
  //imports: [RouterOutlet,ZXingScannerModule],
  templateUrl: './qrSeleccionArchivo.html'
})
export class AppComponent {
  // Declara una referencia al elemento canvas en el template
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  // Variable para almacenar los datos escaneados del código QR
  scannedData: string | null = null;
  
  // Variable para almacenar el DNI extraído del código QR
  extractedDni: string | null = null;

  // Método que se ejecuta cuando se selecciona un archivo
  onFileSelected(event: any): void {
    // Obtiene el archivo seleccionado
    const file = event.target.files[0];
    
    // Verifica si se seleccionó un archivo
    if (file) {
      // Crea un nuevo objeto FileReader para leer el archivo
      const reader = new FileReader();
      
      // Define qué hacer cuando el archivo se carga completamente
      reader.onload = (e: any) => {
        // Crea un nuevo objeto Image
        const img = new Image();
        
        // Define qué hacer cuando la imagen se carga completamente
        img.onload = () => {
          // Obtiene la referencia al elemento canvas
          const canvas = this.canvas.nativeElement;
          
          // Ajusta el tamaño del canvas al tamaño de la imagen
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Obtiene el contexto 2D del canvas
          const ctx = canvas.getContext('2d');
          
          // Verifica si se obtuvo el contexto correctamente
          if (ctx) {
            // Dibuja la imagen en el canvas
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // Obtiene los datos de la imagen del canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Utiliza la librería jsQR para intentar detectar un código QR en la imagen
            const code = '';//jsQR(imageData.data, imageData.width, imageData.height);
            
            // Verifica si se detectó un código QR
            if (code) {
              // Almacena los datos del código QR
              this.scannedData = code; //seria code.data
              
              // Extrae el DNI de los datos del código QR
              this.extractedDni = this.extractDni(code); //seria code.data
              
              console.log('Código escaneado:', this.scannedData);
              console.log('DNI extraído:', this.extractedDni);
            } else {
              console.log('No se pudo detectar un código QR');
            }
          }
        };
        
        // Establece la fuente de la imagen como el resultado de la lectura del archivo
        img.src = e.target.result;
      };
      
      // Inicia la lectura del archivo como una URL de datos
      reader.readAsDataURL(file);
    }
  }

  // Método para extraer el DNI del código escaneado
  extractDni(code: string): string | null {
    // Verifica si el código contiene '@' (formato de código de barras del DNI)
    if (code.includes('@')) {
      // Divide el código por '@' y toma la última parte (el DNI)
      const parts = code.split('@');
      return parts[parts.length - 1];
    } else {
      // Si no contiene '@', asume que es un QR generado por el sistema
      // Divide el código por ',' y toma la última parte (el DNI)
      const parts = code.split(',');
      return parts[parts.length - 1];
    }
  }

}
// Esto es utilizando la libreria de ZXing
  // allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128];
  // scannedData: string | null = null;
  // extractedDni: string | null = null;

  // onScanSuccess(result: string) {
  //   this.scannedData = result;
  //   this.extractedDni = this.extractDni(result);
  //   console.log('Código escaneado:', result);
  //   console.log('DNI extraído:', this.extractedDni);
  // }

  // extractDni(code: string): string | null {
  //   if (code.includes('@')) {
  //     // Es un código de barras del DNI
  //     const parts = code.split('@');
  //     return parts[parts.length - 1];
  //   } else {
  //     // Es un QR generado por ustedes
  //     const parts = code.split(',');
  //     return parts[parts.length - 1];
  //   }


//}