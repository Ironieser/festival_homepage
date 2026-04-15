interface TagFilterProps {
  tags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onReset: () => void
}

export function TagFilter({
  tags,
  selectedTags,
  onToggleTag,
  onReset,
}: TagFilterProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#e7f5ff]">
          风格筛选
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-[#f4e1a3] underline-offset-2 hover:underline"
        >
          清空
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? 'border-[#f2e6bf] bg-[#f2e6bf] text-[#3f6d86]'
                  : 'border-sky-100/35 bg-[#3d7da1] text-sky-50 hover:border-sky-100/60'
              }`}
              aria-pressed={active}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </section>
  )
}
