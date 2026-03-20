import { DIAGRAM_CONFIGS } from '../../components/diagrams/configs'
import { ArchitectureDiagram } from '../../components/diagrams/ArchitectureDiagram'

export const metadata = {
  title: 'Architecture Diagrams | DEJA.js',
  description: 'System architecture diagrams for the DEJA.js model railroad control platform',
}

export default function DiagramsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Architecture Diagrams</h1>
        <p className="text-gray-400 mb-10">
          System topology diagrams for different DEJA.js configurations. Navigate to{' '}
          <code className="text-cyan-400">/diagrams/[variant]</code> for a full-screen export view.
        </p>

        <div className="grid grid-cols-1 gap-12">
          {DIAGRAM_CONFIGS.map(config => (
            <div
              key={config.id}
              className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{config.label}</h2>
                <a
                  href={`/diagrams/${config.id}`}
                  className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Full view →
                </a>
              </div>
              <ArchitectureDiagram config={config} className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
