import { View, Image, StyleSheet } from 'react-native';

const logo = require('@/assets/images/splash-logo.png');

export function SplashContent() {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
  },
  logo: {
    width: 300,
    height: 380,
  },
});
