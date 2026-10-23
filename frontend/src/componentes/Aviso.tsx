// Mensaje de error (rojo) o de éxito (verde). Si no hay texto, no muestra nada.
export function Aviso({
  tipo = 'error',
  children,
}: {
  tipo?: 'error' | 'exito'
  children: string | null | undefined
}) {
  if (!children) return null
  return (
    <p className={`aviso aviso-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  )
}
