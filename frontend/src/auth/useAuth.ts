import { useContext } from 'react'
import { ContextoAuth } from './contexto'

// Uso en cualquier componente: const { usuario, cerrarSesion } = useAuth()
export function useAuth() {
  const valor = useContext(ContextoAuth)
  if (!valor) {
    throw new Error('useAuth() debe usarse dentro de <AuthProvider>')
  }
  return valor
}
