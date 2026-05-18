export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${hover ? 'hover:shadow-md hover:border-blue-200 transition-all cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}