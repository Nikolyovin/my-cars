import { Stack } from 'expo-router'
import { CarsProvider } from '../../utils/CarsContext'

export default function RootLayout() {
  return (
    <CarsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CarsProvider>
  )
}
