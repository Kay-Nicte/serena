import { Stack, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';

export default function ConexionesLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
      const state = navigation.getState();
      const route = state?.routes?.find((r: any) => r.name === 'conexiones');
      const nestedState = route?.state;
      if (nestedState && nestedState.index != null && nestedState.index > 0) {
        e.preventDefault();
        navigation.dispatch(
          CommonActions.navigate({
            name: 'conexiones',
            params: { screen: 'index' },
          })
        );
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[matchId]" />
    </Stack>
  );
}
