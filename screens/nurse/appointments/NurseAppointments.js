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
import NurseHeader from "../../Components/header/NurseHeader";
import PatientDetailsModal from "../../doctor/doctorSchedules/PatientDetailsModal";
import CareProviderEndSession from "../../Components/careProviderModals/CareProviderEndSession";
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const NurseAppointments = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewDetails, setViewDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [endLoading, setEndLoading] = useState(false);
  const [startCardId, setStartCardId] = useState(false);
  const [endCardId, setEndCardId] = useState(false);
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
      let url = `${BASE_URL}/provider/nurse/schedules?page=${page}&per_page=${perPage}`;
      if (selectedFilter !== "All") {
        url += `&status=${selectedFilter}`;
      }
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Request failed");
      }

      const data = await response.json();
      setSchedules(data.data);
      console.log("schedules: ", data);
      const totalItems = data.meta?.total;
      const totalPages = Math.ceil(totalItems / (perPage || 3));
      setPagination((prev) => ({ ...prev, totalItems, totalPages }));
    } catch (err) {
      setError(err.message || "Failed to load schedules.");
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
        `${BASE_URL}/provider/nurse/schedules/${sessionId}/start-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to start session");
      }

      fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
    } catch (err) {
      setError(err.message || "Failed to start session");
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
        `${BASE_URL}/provider/nurse/schedules/${sessionId}/end-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok || data.status !== "success") {
        throw new Error(data.message);
      }

      setSelectedSessionId(sessionId);
      setSelectedPatientId(patientId);
      setShowSessionModal(true);

      fetchSchedules();
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
            "Content-Type": "application/json",
            ...NGROK_HEADERS,
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch patient details");

      const data = await response.json();
      setDetails(data.data || data);
    } catch (err) {
      setDetailsError(err.message || "Failed to load Details");
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

  const filterLabel =
    selectedFilter === "All"
      ? t("nurseAppointments.all")
      : selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1);

  const statusColor = (status) => {
    if (status === "accepted") return colors.success;
    if (status === "completed") return colors.textColor;
    return colors.cyan;
  };

  const renderCard = ({ item: schedule }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.patientName}>{schedule.patient_name}</Text>
        <Text style={styles.serviceLine}>
          <Text style={styles.serviceLabel}>
            {t("nurse.nurseAppointments.service")}{" "}
          </Text>
          {schedule.service}
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        <View style={styles.row}>
          <FontAwesome5 name="clock" size={16} color={colors.cyan} />
          <Text style={styles.rowText}>
            {t("nurse.nurseAppointments.at")}{" "}
            {new Date(schedule.scheduled_at).toLocaleString()}
          </Text>
        </View>
        <View style={styles.row}>
          <FontAwesome5 name="map-marker-alt" size={16} color={colors.cyan} />
          <Text style={styles.rowText}>{schedule.address}</Text>
        </View>
        <Text style={styles.statusLine}>
          {t("nurse.nurseAppointments.status")}{" "}
          <Text
            style={{ color: statusColor(schedule.status), fontWeight: "600" }}
          >
            {schedule.status}
          </Text>
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => handleViewDetails(schedule.patient_id)}
          disabled={viewDetails === schedule.patient_id}
        >
          <Text style={styles.viewDetailsText}>
            {viewDetails === schedule.patient_id
              ? t("nurse.nurseAppointments.loadingDetails")
              : t("nurse.nurseAppointments.viewDetails")}
          </Text>
        </TouchableOpacity>

        {schedule.status === "accepted" && (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => startSession(schedule.session_id)}
            disabled={startLoading}
          >
            <Text style={styles.startBtnText}>
              {startLoading && startCardId === schedule.session_id
                ? t("nurse.nurseAppointments.starting")
                : t("nurse.nurseAppointments.startSession")}
            </Text>
          </TouchableOpacity>
        )}

        {schedule.status === "in_progress" && (
          <TouchableOpacity
            style={styles.endBtn}
            onPress={() => endSession(schedule.session_id, schedule.patient_id)}
            disabled={endLoading}
          >
            <Text style={styles.endBtnText}>
              {endLoading && endCardId === schedule.session_id
                ? t("nurse.nurseAppointments.ending")
                : t("nurse.nurseAppointments.endSession")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <NurseHeader />
      <View style={styles.container}>
        <View style={{ marginBottom: 20 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t("nurse.nurseAppointments.title")}</Text>

            <View>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={handleFilterClick}
              >
                <Text style={styles.filterBtnText}>
                  {t("nurse.nurseAppointments.filter")} {filterLabel}
                </Text>
                <FontAwesome5
                  name="chevron-down"
                  size={12}
                  color="#009999"
                  style={
                    filterOpen ? { transform: [{ rotate: "180deg" }] } : null
                  }
                />
              </TouchableOpacity>

              {filterOpen && (
                <View style={styles.filterDropdown}>
                  {["All", "accepted", "completed"].map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterOption,
                        selectedFilter === filter && styles.filterOptionActive,
                      ]}
                      onPress={() => handleSelectFilter(filter)}
                    >
                      <Text style={styles.filterOptionText}>
                        {filter === "All"
                          ? t("nurseAppointments.all")
                          : filter === "accepted"
                            ? t("nurse.nurseAppointments.accepted")
                            : t("nurse.nurseAppointments.completed")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          <Text style={styles.subtitle}>{t("nurse.nurseAppointments.subtitle")}</Text>
        </View>

        {isLoading ? (
          <Text style={styles.centerText}>
            {t("nurse.nurseAppointments.loading")}
          </Text>
        ) : schedules.length > 0 ? (
          <FlatList
            data={schedules}
            keyExtractor={(item) => String(item.patient_id)}
            renderItem={renderCard}
            contentContainerStyle={{ gap: 16, marginBottom: 20 }}
          />
        ) : error ? (
          <Text style={[styles.centerText, { color: colors.danger }]}>
            {error}
          </Text>
        ) : (
          <Text style={styles.centerText}>
            {t("nurse.nurseAppointments.noSchedules")}
          </Text>
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            style={[
              styles.pageBtn,
              pagination.currentPage === 1 && styles.pageBtnDisabled,
            ]}
            onPress={handlePrevPage}
            disabled={pagination.currentPage === 1}
          >
            <Text
              style={[
                styles.pageBtnText,
                pagination.currentPage === 1 && styles.pageBtnTextDisabled,
              ]}
            >
              {t("nurse.nurseAppointments.previous")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageOfText}>
            {t("nurseAppointments.pageOf", {
              page: pagination.currentPage,
              total: pagination.totalPages,
            })}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageBtn,
              pagination.currentPage === pagination.totalPages &&
                styles.pageBtnDisabled,
            ]}
            onPress={handleNextPage}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <Text
              style={[
                styles.pageBtnText,
                pagination.currentPage === pagination.totalPages &&
                  styles.pageBtnTextDisabled,
              ]}
            >
              {t("nurseAppointments.next")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <CareProviderEndSession
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setSelectedPatientId(null);
          setSelectedSessionId(null);
          fetchSchedules();
        }}
        patientId={selectedPatientId}
        sessionId={selectedSessionId}
        providerType="nurse"
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

export default NurseAppointments;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.gray50 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#0a3460" },
  subtitle: { color: colors.gray500, marginTop: 6, fontSize: 15 },
  filterBtn: {
    backgroundColor: "#ebfafa",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterBtnText: { color: "#009999", fontWeight: "600" },
  filterDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    paddingVertical: 6,
    width: 160,
    zIndex: 10,
  },
  filterOption: { paddingHorizontal: 16, paddingVertical: 10 },
  filterOptionActive: { backgroundColor: "#ebfafa" },
  filterOptionText: { fontSize: 14, color: colors.gray800 },
  centerText: {
    textAlign: "center",
    color: colors.gray500,
    marginVertical: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  cardHeader: {
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  patientName: { fontSize: 17, fontWeight: "600", color: colors.gray800 },
  serviceLine: { fontSize: 14, color: colors.textColor, marginTop: 4 },
  serviceLabel: { color: colors.cyan },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowText: { fontSize: 13, fontWeight: "500", color: colors.gray700 },
  statusLine: { marginTop: 6, fontWeight: "500", color: colors.gray700 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  viewDetailsText: { color: "#0a3460", fontSize: 13, fontWeight: "600" },
  startBtn: {
    backgroundColor: colors.darkBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  startBtnText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  endBtn: {
    backgroundColor: "#e71313",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  endBtnText: { color: colors.white, fontSize: 13, fontWeight: "600" },
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
