import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || '';
      const isPermissionError = errorMessage.includes('Missing or insufficient permissions');

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-4">
              {isPermissionError ? 'Database Access Denied' : 'Something went wrong'}
            </h1>
            
            {isPermissionError ? (
              <div className="text-zinc-400 space-y-4 text-sm text-left">
                <p>
                  Your app is trying to read data from Firebase, but the security rules are blocking it.
                </p>
                <p>
                  Since you manually configured Firebase, you need to update the rules in your Firebase Console:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-zinc-300">
                  <li>Go to the <strong>Firebase Console</strong></li>
                  <li>Open your project (<strong>promptxp-93dc7</strong>)</li>
                  <li>Click <strong>Firestore Database</strong> in the left menu</li>
                  <li>Go to the <strong>Rules</strong> tab</li>
                  <li>Paste the correct rules that allow reading collections</li>
                  <li>Click <strong>Publish</strong></li>
                </ol>
                <p className="mt-4 text-xs text-zinc-500">
                  After publishing, refresh this page.
                </p>
              </div>
            ) : (
              <p className="text-zinc-400">
                An unexpected error occurred. Please try refreshing the page.
              </p>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="mt-8 w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
