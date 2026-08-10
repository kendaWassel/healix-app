import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PatientHomePage from "./patientHomePage/PatientHomePage";
import DoctorConsultation from "./DoctorConsultation/DoctorConsultation";
import PickDoctor from "./DoctorConsultation/booking/PickDoctor";
import MySchedules from "./MySchedules/MySchedules";
import Receipts from "./Receipts/Receipts";
import TrackDelivery from "./trackDelivery/TrackDelivery";
const Stack = createNativeStackNavigator();

const Patient = () => {
  return (
    <Stack.Navigator
      initialRouteName="PatientHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="PatientHome" component={PatientHomePage} />
      
      <Stack.Screen name="DoctorConsultation" component={DoctorConsultation} /> 
      <Stack.Screen name="PickDoctor" component={PickDoctor} /> 
      <Stack.Screen name="MySchedules" component={MySchedules} /> 
      <Stack.Screen name="Receipts" component={Receipts} /> 
            <Stack.Screen name="TrackDelivery" component={TrackDelivery} />
    </Stack.Navigator>
  );
};

export default Patient;