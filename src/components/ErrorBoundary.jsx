import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Критическая ошибка:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-red-50 rounded-xl border border-red-200">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Произошла ошибка в калькуляторе</h2>
          <p className="text-gray-500 mb-6">Попробуйте изменить введенные данные.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;