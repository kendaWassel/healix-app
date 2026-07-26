import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PhysioHomePage from "./physioHomePage/PhysioHomePage";
import PhysioNewOrders from "./physioNewOrders/PhysioNewOrders";
import PhysioSchedules from "./physioSchedules/PhysioSchedules";

const Stack = createNativeStackNavigator();

const Physio = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PhysioHome" component={PhysioHomePage} />
      <Stack.Screen name="PhysioNewOrders" component={PhysioNewOrders} />
      <Stack.Screen name="PhysioSchedules" component={PhysioSchedules} />
    </Stack.Navigator>
  );
};

export default Physio;
