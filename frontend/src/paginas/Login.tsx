import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { textoDeError } from '../api/cliente'
import { useAuth } from '../auth/useAuth'
import { Aviso } from '../componentes/Aviso'

// Cuentas de ejemplo creadas por la semilla del backend (contraseña: nexo123)
const CUENTAS_DEMO = [
  { rol: 'Rector', email: 'rector@nexo.edu.co' },
  { rol: 'Profesor', email: 'ana.gomez@nexo.edu.co' },
  { rol: 'Estudiante', email: 'sofia.martinez@nexo.edu.co' },
]

export function Login() {
  const { usuario, iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // Si ya hay sesión, no tiene sentido ver el login
  if (usuario) return <Navigate to="/" replace />

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(email, contrasena)
      // Volvemos a la página que intentaba abrir (o al inicio)
      const desde = (ubicacion.state as { desde?: string } | null)?.desde ?? '/'
      navegar(desde, { replace: true })
    } catch (e) {
      setError(textoDeError(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <form className="tarjeta login-tarjeta" onSubmit={enviar}>
        <div className="login-marca">
          <span className="marca-logo" aria-hidden="true">
            N
          </span>
          <div>
            <h1>Nexo University</h1>
            <p className="texto-suave">Plataforma académica</p>
          </div>
        </div>

        <Aviso>{error}</Aviso>

        <label className="campo">
          Correo institucional
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            placeholder="nombre@nexo.edu.co"
          />
        </label>
        <label className="campo">
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="boton boton-bloque" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <div className="login-demo">
          <p className="texto-suave texto-pequeno">
            Cuentas de prueba (contraseña <code>nexo123</code>):
          </p>
          <div className="acciones">
            {CUENTAS_DEMO.map((cuenta) => (
              <button
                key={cuenta.email}
                type="button"
                className="boton boton-secundario boton-pequeno"
                onClick={() => {
                  setEmail(cuenta.email)
                  setContrasena('nexo123')
                }}
              >
                {cuenta.rol}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}
