// screens/doctor/Doctor.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorHomePage from "./DoctorHomePage/DoctorHomePage";
import DoctorSchedules from "./doctorSchedules/DoctorSchedules";


const Stack = createNativeStackNavigator();

const Doctor = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorHome" component={DoctorHomePage} />
      <Stack.Screen name="DoctorSchedules" component={DoctorSchedules} />
    </Stack.Navigator>
  );
};

export default Doctor;