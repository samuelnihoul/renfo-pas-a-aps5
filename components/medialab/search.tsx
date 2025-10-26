"use client"

import { Search as SearchIcon, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useDebounce } from "use-debounce"
import Link from "next/link"

interface Exercise {
  id: number
  name: string
  description: string
  instructions: string
  difficulty: string
  muscleGroup: string
  videoUrl?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

interface SearchResultsProps {
  results: Exercise[]
  onResultClick: () => void
}

const SearchResults = ({ results, onResultClick }: SearchResultsProps) => (
  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-96 overflow-y-auto">
    {results.length > 0 ? (
      <ul className="py-1">
        {results.map((exercise) => (
          <li key={exercise.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            <Link 
              href={`/mediatheque/${exercise.muscleGroup.toLowerCase()}/${exercise.id}`}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200"
              onClick={onResultClick}
            >
              <div className="font-medium">{exercise.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {exercise.muscleGroup} • {exercise.difficulty || 'Tous niveaux'}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        Aucun exercice trouvé
      </div>
    )}
  </div>
)

export function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery] = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [searchRef])

  // Search when query changes
  useEffect(() => {
    const searchExercises = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        setIsOpen(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/exercises/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (!response.ok) throw new Error('Erreur lors de la recherche')
        const data = await response.json()
        setResults(data)
        setIsOpen(data.length > 0)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchExercises()
  }, [debouncedQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (e.target.value.trim()) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Rechercher un exercice..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>
      
      {isOpen && (
        <SearchResults 
          results={results} 
          onResultClick={() => {
            setIsOpen(false)
            setQuery("")
          }} 
        />
      )}
    </div>
  )
}
