// screens/patient/DoctorConsultation/PickDoctor/PickDoctor.js
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
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import DoctorCard from "../../../Components/doctorCard/DoctorCard";
import Footer from "../../../Components/footer/Footer";
import BookingOption from "../booking/BookingOption";
import DoneModal from "../booking/DoneModal";
import ScheduleLaterModal from "../booking/ScheduleLaterModal";
import PatientCallNowModal from "../booking/PatientCallNowModal";

const PickDoctor = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { id } = route.params || {};

  const [openPickOption, setOpenPickOption] = useState(false);
  const [openModalDone, setOpenModalDone] = useState(false);
  const [openScheduleLater, setOpenScheduleLater] = useState(false);
  const [openCallNow, setOpenCallNow] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchDoctors = async (page, perPage) => {
    setIsLoading(true);
    setError(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/doctors/by-specialization?specialization_id=${id}&page=${page}&per_page=${perPage}`,
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
        throw new Error(serverError.message || "Doctors request failed");
      }

      const data = await response.json();
      console.log("success getting doctors: ", data);

      setDoctors(data.data);

      const totalItems = data.meta.total;
      const totalPages = Math.ceil(totalItems / (perPage || 6));
      setPagination((prev) => ({
        ...prev,
        totalItems,
        totalPages,
      }));
    } catch (err) {
      setError(err.message || "failed to get doctors");
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    if (id) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDoctors(pagination.currentPage, pagination.itemsPerPage);
    }
  }, [id, pagination.currentPage, pagination.itemsPerPage]);

  const handleConfirm = async (option) => {
    console.log("Selected option:", option);

    if (option === "Schedule For later") {
      setOpenPickOption(false);
      setTimeout(() => {
        setOpenScheduleLater(true);
      }, 200);
    } else if (option === "Call Now") {
      if (selected === null || !doctors[selected]) {
        setError(t("pickDoctor.selectDoctorFirst"));
        setOpenPickOption(false);
        return;
      }

      setOpenPickOption(false);
      setTimeout(() => {
        setOpenCallNow(true);
      }, 200);
    } else {
      setOpenPickOption(false);
      setTimeout(() => {
        setOpenModalDone(true);
      }, 400);
    }
  };

  const handleGoHome = () => {
    setOpenModalDone(false);
    navigation.navigate("PatientHome");
  };

  const renderDoctor = ({ item: doctor, index }) => {
    const isActive = selected === index;
    const isDimmed = selected !== index;
    return (
      <View style={styles.cardWrapper}>
        <DoctorCard
          {...doctor}
          isActive={isActive}
          isDimmed={isDimmed}
          onSelect={() => {
            console.log("doctor selected: ", doctor.id);
            setSelected(index);
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fafbfc" }}>
      <View style={styles.headerSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate("DoctorConsultation")}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={26} color="#052443" />
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t("pickDoctor.title")}</Text>
            <Text style={styles.subtitle}>{t("pickDoctor.tapToChoose")}</Text>
          </View>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              if (selected !== null) {
                setError(null);
                setOpenPickOption(true);
              } else {
                setError(t("pickDoctor.selectDoctorFirst"));
              }
            }}
          >
            <Text style={styles.nextBtnText}>{t("common.next")}</Text>
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {isLoading && (
          <ActivityIndicator
            size="large"
            color="#39CCCC"
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      <FlatList
        data={doctors}
        keyExtractor={(_, index) => String(index)}
        renderItem={renderDoctor}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>{t("pickDoctor.noDoctorsFound")}</Text>
          ) : null
        }
        ListFooterComponent={
          doctors.length > 0 ? (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                onPress={handlePrevPage}
                disabled={pagination.currentPage === 1}
                style={[
                  styles.pageBtn,
                  pagination.currentPage === 1 && styles.pageBtnDisabled,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={16}
                  color={pagination.currentPage === 1 ? "#9ca3af" : "#39CCCC"}
                />
                <Text
                  style={[
                    styles.pageBtnText,
                    pagination.currentPage === 1 && styles.pageBtnTextDisabled,
                  ]}
                >
                  {t("common.prev")}
                </Text>
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                {pagination.currentPage} of {pagination.totalPages}
              </Text>

              <TouchableOpacity
                onPress={handleNextPage}
                disabled={pagination.currentPage === pagination.totalPages}
                style={[
                  styles.pageBtn,
                  pagination.currentPage === pagination.totalPages &&
                    styles.pageBtnDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.pageBtnText,
                    pagination.currentPage === pagination.totalPages &&
                      styles.pageBtnTextDisabled,
                  ]}
                >
                  {t("common.next")}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={
                    pagination.currentPage === pagination.totalPages
                      ? "#9ca3af"
                      : "#39CCCC"
                  }
                />
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          flexGrow: 1,
        }}
      />

      <Footer />

      <BookingOption
        isOpen={openPickOption}
        onClose={() => setOpenPickOption(false)}
        onConfirm={handleConfirm}
      />
      <ScheduleLaterModal
        isOpen={openScheduleLater}
        onClose={() => setOpenScheduleLater(false)}
        doctorId={
          selected !== null && doctors[selected] ? doctors[selected].id : null
        }
        onConfirm={({ date, time }) => {
          console.log("Scheduled later:", { date, time });
          setOpenScheduleLater(false);
          setTimeout(() => setOpenModalDone(true), 300);
        }}
      />
      <DoneModal isOpen={openModalDone} onHome={handleGoHome} message={t("pickDoctor.bookingDone")} />
      <PatientCallNowModal
        onClose={() => setOpenCallNow(false)}
        isOpen={openCallNow}
        doctorId={
          selected !== null && doctors[selected] ? doctors[selected].id : null
        }
        onConfirm={() => {
          console.log(t("pickDoctor.callInitiated"));
        }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  headerSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: "#052443",
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    color: "#767676",
    marginTop: 8,
    fontWeight: "500",
    fontSize: 13,
  },
  nextBtn: {
    backgroundColor: "#052443",
    borderWidth: 2,
    borderColor: "#052443",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#767676",
    marginTop: 30,
  },
  cardWrapper: {
    width: "48%",
    marginBottom: 16,
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginVertical: 20,
  },
  pageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 2,
    borderColor: "#39CCCC",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageBtnDisabled: {
    borderColor: "#e5e7eb",
  },
  pageBtnText: {
    color: "#39CCCC",
    fontWeight: "600",
  },
  pageBtnTextDisabled: {
    color: "#9ca3af",
  },
  pageInfo: {
    color: "#374151",
    fontWeight: "500",
  },
});

export default PickDoctor;