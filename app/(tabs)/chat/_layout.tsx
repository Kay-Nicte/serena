import { Stack, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { CommonActions } from '@react-navigation/native';

export default function ChatLayout() {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, (e: any) => {
      const state = navigation.getState();
      // Only reset if the chat stack has more than 1 screen (i.e. a conversation is open)
      const chatRoute = state?.routes?.find((r: any) => r.name === 'chat');
      const nestedState = chatRoute?.state;
      if (nestedState && nestedState.index != null && nestedState.index > 0) {
        e.preventDefault();
        navigation.dispatch(
          CommonActions.navigate({
            name: 'chat',
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
