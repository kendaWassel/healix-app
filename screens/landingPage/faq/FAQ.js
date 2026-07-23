import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQ() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);

  const FAQS = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  const toggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>{t("faq.sectionTitle")}</Text>
      <View style={styles.wrap}>
        {FAQS.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity style={styles.question} onPress={() => toggle(index)}>
              <Text style={styles.qText}>{item.q}</Text>
              <Ionicons
                name={activeIndex === index ? "chevron-up" : "chevron-down"}
                size={18}
                color="#39CCCC"
              />
            </TouchableOpacity>
            {activeIndex === index && <Text style={styles.answer}>{item.a}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24, fontWeight: "bold", color: "#052443",
    textAlign: "center", marginTop: 36, marginBottom: 20,
  },
  wrap: { paddingHorizontal: 20, gap: 12 },
  card: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0",
    borderRadius: 16, overflow: "hidden", marginBottom: 12,
  },
  question: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 18,
  },
  qText: { fontSize: 15, fontWeight: "600", color: "#052443", flex: 1, paddingRight: 10 },
  answer: {
    paddingHorizontal: 18, paddingBottom: 18, color: "#767676",
    fontSize: 14, lineHeight: 21,
  },
});