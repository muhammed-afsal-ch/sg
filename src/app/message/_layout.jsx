import { Stack } from 'expo-router';

export default function MessageLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#161622',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        }, title:"Message Us"
      }}
    />
  );
}
