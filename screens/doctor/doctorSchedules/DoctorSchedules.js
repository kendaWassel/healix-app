// screens/doctor/DoctorSchedules.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DoctorHeader from "../../Components/header/DoctorHeader";
import Footer from "../../Components/footer/Footer";
import PatientDetailsModal from "./PatientDetailsModal";
import DoctorCallNow from "../doctorCallNow/DoctorCallNow";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS = [
  { key: "All", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function DoctorSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    totalPages: 1,
  });
  const [patientPhone, setPatientPhone] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);

  const fetchSchedules = async (page, perPage) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      let url = `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/doctor/my-schedules?page=${page}&per_page=${perPage}`;
      if (selectedFilter !== "All") {
        url += `&status=${selectedFilter}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Request failed");
      }

      const data = await response.json();
      console.log("Schedules fetched:", data);
      if (data.status === "success" && Array.isArray(data.data)) {
        setSchedules(data.data);
        const totalItems = data.meta?.total || data.total || 0;
        const totalPages = Math.ceil(totalItems / (perPage || 6));
        setPagination((prev) => ({
          ...prev,
          totalItems,
          totalPages,
        }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed fetching schedules:", err);
      setError(err.message || "Failed to load schedules.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
  }, [pagination.currentPage, pagination.itemsPerPage, selectedFilter]);

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

  const handleSelectFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterOpen(false);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleViewDetails = async (patientId, consultation_id) => {
    console.log("patient id: ", patientId);
    setSelectedCardId(consultation_id);
    setSelectedPatientId(patientId);
    setIsLoadingDetails(true);
    setError(null);
    setDetails(null);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patients/${patientId}/view-details`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch patient details");

      const data = await response.json();
      console.log("Patient details:", data);
      setDetails(data.data || data);
      setSuccessMsg("Details loaded successfully.");
    } catch (err) {
      setError(err.message || "Failed to load Details");
    } finally {
      setSelectedPatientId(null);
      setSelectedCardId(null);
      setIsLoadingDetails(false);
    }
  };

  const statusStyle = (status) => {
    if (status === "completed") return styles.statusCompleted;
    if (status === "pending") return styles.statusPending;
    return styles.statusInProgress;
  };

  const statusTextStyle = (status) => {
    if (status === "completed") return styles.statusCompletedText;
    if (status === "pending") return styles.statusPendingText;
    return styles.statusInProgressText;
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.patientName}>{item.patient_name || "Unknown"}</Text>
        <View style={[styles.statusBadge, statusStyle(item.status)]}>
          <Text style={[styles.statusText, statusTextStyle(item.status)]}>
            {item.status || "Unknown"}
          </Text>
        </View>
      </View>

      {item.status !== "completed" && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {
            setSelectedPatientId(item.patient_id);
            setPatientPhone(item.patient_phone);
            setSelectedConsultationId(item.consultation_id || item.id);
            setShowCallModal(true);
          }}
        >
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color="#39CCCC" />
          <Text style={styles.timeText}>
            {item.scheduled_at
              ? new Date(item.scheduled_at).toLocaleString()
              : "Unknown"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailsButton}
          disabled={isLoadingDetails}
          onPress={() => handleViewDetails(item.patient_id, item.consultation_id)}
        >
          <Text style={styles.detailsButtonText}>
            {selectedCardId === item.consultation_id ? "Loading..." : "View details"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <DoctorHeader />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Schedules</Text>
          <View>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterOpen(!filterOpen)}
            >
              <Ionicons name="filter" size={16} color="#052443" />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>

            {filterOpen && (
              <View style={styles.filterMenu}>
                {FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => handleSelectFilter(f.key)}
                    style={styles.filterMenuItem}
                  >
                    <Text style={styles.filterMenuItemText}>{f.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        <Text style={styles.subtitle}>Check your schedules here</Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={schedules}
        keyExtractor={(item,index) => String(item.id ?? item.consultation_id ?? `schedule-${index}`)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginTop: 30 }} />
          ) : (
            <Text style={styles.emptyText}>No schedules found.</Text>
          )
        }
        ListFooterComponent={
          schedules.length > 0 ? (
            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={styles.pageButton}
                onPress={handlePrevPage}
                disabled={pagination.currentPage === 1}
              >
                <Ionicons name="chevron-back" size={16} color="#39CCCC" />
                <Text style={styles.pageButtonText}>Prev</Text>
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                {pagination.currentPage} / {pagination.totalPages}
              </Text>

              <TouchableOpacity
                style={styles.pageButton}
                onPress={handleNextPage}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <Text style={styles.pageButtonText}>Next</Text>
                <Ionicons name="chevron-forward" size={16} color="#39CCCC" />
              </TouchableOpacity>
            </View>
          ) : (
            <Footer />
          )
        }
      />

      {details && (
        <PatientDetailsModal
          details={details}
          onClose={() => {
            setDetails(null);
            setSuccessMsg(null);
            setError(null);
          }}
        />
      )}

      <DoctorCallNow
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setSelectedPatientId(null);
          setPatientPhone(null);
          setSelectedConsultationId(null);
          fetchSchedules(pagination.currentPage, pagination.itemsPerPage);
        }}
        patientId={selectedPatientId}
        patient_phone={patientPhone}
        consultationId={selectedConsultationId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#052443",
  },
  subtitle: {
    color: "#767676",
    marginTop: 6,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#052443",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    color: "#052443",
    fontWeight: "600",
  },
  filterMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    zIndex: 10,
    minWidth: 140,
  },
  filterMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  filterMenuItemText: {
    color: "#374151",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#767676",
    marginTop: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#052443",
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusCompleted: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  statusCompletedText: { color: "#16a34a" },
  statusPending: { borderColor: "#d97706", backgroundColor: "#fffbeb" },
  statusPendingText: { color: "#d97706" },
  statusInProgress: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  statusInProgressText: { color: "#2563eb" },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#052443",
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  callButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: "#767676",
  },
  detailsButton: {
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    color: "#052443",
    fontWeight: "500",
  },
  paginationControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#39CCCC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pageButtonText: {
    color: "#39CCCC",
    fontWeight: "600",
    fontSize: 13,
  },
  pageInfo: {
    color: "#374151",
    fontWeight: "500",
  },
});