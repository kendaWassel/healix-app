// screens/patient/DoctorConsultation/Booking/ScheduleLaterModal.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export default function ScheduleLaterModal({
  isOpen,
  onClose,
  doctorId,
  onConfirm,
}) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [times, setTimes] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const minDate = new Date();

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const bookTime = async (time) => {
    setError(null);
    setLoading(true);

    const token = await AsyncStorage.getItem("token");
    const timeParts = time.split(":");
    const timeWithSeconds = timeParts.length === 2 ? `${time}:00` : time;
    const formattedDateTime = `${selectedDate}T${timeWithSeconds}`;
    console.log("date: ", formattedDateTime);

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/consultations/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctor_id: doctorId,
            scheduled_at: formattedDateTime,
            call_type: "schedule",
          }),
        }
      );

      if (!response.ok) {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("scheduleLater.consultationFailed"));
      }

      await response.json();
      if (onConfirm) onConfirm({ date: selectedDate, time });
    } catch (err) {
      setError(err.message || t("scheduleLater.consultationFailedGeneric"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate("");
      setSelectedTime(null);
      setError(null);
      setTimes([]);
      setDoctor(null);
      setShowDatePicker(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!selectedDate || !doctorId) {
      setTimes([]);
      return;
    }

    const fetchSlots = async () => {
      const token = await AsyncStorage.getItem("token");
      setLoading(true);
      setError(null);
      try {
        const url = `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/doctors/${doctorId}/available-slots?date=${selectedDate}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || t("scheduleLater.loadSlotsFailed"));
        }
        const data = await res.json();
        console.log("slots: ", data);
        const list = data.available_slots;
        const normalized = Array.isArray(list) ? list : [];
        setTimes(normalized);
        setDoctor(data.doctor_id);
      } catch (e) {
        setError(e.message || t("scheduleLater.loadSlotsFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [isOpen, selectedDate, doctorId]);

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{t("scheduleLater.title")}</Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>{t("scheduleLater.pickDate")}</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={{ color: selectedDate ? "#111827" : "#9ca3af" }}>
                  {selectedDate || t("scheduleLater.selectDate")}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={selectedDate ? new Date(selectedDate) : minDate}
                    mode="date"
                    minimumDate={minDate}
                    display="spinner"
                    themeVariant="light"
                    onChange={(event, date) => {
                      if (date) setSelectedDate(formatDate(date));
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.confirmDateBtn}
                  >
                    <Text style={styles.confirmDateBtnText}>{t("scheduleLater.confirmDate")}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.slotsWrapper}>
              {loading && (
                <View style={styles.centerRow}>
                  <ActivityIndicator color="#39CCCC" />
                  <Text style={styles.loadingText}>
                    {t("scheduleLater.loadingTimes")}
                  </Text>
                </View>
              )}

              {!loading && error && <Text style={styles.errorText}>{error}</Text>}

              {!loading && !error && selectedDate && (
                times.length > 0 ? (
                  <View>
                    <Text style={styles.slotsLabel}>{t("scheduleLater.availableTimes")}</Text>
                    <ScrollView
                      style={styles.slotsScrollArea}
                      nestedScrollEnabled={true}
                      showsVerticalScrollIndicator={true}
                    >
                      <View style={styles.slotsGrid}>
                        {times.map((time, idx) => {
                          const isSelected = selectedTime === time;
                          return (
                            <TouchableOpacity
                              key={`${time}-${idx}`}
                              onPress={() => setSelectedTime(time)}
                              style={[
                                styles.slotBtn,
                                isSelected && styles.slotBtnSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.slotBtnText,
                                  isSelected && styles.slotBtnTextSelected,
                                ]}
                              >
                                {time}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>
                ) : (
                  <Text style={styles.hintText}>
                    {t("scheduleLater.noSlots")}
                  </Text>
                )
              )}

              {!selectedDate && (
                <Text style={styles.hintText}>
                  {t("scheduleLater.selectDateHint")}
                </Text>
              )}
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity onPress={onClose} disabled={loading} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedDate && selectedTime) {
                    bookTime(selectedTime);
                  }
                }}
                disabled={loading || !selectedDate || !selectedTime}
                style={[
                  styles.confirmBtn,
                  (!selectedDate || !selectedTime || loading) && styles.confirmBtnDisabled,
                ]}
              >
                <Text style={styles.confirmBtnText}>
                  {loading ? t("scheduleLater.booking") : t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5,36,67,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 420,
    maxHeight: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerWrapper: {
    marginTop: 8,
  },
  confirmDateBtn: {
    backgroundColor: "#0e7490",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
  },
  confirmDateBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  slotsWrapper: {
    marginBottom: 16,
    minHeight: 60,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 13,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
  },
  slotsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  slotsScrollArea: {
    maxHeight: 180,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
  },
  slotBtnSelected: {
    backgroundColor: "#0e7490",
    borderColor: "#0e7490",
  },
  slotBtnText: {
    fontSize: 13,
    color: "#374151",
  },
  slotBtnTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  hintText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    marginVertical: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#374151",
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#052443",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});