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
import { APP_VERSION } from '../../../../utils/version'

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

  // Пока идёт загрузка — показываем оверлей
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
      <Text style={styles.versionText}>v{APP_VERSION}</Text>

      {/* Дата последнего обновления */}
      {lastUpdated && (
        <Text style={styles.updatedText}>
          Обновлено: {new Date(lastUpdated).toLocaleDateString('ru-RU')}
        </Text>
      )}

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

      <Pressable style={styles.reloadButton} onPress={loadFromFile}>
        <Text style={styles.reloadButtonText}>Обновить файл</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  head: {
    backgroundColor: '#373737',
    width: '95%',
    padding: 20,
    borderRadius: 16,
    alignSelf: 'center',
    gap: 12,
  },
  headTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  carName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },

  // VIN + подсказка
  vinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
    color: '#22c55e', // зелёный при успехе
  },

  plate: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  plateText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
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
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
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
  reloadButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  reloadButtonText: {
    color: '#9a9a9a',
    fontSize: 12,
    textDecorationLine: 'underline',
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
  updatedText: {
    color: '#6a6a6a',
    fontSize: 11,
    marginTop: -4,
  },
  versionText: {
    color: '#4a4a4a',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
})
