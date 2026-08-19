import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import DoctorHeader from "../../Components/header/DoctorHeader";
import Footer from "../../Components/footer/Footer";
import { colors } from "../../../constants/colors";
import { apiFetch } from "../../../utils/apiClient";
import { usePdfDownload } from "../../../utils/usePdfDownload";

const severityColors = {
  normal: { bg: "#dcfce7", text: "#15803d" },
  mild: { bg: "#fef9c3", text: "#a16207" },
  moderate: { bg: "#ffedd5", text: "#c2410c" },
  severe: { bg: "#fee2e2", text: "#b91c1c" },
  critical: { bg: "#dc2626", text: colors.white },
};

export default function PatientLabAnalyses() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId, patientName } = route.params || {};
  const { downloadDoctorPdf, downloadingId, downloadError } = usePdfDownload();

  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
  });

const fetchAnalyses = async (page = 1) => {
  setIsLoading(true);
  setError(null);
  const token = await AsyncStorage.getItem("token");

  try {
    const response = await fetch(
      `${BASE_URL}/lab/analyses?page=${page}&per_page=${pagination.perPage}`,
      {
        method: "GET",
        headers: {
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log("Lab analyses status:", response.status);

    if (!response.ok) {
      const rawText = await response.text().catch(() => "");
      console.log("Lab analyses error body:", rawText);
      let serverError = {};
      try { serverError = JSON.parse(rawText); } catch {}
      throw new Error(serverError.message || t("labHistory.loadFail"));
    }

    const data = await response.json();
    console.log("Lab analyses fetched:", data);

    setAnalyses(Array.isArray(data.data) ? data.data : []);
    if (data.meta) {
      setPagination((prev) => ({
        ...prev,
        currentPage: data.meta.current_page,
        lastPage: data.meta.last_page,
        total: data.meta.total,
      }));
    }
  } catch (err) {
    console.error("Failed fetching lab analyses:", err);
    setError(err.message || t("labHistory.loadFail"));
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    if (patientId) fetchAnalyses(1);
  }, [patientId]);

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.lastPage) {
      fetchAnalyses(pagination.currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      fetchAnalyses(pagination.currentPage - 1);
    }
  };

  const renderCard = ({ item }) => {
    const severity = severityColors[item.overall_severity] || {
      bg: colors.gray200,
      text: colors.gray800,
    };
    const isDownloading = downloadingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.reportId}>
            {t("labHistory.report")} #{item.report_id}
          </Text>
          <View style={[styles.severityBadge, { backgroundColor: severity.bg }]}>
            <Text style={[styles.severityBadgeText, { color: severity.text }]}>
              {item.overall_severity}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          {item.analyzed_at ? new Date(item.analyzed_at).toLocaleString() : ""}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t("labHistory.testsAnalyzed")}</Text>
            <Text style={styles.statValue}>{item.total_tests_analyzed}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t("labHistory.abnormal")}</Text>
            <Text style={[styles.statValue, { color: "#ef4444" }]}>
              {item.abnormal_count}
            </Text>
          </View>
        </View>

        {item.summary && (
          <Text style={styles.summaryText} numberOfLines={3}>
            {item.summary}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={() =>
            downloadDoctorPdf(patientId, item.id, t("labHistory.downloadDialogTitle"))
          }
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="download-outline" size={16} color={colors.white} />
              <Text style={styles.downloadBtnText}>{t("labHistory.download")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <DoctorHeader />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#052443" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("labHistory.title")}</Text>
            {patientName && <Text style={styles.subtitle}>{patientName}</Text>}
          </View>
        </View>

        {downloadError && (
          <Text style={styles.errorText}>{t("labHistory.downloadFail")}</Text>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.cyan} style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : analyses.length === 0 ? (
          <Text style={styles.emptyText}>{t("labHistory.noAnalyses")}</Text>
        ) : (
          <FlatList
            data={analyses}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
            contentContainerStyle={{ gap: 16, paddingVertical: 12 }}
          />
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            style={[
              styles.pageBtn,
              pagination.currentPage === 1 && styles.pageBtnDisabled,
            ]}
            onPress={handlePrevPage}
            disabled={pagination.currentPage === 1 || isLoading}
          >
            <Text
              style={[
                styles.pageBtnText,
                pagination.currentPage === 1 && styles.pageBtnTextDisabled,
              ]}
            >
              {t("labHistory.previous")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageOfText}>
            {t("labHistory.pageOf", {
              page: pagination.currentPage,
              total: pagination.lastPage,
            })}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageBtn,
              pagination.currentPage === pagination.lastPage && styles.pageBtnDisabled,
            ]}
            onPress={handleNextPage}
            disabled={pagination.currentPage === pagination.lastPage || isLoading}
          >
            <Text
              style={[
                styles.pageBtnText,
                pagination.currentPage === pagination.lastPage &&
                  styles.pageBtnTextDisabled,
              ]}
            >
              {t("labHistory.next")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.gray50 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray500, marginTop: 4 },
  errorText: { color: "#ef4444", textAlign: "center", marginVertical: 12 },
  emptyText: { color: colors.gray500, textAlign: "center", marginTop: 30 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 18,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reportId: { fontWeight: "700", color: "#0a3460", fontSize: 15 },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  severityBadgeText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  dateText: { fontSize: 12, color: colors.gray500, marginBottom: 12 },
  statsRow: { flexDirection: "row", gap: 24, marginBottom: 12 },
  statItem: {},
  statLabel: { fontSize: 12, color: colors.gray700 },
  statValue: { fontSize: 18, fontWeight: "bold", color: colors.darkBlue, marginTop: 2 },
  summaryText: { fontSize: 13, color: colors.gray700, lineHeight: 20, marginBottom: 14 },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.darkBlue,
    borderRadius: 10,
    paddingVertical: 10,
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadBtnText: { color: colors.white, fontWeight: "600" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 12,
  },
  pageBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  pageBtnDisabled: { borderColor: colors.gray300 },
  pageBtnText: { color: colors.cyan, fontWeight: "500" },
  pageBtnTextDisabled: { color: colors.gray500 },
  pageOfText: { fontWeight: "600", color: colors.gray700 },
});