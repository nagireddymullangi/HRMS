import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle={this.state.error?.message}
            extra={[
              <Button
                key="reload"
                type="primary"
                onClick={() => window.location.reload()}
                style={{ borderRadius: 10 }}
              >
                Reload Page
              </Button>,
            ]}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;