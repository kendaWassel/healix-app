
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DeliveryHomePage from "./deliveryHomePage/DeliveryHomePage";
import MyOrders from "./myOrders/MyOrders";
import NewOrders from "./newOrders/NewOrders";

const Stack = createNativeStackNavigator();

const Delivery = () => {
  return (
    <Stack.Navigator
      initialRouteName="DeliveryHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="DeliveryHome" component={DeliveryHomePage} />
      <Stack.Screen name="NewOrders" component={NewOrders} />
      <Stack.Screen name="MyOrders" component={MyOrders} />
    </Stack.Navigator>
  );
};

export default Delivery;
