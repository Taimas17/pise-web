import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type Props = { children: ReactNode };

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('UI ErrorBoundary caught an error', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Une erreur est survenue</AlertTitle>
              <AlertDescription>
                <p className="mb-3">{this.state.error?.message || 'Veuillez réessayer plus tard.'}</p>
                <Button variant="outline" onClick={this.handleReload}>Recharger la page</Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
