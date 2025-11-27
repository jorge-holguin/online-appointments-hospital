"use client"

interface ChatMessageOptionsProps {
  options: Array<{
    id: string
    label: string
    value: string
    description?: string
  }>
  onSelect: (value: string) => void
}

/**
 * Componente para mostrar opciones/botones en el chat
 * Similar a botones de selección múltiple
 */
export default function ChatMessageOptions({ options, onSelect }: ChatMessageOptionsProps) {
  return (
    <div className="flex flex-col gap-2 my-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.value)}
          className="bg-white hover:bg-[#3e92cc] hover:text-white border-2 border-[#3e92cc] text-[#3e92cc] rounded-lg px-4 py-3 text-left transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <div className="font-semibold text-sm md:text-base">
            {option.label}
          </div>
          {option.description && (
            <div className="text-xs mt-1 opacity-70 group-hover:opacity-100">
              {option.description}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
