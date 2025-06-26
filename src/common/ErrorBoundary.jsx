import React, { Component } from 'react';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';

const { FiAlertTriangle, FiRefreshCw, FiHome } = FiIcons;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={this.props.onRetry}
          navigate={this.props.navigate}
        />
      );
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry, navigate }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="text-2xl text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ocorreu um erro!</h2>
        <p className="text-gray-600 mb-4">
          Algo deu errado ao carregar esta página.
        </p>
        <div className="flex flex-col gap-3 mt-6">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <FiRefreshCw />
              Tentar novamente
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FiHome />
            Voltar para o início
          </button>
        </div>
      </div>
    </div>
  );
}

export function withErrorBoundary(WrappedComponent) {
  return function WithErrorBoundary(props) {
    const navigate = useNavigate();
    const [key, setKey] = React.useState(0);

    const handleRetry = () => {
      setKey(prevKey => prevKey + 1);
    };

    return (
      <ErrorBoundary key={key} navigate={navigate} onRetry={handleRetry}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

export default ErrorBoundary;