import React, { createContext, useContext, useEffect, useState } from 'react'
import { Car, loadSavedCars, pickAndSaveCars } from './carsStorage'

type CarsContextValue = {
  cars: Car[]
  activeCarId: string | null
  setActiveCarId: (id: string) => void
  activeCar: Car | null
  loadFromFile: () => Promise<void>
  loading: boolean
}

const CarsContext = createContext<CarsContextValue | null>(null)

export function CarsProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([])
  const [activeCarId, setActiveCarId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // При старте — пытаемся загрузить сохранённый файл
  useEffect(() => {
    ;(async () => {
      const saved = await loadSavedCars()
      if (saved && saved.length) {
        setCars(saved)
        setActiveCarId(saved[0].id)
      }
      setLoading(false)
    })()
  }, [])

  const loadFromFile = async () => {
    setLoading(true)
    const data = await pickAndSaveCars()
    if (data && data.length) {
      setCars(data)
      setActiveCarId(data[0].id)
    }
    setLoading(false)
  }

  const activeCar = cars.find((c) => c.id === activeCarId) ?? null

  return (
    <CarsContext.Provider
      value={{
        cars,
        activeCarId,
        setActiveCarId,
        activeCar,
        loadFromFile,
        loading,
      }}
    >
      {children}
    </CarsContext.Provider>
  )
}

export function useCars() {
  const ctx = useContext(CarsContext)
  if (!ctx) throw new Error('useCars должен быть внутри CarsProvider')
  return ctx
}
