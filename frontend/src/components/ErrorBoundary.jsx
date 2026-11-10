import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center">
                    <div className="card p-8 max-w-md space-y-4">
                        <h1 className="text-2xl font-serif font-bold text-ink">Something went wrong</h1>
                        <p className="text-sm text-umber">
                            Please tap below to reload Bangels Verse.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

