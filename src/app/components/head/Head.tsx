import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'

const cars = [
  {
    id: 1,
    name: 'красная',
    image: require('@/assets/images/red.jpg'),
  },
  {
    id: 2,
    name: 'черная',
    image: require('@/assets/images/black.jpg'),
  },
]

export default function Head() {
  const [activeId, setActiveId] = useState(1)
  const car = cars.find((c) => c.id === activeId)

  return (
    <View style={styles.head}>
      {/* Верхняя часть: инфо + картинка */}
      <View style={styles.headTop}>
        <View style={styles.headInformation}>
          <Text style={styles.headInformationText}>
            {activeId == 1 ? 'XTA210930Y2696785' : 'XTA210930Y2623347'}
          </Text>
        </View>

        <View style={styles.headImgWrapper}>
          <Image source={car.image} style={styles.image} contentFit='cover' />
        </View>
      </View>

      {/* Нижняя часть: свитч по центру */}
      <View style={styles.switchRow}>
        {/* <Text style={styles.switchLabel}>{car.name}</Text> */}
        <Switch
          value={activeId === 2}
          onValueChange={(isSecond) => setActiveId(isSecond ? 2 : 1)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={activeId === 2 ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor='#3e3e3e'
        />
      </View>
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
    gap: 16, // отступ между верхом и свитчем
  },
  headTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headInformation: {
    flexShrink: 1,
  },
  headInformationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headImgWrapper: {
    width: 150,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // ← центрируем по горизонтали
    gap: 10,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 14,
  },
})
