// FILE: src/pages/seller/components/SystemPanel.tsx

type System = {
    name: string;
    status: 'OK' | 'Warning' | 'Error';
    details: string;
    last_checked: string;
};

interface SystemPanelProps {
    systems?: System[];
}

export default function SystemPanel({ systems = [] }: SystemPanelProps) {
    return (
        <div className="card p-6 bg-white dark:bg-zinc-950 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">System Health Monitor</h3>
            <div className="grid md:grid-cols-3 gap-4">
                {systems.map((s: System) => (
                    <div key={s.name} className="p-4 border rounded-lg">
                        <div className="font-medium">{s.name}</div>
                        <div className={`mt-2 ${s.status === 'OK' ? 'text-green-500' : s.status === 'Warning' ? 'text-yellow-500' : 'text-red-500'}`}>{s.status}</div>
                        <div className="text-xs text-zinc-500 mt-2">{s.details}</div>
                        <div className="text-xs text-zinc-400 mt-2">Last checked: {s.last_checked}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}