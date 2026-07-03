import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ServicesCard = ({ service }) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name={service.icon} size={28} color="#39CCCC" />
      </View>
      <Text style={styles.title}>{service.for}</Text>
      <Text style={styles.desc}>{service.desc}</Text>
    </View>
  );
};

export default ServicesCard;

const styles = StyleSheet.create({
  card: {
    width: "47%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: "#fff",
    shadowColor: "#eaeaea",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eafafa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#052443",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  desc: { fontSize: 13, color: "#767676", textAlign: "center", lineHeight: 18 },
});