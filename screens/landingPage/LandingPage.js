import { ScrollView, StyleSheet } from "react-native";
import LandingHeader from "../Components/header/LandingHeader";
import HeroSection from "./heroSection/HeroSection";
import OurServices from "./ourServices/OurServices";
import FAQ from "./faq/FAQ";
import Footer from "../Components/footer/Footer";

export default function LandingPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 0 }}>
      <LandingHeader />
      <HeroSection />
      <OurServices />
      <FAQ />
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});