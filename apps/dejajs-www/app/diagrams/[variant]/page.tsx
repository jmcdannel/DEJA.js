import { notFound } from 'next/navigation'
import { CONFIG_MAP, DIAGRAM_CONFIGS } from '../../../components/diagrams/configs'
import { ArchitectureDiagram } from '../../../components/diagrams/ArchitectureDiagram'

interface PageProps {
  params: Promise<{ variant: string }>
}

export function generateStaticParams() {
  return DIAGRAM_CONFIGS.map(c => ({ variant: c.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const { variant } = await params
  const config = CONFIG_MAP[variant]
  return {
    title: config ? `${config.label} Architecture | DEJA.js` : 'Diagram | DEJA.js',
  }
}

export default async function DiagramVariantPage({ params }: PageProps) {
  const { variant } = await params
  const config = CONFIG_MAP[variant]

  if (!config) return notFound()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-8">
      <div className="mb-6 text-sm text-gray-500 flex items-center gap-2 self-start max-w-4xl w-full">
        <a href="/diagrams" className="hover:text-gray-300 transition-colors">
          ← All diagrams
        </a>
        <span>/</span>
        <span className="text-gray-300 font-medium">{config.label}</span>
      </div>

      <div className="max-w-4xl w-full">
        <ArchitectureDiagram config={config} width={860} className="w-full max-w-full" />
      </div>
    </div>
  )
}
