# Delivery screens — RN conversion notes

## 1. Install the new dependencies

Run this in your project root (where `package.json` is):

```
npm install i18next react-i18next expo-localization expo-document-picker
```

`expo-document-picker` isn't in your `package.json` yet — needed for the license-file picker.
`@expo/vector-icons` (already installed) covers all the FontAwesome + Lucide icons used across these files, so no extra icon package needed.

## 2. Copy these files into your project

Copy the `src/` folder contents into your project, matching this layout:

```
constants/colors.js
constants/api.js
i18n/i18n.js
i18n/locales/en.json
i18n/locales/ar.json
components/headers/DeliveryHeader.js   (PLACEHOLDER — see below)
components/footer/Footer.js            (PLACEHOLDER — see below)
screens/delivery/Delivery.js
screens/delivery/deliveryHomePage/DeliveryHomePage.js
screens/delivery/myOrders/MyOrders.js
screens/delivery/newOrders/NewOrders.js
assets/gallery-7.png                   (PLACEHOLDER gray square — replace with your real photo asset)
```

Adjust the relative import paths (`../../../constants/colors` etc.) if you place folders differently than your existing `screens/registers/...` structure.

## 3. Initialize i18n once, at the top of your app

In `App.js`, add this import **once**, near the top (order matters — it must run before any screen uses `useTranslation`):

```js
import "./i18n/i18n"; // adjust path to wherever you put i18n.js
```

## 4. Register the Delivery screen in your root navigator

Your current `App.js` has a `DeliveryRegister` screen, but no `Delivery` screen itself (the login redirect logic falls back to `"Delivery"` for any role that isn't patient/doctor/pharmacist/nurse/physio, but that screen doesn't exist yet). Add it:

```js
import Delivery from "./screens/delivery/Delivery";
// ...
<Stack.Screen name="Delivery" component={Delivery} />
```

Since `Delivery.js` is itself a nested `Stack.Navigator` (converted from your `react-router-dom` `<Routes>`), this one line gives you all three screens: home, new orders, my orders.

## 5. Replace the placeholder Header/Footer

I don't have your real `DeliveryHeader.jsx` / `Footer.jsx` — the ones included are simple stand-ins so the screens render without crashing. Send me those two files next and I'll convert them to match exactly, and wire up their real navigation targets.

## 6. Color variables

`constants/colors.js` mirrors your CSS `:root` variables 1:1 (`cyan`, `darkBlue`, `white`, `cardBorder`, `textColor`), plus a few extra grays/status colors used for alerts and disabled states — pulled directly from the Tailwind classes in your original JSX (e.g. `bg-red-100`, `text-red-700`) so nothing was invented, just named.

## 7. Multi-language notes

- Text is wired up via `useTranslation()` / `t("key")` — English and Arabic JSON files are already filled in for every string across all three delivery screens.
- Switching language at runtime: call `changeAppLanguage("ar")` (exported from `i18n.js`) from wherever you'll build a language-switcher UI.
- **RTL heads-up**: React Native requires an app reload (not just a re-render) to fully flip layout direction for Arabic. `changeAppLanguage` calls `I18nManager.forceRTL()`, but you'll want to trigger `Updates.reloadAsync()` (from `expo-updates`) or prompt the user to restart the app after switching — this is a platform limitation, not something I can code around.

## 8. Things I flagged in your code (kept as-is, not changed)

- All the form fields in `DeliveryHomePage` are `editable={false}` — same as your original `disabled` inputs. It's currently a read-only profile view even though there's an "Update" button; I preserved that exactly rather than guessing you wanted it editable.
- `UserLogin.js`'s role→route map has no explicit `"delivery"` entry and silently falls back to `"Delivery"` for anything unmatched — worth double-checking against your backend's actual role string.
