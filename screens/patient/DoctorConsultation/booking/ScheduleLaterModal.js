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

export default function ScheduleLaterModal({
  isOpen,
  onClose,
  doctorId,
  onConfirm,
}) {
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [times, setTimes] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const minDate = new Date(); // اليوم — لا يمكن اختيار تاريخ سابق

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
        throw new Error(serverError.message || "consultation failed");
      }

      await response.json();
      if (onConfirm) onConfirm({ date: selectedDate, time });
    } catch (err) {
      setError(err.message || "Failed to create consultation.");
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
          throw new Error(e.message || "Failed to load slots");
        }
        const data = await res.json();
        console.log("slots: ", data);
        const list = data.available_slots;
        const normalized = Array.isArray(list) ? list : [];
        setTimes(normalized);
        setDoctor(data.doctor_id);
      } catch (e) {
        setError(e.message || "Failed to load slots");
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
            <Text style={styles.title}>Schedule for later</Text>

            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Pick a date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateInput}
              >
                <Text style={{ color: selectedDate ? "#111827" : "#9ca3af" }}>
                  {selectedDate || "Select a date"}
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
                    <Text style={styles.confirmDateBtnText}>Confirm Date</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.slotsWrapper}>
              {loading && (
                <View style={styles.centerRow}>
                  <ActivityIndicator color="#39CCCC" />
                  <Text style={styles.loadingText}>
                    Loading available times...
                  </Text>
                </View>
              )}

              {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && selectedDate && (
  times.length > 0 ? (
    <View>
      <Text style={styles.slotsLabel}>Available times</Text>
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
                onPress={() => {
                  setSelectedTime(time);
                  bookTime(time);
                }}
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
      No available time slots for this date.
    </Text>
  )
)}

              {!selectedDate && (
                <Text style={styles.hintText}>
                  Select a date to see available times.
                </Text>
              )}
            </View>

            <View style={styles.buttonsRow}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (selectedDate && selectedTime) {
                    onConfirm({ date: selectedDate, time: selectedTime });
                  }
                }}
                disabled={!!error || loading || !selectedDate || !selectedTime}
                style={[
                  styles.confirmBtn,
                  (!selectedDate || !selectedTime) && styles.confirmBtnDisabled,
                ]}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
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
    width: "95%",
    maxWidth: 480,
    maxHeight: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 18,
    textAlign: "center",
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerWrapper: {
    marginBottom: 16,
  },
  confirmDateBtn: {
    backgroundColor: "#0e7490",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  confirmDateBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  slotsWrapper: {
    minHeight: 96,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#4b5563",
  },
  errorText: {
    color: "#dc2626",
  },
  hintText: {
    color: "#4b5563",
  },
  slotsLabel: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  
  },
  slotBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: "30%",
    alignItems: "center",
  },
  slotBtnSelected: {
    backgroundColor: "#0e7490",
    borderColor: "#0e7490",
  },
  slotBtnText: {
    fontSize: 13,
    color: "#1f2937",
  },
  slotBtnTextSelected: {
    color: "#fff",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelBtnText: {
    color: "#374151",
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#001f3f",
  },
  confirmBtnDisabled: {
    backgroundColor: "#d1d5db",
  },
  confirmBtnText: {
    color: "#fff",
    fontWeight: "500",
  },
  slotsScrollArea: {
  maxHeight: 180,     
  marginBottom: 8,
},
});