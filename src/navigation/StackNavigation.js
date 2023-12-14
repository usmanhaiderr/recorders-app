import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import Login from '../screens/Login';
import Home from '../screens/Home';
import {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';
import Register from '../screens/Register';

const Stack = createNativeStackNavigator();

export default function StackNavigation() {
  const {isUserLoggedIn} = useContext(AuthContext);
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerShown: false,
        }}>
        {!isUserLoggedIn ? (
          <>
            <Stack.Screen
              name="login"
              component={Login}
              options={{
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="register"
              component={Register}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="home"
            component={Home}
            options={{
              animation: 'slide_from_right',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
