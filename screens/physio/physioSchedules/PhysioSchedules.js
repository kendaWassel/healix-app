import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Footer from "../../Components/footer/Footer";
import PhysioHeader from "../../Components/header/PhysioHeader";
import PatientDetailsModal from "../../doctor/doctorSchedules/PatientDetailsModal";
import CareProviderEndSession from "../../Components/careProviderModals/CareProviderEndSession";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";
import i18n from "../../../i18n/i18n";

const FILTERS = ["All", "accepted", "completed"];

const PhysioSchedules = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewDetails, setViewDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [endLoading, setEndLoading] = useState(false);
  const [startCardId, setStartCardId] = useState(null);
  const [endCardId, setEndCardId] = useState(null);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    totalPages: 1,
  });
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsError, setDetailsError] = useState(null);

  const fetchSchedules = async (page = 1, perPage = 6) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      let url = `${BASE_URL}/provider/physiotherapist/schedules?page=${page}&per_page=${perPage}`;
      if (selectedFilter !== "All") {
        url += `&status=${selectedFilter}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

        },
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Request failed");
      }

      const result = await response.json();
      console.log("schedules: ", result);
      setSchedules(result.data);
      const totalItems = result.meta?.total;
      const totalPages = Math.ceil(totalItems / (perPage || 3));
      setPagination((prev) => ({
        ...prev,
        totalItems,
        totalPages,
      }));
    } catch (err) {
      setError(err.message || t("physioSchedules.loadFail"));
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async (sessionId) => {
    setStartCardId(sessionId);
    setStartLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/provider/physiotherapist/schedules/${sessionId}/start-session`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

          },
        },
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || t("physioSchedules.startFail"));
      }

      fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      setError(err.message || t("physioSchedules.startFail"));
    } finally {
      setStartCardId(null);
      setStartLoading(false);
    }
  };

  const endSession = async (sessionId, patientId) => {
    setEndLoading(true);
    setEndCardId(sessionId);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/provider/physiotherapist/schedules/${sessionId}/end-session`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

          },
        },
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message);
      }

      setSelectedSessionId(sessionId);
      setSelectedPatientId(patientId);
      setShowSessionModal(true);

      fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      console.error("End session failed:", err.message);
    } finally {
      setEndLoading(false);
      setEndCardId(null);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handleViewDetails = async (patientId) => {
    setViewDetails(patientId);
    setDetailsError(null);
    setDetails(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/patients/${patientId}/view-details`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
    "Accept-Language": i18n.language,

          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch patient details");

      const result = await response.json();
      setDetails(result.data || result);
    } catch (err) {
      setDetailsError(err.message || t("physioSchedules.detailsFail"));
    } finally {
      setViewDetails(null);
    }
  };

  const handleFilterClick = () => setFilterOpen(!filterOpen);

  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterOpen(false);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
  }, [pagination.currentPage, showSessionModal, selectedFilter]);

const filterLabel = (filter) => {
  if (filter === "All") return t("physioSchedules.all");
  if (filter === "accepted") return t("physioSchedules.accepted");
  if (filter === "completed") return t("physioSchedules.completed");
  return filter;
};

  const statusColor = (status) => {
    if (status === "accepted" || status === "مقبولة") return colors.success;
    if (status === "completed" || status === "مكتملة") return colors.textColor;
    return colors.cyan;
  };

  const renderCard = ({ item: schedule }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{schedule.patient_name}</Text>
        <Text style={styles.serviceText}>
          <Text style={styles.serviceLabel}>
            {t("physioSchedules.service")}{" "}
          </Text>
          {schedule.service}
        </Text>
      </View>

      <View style={styles.infoBlock}>
        <View style={styles.infoRow}>
          <FontAwesome5 name="clock" size={16} color={colors.cyan} />
          <Text style={styles.infoText}>
            {t("physioSchedules.at")}{" "}
            {new Date(schedule.scheduled_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <FontAwesome5 name="map-marker-alt" size={16} color={colors.cyan} />
          <Text style={styles.infoText}>{schedule.address}</Text>
        </View>

        <Text style={styles.statusRow}>
          {t("physioSchedules.status")}{" "}
          <Text style={{ color: statusColor(schedule.status), fontWeight: "600" }}>
            {schedule.status}
          </Text>
        </Text>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={() => handleViewDetails(schedule.patient_id)}
          disabled={viewDetails === schedule.patient_id}
        >
          <Text
            style={[
              styles.viewDetailsText,
              viewDetails === schedule.patient_id && styles.disabledText,
            ]}
          >
            {viewDetails === schedule.patient_id
              ? t("physioSchedules.loadingDetails")
              : t("physioSchedules.viewDetails")}
          </Text>
        </TouchableOpacity>

        {schedule.status === "accepted" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.startBtn]}
            onPress={() => startSession(schedule.session_id)}
            disabled={startLoading}
          >
            <Text style={styles.actionBtnText}>
              {startLoading && startCardId === schedule.session_id
                ? t("physioSchedules.starting")
                : t("physioSchedules.startSession")}
            </Text>
          </TouchableOpacity>
        )}

        {schedule.status === "in_progress" && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.endBtn]}
            onPress={() => endSession(schedule.session_id, schedule.patient_id)}
            disabled={endLoading}
          >
            <Text style={styles.actionBtnText}>
              {endLoading && endCardId === schedule.session_id
                ? t("physioSchedules.ending")
                : t("physioSchedules.endSession")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <PhysioHeader />
      <View style={styles.container}>
        <View style={{ marginBottom: 20 }}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t("physioSchedules.title")}</Text>

            <View>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={handleFilterClick}
              >
                <Text style={styles.filterBtnText}>
                  {t("physioSchedules.filter")} {filterLabel(selectedFilter)}
                </Text>
                <FontAwesome5
                  name="chevron-down"
                  size={12}
                  color="#009999"
                  style={{
                    transform: [{ rotate: filterOpen ? "180deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>

              {filterOpen && (
                <View style={styles.filterDropdown}>
                  {FILTERS.map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOption,
                        selectedFilter === filter && styles.filterOptionActive,
                      ]}
                      onPress={() => handleSelectFilter(filter)}
                    >
                      <Text style={styles.filterOptionText}>
                        {filterLabel(filter)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          <Text style={styles.subtitle}>{t("physioSchedules.subtitle")}</Text>
        </View>

        {isLoading && (
          <Text style={styles.centerText}>{t("physioSchedules.loading")}</Text>
        )}

        {!isLoading && schedules.length === 0 && (
          <Text style={styles.centerText}>
            {error || t("physioSchedules.noSchedules")}
          </Text>
        )}

        <FlatList
          data={schedules}
          style={styles.order}
          keyExtractor={(item) => String(item.session_id ?? item.patient_id)}
          renderItem={renderCard}
          contentContainerStyle={{ gap: 16 }}
        />

        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageBtn}
            disabled={pagination.currentPage === 1}
            onPress={handlePrevPage}
          >
            <Text style={styles.pageBtnText}>
              {t("physioSchedules.previous")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageOfText}>
            {t("physioSchedules.pageOf", {
              page: pagination.currentPage,
              lastPage: pagination.totalPages,
            })}
          </Text>

          <TouchableOpacity
            style={styles.pageBtn}
            disabled={pagination.currentPage === pagination.totalPages}
            onPress={handleNextPage}
          >
            <Text style={styles.pageBtnText}>{t("physioSchedules.next")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CareProviderEndSession
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedPatientId(null);
          setSelectedSessionId(null);
          fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
        }}
        patientId={selectedPatientId}
        sessionId={selectedSessionId}
        providerType="physiotherapist"
      />

      {details && (
        <PatientDetailsModal
          details={details}
          onClose={() => {
            setDetails(null);
            setDetailsError(null);
          }}
        />
      )}

      <Footer />
    </View>
  );
};

export default PhysioSchedules;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.gray50 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray500, marginTop: 6 },
  order: { marginBottom: 20 },
  centerText: { textAlign: "center", color: colors.gray500, marginBottom: 12 },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ebfafa",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterBtnText: { color: "#009999", fontWeight: "600" },
  filterDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingVertical: 6,
    width: 160,
    zIndex: 10,
    elevation: 5,
  },
  filterOption: { paddingHorizontal: 16, paddingVertical: 10 },
  filterOptionActive: { backgroundColor: "#ebfafa" },
  filterOptionText: { color: colors.gray800, fontWeight: "500" },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.gray800 },
  serviceText: { fontSize: 14, color: colors.gray700, marginTop: 4 },
  serviceLabel: { color: colors.cyan, fontWeight: "500" },
  infoBlock: { gap: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoText: { fontSize: 13, color: colors.gray700, fontWeight: "500" },
  statusRow: { fontWeight: "500", color: colors.gray700, marginTop: 4 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  viewDetailsText: { color: "#0a3460", fontSize: 13, fontWeight: "600" },
  disabledText: { opacity: 0.5 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  startBtn: { backgroundColor: colors.darkBlue },
  endBtn: { backgroundColor: "#e71313" },
  actionBtnText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
  },
  pageBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  pageBtnText: { color: colors.cyan, fontWeight: "500" },
  pageOfText: { fontWeight: "500", color: colors.gray700 },
});
