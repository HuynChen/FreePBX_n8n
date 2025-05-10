import { createNativeStackNavigator } from '@react-navigation/native-stack';
import POST from './Post';
import Explore from './Explore';

const Stack = createNativeStackNavigator();

function index() {
  return(
    <Stack.Navigator>
      <Stack.Screen name="Explore" component={Explore} options={{ headerShown: false }} />
      <Stack.Screen name="POST" component={POST} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

export default index;