import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useCars } from '../../../../utils/CarsContext'

export default function Main() {
  const { activeCar } = useCars()

  if (!activeCar) return null

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
        renderItem={({ item, index }) => (
          <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
            <Text style={[styles.cell, styles.colYear]}>{item.year}</Text>
            <Text style={[styles.cell, styles.colMileage]}>
              {Number(item.mileage).toLocaleString('ru-RU')}
            </Text>
            <Text style={[styles.cell, styles.colPart]}>{item.part}</Text>
          </View>
        )}
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
  listContent: { paddingBottom: 8 },
})
