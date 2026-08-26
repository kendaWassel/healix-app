import { useNavigation } from "@react-navigation/native";
import { markNavigationStart } from "../utils/navPerf";

export function useTrackedNavigation() {
  const navigation = useNavigation();
  const originalNavigate = navigation.navigate;

  navigation.navigate = (name, params) => {
    markNavigationStart(name);
    return originalNavigate(name, params);
  };

  return navigation;
}