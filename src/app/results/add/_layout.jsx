import { Stack } from 'expo-router';

export default function ResultAddLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#161622',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        }, title:"Add New Result"
      }}
    />
  );
}
