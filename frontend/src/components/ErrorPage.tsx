import React from 'react';

interface ErrorPageProps {
    message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message = 'Something went wrong' }) => {
    return (
        <div style={{
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Error</h1>
            <p style={{ fontSize: '18px', color: '#6c757d' }}>{message}</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Reload Page
            </button>
        </div>
    );
};

export default ErrorPage;
