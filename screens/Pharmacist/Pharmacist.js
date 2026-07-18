// screens/pharmacist/Pharmacist.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PharmacistHomePage from "./pharmacistHomePage/PharmacistHomePage";
import NewOrders from "./NewOrders/NewOrders";
import MyOrders from "./MyOrders/MyOrders"

const Stack = createNativeStackNavigator();

const Pharmacist = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PharmacistHome" component={PharmacistHomePage} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
      <Stack.Screen name="NewOrders" component={NewOrders} />
    </Stack.Navigator>
  );
};

export default Pharmacist;