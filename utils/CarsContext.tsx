import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
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
  refreshKey: number
}

const CarsContext = createContext<CarsContextValue | null>(null)

export function CarsProvider({ children }: { children: React.ReactNode }) {
  const [cars, setCars] = useState<Car[]>([])
  const [activeCarId, setActiveCarId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // 1. Добавили состояние для даты
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const saved = await loadSavedCars()
      if (saved && saved.length) {
        setCars(saved)
        setActiveCarId(saved[0].id)
        // 2. Берем дату из файла при старте
        setLastUpdated(getStorageModifiedTime())
      }
      setLoading(false)
    })()
  }, [])

  // 3. Заменили функцию loadFromFile
  const loadFromFile = async () => {
    setLoading(true)
    try {
      const data = await pickAndSaveCars()
      if (data && data.length) {
        setCars(data)
        setActiveCarId(data[0].id)
        setRefreshKey((k) => k + 1)
        setLastUpdated(Date.now()) // Обновляем дату вручную
      }
    } finally {
      setLoading(false) // Выключаем загрузку при любом исходе
    }
  }

  const activeCar = useMemo(
    () => cars.find((c) => c.id === activeCarId) ?? null,
    [cars, activeCarId],
  )

  // 4. Удалили старый useMemo для lastUpdated

  const value = useMemo(
    () => ({
      cars,
      activeCarId,
      setActiveCarId,
      activeCar,
      loadFromFile,
      loading,
      lastUpdated,
      refreshKey,
    }),
    [cars, activeCarId, activeCar, loading, lastUpdated, refreshKey],
  )

  return <CarsContext.Provider value={value}>{children}</CarsContext.Provider>
}

export function useCars() {
  const ctx = useContext(CarsContext)
  if (!ctx) throw new Error('useCars должен быть внутри CarsProvider')
  return ctx
}
