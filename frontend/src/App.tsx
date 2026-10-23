import { Route, Routes } from 'react-router'
import { RutaProtegida } from './auth/RutaProtegida'
import { Layout } from './componentes/Layout'
import { Login } from './paginas/Login'
import { Panel } from './paginas/Panel'
import { Clases } from './paginas/Clases'
import { ClaseDetalle } from './paginas/ClaseDetalle'
import { Inscripcion } from './paginas/Inscripcion'
import { Boletin } from './paginas/Boletin'
import { ListaUsuarios } from './paginas/ListaUsuarios'
import { FormularioUsuario } from './paginas/FormularioUsuario'
import { Academico } from './paginas/Academico'
import { Material } from './paginas/Material'
import { Reportes } from './paginas/Reportes'
import { ReporteClase } from './paginas/ReporteClase'
import { Perfil } from './paginas/Perfil'
import { NoEncontrada } from './paginas/NoEncontrada'

// Mapa de páginas: cada <Route> une una dirección con un componente.
// "roles" limita quién puede abrir la página (el backend vuelve a revisarlo).
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Todas estas páginas comparten el Layout (barra + menú) y piden sesión */}
      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route index element={<Panel />} />
        <Route path="clases" element={<Clases />} />
        <Route path="clases/:id" element={<ClaseDetalle />} />
        <Route path="material" element={<Material />} />
        <Route path="perfil" element={<Perfil />} />

        {/* Solo estudiantes */}
        <Route
          path="inscripcion"
          element={
            <RutaProtegida roles={['estudiante']}>
              <Inscripcion />
            </RutaProtegida>
          }
        />
        <Route
          path="mis-notas"
          element={
            <RutaProtegida roles={['estudiante']}>
              <Boletin />
            </RutaProtegida>
          }
        />

        {/* Profesores y rector */}
        <Route
          path="reportes"
          element={
            <RutaProtegida roles={['profesor', 'rector']}>
              <Reportes />
            </RutaProtegida>
          }
        />
        <Route
          path="reportes/clases/:id"
          element={
            <RutaProtegida roles={['profesor', 'rector']}>
              <ReporteClase />
            </RutaProtegida>
          }
        />

        {/* Solo rector */}
        <Route
          path="estudiantes"
          element={
            <RutaProtegida roles={['rector']}>
              <ListaUsuarios rol="estudiante" />
            </RutaProtegida>
          }
        />
        <Route
          path="estudiantes/nuevo"
          element={
            <RutaProtegida roles={['rector']}>
              <FormularioUsuario rol="estudiante" />
            </RutaProtegida>
          }
        />
        <Route
          path="estudiantes/:id"
          element={
            <RutaProtegida roles={['rector']}>
              <FormularioUsuario rol="estudiante" />
            </RutaProtegida>
          }
        />
        <Route
          path="estudiantes/:id/boletin"
          element={
            <RutaProtegida roles={['rector']}>
              <Boletin />
            </RutaProtegida>
          }
        />
        <Route
          path="profesores"
          element={
            <RutaProtegida roles={['rector']}>
              <ListaUsuarios rol="profesor" />
            </RutaProtegida>
          }
        />
        <Route
          path="profesores/nuevo"
          element={
            <RutaProtegida roles={['rector']}>
              <FormularioUsuario rol="profesor" />
            </RutaProtegida>
          }
        />
        <Route
          path="profesores/:id"
          element={
            <RutaProtegida roles={['rector']}>
              <FormularioUsuario rol="profesor" />
            </RutaProtegida>
          }
        />
        <Route
          path="academico"
          element={
            <RutaProtegida roles={['rector']}>
              <Academico />
            </RutaProtegida>
          }
        />

        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  )
}
