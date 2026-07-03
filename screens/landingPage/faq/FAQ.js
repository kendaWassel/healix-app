import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  LayoutAnimation, Platform, UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  { q: "How do I book an appointment?", a: "You can book an appointment by choosing a care provider, selecting a suitable time, and confirming your booking from your dashboard." },
  { q: "Can I cancel or reschedule my appointment?", a: "Yes, you can cancel or reschedule your appointment before it starts from the schedules page." },
  { q: "How do online consultations work?", a: "Online consultations are done through secure calls. You will be notified when the doctor is ready to start the session." },
  { q: "When do I pay for the session?", a: "Payment is required after the session is completed. You will then be able to rate your care provider." },
  { q: "Is my medical data secure?", a: "Absolutely. All medical data is encrypted and handled according to strict privacy standards." },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
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