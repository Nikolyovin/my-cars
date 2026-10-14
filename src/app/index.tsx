import { StyleSheet, View } from 'react-native'
import Head from './components/head/Head'
import Main from './components/main/Main'

export default function Index() {
  return (
    <View style={styles.container}>
      <Head />
      <Main />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#141414',
    padding: '10px',
  },
})
