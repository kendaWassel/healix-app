import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PatientHomePage from "./patientHomePage/PatientHomePage";
//import DoctorConsultation from "./DoctorConsultation/DoctorConsultation";
//import PickDoctor from "./DoctorConsultation/pickDoctor/PickDoctor";
//import MySchedules from "./MySchedules/MySchedules";
//import Receipts from "./Receipts/Receipts";

const Stack = createNativeStackNavigator();

const Patient = () => {
  return (
    <Stack.Navigator
      initialRouteName="PatientHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="PatientHome" component={PatientHomePage} />
      
     {/* <Stack.Screen name="DoctorConsultation" component={DoctorConsultation} /> */}
     {/* <Stack.Screen name="PickDoctor" component={PickDoctor} /> */}
     {/* <Stack.Screen name="MySchedules" component={MySchedules} /> */}
     {/* <Stack.Screen name="Receipts" component={Receipts} /> */}
      
    </Stack.Navigator>
  );
};

export default Patient;