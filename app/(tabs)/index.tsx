import { View, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { createThemedStyles } from '../../constants/Styles';
import HomeScreen from '../../screens/HomeScreen';

export default function TabHomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const styles = createThemedStyles(theme);

  return (
    <View style={styles.screen}>
      <HomeScreen />
    </View>
  );
}
