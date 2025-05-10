// index.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../profile/Profile';
import Favorite from '../favorite/index';
import Explore from '../(root)/Explore';
import Login from '../(auth)/sign-in';
import Detail from './Detail';

const Stack = createNativeStackNavigator();

function index() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={Profile}  options={{ headerShown: false }}/>
      <Stack.Screen name="Detail" component={Detail} />
      <Stack.Screen name="Favorite" component={Favorite}/>
      <Stack.Screen name="Explore" component={Explore}/>
      <Stack.Screen name="Login" component={Login}/>
    </Stack.Navigator>
  );
}

export default index;