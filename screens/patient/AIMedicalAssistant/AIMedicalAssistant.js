// screens/patient/AIMedicalAssistant/AI_Medical_Assistant.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";

const API_BASE = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export default function AI_Medical_Assistant({ isOpen, onClose }) {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-US");
  const [isFinished, setIsFinished] = useState(false);
  const scrollRef = useRef(null);
  const recordingRef = useRef(null);

  // 🔹 عند فتح النافذة: أنشئي محادثة جديدة واحصلي على السؤال الأول
  useEffect(() => {
    if (isOpen) {
      startNewConversation();
    } else {
      setConversationId(null);
      setMessages([]);
      setInput("");
      setIsFinished(false);
    }
  }, [isOpen]);

  const startNewConversation = async () => {
  setIsStarting(true);
  setMessages([]);
  setIsFinished(false);

  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/patient/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: `Symptom Check - ${new Date().toLocaleDateString()}`,
      }),
    });

    const data = await response.json();
    console.log("New conversation:", data);

    const newConversationId = data.data?.id;  
    setConversationId(newConversationId);
    setMessages([
      { role: "bot", text: t("aiAssistant.greeting") },  
    ]);
  } catch (err) {
    console.error("Failed to start conversation:", err);
    setMessages([{ role: "bot", text: t("aiAssistant.connectionError"), error: true }]);
  } finally {
    setIsStarting(false);
  }
};
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.warn("Microphone permission not granted");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    try {
      setIsListening(false);
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;

      await sendVoiceMessage(uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const sendVoiceMessage = async (uri) => {
    if (!conversationId) return;
    setIsTranscribing(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const formData = new FormData();
      formData.append("audio", {
        uri,
        name: "recording.m4a",
        type: "audio/m4a",
      });
      formData.append("conversation_id", conversationId);

      const response = await fetch(`${API_BASE}/api/speech-to-text`, {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Voice message result:", data);

      if (!data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.message || t("aiAssistant.couldNotProcess"), error: true },
        ]);
        return;
      }

     
      setMessages((prev) => [
        ...prev,
        { role: "user", text: data.text },
       {
    role: "bot",
    text: data.question || "",
    detectedSymptoms: data.detected_symptoms || null, 
  },
]);
      if (data.finished) setIsFinished(true);
    } catch (err) {
      console.error("Voice message failed:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: t("aiAssistant.connectionError"), error: true },
      ]);
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleVoiceLang = () => {
    if (isListening) return;
    setVoiceLang((prev) => (prev === "en-US" ? "ar-SA" : "en-US"));
  };

  const handleSend = async () => {
  const text = input.trim();
  if (!text || isTyping || !conversationId) return;

  setMessages((prev) => [...prev, { role: "user", text }]);
  setInput("");
  setIsTyping(true);

  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(
      `${API_BASE}/api/patient/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      }
    );

    const data = await response.json();
    console.log("Message result:", data);

    setMessages((prev) => [
      ...prev,
      {
        role: "bot",
        text: data.question || t("aiAssistant.couldNotProcess"),
        detectedSymptoms: data.detected_symptoms || null,   
      },
    ]);

    if (data.finished) setIsFinished(true);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: t("aiAssistant.connectionError"), error: true },
    ]);
  } finally {
    setIsTyping(false);
  }
};

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>{t("aiAssistant.title")}</Text>
                <Text style={styles.headerSubtitle}>{t("aiAssistant.subtitle")}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerBox}>
            <Ionicons name="warning-outline" size={16} color="#d97706" />
            <Text style={styles.disclaimerText}>{t("aiAssistant.disclaimer")}</Text>
          </View>

          {/* Messages */}
          {isStarting ? (
            <View style={styles.startingBox}>
              <ActivityIndicator size="large" color="#39CCCC" />
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.messagesArea}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            >
           {messages.map((msg, i) => (
  <View key={i} style={{ gap: 6 }}>
    <View
      style={[
        styles.messageRow,
        { justifyContent: msg.role === "user" ? "flex-end" : "flex-start" },
      ]}
    >
      {msg.role === "bot" && (
        <View style={styles.botIcon}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
        </View>
      )}
      <View
        style={[
          styles.bubble,
          msg.role === "user"
            ? styles.bubbleUser
            : msg.error
            ? styles.bubbleUrgent
            : styles.bubbleBot,
        ]}
      >
        <Text
          style={msg.role === "user" ? styles.bubbleTextUser : styles.bubbleTextBot}
        >
          {msg.text}
        </Text>
      </View>
      {msg.role === "user" && (
        <View style={styles.userIcon}>
          <Ionicons name="person" size={16} color="#374151" />
        </View>
      )}
    </View>

    {msg.detectedSymptoms && msg.detectedSymptoms.length > 0 && (
      <View style={styles.symptomsBox}>
        <View style={styles.symptomsHeader}>
          <Ionicons name="pulse-outline" size={14} color="#052443" />
          <Text style={styles.symptomsLabel}>{t("aiAssistant.detectedSymptoms")}</Text>
        </View>
        <View style={styles.symptomsChips}>
          {msg.detectedSymptoms.map((symptom, j) => (
            <View key={j} style={styles.symptomChip}>
              <Text style={styles.symptomChipText}>
                {typeof symptom === "string" ? symptom : symptom.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    )}
  </View>
))}

              {isTyping && (
                <View style={[styles.messageRow, { justifyContent: "flex-start" }]}>
                  <View style={styles.botIcon}>
                    <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                  </View>
                  <View style={styles.bubbleBot}>
                    <ActivityIndicator size="small" color="#9ca3af" />
                  </View>
                </View>
              )}

              {isFinished && (
                <View style={styles.finishedBox}>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                  <Text style={styles.finishedText}>{t("aiAssistant.interviewFinished")}</Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                isListening
                  ? t("aiAssistant.listening")
                  : isTranscribing
                  ? t("aiAssistant.transcribing")
                  : t("aiAssistant.describeSymptoms")
              }
              editable={!isTyping && !isTranscribing && !isFinished}
              style={[
                styles.textInput,
                { textAlign: voiceLang === "ar-SA" ? "right" : "left" },
              ]}
            />

            <TouchableOpacity
              onPress={toggleVoiceLang}
              disabled={isListening || isTyping || isTranscribing || isFinished}
              style={styles.langBtn}
            >
              <Text style={styles.langBtnText}>{voiceLang === "en-US" ? "EN" : "ع"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleListening}
              disabled={isTyping || isTranscribing || isFinished}
              style={[styles.micBtn, isListening && styles.micBtnActive]}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : (
                <Ionicons
                  name={isListening ? "mic-off" : "mic"}
                  size={18}
                  color={isListening ? "#fff" : "#6b7280"}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || isTyping || isFinished}
              style={[styles.sendBtn, (!input.trim() || isTyping || isFinished) && styles.sendBtnDisabled]}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  card: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, height: "85%" },
  header: {
    backgroundColor: "#052443", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: { backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 20 },
  headerTitle: { color: "#fff", fontWeight: "600" },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  closeBtn: { padding: 6 },
  disclaimerBox: {
    backgroundColor: "#fffbeb", borderBottomWidth: 1, borderBottomColor: "#fde68a",
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8,
  },
  disclaimerText: { fontSize: 11, color: "#92400e", flex: 1 },
  startingBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
  messagesArea: { flex: 1, backgroundColor: "#f9fafb" },
  messageRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  botIcon: { backgroundColor: "#052443", padding: 6, borderRadius: 16 },
  userIcon: { backgroundColor: "#d1d5db", padding: 6, borderRadius: 16 },
  bubble: { maxWidth: "75%", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  bubbleUser: { backgroundColor: "#052443" },
  bubbleBot: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  bubbleUrgent: { backgroundColor: "#fef2f2", borderWidth: 2, borderColor: "#fca5a5" },
  bubbleTextUser: { color: "#fff", fontSize: 13 },
  bubbleTextBot: { color: "#1f2937", fontSize: 13 },
  finishedBox: {
    flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4",
    borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 10, padding: 12, marginTop: 8,
  },
  finishedText: { color: "#15803d", fontSize: 13, fontWeight: "600" },
  inputRow: {
    flexDirection: "row", alignItems: "center", gap: 8, borderTopWidth: 1,
    borderTopColor: "#e5e7eb", padding: 10, backgroundColor: "#fff",
  },
  textInput: {
    flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 13,
  },
  langBtn: { backgroundColor: "#f3f4f6", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 16 },
  langBtnText: { fontSize: 11, fontWeight: "700", color: "#4b5563" },
  micBtn: { backgroundColor: "#f3f4f6", padding: 10, borderRadius: 20 },
  micBtnActive: { backgroundColor: "#ef4444" },
  sendBtn: { backgroundColor: "#052443", padding: 10, borderRadius: 20 },
  sendBtnDisabled: { opacity: 0.4 },
  symptomsBox: {
  marginLeft: 36,
  maxWidth: "85%",
  backgroundColor: "#ecfeff",
  borderWidth: 1,
  borderColor: "#a5f3fc",
  borderRadius: 10,
  padding: 10,
},
symptomsHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginBottom: 6,
},
symptomsLabel: {
  fontSize: 12,
  fontWeight: "600",
  color: "#052443",
},
symptomsChips: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
},
symptomChip: {
  backgroundColor: "#cffafe",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},
symptomChipText: {
  fontSize: 11,
  color: "#0e7490",
  fontWeight: "500",
},
});