import "./i18n/i18n"

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StripeProvider } from "@stripe/stripe-react-native";

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
import Physio from "./screens/physio/Physio";
import DeepLinkListener from "./DeepLinkListener";
import VerifyEmailScreen from "./screens/verifyemailScreen/VerifyEmailScreen";
import AI_Medical_Assistant from "./screens/patient/AIMedicalAssistant/AI_Medical_Assistant";
import EditMedicalReportModal from "./screens/Components/PatientMedicalReport/EditMedicalReportModal";
import MedicalReportModal from "./screens/registers/patient/MedicalReportModal";
import CreatePrescriptionScreen from "./screens/doctor/prescription/CreatePrescription";
import DoctorEndCallModal from "./screens/doctor/doctorCallNow/DoctorEndCallModal";
import DoctorCallNow from "./screens/doctor/doctorCallNow/DoctorCallNow";
const Stack = createNativeStackNavigator();

const STRIPE_PUBLISHABLE_KEY = "pk_test_51Sb7QiADj5gMi232iI6BqSWfA8HBIm1VFNrlZxAtk1U0gPLuZ7KxgQipkKw0Jv2QzcDq1Mjc4lISxsrjcYnY5GpH00wseIAv7q";

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    <NavigationContainer>
       <DeepLinkListener />
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
        <Stack.Screen name="Doctor" component={Doctor} /> 
        <Stack.Screen name="Pharmacist" component={Pharmacist} />
        <Stack.Screen name="Delivery" component={Delivery} />
        <Stack.Screen name="Nurse" component={Nurse} />
        <Stack.Screen name="Physio" component={Physio} />
        <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} />
       <Stack.Screen
         name="AIMedicalAssistant"
         component={AI_Medical_Assistant}
         options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
       />
           <Stack.Screen
         name="EditMedicalReportScreen"
         component={EditMedicalReportModal}
         options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
       />

        <Stack.Screen
   name="MedicalReportScreen"
   component={MedicalReportModal}
   options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
 />

   <Stack.Screen
     name="CreatePrescriptionScreen"
     component={CreatePrescriptionScreen}
     options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
   />
   <Stack.Screen
     name="DoctorEndCallScreen"
     component={DoctorEndCallModal}
     options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
   />
   <Stack.Screen
     name="DoctorCallNowScreen"
     component={DoctorCallNow}
     options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }}
   />

      </Stack.Navigator>
    </NavigationContainer>
    </StripeProvider>
  );
}