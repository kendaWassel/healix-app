// Converted from Nurse.jsx.
// react-router-dom's <Routes>/<Route> becomes a nested Stack.Navigator,
// same pattern as the Delivery module.

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NurseHomePage from "./nurseHomePage/NurseHomePage";
import NurseNewOrders from "./newOrders/NurseNewOrders";
import NurseAppointments from "./appointments/NurseAppointments";

const Stack = createNativeStackNavigator();

const Nurse = () => {
  return (
    <Stack.Navigator
      initialRouteName="NurseHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="NurseHome" component={NurseHomePage} />
      <Stack.Screen name="NurseNewOrders" component={NurseNewOrders} />
      <Stack.Screen name="NurseAppointments" component={NurseAppointments} />
    </Stack.Navigator>
  );
};

export default Nurse;
