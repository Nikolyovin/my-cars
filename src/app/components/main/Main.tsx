import { StyleSheet, Text, View } from 'react-native'

export default function Main() {
  return (
    <View style={styles.main}>
      <Text style={styles.mainText}>Main.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  mainText: { color: '#ffffff' },
})
