import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useCars } from '../../../../utils/CarsContext'

export default function Head() {
  const {
    cars,
    activeCarId,
    setActiveCarId,
    activeCar,
    loadFromFile,
    loading,
    lastUpdated,
  } = useCars()
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <View style={[styles.head, styles.headLoading]}>
        <ActivityIndicator size='large' color='#e63946' />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    )
  }

  if (!activeCar) {
    return (
      <View style={styles.head}>
        <Text style={styles.empty}>Нет данных о машинах</Text>
        <Pressable style={styles.loadButton} onPress={loadFromFile}>
          <Text style={styles.loadButtonText}>Загрузить Excel-файл</Text>
        </Pressable>
      </View>
    )
  }

  const copyVin = async () => {
    await Clipboard.setStringAsync(activeCar.vin)
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <View style={styles.head}>
      <View style={styles.headTop}>
        <Text style={styles.carName}>
          {activeCar.name} {activeCar.year}
        </Text>
        <View style={styles.plate}>
          <Text style={styles.plateText}>{activeCar.plate}</Text>
        </View>
      </View>

      <Pressable onPress={copyVin} style={styles.vinRow}>
        <Text style={styles.carVin}>{activeCar.vin}</Text>
        <Text style={[styles.copyHint, copied && styles.copyHintActive]}>
          {copied ? 'Скопировано' : 'Копировать'}
        </Text>
      </Pressable>

      <View style={styles.tabs}>
        {cars.map((c) => {
          const isActive = c.id === activeCarId
          return (
            <Pressable
              key={c.id}
              onPress={() => setActiveCarId(c.id)}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.tabActive,
                pressed && styles.tabPressed,
              ]}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
                numberOfLines={1}
              >
                {c.name}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {/* Нижняя часть: кнопка обновления и дата */}
      <View style={styles.footer}>
        <Pressable style={styles.reloadButton} onPress={loadFromFile}>
          <Text style={styles.reloadButtonText}>Обновить файл</Text>
        </Pressable>

        {lastUpdated && (
          <Text style={styles.updatedText}>
            {new Date(lastUpdated).toLocaleDateString('ru-RU')}
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  head: {
    backgroundColor: '#373737',
    width: '95%',
    padding: 14, // уменьшено с 20
    borderRadius: 16,
    alignSelf: 'center',
    gap: 8, // уменьшено с 12
  },
  headTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8, // уменьшено с 12
  },
  carName: {
    color: '#fff',
    fontSize: 17, // чуть уменьшено с 18
    fontWeight: '700',
    flexShrink: 1,
  },

  // VIN + подсказка
  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4, // уменьшено с 6
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  carVin: {
    color: '#9a9a9a',
    fontSize: 13,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  copyHint: {
    color: '#6a6a6a',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  copyHintActive: {
    color: '#22c55e',
  },

  plate: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 8, // уменьшено с 10
    paddingVertical: 3, // уменьшено с 4
    borderWidth: 2,
    borderColor: '#000',
  },
  plateText: {
    color: '#000',
    fontSize: 13, // уменьшено с 14
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Табы
  tabs: {
    flexDirection: 'row',
    gap: 6, // уменьшено с 8
    marginTop: 2, // уменьшено с 4
  },
  tab: {
    flex: 1,
    paddingVertical: 8, // уменьшено с 10
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3f3f3f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#e63946',
    borderColor: '#e63946',
  },
  tabPressed: {
    opacity: 0.75,
  },
  tabText: {
    color: '#bfbfbf',
    fontSize: 12, // уменьшено с 13
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Футер с кнопкой и датой
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // кнопка слева, дата справа
    alignItems: 'center',
    marginTop: 2,
  },
  reloadButton: {
    // убрали alignSelf: 'flex-end', теперь работает через footer
  },
  reloadButtonText: {
    color: '#9a9a9a',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  updatedText: {
    color: '#6a6a6a',
    fontSize: 11,
  },

  // Остальное без изменений
  empty: {
    color: '#9a9a9a',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadButton: {
    backgroundColor: '#e63946',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  headLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: '#9a9a9a',
    fontSize: 13,
  },
})
