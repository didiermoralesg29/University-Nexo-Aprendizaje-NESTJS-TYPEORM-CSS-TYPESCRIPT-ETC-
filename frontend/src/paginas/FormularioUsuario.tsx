import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api, textoDeError } from '../api/cliente'
import type { Programa, Usuario } from '../api/tipos'
import { useDatos } from '../hooks/useDatos'
import { Aviso } from '../componentes/Aviso'
import { Cargando } from '../componentes/Cargando'

type RolGestionado = 'estudiante' | 'profesor'

// Registrar (sin :id) o editar (con :id) un estudiante o profesor. Solo rector.
// Paso 1: si estamos editando, cargamos el usuario.
export function FormularioUsuario({ rol }: { rol: RolGestionado }) {
  const { id } = useParams()
  const existente = useDatos<Usuario>(id ? `/usuarios/${id}` : null)

  if (existente.cargando) return <Cargando />
  if (existente.error) return <Aviso>{existente.error}</Aviso>
  // Paso 2: mostramos el formulario con los datos ya cargados como valores iniciales.
  // "key" hace que React cree un formulario NUEVO si cambiamos de usuario.
  return <Formulario key={id ?? 'nuevo'} rol={rol} inicial={existente.datos} />
}

function Formulario({ rol, inicial }: { rol: RolGestionado; inicial: Usuario | null }) {
  const editando = inicial !== null
  const id = inicial?.id
  const esEstudiante = rol === 'estudiante'
  const base = esEstudiante ? '/estudiantes' : '/profesores'
  const navegar = useNavigate()
  const programas = useDatos<Programa[]>(esEstudiante ? '/programas' : null)

  // Cada campo empieza con el valor del usuario (o vacío si es nuevo)
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [email, setEmail] = useState(inicial?.email ?? '')
  const [contrasena, setContrasena] = useState('')
  const [documento, setDocumento] = useState(inicial?.documento ?? '')
  const [telefono, setTelefono] = useState(inicial?.telefono ?? '')
  const [codigo, setCodigo] = useState(inicial?.codigo ?? '')
  const [programaId, setProgramaId] = useState(inicial?.programa ? String(inicial.programa.id) : '')
  const [semestre, setSemestre] = useState(String(inicial?.semestre ?? 1))
  const [departamento, setDepartamento] = useState(inicial?.departamento ?? '')
  const [activo, setActivo] = useState(inicial?.activo ?? true)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setGuardando(true)

    // Solo enviamos los campos que aplican y que tienen valor
    const datos: Record<string, unknown> = { nombre, email }
    if (contrasena) datos.contrasena = contrasena
    if (documento) datos.documento = documento
    if (telefono) datos.telefono = telefono
    if (esEstudiante) {
      datos.programaId = Number(programaId)
      datos.semestre = Number(semestre)
      if (codigo) datos.codigo = codigo
    } else if (departamento) {
      datos.departamento = departamento
    }
    if (editando) datos.activo = activo
    else datos.rol = rol

    try {
      const guardado = editando
        ? await api<Usuario>(`/usuarios/${id}`, { metodo: 'PATCH', cuerpo: datos })
        : await api<Usuario>('/usuarios', { metodo: 'POST', cuerpo: datos })
      const accion = editando ? 'actualizado' : 'registrado'
      navegar(base, { state: { mensaje: `${guardado.nombre} fue ${accion} correctamente` } })
    } catch (e) {
      setError(textoDeError(e))
      setGuardando(false)
    }
  }

  const titulo = `${editando ? 'Editar' : 'Registrar'} ${esEstudiante ? 'estudiante' : 'profesor'}`

  return (
    <>
      <Link to={base} className="volver">
        ← Volver
      </Link>
      <h1>{titulo}</h1>

      <form className="tarjeta formulario" onSubmit={enviar}>
        <Aviso>{error ?? programas.error}</Aviso>

        <div className="campos">
          <label className="campo campo-ancho">
            Nombre completo
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </label>
          <label className="campo campo-ancho">
            Correo institucional
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nombre.apellido@nexo.edu.co"
            />
          </label>
          <label className="campo">
            {editando ? 'Nueva contraseña' : 'Contraseña'}
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required={!editando}
              minLength={6}
              placeholder={editando ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
              autoComplete="new-password"
            />
          </label>
          <label className="campo">
            Documento
            <input value={documento} onChange={(e) => setDocumento(e.target.value)} />
          </label>
          <label className="campo">
            Teléfono
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </label>

          {esEstudiante ? (
            <>
              <label className="campo campo-ancho">
                Programa
                <select value={programaId} onChange={(e) => setProgramaId(e.target.value)} required>
                  <option value="">Elige un programa…</option>
                  {programas.datos?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="campo">
                Semestre
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={semestre}
                  onChange={(e) => setSemestre(e.target.value)}
                  required
                />
              </label>
              <label className="campo">
                Código estudiantil
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Automático si se deja vacío"
                />
              </label>
            </>
          ) : (
            <label className="campo campo-ancho">
              Departamento
              <input
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Ej: Ingeniería"
              />
            </label>
          )}

          {editando && (
            <label className="campo campo-casilla campo-completo">
              <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
              Activo (si lo desmarcas, no podrá iniciar sesión)
            </label>
          )}
        </div>

        <div className="acciones">
          <button type="submit" className="boton" disabled={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar'}
          </button>
          <Link to={base} className="boton boton-secundario">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  )
}
