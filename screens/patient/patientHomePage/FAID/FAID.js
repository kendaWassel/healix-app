import { View, Text, StyleSheet } from "react-native";
import FAIDCard from "../FAID/FAIDCard";

const faid = [
  {
    title: "CPR Basics",
    desc: "Check responsiveness, call for help, push hard and fast on the chest.",
  },
  {
    title: "Bleeding Control",
    desc: "Put pressure on the wound with a clean cloth until bleeding stops.",
  },
  {
    title: "Burn Care",
    desc: "Cool with running water, cover with a clean, non-fluffy dressing.",
  },
  {
    title: "Choking Response",
    desc: "If coughing fails, give quick abdominal thrusts until the object comes out or help arrives.",
  },
  {
    title: "Shock Recognition",
    desc: "Lay them flat, raise legs if safe, keep warm, call for help.",
  },
  {
    title: "Poisoning/Ingestion",
    desc: "Do not vomit; call poison control or emergency services and share what was taken.",
  },
];

const FAID = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>First Aids</Text>
      <View style={styles.grid}>
        {faid.map((item, index) => (
          <FAIDCard key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

export default FAID;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#052443",
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
});