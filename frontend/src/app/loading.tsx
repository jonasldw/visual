export default function Loading() {
  return (
    <div className="flex-1 flex flex-col">
      {/* TopBar placeholder */}
      <div className="h-16 bg-white border-b border-gray-200" />
      
      {/* Main content loading */}
      <main className="flex-1 p-4">
        <div className="bg-white overflow-hidden rounded-lg">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Lade Kundendaten...</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}