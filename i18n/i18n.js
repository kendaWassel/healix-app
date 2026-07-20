import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";

import en from "./locales/en.json";
import ar from "./locales/ar.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage === "ar" ? "ar" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v3",
});

export const changeAppLanguage = async (lang) => {
  await i18n.changeLanguage(lang);
  const shouldBeRTL = lang === "ar";
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);

    setTimeout(async()=>{
      await Updates.reloadAsync();
    },500);
  }
};

export default i18n;
