import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  Car,
  getStorageModifiedTime,
  loadSavedCars,
  pickAndSaveCars,
} from './carsStorage'

type CarsContextValue = {
  cars: Car[]
  activeCarId: string | null
  setActiveCarId: (id: string) => void
  activeCar: Car | null
  loadFromFile: () => Promise<void>
  loading: boolean
  lastUpdated: number | null
}

const CarsContext = createContext<CarsContextValue | null>(null)

export function CarsProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([])
  const [activeCarId, setActiveCarId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  // Триггер для пересчёта lastUpdated после загрузки
  const [refreshKey, setRefreshKey] = useState(0)

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
      setRefreshKey((k) => k + 1) // форсируем пересчёт lastUpdated
    }
    setLoading(false)
  }

  const activeCar = cars.find((c) => c.id === activeCarId) ?? null

  // Читаем время изменения файла при каждом рендере.
  // refreshKey в зависимостях заставляет пересчитать после загрузки.
  const lastUpdated = React.useMemo(
    () => getStorageModifiedTime(),
    [refreshKey, cars.length],
  )

  return (
    <CarsContext.Provider
      value={{
        cars,
        activeCarId,
        setActiveCarId,
        activeCar,
        loadFromFile,
        loading,
        lastUpdated,
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
