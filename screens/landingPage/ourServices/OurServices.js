import { View, Text, StyleSheet } from "react-native";
import ServicesCard from "../../Components/servicesCard/ServicesCard";

const services = [
  { icon: "person", for: "For Patients", desc: "Access a network of trusted healthcare professionals" },
  { icon: "medkit", for: "For Doctors", desc: "Provide online consultations" },
  { icon: "flask", for: "For Pharmacists", desc: "Receive and process medications orders" },
  { icon: "medical", for: "For Nurses", desc: "Provide at-home medical care" },
  { icon: "walk", for: "For Physiotherapists", desc: "Provide at-home physical care" },
  { icon: "car", for: "For Delivery Agents", desc: "Get assigned to deliver medications to patients" },
];

export default function OurServices() {
  return (
    <View>
      <Text style={styles.sectionTitle}>Our Services</Text>
      <View style={styles.grid}>
        {services.map((service, index) => (
          <ServicesCard key={index} service={service} />
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
  grid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",
    paddingHorizontal: 20, gap: 14,
  },
});