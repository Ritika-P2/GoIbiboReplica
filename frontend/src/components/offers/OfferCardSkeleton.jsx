export default function OfferCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      <div className="h-28 bg-gray-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-gray-200 rounded-full" />
        <div className="h-4 w-3/4 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
