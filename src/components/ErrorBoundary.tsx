import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="h-20 w-20 rounded-3xl bg-rose-500/20 flex items-center justify-center mb-6 border border-rose-500/30">
            <AlertTriangle className="h-10 w-10 text-rose-400" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Something went wrong</h1>
          <p className="text-white/60 max-w-md mb-8">
            The Voter Intelligence Network encountered an unexpected error. Don't worry, your data is secure.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
          >
            <RefreshCcw className="h-4 w-4" />
            Restart Simulation
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
