import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorHomePage from "./DoctorHomePage/DoctorHomePage";
import DoctorSchedules from "./doctorSchedules/DoctorSchedules";
import PatientLabAnalyses from "./patientLabAnalyses/PatientLabAnalyses";

const Stack = createNativeStackNavigator();

const Doctor = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorHome" component={DoctorHomePage} />
      <Stack.Screen name="DoctorSchedules" component={DoctorSchedules} />
      <Stack.Screen name="PatientLabAnalyses" component={PatientLabAnalyses} />
    </Stack.Navigator>
  );
};

export default Doctor;