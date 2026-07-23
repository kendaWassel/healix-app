// screens/patient/mySchedules/MySchedules.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import Footer from "../../Components/footer/Footer";
import PatientHeader from "../../Components/header/PatientHeader";
import PatientScheduleCall from "./PatientScheduleCall";
import PatientScheduleSession from "./PatientScheduleSession";
import RatingModal from "../DoctorConsultation/booking/RatingModal";
import DoneModal from "../DoctorConsultation/booking/DoneModal";
import PaymentModal from "../../Components/servicesCard/PayementModal";
import { apiFetch } from "../../../utils/apiClient";

const MySchedules = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cpSchedules, setCpSchedules] = useState([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDoctorPhone, setSelectedDoctorPhone] = useState(null);
  const [cpIsLoading, setCpIsLoading] = useState(false);
  const [cpError, setCpError] = useState(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedCpId, setSelectedCpId] = useState(null);
  const [showBookingDone, setShowBookingDone] = useState(false);
  const [cpLoadBtn, setCpLoadBtn] = useState(false);
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 3,
    totalItems: 0,
    totalPages: 1,
  });
  const [cpPagination, setCpPagination] = useState({
    currentPage: 1,
    itemsPerPage: 3,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await apiFetch(
      `/api/patient/my-schedules?page=${pagination.currentPage}&per_page=3`
    );
      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
           throw new Error(serverError.message || t("mySchedules.loadFail"));
      }
      const data = await response.json();
      setSchedules(data.data);
      console.log("schedules: ", data);
      const totalItems = data.meta?.total || 0;
      const totalPages = Math.ceil(totalItems / pagination.itemsPerPage) || 1;
      setPagination((prev) => ({ ...prev, totalItems, totalPages }));
    } catch (err) {
      setError(err.message || t("mySchedules.loadFail"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCpSchedules = async () => {
    if (!cpLoadBtn) return;
    setCpIsLoading(true);
    setCpError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/care-provider-schedules?page=${cpPagination.currentPage}&per_page=3`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || "Request failed");
      }
      const data = await response.json();
      setCpSchedules(data.data);
      console.log("Cp schedules: ", data);
      const totalItems = data.meta?.total || 0;
      const totalPages = Math.ceil(totalItems / cpPagination.itemsPerPage) || 1;
      setCpPagination((prev) => ({ ...prev, totalItems, totalPages }));
    } catch (err) {
      setCpError(err.message || t("mySchedules.loadFail"));
    } finally {
      setCpIsLoading(false);
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
  const handleCpNextPage = () => {
    if (cpPagination.currentPage < cpPagination.totalPages) {
      setCpPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };
  const handleCpPrevPage = () => {
    if (cpPagination.currentPage > 1) {
      setCpPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayModal(false);
    setTimeout(() => setShowRateModal(true), 300);
  };

  const handleRatingSkip = () => {
    setShowRateModal(false);
    setTimeout(() => setShowBookingDone(true), 300);
  };

  useEffect(() => {
    fetchSchedules();
  }, [pagination.currentPage]);

  useEffect(() => {
    if (cpLoadBtn) {
      fetchCpSchedules();
    }
  }, [cpLoadBtn, cpPagination.currentPage]);

  const PaginationBar = ({ page, totalPages, onPrev, onNext }) => (
    <View style={styles.paginationRow}>
      <TouchableOpacity
        onPress={onPrev}
        disabled={page === 1}
        style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
      >
        <Text style={[styles.pageBtnText, page === 1 && styles.pageBtnTextDisabled]}>
          {t("common.prev")}
        </Text>
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        {page} of {totalPages}
      </Text>
      <TouchableOpacity
        onPress={onNext}
        disabled={page === totalPages}
        style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
      >
        <Text
          style={[styles.pageBtnText, page === totalPages && styles.pageBtnTextDisabled]}
        >
          {t("common.next")}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <PatientHeader />
      <ScrollView style={{ backgroundColor: "#f9fafb" }} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Doctor Schedules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("mySchedules.doctorSchedules")}</Text>
          <Text style={styles.sectionSubtitle}>{t("mySchedules.checkSchedules")}</Text>

          {isLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : schedules.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {schedules.map((schedule) => (
                  <View key={schedule.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTopLeft}>
                        <Image
                          source={{ uri: schedule.doctor_image || undefined }}
                          defaultSource={require("../../../assets/no-photo.png")}
                          style={styles.avatar}
                        />
                        <View>
                          <Text style={styles.doctorName}>{schedule.doctor_name}</Text>
                          <Text style={styles.specialization}>
                            {schedule.specialization}
                          </Text>
                        </View>
                      </View>

                      {schedule.status !== "completed" && (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedConsultationId(
                              schedule.consultation_id || schedule.id
                            );
                            setSelectedDoctorId(schedule.doctor_id);
                            setSelectedDoctorPhone(schedule.doctor_phone);
                            setShowCallModal(true);
                          }}
                          style={styles.callBtn}
                        >
                          <Ionicons name="call" size={16} color="#39CCCC" />
                          <Text style={styles.callBtnText}>{t("mySchedules.call")}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color="#39CCCC" />
                        <Text style={styles.infoText}>
                          {schedule.scheduled_at
                            ? new Date(schedule.scheduled_at).toLocaleString()
                            : t("mySchedules.unknown")}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="cash-outline" size={16} color="#39CCCC" />
                        <Text style={styles.infoText}>{schedule.fee}</Text>
                      </View>
                      <Text style={styles.statusText}>
                        {schedule.status || t("mySchedules.unknown")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <PaginationBar
                page={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
              />
            </>
          ) : (
            <Text style={styles.emptyText}>{t("mySchedules.noSchedulesFound")}</Text>
          )}
        </View>

        {/* Care Provider Schedules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("mySchedules.careProviderSchedules")}</Text>
          <Text style={styles.sectionSubtitle}>{t("mySchedules.checkSchedules")}</Text>

          {!cpLoadBtn ? (
            <TouchableOpacity
              onPress={() => setCpLoadBtn(true)}
              style={styles.loadBtn}
            >
              <Text style={styles.loadBtnText}>{t("mySchedules.loadOrders")}</Text>
            </TouchableOpacity>
          ) : cpIsLoading ? (
            <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
          ) : cpError ? (
            <Text style={styles.errorText}>{cpError}</Text>
          ) : cpSchedules.length > 0 ? (
            <>
              <View style={styles.cardsWrap}>
                {cpSchedules.map((schedule) => (
                  <View key={schedule.session_id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTopLeft}>
                        <Image
                          source={{ uri: schedule.care_provider_image || undefined }}
                          defaultSource={require("../../../assets/no-photo.png")}
                          style={styles.avatar}
                        />
                        <View>
                          <Text style={styles.doctorName}>
                            {schedule.care_provider_name}
                          </Text>
                          <Text style={styles.specialization}>
                            Type: {schedule.type}
                          </Text>
                        </View>
                      </View>
                      {schedule.session_status === "canceled" ? (
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedSessionId(schedule.session_id);
                            setSelectedCpId(schedule.id);
                            setShowScheduleModal(true);
                          }}
                          style={styles.callBtn}
                        >
                          <Text style={styles.callBtnText}>{t("mySchedules.chooseNewDate")}</Text>
                        </TouchableOpacity>
                      ) : (
                        schedule.session_status === "completed" && (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedSessionId(schedule.session_id);
                              setSelectedCpId(schedule.care_provider_id);
                              setShowPayModal(true);
                            }}
                            style={styles.callBtn}
                          >
                            <Ionicons name="star" size={16} color="#39CCCC" />
                            <Text style={styles.callBtnText}>{t("mySchedules.payAndRate")}</Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>

                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={16} color="#39CCCC" />
                        <Text style={styles.infoText}>
                          {schedule.session_scheduled_at
                            ? new Date(
                                schedule.session_scheduled_at
                              ).toLocaleString()
                            : t("mySchedules.unknown")}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="cash-outline" size={16} color="#39CCCC" />
                        <Text style={styles.infoText}>{schedule.session_fee}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t("mySchedules.service")} </Text>
                      <Text style={styles.detailValue}>
                        {schedule.session_reason || t("mySchedules.unknown")}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t("mySchedules.gender")} </Text>
                      <Text style={styles.detailValue}>
                        {schedule.gender || t("mySchedules.unknown")}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{t("mySchedules.status")} </Text>
                      {schedule.session_status === "canceled" ? (
                        <View style={styles.canceledBadge}>
                          <Text style={styles.canceledBadgeText}>{t("mySchedules.canceled")}</Text>
                        </View>
                      ) : (
                        <Text style={styles.detailValue}>
                          {schedule.session_status || t("mySchedules.unknown")}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <PaginationBar
                page={cpPagination.currentPage}
                totalPages={cpPagination.totalPages}
                onPrev={handleCpPrevPage}
                onNext={handleCpNextPage}
              />
            </>
          ) : (
            <Text style={styles.emptyText}>{t("mySchedules.noSchedulesFound")}</Text>
          )}
        </View>

     
      </ScrollView>
   <Footer />
      <PatientScheduleCall
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setSelectedConsultationId(null);
          setSelectedDoctorId(null);
          setSelectedDoctorPhone(null);
        }}
        consultationId={selectedConsultationId}
        doctorId={selectedDoctorId}
        doctorPhone={selectedDoctorPhone}
      />
      <PaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        paymentType="careprovider"
      />
      <RatingModal
        isOpen={showRateModal}
        onClose={handleRatingSkip}
        url={`session/${selectedSessionId}/rate/${selectedCpId}`}
        onRatingSuccess={() => {
          setShowRateModal(false);
          setTimeout(() => setShowBookingDone(true), 300);
        }}
        message={t("mySchedules.rateCareProvider")}
      />
      <DoneModal
        isOpen={showBookingDone}
        onHome={() => {
          setShowBookingDone(false);
          setSelectedSessionId(null);
          setSelectedCpId(null);
          setShowPayModal(false);
          setShowRateModal(false);
          fetchCpSchedules();
        }}
        message={t("mySchedules.thankYouFeedback")}
      />
      <PatientScheduleSession
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        cpId={selectedCpId}
        onConfirm={() => {
          setShowScheduleModal(false);
          setTimeout(() => setShowBookingDone(true), 300);
        }}
        sessionId={selectedSessionId}
      />
    </View>
  );
};



const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0a3460",
  },
  sectionSubtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginTop: 6,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#4b5563",
  },
  loadBtn: {
    alignSelf: "center",
    backgroundColor: "#052443",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 16,
  },
  loadBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cardsWrap: {
    gap: 16,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  cardTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#60a5fa",
  },
  doctorName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },
  specialization: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginTop: 2,
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ecf8f6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callBtnText: {
    color: "#0a3460",
    fontSize: 12,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  statusText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  detailLabel: {
    color: "#39CCCC",
    fontWeight: "700",
    fontSize: 13,
  },
  detailValue: {
    color: "#374151",
    fontWeight: "500",
    fontSize: 13,
  },
  canceledBadge: {
    backgroundColor: "#f87171",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  canceledBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginBottom: 10,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: "#39CCCC",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageBtnDisabled: {
    borderColor: "#d1d5db",
  },
  pageBtnText: {
    color: "#39CCCC",
    fontSize: 13,
    fontWeight: "600",
  },
  pageBtnTextDisabled: {
    color: "#9ca3af",
  },
  pageInfo: {
    color: "#374151",
    fontWeight: "600",
  },
});

export default MySchedules;