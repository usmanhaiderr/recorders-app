import React from 'react';
import {SafeAreaView} from 'react-native';
import Home from './src/screens/Home';
import StackNavigation from './src/navigation/StackNavigation';
import AuthContextProvider from './src/context/AuthContext';

const App: React.FC = () => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <AuthContextProvider>
        <StackNavigation />
      </AuthContextProvider>
    </SafeAreaView>
  );
};

export default App;
