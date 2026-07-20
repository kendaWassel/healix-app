// screens/patient/DoctorConsultation/DoctorConsultation.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import PatientHeader from "../../Components/header/PatientHeader";
import Footer from "../../Components/footer/Footer";

export default function DoctorConsultation() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [selected, setSelected] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [Specialitytypes, setSpecialitytypes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 6,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchSpecializations = async (page, perPage) => {
    setIsLoading(true);
    setError(null);

    const token = await AsyncStorage.getItem("token");

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/specializations?page=${page}&per_page=${perPage}`,
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
        throw new Error(serverError.message || "Specializations request failed");
      }

      const data = await response.json();
      console.log("success getting specs: ", data);

      setSpecialitytypes(data.data);

      const totalItems = data.meta.total;
      const totalPages = Math.ceil(totalItems / (perPage || 6));
      setPagination((prev) => ({
        ...prev,
        totalItems,
        totalPages,
      }));
    } catch (err) {
      setError(err.message || "failed to get specs");
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
    fetchSpecializations(pagination.currentPage, pagination.itemsPerPage);
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const renderSpeciality = ({ item: type }) => {
    const isSelected = selected === type.id;
    return (
      <TouchableOpacity
        style={[styles.specBtn, isSelected && styles.specBtnSelected]}
        onPress={() => {
          console.log("selected: ", type.id);
          setSelected(type.id);
        }}
      >
        <Text style={[styles.specBtnText, isSelected && styles.specBtnTextSelected]}>
          {type.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
  <View style={{ flex: 1 }}>    
            <PatientHeader />
      <View style={styles.headerSection}>
        <TouchableOpacity
          onPress={() => {
            console.log("Back pressed, can go back?", navigation.canGoBack());
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={26} color="#052443" />
        </TouchableOpacity>

        <View style={styles.headerRow}>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>{t("doctorConsultation.pickSpeciality")}</Text>
            <Text style={styles.subtitle}>
              {t("doctorConsultation.tapToChoose")}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            disabled={!selected}
            onPress={() => navigation.navigate("PickDoctor", { id: selected })}
          >
            <Text style={styles.nextBtnText}>{t("common.next")}</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 16 }} />
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* البطاقات — قريبة من الرأس، تبدأ من الأعلى بدون توسيط */}
      <FlatList
        data={Specialitytypes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSpeciality}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListFooterComponent={
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
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 20,
        }}
      />

      <Footer />
    </View>
  );
}

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
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  title: {
    color: "#052443",
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    color: "#767676",
    marginTop: 8,
    fontSize: 13,
  },
  nextBtn: {
    backgroundColor: "#052443",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  nextBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  nextBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  specBtn: {
    width: "48%",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: "center",
    marginTop: 8,
    justifyContent: "center",
  },
  specBtnSelected: {
    borderColor: "#39CCCC",
    backgroundColor: "#ecfeff",
  },
  specBtnText: {
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
  specBtnTextSelected: {
    color: "#0e7490",
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