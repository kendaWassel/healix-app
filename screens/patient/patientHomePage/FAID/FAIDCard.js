import { View, Text, StyleSheet } from "react-native";

const FAIDCard = ({ item }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </View>
  );
};

export default FAIDCard;

const styles = StyleSheet.create({
  card: {
    width: "47%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 22,
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
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#052443",
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    fontWeight: "700",
    color: "#767676",
    textAlign: "center",
    lineHeight: 19,
  },
});