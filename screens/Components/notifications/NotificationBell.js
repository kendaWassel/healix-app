import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../../../utils/apiClient";

export default function NotificationBell() {
  const { t, i18n } = useTranslation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showList, setShowList] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notifications");
      const result = await res.json();

      if (res.ok) {
        setUnreadCount(result.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  // Fetch all notifications
  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const res = await apiFetch("/api/notifications");
      const result = await res.json();

      if (res.ok) {
        setNotifications(result.data || []);
        setUnreadCount(result.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Open notification list
  const openList = async () => {
    setShowList(true);
    await fetchNotifications();
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read_at: new Date().toISOString(),
              }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const res = await apiFetch("/api/notifications/read-all", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read_at: new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };


// Delete a single notification
const deleteNotification = async (id) => {
  try {
    const res = await apiFetch(`/api/notifications/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete notification");
    }

    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id);
      if (target && !target.read_at) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  } catch (err) {
    console.error("Failed to delete notification:", err);
  }
};
  
  // Get notification title according to current language
  const getNotificationTitle = (notification) => {
    if (i18n.language === "ar") {
      return (
        notification.data?.title_ar ??
        notification.data?.title ??
        ""
      );
    }

    return notification.data?.title ?? "";
  };

  const getNotificationMessage = (notification) => {
    if (i18n.language === "ar") {
      return (
        notification.data?.message_ar ??
        notification.data?.message ??
        ""
      );
    }

    return notification.data?.message ?? "";
  };

  return (
    <>
      {/* Notification Bell */}
      <TouchableOpacity
        onPress={openList}
        style={styles.bellBtn}
        activeOpacity={0.7}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color="#052443"
        />

        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notifications Modal */}
      <Modal
        visible={showList}
        transparent
        animationType="fade"
        onRequestClose={() => setShowList(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {t("notifications.title")}
              </Text>

              <TouchableOpacity
                onPress={() => setShowList(false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Mark All As Read */}
            {notifications.length > 0 && unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.markAllBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.markAllText}>
                  {t("notifications.markAllRead")}
                </Text>
              </TouchableOpacity>
            )}

            {/* Loading */}
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#39CCCC"
                style={styles.loading}
              />
            ) : notifications.length === 0 ? (
              /* Empty */
              <Text style={styles.emptyText}>
                {t("notifications.empty")}
              </Text>
            ) : (
              /* Notifications List */
              <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
   renderItem={({ item }) => (
  <TouchableOpacity
    onPress={() =>
      !item.read_at && markAsRead(item.id)
    }
    activeOpacity={0.7}
    style={[
      styles.notifCard,
      !item.read_at &&
        styles.notifCardUnread,
    ]}
  >
    <View style={styles.notifRow}>
      {/* Unread Dot */}
      {!item.read_at && (
        <View style={styles.dot} />
      )}
      <View style={styles.notifContent}>
        {/* Notification Title */}
        <Text style={styles.notifTitle}>
          {getNotificationTitle(item)}
        </Text>
        {/* Notification Message */}
        <Text style={styles.notifBody}>
          {getNotificationMessage(item)}
        </Text>
        {/* Notification Time */}
        <Text style={styles.notifTime}>
          {new Date(
            item.created_at
          ).toLocaleString(
            i18n.language === "ar"
              ? "ar"
              : "en"
          )}
        </Text>
      </View>
      {/* Delete Button */}
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation?.();
          deleteNotification(item.id);
        }}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color="#9ca3af" />
      </TouchableOpacity>
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
  // Notification bell
  bellBtn: {
    padding: 8,
    position: "relative",
  },

  // Unread badge
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

  // Dark overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "ios" ? 100 : 80,
  },

  // Notification window
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    maxHeight: "70%",
    paddingBottom: 12,
    overflow: "hidden",
  },

  // Header
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

  // Mark all button
  markAllBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },

  markAllText: {
    color: "#39CCCC",
    fontWeight: "600",
    fontSize: 13,
  },

  // Loading
  loading: {
    marginTop: 30,
    marginBottom: 30,
  },

  // Empty state
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 40,
    marginBottom: 40,
    fontSize: 14,
  },

  // List
  listContent: {
    paddingBottom: 8,
  },

  // Notification card
  notifCard: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  // Unread notification
  notifCardUnread: {
    backgroundColor: "#f0fdff",
  },

  // Notification row
  notifRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  // Unread dot
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#39CCCC",
    marginTop: 6,
    marginRight: 8,
  },

  // Notification content
  notifContent: {
    flex: 1,
  },

  // Notification title
  notifTitle: {
    fontWeight: "700",
    color: "#111827",
    fontSize: 14,
  },

  // Notification body
  notifBody: {
    color: "#4b5563",
    fontSize: 13,
    marginTop: 2,
    lineHeight: 19,
  },

  // Notification time
  notifTime: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 4,
  },
  deleteBtn: {
  padding: 4,
  marginLeft: 8,
},
});