import { Link } from 'react-router'

export function NoEncontrada() {
  return (
    <div className="tarjeta vacio">
      <h1>Página no encontrada</h1>
      <p className="texto-suave">La dirección que escribiste no existe.</p>
      <Link to="/" className="boton">
        Ir al inicio
      </Link>
    </div>
  )
}
