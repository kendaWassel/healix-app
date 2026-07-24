import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Modal, ScrollView,
  ActivityIndicator, StyleSheet, Dimensions, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { Audio } from "expo-av";
import { I18nManager } from "react-native";

const API_BASE = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);


export default function AI_Medical_Assistant({ isOpen, onClose }) {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
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


  const acceptLanguage = () => (i18n.language?.startsWith("ar") ? "ar" : "en");

  const authHeaders = async ({ json = false } = {}) => {
    const token = await AsyncStorage.getItem("token");
    const headers = {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      "Accept-Language": acceptLanguage(),
      Authorization: `Bearer ${token}`,
    };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  };

  const readResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      const text =
        response.status === 401
          ? t("aiAssistant.sessionExpired", t("aiAssistant.connectionError"))
          : data.message || t("aiAssistant.connectionError");
      setMessages((prev) => [...prev, { role: "bot", text, error: true }]);
      return { ok: false, data };
    }
    return { ok: true, data };
  };

  /* ------------------------------------------------------------------
   * Sidebar animation
   * ------------------------------------------------------------------ */
const openSidebar = () => setShowHistory(true);
const closeSidebar = () => setShowHistory(false);
const toggleSidebar = () => setShowHistory((v) => !v);


  /* ------------------------------------------------------------------
   * History
   * ------------------------------------------------------------------ */
  const mapApiMessages = (apiMessages = []) =>
    [...apiMessages].reverse().map((m) => ({
      role: m.sender === "assistant" ? "bot" : "user",
      text: m.message || m.transcribed_text || "",
      isVoice: m.message_type === "voice",
      detectedSymptoms:
        Array.isArray(m.detected_symptoms) && m.detected_symptoms.length
          ? m.detected_symptoms
          : null,
    }));

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/patient/conversations`, {
        headers: await authHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return [];
      return data.data?.data || [];
    } catch (err) {
      console.error("Failed to load conversations:", err);
      return [];
    }
  };

  const openConversation = async (id) => {
    setIsStarting(true);
    closeSidebar();
    try {
      const response = await fetch(
        `${API_BASE}/api/patient/conversations/${id}/messages`,
        { headers: await authHeaders() }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessages([{ role: "bot", text: t("aiAssistant.connectionError"), error: true }]);
        return;
      }

      const history = mapApiMessages(data.data?.data);
      setConversationId(id);
      setMessages(history.length ? history : [{ role: "bot", text: t("aiAssistant.greeting") }]);

      const meta = conversations.find((c) => c.id === id);
      setIsFinished(!!meta?.ended_at);
    } catch (err) {
      console.error("Failed to open conversation:", err);
      setMessages([{ role: "bot", text: t("aiAssistant.connectionError"), error: true }]);
    } finally {
      setIsStarting(false);
    }
  };

  const startNewConversation = async () => {
    setIsStarting(true);
    closeSidebar();
    setMessages([]);
    setIsFinished(false);

    try {
      const response = await fetch(`${API_BASE}/api/patient/conversations`, {
        method: "POST",
        headers: await authHeaders({ json: true }),
        body: JSON.stringify({
          title: `Symptom Check - ${new Date().toLocaleDateString()}`,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.data?.id) {
        setMessages([
          {
            role: "bot",
            text:
              response.status === 401
                ? t("aiAssistant.sessionExpired", t("aiAssistant.connectionError"))
                : data.message || t("aiAssistant.connectionError"),
            error: true,
          },
        ]);
        return;
      }

      setConversationId(data.data.id);
      setMessages([{ role: "bot", text: t("aiAssistant.greeting") }]);
      setConversations(await fetchConversations());
    } catch (err) {
      console.error("Failed to start conversation:", err);
      setMessages([{ role: "bot", text: t("aiAssistant.connectionError"), error: true }]);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setConversationId(null);
      setMessages([]);
      setInput("");
      setIsFinished(false);
      setShowHistory(false);
      
      return;
    }

    (async () => {
      setIsStarting(true);
      const list = await fetchConversations();
      setConversations(list);
      setIsStarting(false);
      if (list.length > 0) await openConversation(list[0].id);
      else await startNewConversation();
    })();
  }, [isOpen]);

  /* ------------------------------------------------------------------
   * Voice
   * ------------------------------------------------------------------ */
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.warn("Microphone permission not granted");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
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
      const formData = new FormData();
      formData.append("audio", { uri, name: "recording.m4a", type: "audio/m4a" });
      formData.append("conversation_id", conversationId);

      const response = await fetch(`${API_BASE}/api/speech-to-text`, {
        method: "POST",
        headers: await authHeaders(),
        body: formData,
      });

      const { ok, data } = await readResponse(response);
      if (!ok) return;

      setMessages((prev) => {
        const next = [...prev, { role: "user", text: data.text, isVoice: true }];
        if (data.question) {
          next.push({
            role: "bot",
            text: data.question,
            detectedSymptoms: data.detected_symptoms || null,
          });
        }
        return next;
      });
      if (data.finished) setIsFinished(true);
      setConversations(await fetchConversations());
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

  const toggleListening = () => (isListening ? stopRecording() : startRecording());
  const toggleVoiceLang = () => {
    if (isListening) return;
    setVoiceLang((prev) => (prev === "en-US" ? "ar-SA" : "en-US"));
  };

  /* ------------------------------------------------------------------
   * Text
   * ------------------------------------------------------------------ */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping || !conversationId) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/patient/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: await authHeaders({ json: true }),
          body: JSON.stringify({ message: text }),
        }
      );

      const { ok, data } = await readResponse(response);
      if (!ok) return;

      setMessages((prev) => {
        if (data.question) {
          return [
            ...prev,
            { role: "bot", text: data.question, detectedSymptoms: data.detected_symptoms || null },
          ];
        }
        if (!data.finished) {
          return [...prev, { role: "bot", text: t("aiAssistant.couldNotProcess"), error: true }];
        }
        return prev;
      });

      if (data.finished) setIsFinished(true);
      setConversations(await fetchConversations());
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
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.fullScreen}>
        {/* المحتوى الرئيسي */}
        <View style={styles.mainArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={toggleSidebar} style={styles.iconBtn}>
                <Ionicons name="menu" size={22} color="#fff" />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>{t("aiAssistant.title")}</Text>
                <Text style={styles.headerSubtitle}>{t("aiAssistant.subtitle")}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={startNewConversation} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
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
                      <Text style={msg.role === "user" ? styles.bubbleTextUser : styles.bubbleTextBot}>
                        {msg.isVoice ? "🎤 " : ""}{msg.text}
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
              style={[styles.textInput, { textAlign: voiceLang === "ar-SA" ? "right" : "left" }]}
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

        {/* Backdrop خلف الـ Sidebar — يغلقه عند الضغط خارجه */}
       {/* Sidebar — يظهر فقط عند الضغط على زر القائمة */}
        {showHistory && (
          <>
            <Pressable style={styles.backdrop} onPress={closeSidebar} />

            <View style={styles.sidebar}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>{t("aiAssistant.previousChats")}</Text>
                <TouchableOpacity onPress={closeSidebar}>
                  <Ionicons name="close" size={20} color="#052443" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={startNewConversation} style={styles.newChatBtn}>
                <Ionicons name="add-circle-outline" size={18} color="#39CCCC" />
                <Text style={styles.newChatBtnText}>{t("aiAssistant.newChat")}</Text>
              </TouchableOpacity>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
                {conversations.length === 0 && (
                  <Text style={styles.historyEmpty}>{t("aiAssistant.noPreviousChats")}</Text>
                )}
                {conversations.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => openConversation(c.id)}
                    style={[styles.historyItem, c.id === conversationId && styles.historyItemActive]}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={c.id === conversationId ? "#0e7490" : "#6b7280"}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.historyItemTitle,
                          c.id === conversationId && styles.historyItemTitleActive,
                        ]}
                        numberOfLines={1}
                      >
                        {c.title || `#${c.id}`}
                      </Text>
                      <Text style={styles.historyItemMeta}>
                        {c.ended_at ? t("aiAssistant.completed") : t("aiAssistant.inProgress")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#f9fafb" },
  mainArea: { flex: 1 },

  header: {
    backgroundColor: "#052443", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14,
    paddingTop: 46,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerActions: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: 6 },
  headerTitle: { color: "#fff", fontWeight: "600" },
  headerSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 11 },

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
    marginLeft: 36, maxWidth: "85%", backgroundColor: "#ecfeff",
    borderWidth: 1, borderColor: "#a5f3fc", borderRadius: 10, padding: 10,
  },
  symptomsHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  symptomsLabel: { fontSize: 12, fontWeight: "600", color: "#052443" },
  symptomsChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  symptomChip: { backgroundColor: "#cffafe", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  symptomChipText: { fontSize: 11, color: "#0e7490", fontWeight: "500" },

  /* ---- Sidebar ---- */
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
 sidebar: {
  position: "absolute",
  top: 0,
  bottom: 0,
  right: 0,          // ✅ ثابت على اليمين (يناسب العربية بصرياً)
  width: SIDEBAR_WIDTH,
  backgroundColor: "#fff",
  paddingTop: 46,
  borderLeftWidth: 1,
  borderLeftColor: "#e5e7eb",
  shadowColor: "#000",
  shadowOffset: { width: -2, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 12,
},
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sidebarTitle: { fontSize: 15, fontWeight: "700", color: "#052443" },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginVertical: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: "#a5f3fc",
  },
  newChatBtnText: { color: "#0e7490", fontWeight: "600", fontSize: 13 },
  historyEmpty: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 20,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  historyItemActive: { backgroundColor: "#ecfeff" },
  historyItemTitle: { fontSize: 13, color: "#374151" },
  historyItemTitleActive: { color: "#0e7490", fontWeight: "600" },
  historyItemMeta: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
});