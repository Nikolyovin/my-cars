import * as DocumentPicker from 'expo-document-picker'
import { File, Paths } from 'expo-file-system'
import * as XLSX from 'xlsx'

export type ServiceRecord = {
  id: string
  year: string
  mileage: string
  part: string
}

export type Car = {
  id: string
  name: string
  year: string
  vin: string
  plate: string
  records: ServiceRecord[]
}

// Файл-хранилище в documentDirectory
const STORAGE_FILE = new File(Paths.document, 'cars.xlsx')

// Парсим один лист Excel в объект Car
function parseSheet(sheetName: string, sheet: XLSX.WorkSheet): Car {
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
  })

  const meta: Record<string, string> = {}
  let tableStartIndex = 0

  for (let i = 0; i < rows.length; i++) {
    const [key, value] = rows[i]
    // Метаданные: name, vin, plate — пары ключ/значение
    if (
      typeof key === 'string' &&
      typeof value === 'string' &&
      key !== 'year'
    ) {
      meta[key.trim()] = value.trim()
    }
    // Заголовок таблицы: year | mileage | part
    else if (key === 'year' && value === 'mileage') {
      tableStartIndex = i + 1
      break
    }
  }

  const records: ServiceRecord[] = rows
    .slice(tableStartIndex)
    .filter((row) => row.length >= 3 && row[0])
    .map((row, i) => ({
      id: `${sheetName}-${i}`,
      year: String(row[0] ?? ''),
      mileage: String(row[1] ?? ''),
      part: String(row[2] ?? ''),
    }))

  return {
    id: `${sheetName}-${Date.now()}`, // <-- ДОБАВИТЬ Date.now()
    name: meta['name'] || sheetName,
    year: meta['year'] || '',
    vin: meta['vin'] || '',
    plate: meta['plate'] || '',
    records,
  }
}

// Парсим весь Excel-файл из base64
export function parseWorkbook(base64: string): Car[] {
  const workbook = XLSX.read(base64, { type: 'base64' })
  return workbook.SheetNames.map((name) =>
    parseSheet(name, workbook.Sheets[name]),
  )
}

// Возвращает время последнего изменения файла в мс, или null
export function getStorageModifiedTime(): number | null {
  try {
    if (!STORAGE_FILE.exists) return null
    // modificationTime устарел, используем lastModified
    return STORAGE_FILE.lastModified ?? null
  } catch {
    return null
  }
}

// Проверяем, есть ли сохранённый файл, и читаем его
export async function loadSavedCars(): Promise<Car[] | null> {
  try {
    if (!STORAGE_FILE.exists) return null

    const base64 = await STORAGE_FILE.base64()
    return parseWorkbook(base64)
  } catch (e) {
    console.warn('Не удалось загрузить сохранённый файл', e)
    return null
  }
}

// Выбор файла пользователем и сохранение в documentDirectory
export async function pickAndSaveCars(): Promise<Car[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      copyToCacheDirectory: true,
    })

    if (result.canceled) return null

    // 1. Сначала читаем выбранный файл из кэша
    const pickedFile = new File(result.assets[0].uri)
    const base64 = await pickedFile.base64()
    const cars = parseWorkbook(base64)

    // 2. Потом копируем в documentDirectory для сохранения между запусками
    if (STORAGE_FILE.exists) STORAGE_FILE.delete()
    pickedFile.copy(STORAGE_FILE)

    // 3. Принудительно обновляем дату модификации файла
    // (при копировании сохраняется старая дата исходного файла)
    // const base64ToOverwrite = await STORAGE_FILE.base64()
    // STORAGE_FILE.write(base64ToOverwrite, { encoding: 'base64' })

    return cars
  } catch (e) {
    console.warn('Не удалось загрузить файл', e)
    return null
  }
}
