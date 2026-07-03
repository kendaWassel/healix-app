import { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const accountTypes = [
  {
    key: "pharmacist",
    title: "For Pharmacists",
    desc: "Receive and process medications orders",
    icon: "medical",
    dest: "PharmacistRegister",
  },
  {
    key: "doctor",
    title: "For Doctors",
    desc: "Provide online consultations",
    icon: "person",
    dest: "DoctorRegister",
  },
  {
    key: "patient",
    title: "For Patients",
    desc: "Access a network of trusted healthcare professionals",
    icon: "person-outline",
    dest: "PatientRegister",
  },
  {
    key: "delivery",
    title: "For Delivery Agents",
    desc: "Deliver medications or transport care providers safely",
    icon: "car",
    dest: "DeliveryRegister",
  },
  {
    key: "nurse",
    title: "For Nurses",
    desc: "Provide at-home medical care",
    icon: "medkit",
    dest: "CareProviderRegister",
  },
  {
    key: "physiotherapist",
    title: "For Physiotherapists",
    desc: "Provide at-home physical care",
    icon: "walk",
    dest: "CareProviderRegister",
  },
];

export default function NewAccountSetup() {
  const [selected, setSelected] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const handleContinue = async () => {
    if (!selected) return;
    setError(null);
    setIsLoading(true);

    try {
      // احتفظ بمنطق الـ API إن أردته، أو احذفه والانتقال مباشرة
      const dest = accountTypes.find((a) => a.key === selected)?.dest;
      if (dest) navigation.navigate(dest);
    } catch (err) {
      setError(err.message || "Can't continue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* الرأس */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>New Account Setup</Text>
        <Text style={styles.subtitle}>Choose your account type</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      {/* بطاقات الاختيار — عمود واحد */}
      <View style={styles.cardsWrap}>
        {accountTypes.map((type) => {
          const isSelected = selected === type.key;
          return (
            <TouchableOpacity
              key={type.key}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(type.key)}
            >
              <View style={styles.cardRow}>
                <Ionicons
                  name={type.icon}
                  size={26}
                  color={isSelected ? "#39CCCC" : "#A1A1A1"}
                />
                <View style={styles.cardText}>
                  <Text
                    style={[
                      styles.cardTitle,
                      isSelected && styles.cardTitleSelected,
                    ]}
                  >
                    {type.title}
                  </Text>
                  <Text style={styles.cardDesc}>{type.desc}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#39CCCC" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* زر المتابعة */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selected || isLoading) && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selected || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35,
    paddingBottom: 40,
  },

  header: { alignItems: "center", marginBottom: 24 },
  backArrow: { position: "absolute", left: 0, top: 0 },
  title: {
    fontSize: 24, fontWeight: "bold", color: "#003366", marginTop: 8,
  },
  subtitle: { fontSize: 16, color: "#666", marginTop: 6 },
  error: { color: "red", fontWeight: "bold", marginTop: 8 },

  cardsWrap: { gap: 12 },

  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  cardSelected: {
    borderColor: "#39CCCC",
    backgroundColor: "#fff",
    shadowColor: "#39CCCC",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: "600", color: "#333" },
  cardTitleSelected: { color: "#39CCCC" },
  cardDesc: { fontSize: 13, color: "#666", marginTop: 2 },

  continueButton: {
    backgroundColor: "#052443",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  continueButtonDisabled: { backgroundColor: "#9ca3af" },
  continueButtonText: { color: "#fff", fontWeight: "bold", fontSize: 17 },
});