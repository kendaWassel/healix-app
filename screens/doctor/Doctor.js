// screens/doctor/Doctor.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorHomePage from "./DoctorHomePage/DoctorHomePage";
import DoctorSchedules from "./doctorSchedules/DoctorSchedules";
// import ModifyMedicalReport from "./doctorSchedules/ModifyMedicalReports";

const Stack = createNativeStackNavigator();

const Doctor = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorHome" component={DoctorHomePage} />
      <Stack.Screen name="DoctorSchedules" component={DoctorSchedules} />
      {/* ModifyMedicalReport is a modal opened from within DoctorEndCallModal,
          not a standalone route — commented out to avoid the
          "Invalid value for component prop" error until confirmed */}
      {/* <Stack.Screen name="ModifyMedicalReport" component={ModifyMedicalReport} /> */}
    </Stack.Navigator>
  );
};

export default Doctor;