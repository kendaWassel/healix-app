import { useEffect, useState } from "react";
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
import { colors } from "../../../constants/colors";
import { BASE_URL, NGROK_HEADERS } from "../../../constants/api";

const toDateString = (d) => d.toISOString().split("T")[0];
const toTimeString = (d) =>
  d.toTimeString().split(" ")[0]; // "HH:MM:SS"

export default function CareProviderScheduleNextSession({
  isOpen,
  onClose,
  sessionId,
  onConfirm,
}) {
  const [wantsToSchedule, setWantsToSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date(0, 0, 0, 0, 0, 0));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setWantsToSchedule(null);
      setSelectedDate(new Date());
      setSelectedTime(new Date(0, 0, 0, 0, 0, 0));
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (wantsToSchedule === null) {
      setError("Please select Yes or No");
      return;
    }

    if (wantsToSchedule && (!selectedDate || !selectedTime)) {
      setError("Please select both date and time");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (wantsToSchedule) {
        const formattedDateTime = `${toDateString(selectedDate)} ${toTimeString(
          selectedTime
        )}`;
        const token = await AsyncStorage.getItem("token");

        const response = await fetch(
          `${BASE_URL}/home-visits/${sessionId}/follow-up`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...NGROK_HEADERS,
              Authorization: `bearer ${token}`,
            },
            body: JSON.stringify({ scheduled_at: formattedDateTime }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Scheduling next session:", {
            sessionId,
            scheduled_at: formattedDateTime,
          });
        }
        if (onConfirm) {
          onConfirm({ scheduled: true, date: formattedDateTime });
        }
      } else {
        if (onConfirm) {
          onConfirm({ scheduled: false });
        }
      }
    } catch (err) {
      setError(err.message || "Failed to schedule next session");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Schedule Next Session?</Text>
          <Text style={styles.subtitle}>
            Do you want to schedule a next session for this patient?
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.yesNoRow}>
            <TouchableOpacity
              style={[
                styles.yesNoBtn,
                wantsToSchedule === true && styles.yesNoBtnActive,
              ]}
              onPress={() => {
                setWantsToSchedule(true);
                setError(null);
              }}
            >
              <Text
                style={[
                  styles.yesNoText,
                  wantsToSchedule === true && styles.yesNoTextActive,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.yesNoBtn,
                wantsToSchedule === false && styles.yesNoBtnActive,
              ]}
              onPress={() => {
                setWantsToSchedule(false);
                setError(null);
              }}
            >
              <Text
                style={[
                  styles.yesNoText,
                  wantsToSchedule === false && styles.yesNoTextActive,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickDateGroup}>
            <Text style={styles.label}>Pick a date and time</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={[styles.dateTimeBtn, !wantsToSchedule && styles.dateTimeBtnDisabled]}
                onPress={() => wantsToSchedule && setShowDatePicker(true)}
                disabled={!wantsToSchedule}
              >
                <Text style={styles.dateTimeText}>{toDateString(selectedDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dateTimeBtn, !wantsToSchedule && styles.dateTimeBtnDisabled]}
                onPress={() => wantsToSchedule && setShowTimePicker(true)}
                disabled={!wantsToSchedule}
              >
                <Text style={styles.dateTimeText}>{toTimeString(selectedTime)}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === "ios");
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
                  setShowTimePicker(Platform.OS === "ios");
                  if (date) setSelectedTime(date);
                }}
              />
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (isSubmitting || wantsToSchedule === null) && styles.confirmBtnDisabled,
            ]}
            onPress={handleConfirm}
            disabled={isSubmitting || wantsToSchedule === null}
          >
            <Text style={styles.confirmText}>
              {isSubmitting ? "Processing..." : "Confirm"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.black40,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: colors.white,
    width: "92%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "600", color: colors.gray800, textAlign: "center", marginBottom: 12 },
  subtitle: { color: colors.gray700, textAlign: "center", marginBottom: 16 },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  yesNoRow: { flexDirection: "row", gap: 12, justifyContent: "center", marginBottom: 20 },
  yesNoBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.gray200,
  },
  yesNoBtnActive: { backgroundColor: colors.darkBlue },
  yesNoText: { color: colors.gray700, fontWeight: "500" },
  yesNoTextActive: { color: colors.white },
  pickDateGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: colors.gray700, marginBottom: 8 },
  dateTimeRow: { flexDirection: "row", gap: 10 },
  dateTimeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  dateTimeBtnDisabled: { opacity: 0.5 },
  dateTimeText: { color: colors.gray800, fontSize: 14 },
  confirmBtn: {
    backgroundColor: "#0e7490",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: { color: colors.white, fontWeight: "600" },
});
