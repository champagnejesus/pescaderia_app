"use client"
import { Component, type ReactNode } from "react"
interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-8 text-center">
          <h2 className="text-title-medium text-abyssal-red mb-2">Algo salió mal</h2>
          <p className="text-body-medium text-abyssal-text-secondary">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 px-4 py-2 bg-abyssal-primary text-white rounded-xl">
            Reintentar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
