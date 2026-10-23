export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="cargando" role="status">
      <span className="cargando-circulo" aria-hidden="true" />
      {texto}
    </div>
  )
}
