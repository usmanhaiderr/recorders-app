import {ActivityIndicator, StyleSheet, View} from 'react-native';

export default function CustomLoader() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={'#0361cc'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
