import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useCars } from '../../../../utils/CarsContext'

type SortOrder = 'desc' | 'asc'

export default function Main() {
  const { activeCar, refreshKey } = useCars()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [searchQuery, setSearchQuery] = useState('') // ← новое
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // При смене машины сбрасываем поиск
  useEffect(() => {
    setSearchQuery('')
  }, [activeCar?.id])

  if (!activeCar) return null

  // 1. Фильтруем по запросу
  const filteredRecords = activeCar.records.filter((item) =>
    item.part.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // 2. Сортируем отфильтрованные записи
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    const diff = Number(b.year) - Number(a.year)
    return sortOrder === 'desc' ? diff : -diff
  })

  const toggleSort = async () => {
    await Haptics.selectionAsync()
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const copyPart = async (id: string, text: string) => {
    await Clipboard.setStringAsync(text)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setCopiedId(id)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <View style={styles.main}>
      {/* Поле поиска */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder='Поиск по запчастям...'
          placeholderTextColor='#6a6a6a'
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          clearButtonMode='while-editing' // для iOS
        />
      </View>

      <View style={styles.rowHeader}>
        <Pressable onPress={toggleSort} style={styles.colYear}>
          <Text style={[styles.headerText, styles.sortableHeader]}>
            Год {sortOrder === 'desc' ? '▼' : '▲'}
          </Text>
        </Pressable>
        <Text style={[styles.cell, styles.colMileage, styles.headerText]}>
          Пробег
        </Text>
        <Text style={[styles.cell, styles.colPart, styles.headerText]}>
          Запчасть / работа
        </Text>
      </View>

      <FlatList
        key={`${activeCar.id}-${refreshKey}-${searchQuery}`} // поиск тоже влияет на пересоздание
        data={sortedRecords}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Ничего не найдено' : 'Записей пока нет'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Попробуйте изменить запрос'
                : 'Добавьте данные в Excel-файл и обновите его'}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const isCopied = copiedId === item.id
          return (
            <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
              <Text style={[styles.cell, styles.colYear]}>{item.year}</Text>
              <Text style={[styles.cell, styles.colMileage]}>
                {Number(item.mileage).toLocaleString('ru-RU')}
              </Text>
              <Pressable
                onPress={() => copyPart(item.id, item.part)}
                style={styles.partCell}
              >
                <Text
                  style={[
                    styles.cell,
                    styles.colPart,
                    isCopied && styles.copiedText,
                  ]}
                >
                  {item.part}
                </Text>
              </Pressable>
            </View>
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled' // чтобы тап по элементу списка работал при открытой клавиатуре
      />
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: '#373737',
    width: '95%',
    borderRadius: 16,
    alignSelf: 'center',
    paddingVertical: 12,
    overflow: 'hidden',
    marginTop: 15,
    flex: 1,
  },

  // Поиск
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#3f3f3f',
  },

  rowHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4a4a4a',
    marginBottom: 4,
  },
  headerText: {
    color: '#9a9a9a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  rowEven: {
    backgroundColor: '#3f3f3f',
  },
  separator: {
    height: 1,
    backgroundColor: '#4a4a4a',
    marginHorizontal: 16,
  },
  cell: {
    color: '#fff',
    fontSize: 13,
  },
  colYear: { width: 60 },
  colMileage: { width: 110 },
  colPart: { flex: 1 },

  partCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  copiedHint: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 8,
  },

  listContent: { paddingBottom: 8 },
  sortableHeader: {
    textDecorationLine: 'underline',
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: '#bfbfbf',
    fontSize: 15,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: '#6a6a6a',
    fontSize: 12,
    textAlign: 'center',
  },
  copiedText: {
    color: '#22c55e',
  },
})
