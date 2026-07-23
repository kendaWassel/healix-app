import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import ServicesCard from "../../Components/servicesCard/ServicesCard";

export default function OurServices() {
  const { t } = useTranslation();

  const services = [
    { icon: "person", for: t("ourServices.forPatients"), desc: t("ourServices.forPatientsDesc") },
    { icon: "medkit", for: t("ourServices.forDoctors"), desc: t("ourServices.forDoctorsDesc") },
    { icon: "flask", for: t("ourServices.forPharmacists"), desc: t("ourServices.forPharmacistsDesc") },
    { icon: "medical", for: t("ourServices.forNurses"), desc: t("ourServices.forNursesDesc") },
    { icon: "walk", for: t("ourServices.forPhysiotherapists"), desc: t("ourServices.forPhysiotherapistsDesc") },
    { icon: "car", for: t("ourServices.forDeliveryAgents"), desc: t("ourServices.forDeliveryAgentsDesc") },
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>{t("ourServices.sectionTitle")}</Text>
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