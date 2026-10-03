import React, { Component, ErrorInfo, ReactNode } from "react";
import { ErrorNote } from "./ui";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
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
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
          <ErrorNote message={this.state.error?.message || "Unknown rendering error."} />
          <pre className="mt-4 p-4 bg-stone-100 rounded text-xs overflow-auto">
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-stone-900 text-white px-4 py-2 rounded"
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
