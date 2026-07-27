import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";

import PatientHeader from "../../Components/header/PatientHeader";
import Footer from "../../Components/footer/Footer";
import UploadSection from "./uploadSection";
import ResultsSection from "./resultsSection";
import { useLabAnalysis } from "./useLabAnalysis";
import { colors } from "../../../constants/colors";

export default function LabAnalysis() {
  const { t } = useTranslation();
  const {
    file,
    setFile,
    report,
    loading,
    error,
    analyze,
    loadingTests,
    supportedTests,
    fetchSupportedTests,
  } = useLabAnalysis();

  return (
    <View style={{ flex: 1 }}>
      <PatientHeader />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t("labAnalysis.title")}</Text>
        <Text style={styles.subtitle}>{t("labAnalysis.subtitle")}</Text>

        <TouchableOpacity
          style={styles.viewTestsBtn}
          onPress={fetchSupportedTests}
        >
          <Text style={styles.viewTestsBtnText}>
            {t("labAnalysis.viewSupportedTests")}
          </Text>
        </TouchableOpacity>

        <UploadSection
          file={file}
          setFile={setFile}
          onAnalyze={analyze}
          loading={loading}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <ResultsSection report={report} />

        {loadingTests ? (
          <Text style={styles.centerText}>
            {t("labAnalysis.loadingSupportedTests")}
          </Text>
        ) : (
          supportedTests?.length > 0 && (
            <View style={styles.supportedCard}>
              <View style={styles.supportedHeader}>
                <Text style={styles.supportedTitle}>
                  {t("labAnalysis.supportedTestsTitle")}
                </Text>
                <View style={styles.supportedCountBadge}>
                  <Text style={styles.supportedCountText}>
                    {t("labAnalysis.testsCount", {
                      count: supportedTests.length,
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.testsGrid}>
                {supportedTests.map((test, i) => (
                  <View key={i} style={styles.testChip}>
                    <Text style={styles.testChipText}>{test}</Text>
                  </View>
                ))}
              </View>
            </View>
          )
        )}
      </ScrollView>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: colors.gray50 },
  title: { fontSize: 26, fontWeight: "bold", color: "#0a3460", marginBottom: 6 },
  subtitle: { color: colors.gray700, marginBottom: 20 },
  viewTestsBtn: {
    alignSelf: "flex-start",
    backgroundColor: colors.cyan,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  viewTestsBtnText: { color: colors.white, fontWeight: "600" },
  errorText: { marginTop: 14, color: "#ef4444" },
  centerText: { textAlign: "center", color: colors.gray500, marginTop: 20 },
  supportedCard: {
    marginTop: 30,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 20,
  },
  supportedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 10,
  },
  supportedTitle: { fontSize: 20, fontWeight: "bold", color: colors.darkBlue },
  supportedCountBadge: {
    backgroundColor: "#39CCCC22",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  supportedCountText: { color: "#0a3460", fontWeight: "600" },
  testsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  testChip: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  testChipText: { fontWeight: "600", color: colors.darkBlue, textAlign: "center" },
});
