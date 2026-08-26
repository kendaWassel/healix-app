import { InteractionManager } from "react-native";

// Stores the timestamp of the most recent navigation action, keyed by the
// route we navigated TO — so when that screen finishes mounting/rendering,
// we can compute how long the whole transition actually took.
let pendingNavStart = null;
let pendingRouteName = null;

export function markNavigationStart(routeName) {
  pendingNavStart = Date.now();
  pendingRouteName = routeName;
}

// Call this once inside NavigationContainer's onStateChange — fires every
// time the navigation state changes (i.e., right after any navigate/replace/goBack).
export function handleNavigationStateChange(state) {
  if (!state || !pendingNavStart) return;
  const currentRoute = getActiveRouteName(state);
  if (currentRoute !== pendingRouteName) return;

  // Wait until all animations/interactions finish — this is the moment the
  // screen is actually fully rendered and interactive, not just "started".
  InteractionManager.runAfterInteractions(() => {
    const duration = Date.now() - pendingNavStart;
    console.log(`[NavPerf] ${currentRoute} loaded in ${duration}ms`);
    pendingNavStart = null;
    pendingRouteName = null;
  });
}

function getActiveRouteName(state) {
  const route = state.routes[state.index];
  if (route.state) return getActiveRouteName(route.state);
  return route.name;
}