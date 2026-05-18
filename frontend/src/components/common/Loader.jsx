export default function Loader({ text = 'Loading...', fullPage = false }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  )
  if (fullPage) {
    return <div className="min-h-[60vh] flex items-center justify-center">{inner}</div>
  }
  return <div className="flex items-center justify-center py-12">{inner}</div>
}