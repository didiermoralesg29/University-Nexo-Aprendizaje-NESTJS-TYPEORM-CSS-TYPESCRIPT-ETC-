// Genera un archivo CSV que se abre en Excel y lo descarga en el navegador.
type Celda = string | number | null | undefined

export function descargarCsv(nombreArchivo: string, filas: Celda[][]) {
  const texto = filas.map((fila) => fila.map(formatearCelda).join(';')).join('\r\n')

  // El BOM (marca de orden de bytes) le dice a Excel que el archivo es UTF-8, para que respete las tildes
  const archivo = new Blob([String.fromCharCode(0xfeff) + texto], { type: 'text/csv;charset=utf-8' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(archivo)
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

// Excel en español usa ';' para separar columnas y ',' para los decimales
function formatearCelda(celda: Celda): string {
  if (celda === null || celda === undefined) return ''
  if (typeof celda === 'number') return String(celda).replace('.', ',')
  // Si el texto tiene ; comillas o saltos de línea, va entre comillas
  if (/[;"\n]/.test(celda)) return `"${celda.replaceAll('"', '""')}"`
  return celda
}
