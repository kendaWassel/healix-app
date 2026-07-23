import "./i18n/i18n"

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserLogin from "./screens/login/UserLogin";
import NewAccountSetup from "./screens/registers/newaccountsetup/NewAccountSetup";
import CareProviderRegister from "./screens/registers/careprovider/careproviderRegister";
import PatientRegister from "./screens/registers/patient/PatientRegister";
import DoctorRegister from "./screens/registers/doctor/DoctorRegister";
import DeliveryRegister from "./screens/registers/delivery/DeliveryRegister";
import PharmacistRegister from "./screens/registers/pharmacist/PharmacistRegister";
import LandingPage from "./screens/landingPage/LandingPage";
import Patient from "./screens/patient/patient";
import Doctor from "./screens/doctor/Doctor";
import Pharmacist from "./screens/Pharmacist/Pharmacist";
import Delivery from "./screens/delivery/Delivery";
import Nurse from "./screens/nurse/Nurse";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Login" component={UserLogin} />
        <Stack.Screen name="Register" component={NewAccountSetup} />
        <Stack.Screen
          name="CareProviderRegister"
          component={CareProviderRegister}
        />
        <Stack.Screen
          name="PatientRegister"
          component={PatientRegister}
        />
      <Stack.Screen 
      name="DoctorRegister"
       component={DoctorRegister}
        />
        <Stack.Screen
         name="DeliveryRegister"
          component={DeliveryRegister} 
          />
        <Stack.Screen
         name="PharmacistRegister"
          component={PharmacistRegister}
           />
        <Stack.Screen name="Patient" component={Patient} />
        <Stack.Screen name="Doctor" component={Doctor} /> 
        <Stack.Screen name="Pharmacist" component={Pharmacist} />
        <Stack.Screen name="Delivery" component={Delivery} />
        <Stack.Screen name="Nurse" component={Nurse} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}