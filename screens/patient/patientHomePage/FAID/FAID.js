import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import FAIDCard from "../FAID/FAIDCard";

const FAID = () => {
  const { t } = useTranslation();

  const faid = [
    { title: t("faid.cprTitle"), desc: t("faid.cprDesc") },
    { title: t("faid.bleedingTitle"), desc: t("faid.bleedingDesc") },
    { title: t("faid.burnTitle"), desc: t("faid.burnDesc") },
    { title: t("faid.chokingTitle"), desc: t("faid.chokingDesc") },
    { title: t("faid.shockTitle"), desc: t("faid.shockDesc") },
    { title: t("faid.poisoningTitle"), desc: t("faid.poisoningDesc") },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t("faid.sectionTitle")}</Text>
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