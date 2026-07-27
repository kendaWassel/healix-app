import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "../../../constants/colors";

// NOTE: the web version imported FAIDCard but never rendered it (dead
// import), so it's dropped here. Let me know if you actually want a
// first-aid card shown somewhere in this screen.

const severityColors = {
  normal: { bg: "#dcfce7", text: "#15803d" },
  mild: { bg: "#fef9c3", text: "#a16207" },
  moderate: { bg: "#ffedd5", text: "#c2410c" },
  severe: { bg: "#fee2e2", text: "#b91c1c" },
  critical: { bg: "#dc2626", text: colors.white },
};

const statusColor = (status) =>
  status === "normal"
    ? { bg: "#dcfce7", text: "#15803d" }
    : { bg: "#fee2e2", text: "#b91c1c" };

export default function ResultsSection({ report }) {
  const { t } = useTranslation();

  if (!report) return null;

  const severity = severityColors[report.overall_severity] || {
    bg: colors.gray200,
    text: colors.gray800,
  };

  return (
    <View style={styles.container}>
      {/* Summary cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t("labAnalysis.testsAnalyzed")}</Text>
          <Text style={styles.summaryValue}>{report.total_tests_analyzed}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t("labAnalysis.normal")}</Text>
          <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
            {report.normal_count}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t("labAnalysis.abnormal")}</Text>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            {report.abnormal_count}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t("labAnalysis.severity")}</Text>
          <View
            style={[styles.severityBadge, { backgroundColor: severity.bg }]}
          >
            <Text style={[styles.severityBadgeText, { color: severity.text }]}>
              {report.overall_severity}
            </Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("labAnalysis.summaryTitle")}</Text>
        <Text style={styles.summaryText}>{report.summary}</Text>
      </View>

      {/* Conditions */}
      {report.conditions?.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>
            {t("labAnalysis.possibleConditions")}
          </Text>

          <View style={{ gap: 16 }}>
            {report.conditions.map((condition, index) => {
              const condSeverity =
                severityColors[condition.severity] || {
                  bg: colors.gray200,
                  text: colors.gray800,
                };
              return (
                <View key={index} style={styles.card}>
                  <View style={styles.conditionHeader}>
                    <Text style={styles.conditionName}>
                      {condition.condition_name}
                    </Text>
                    <View
                      style={[
                        styles.smallBadge,
                        { backgroundColor: condSeverity.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.smallBadgeText,
                          { color: condSeverity.text },
                        ]}
                      >
                        {condition.severity}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.conditionDesc}>
                    {condition.description}
                  </Text>

                  <View style={{ marginTop: 14 }}>
                    <View style={styles.confidenceRow}>
                      <Text style={styles.confidenceLabel}>
                        {t("labAnalysis.confidence")}
                      </Text>
                      <Text style={styles.confidenceLabel}>
                        {Math.round(condition.confidence * 100)}%
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${condition.confidence * 100}%` },
                        ]}
                      />
                    </View>
                  </View>

                  {condition.recommendations?.length > 0 && (
                    <View style={{ marginTop: 14 }}>
                      <Text style={styles.recommendationsTitle}>
                        {t("labAnalysis.recommendations")}
                      </Text>
                      {condition.recommendations.map((r, i) => (
                        <View key={i} style={styles.bulletRow}>
                          <Text style={styles.bullet}>{"\u2022"}</Text>
                          <Text style={styles.bulletText}>{r}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Detailed Results */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderWrap}>
          <Text style={styles.sectionTitle}>{t("labAnalysis.testResults")}</Text>
        </View>

        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>
            {t("labAnalysis.test")}
          </Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
            {t("labAnalysis.value")}
          </Text>
          <Text style={[styles.tableHeaderCell, { flex: 1 }]}>
            {t("labAnalysis.status")}
          </Text>
        </View>

        {report.test_results.map((test, i) => {
          const rowColor = statusColor(test.status);
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.tableCellBold, { flex: 1.2 }]}>
                {test.test_name}
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                {test.value} {test.unit}
              </Text>
              <View style={{ flex: 1 }}>
                <View
                  style={[styles.statusBadge, { backgroundColor: rowColor.bg }]}
                >
                  <Text style={[styles.statusBadgeText, { color: rowColor.text }]}>
                    {test.status}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24, gap: 24 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryCard: {
    flexBasis: "47%",
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 18,
    backgroundColor: colors.white,
  },
  summaryLabel: { color: colors.gray700 },
  summaryValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.darkBlue,
    marginTop: 8,
  },
  severityBadge: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  severityBadgeText: { fontWeight: "600", textTransform: "capitalize" },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.darkBlue,
    marginBottom: 14,
  },
  summaryText: { color: colors.gray700, lineHeight: 24 },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  conditionName: { fontSize: 17, fontWeight: "bold", color: colors.darkBlue, flex: 1 },
  smallBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  smallBadgeText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  conditionDesc: { color: colors.gray700, lineHeight: 22 },
  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  confidenceLabel: { color: colors.gray700, fontSize: 13 },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.gray200,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: colors.cyan },
  recommendationsTitle: {
    fontWeight: "600",
    color: colors.darkBlue,
    marginBottom: 6,
  },
  bulletRow: { flexDirection: "row", gap: 6, marginBottom: 4 },
  bullet: { color: colors.gray700 },
  bulletText: { color: colors.gray700, flex: 1, lineHeight: 20 },
  tableCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 16,
    overflow: "hidden",
  },
  tableHeaderWrap: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f7f9fb",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderCell: { fontWeight: "600", color: colors.gray700, fontSize: 13 },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  tableCell: { color: colors.gray700, fontSize: 13 },
  tableCellBold: { fontWeight: "600", color: colors.gray800 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "500" },
});
