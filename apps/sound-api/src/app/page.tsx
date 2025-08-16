export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          DEJA Sound API
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          API for managing BBC sound effects from Vercel Blob
        </p>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Available Endpoints</h2>
            <div className="space-y-2 text-left">
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
                <span className="text-gray-700">/api/sounds</span>
                <span className="text-gray-500">- List all sound files</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">GET</span>
                <span className="text-gray-700">/api/sounds/[pathname]</span>
                <span className="text-gray-500">- Get specific sound file info</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
