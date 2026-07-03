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

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Landing"
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

      </Stack.Navigator>
    </NavigationContainer>
  );
}