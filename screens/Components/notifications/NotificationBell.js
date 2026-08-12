import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../utils/apiClient";

export default function NotificationBell() {
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showList, setShowList] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notifications/unread-count");
      const data = await res.json();
      if (res.ok) setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/notifications");
      const data = await res.json();
      if (res.ok) setNotifications(data.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll unread count periodically so the badge stays current without
  // requiring the user to open the list — real-time push is out of scope
  // for this in-app-only notification center.
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // كل 30 ثانية
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const openList = async () => {
    setShowList(true);
    await fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      fetchUnreadCount();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={openList} style={styles.bellBtn}>
        <Ionicons name="notifications-outline" size={24} color="#052443" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowList(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{t("notifications.title")}</Text>
              <TouchableOpacity onPress={() => setShowList(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {notifications.length > 0 && (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>
                  {t("notifications.markAllRead")}
                </Text>
              </TouchableOpacity>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#39CCCC" style={{ marginTop: 30 }} />
            ) : notifications.length === 0 ? (
              <Text style={styles.emptyText}>{t("notifications.empty")}</Text>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => !item.read_at && markAsRead(item.id)}
                    style={[
                      styles.notifCard,
                      !item.read_at && styles.notifCardUnread,
                    ]}
                  >
                    <View style={styles.notifRow}>
                      {!item.read_at && <View style={styles.dot} />}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.notifTitle}>{item.title}</Text>
                        <Text style={styles.notifBody}>{item.body}</Text>
                        <Text style={styles.notifTime}>
                          {new Date(item.created_at).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellBtn: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#052443",
  },
  markAllBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  markAllText: {
    color: "#39CCCC",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    marginBottom: 40,
  },
  notifCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  notifCardUnread: {
    backgroundColor: "#f0fdff",
  },
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#39CCCC",
    marginTop: 6,
  },
  notifTitle: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 14,
  },
  notifBody: {
    color: "#4b5563",
    fontSize: 13,
    marginTop: 2,
  },
  notifTime: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 4,
  },
});