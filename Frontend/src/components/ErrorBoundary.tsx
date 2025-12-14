import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error }

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: any) {
        console.error('ErrorBoundary caught an error:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded max-w-4xl mx-auto my-4">
                    <div className="font-semibold">Something went wrong.</div>
                    <div className="text-sm mt-2">An unexpected error occurred while rendering this part of the app. Check the console for details.</div>
                </div>
            )
        }
        return this.props.children
    }
}
