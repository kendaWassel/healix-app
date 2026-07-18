// screens/patient/Receipts/SendtoPharmacy.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "./Modal";

const SendToPharmacy = ({ open, onClose, onDone, prescription_id }) => {
  const [pharmacies, setPharmacies] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
  });

  const CITY = "Damascus";

  useEffect(() => {
    if (!open) return;

    const fetchPharmacies = async (page = 1) => {
      const token = await AsyncStorage.getItem("token");
      try {
        setLoading(true);

        const response = await fetch(
          `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/pharmacist/pharmacies`,
          {
            headers: {
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        console.log("pharmacies: ", data);
        if (data.status === "success" && Array.isArray(data.data)) {
          setPharmacies(data.data);
          if (data.meta) {
            setPagination({
              currentPage: data.meta.current_page,
              lastPage: data.meta.last_page,
              total: data.meta.total,
            });
          }
        } else {
          setPharmacies([]);
        }
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies(pagination.currentPage);
  }, [open, pagination.currentPage]);

  const filtered = pharmacies.filter(
    (p) =>
      (p.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.address?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.city?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.area?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!selectedPharmacy || !prescription_id) return;

    setLoadingSend(true);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/prescriptions/${prescription_id}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pharmacy_id: selectedPharmacy,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        Alert.alert("Success", data.message);
        onClose();
        onDone();
      } else {
        Alert.alert("Error", "Failed to send prescription!");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong!");
      console.error(error);
    } finally {
      setLoadingSend(false);
    }
  };

  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }));
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Text style={styles.title}>Send to pharmacy</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search pharmacy..."
            style={styles.searchInput}
          />
        </View>
        <View style={styles.cityBtn}>
          <Text style={styles.cityBtnText}>{CITY}</Text>
          <Ionicons name="chevron-down" size={18} color="#0A2A4A" />
        </View>
      </View>

      <ScrollView style={styles.listArea} showsVerticalScrollIndicator={false}>
        {loading && (
          <ActivityIndicator size="large" color="#39CCCC" style={{ marginVertical: 20 }} />
        )}

        {!loading && filtered.length === 0 && (
          <Text style={styles.emptyText}>No pharmacies found</Text>
        )}

        {filtered.map((p) => {
          const isSelected = selectedPharmacy === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedPharmacy(p.id)}
              style={[styles.pharmacyCard, isSelected && styles.pharmacyCardSelected]}
            >
              <View style={styles.pharmacyTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.pharmacyNameRow}>
                    <View style={styles.pharmacyIcon}>
                      <Ionicons name="business" size={18} color="#fff" />
                    </View>
                    <Text
                      style={[
                        styles.pharmacyName,
                        isSelected && styles.textSelected,
                      ]}
                    >
                      {p.name || "Unknown"}
                    </Text>
                  </View>
                  <Text style={styles.pharmacyCity}>{p.city || "Unknown"}</Text>
                  <View style={styles.pharmacyPhoneRow}>
                    <Ionicons name="call-outline" size={13} color="#6b7280" />
                    <Text style={styles.pharmacyPhone}>{p.phone || "Unknown"}</Text>
                  </View>
                </View>

                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={15} color="#0A2A4A" />
                  <Text style={styles.ratingText}>{p.rating ?? "Unknown"}</Text>
                </View>
              </View>

              <View style={styles.pharmacyBottomRow}>
                <View style={styles.bottomItem}>
                  <Ionicons name="time-outline" size={15} color="#6b7280" />
                  <Text style={styles.bottomItemText}>
                    {p.from || "Unknown"} - {p.to || "Unknown"}
                  </Text>
                </View>
                <View style={styles.bottomItem}>
                  <Ionicons name="location-outline" size={15} color="#6b7280" />
                  <Text style={styles.bottomItemText} numberOfLines={1}>
                    {p.address || "Unknown"}
                  </Text>
                </View>
                {p.open_now !== undefined && (
                  <Text
                    style={[
                      styles.openStatus,
                      { color: p.open_now ? "#16a34a" : "#dc2626" },
                    ]}
                  >
                    {p.open_now ? "Open" : "Closed"}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.paginationRow}>
        <TouchableOpacity
          onPress={handlePrevPage}
          disabled={pagination.currentPage === 1}
          style={[
            styles.pageBtn,
            pagination.currentPage === 1 && styles.btnDisabled,
          ]}
        >
          <Text style={styles.pageBtnText}>Prev</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Page {pagination.currentPage} of {pagination.lastPage}
        </Text>

        <TouchableOpacity
          onPress={handleNextPage}
          disabled={pagination.currentPage === pagination.lastPage}
          style={[
            styles.pageBtn,
            pagination.currentPage === pagination.lastPage && styles.btnDisabled,
          ]}
        >
          <Text style={styles.pageBtnText}>Next</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <TouchableOpacity
          onPress={() => {
            setSelectedPharmacy(null);
            onClose();
          }}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!selectedPharmacy || loadingSend}
          style={[
            styles.sendBtn,
            (!selectedPharmacy || loadingSend) && styles.btnDisabled,
          ]}
        >
          <Text style={styles.sendBtnText}>
            {loadingSend ? "Sending..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default SendToPharmacy;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0A2A4A",
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "#111827",
  },
  cityBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cityBtnText: {
    color: "#0A2A4A",
    fontWeight: "500",
  },
  listArea: {
    maxHeight: 350,
  },
  emptyText: {
    textAlign: "center",
    color: "#6b7280",
    marginVertical: 20,
  },
  pharmacyCard: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  pharmacyCardSelected: {
    borderColor: "#39CCCC",
  },
  pharmacyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pharmacyNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pharmacyIcon: {
    backgroundColor: "#39CCCC",
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pharmacyName: {
    fontWeight: "600",
    color: "#0A2A4A",
    fontSize: 15,
  },
  textSelected: {
    color: "#39CCCC",
  },
  pharmacyCity: {
    color: "#1f2937",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 38,
  },
  pharmacyPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginLeft: 38,
  },
  pharmacyPhone: {
    color: "#6b7280",
    fontSize: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    color: "#0A2A4A",
    fontWeight: "600",
    fontSize: 13,
  },
  pharmacyBottomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 12,
  },
  bottomItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "45%",
  },
  bottomItemText: {
    color: "#6b7280",
    fontSize: 12,
  },
  openStatus: {
    fontWeight: "600",
    fontSize: 12,
    marginLeft: "auto",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  pageBtn: {
    borderWidth: 1,
    borderColor: "#0A2A4A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pageBtnText: {
    color: "#0A2A4A",
    fontWeight: "500",
  },
  pageInfo: {
    color: "#374151",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#0A2A4A",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    color: "#0A2A4A",
    fontWeight: "600",
  },
  sendBtn: {
    backgroundColor: "#0A2A4A",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});