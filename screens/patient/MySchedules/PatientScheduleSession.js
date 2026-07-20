import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export default function PatientScheduleSession({
  isOpen,
  onClose,
  sessionId,
  onConfirm,
}) {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date(0, 0, 0, 0, 0, 0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(new Date());
      setSelectedTime(new Date(0, 0, 0, 0, 0, 0));
    }
  }, [isOpen]);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleBookSession = async () => {
    if (!selectedDate) {
      return;
    }
    const token = await AsyncStorage.getItem("token");

    const formattedDateTime = `${formatDate(selectedDate)} ${formatTime(selectedTime)}`;
    console.log("formated date: ", formattedDateTime);

    try {
      const response = await fetch(
        `https://unjuicy-schizogenous-gibson.ngrok-free.dev/api/patient/home-visits/${sessionId}/request-new-care-provider`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduled_at: formattedDateTime,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        if (onConfirm) {
          onConfirm({ date: formattedDateTime });
        }
      } else {
        const serverError = await response.json().catch(() => ({}));
        throw new Error(serverError.message || t("patientScheduleSession.bookFailed"));
      }
    } finally {
      onClose();
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("patientScheduleSession.title")}</Text>

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>{t("patientScheduleSession.pickDateTime")}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              >
                <Text style={{ color: "#111827" }}>{formatDate(selectedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={[styles.input, { flex: 1 }]}
              >
                <Text style={{ color: "#111827" }}>{formatTime(selectedTime)}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowTimePicker(false);
                  if (date) setSelectedTime(date);
                }}
              />
            )}
          </View>

          <View style={styles.buttonsRow}>
            <TouchableOpacity onPress={handleBookSession} style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>{t("patientScheduleSession.bookSession")}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>{t("patientScheduleSession.close")}</Text>
            </TouchableOpacity>
          </View>
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
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 18,
    textAlign: "center",
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  bookBtn: {
    backgroundColor: "#0e7490",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#0e7490",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  closeBtnText: {
    color: "#0e7490",
    fontWeight: "600",
  },
});