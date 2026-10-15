import * as Clipboard from 'expo-clipboard'
import { useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useCars } from '../../../../utils/CarsContext'

export default function Main() {
  const { activeCar } = useCars()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!activeCar) return null

  const copyPart = async (id: string, text: string) => {
    await Clipboard.setStringAsync(text)
    setCopiedId(id)

    // Сбрасываем предыдущий таймер, если он ещё не сработал
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <View style={styles.main}>
      <View style={styles.rowHeader}>
        <Text style={[styles.cell, styles.colYear, styles.headerText]}>
          Год
        </Text>
        <Text style={[styles.cell, styles.colMileage, styles.headerText]}>
          Пробег
        </Text>
        <Text style={[styles.cell, styles.colPart, styles.headerText]}>
          Запчасть / работа
        </Text>
      </View>

      <FlatList
        data={activeCar.records}
        keyExtractor={(item) => item.id}
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
                <Text style={[styles.cell, styles.colPart]}>{item.part}</Text>
                {isCopied && <Text style={styles.copiedHint}>Скопировано</Text>}
              </Pressable>
            </View>
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
})
