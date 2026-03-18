import Link from 'next/link'

type MVPPlaceholderPageProps = {
  title: string
  description: string
  backHref: string
  todo: string
}

export default function MVPPlaceholderPage({
  title,
  description,
  backHref,
  todo,
}: MVPPlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-6">
          <Link className="text-sm font-medium text-blue-600 hover:text-blue-700" href={backHref}>
            ← Back
          </Link>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{description}</p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            TODO: {todo}
          </div>
        </div>
      </div>
    </div>
  )
}
