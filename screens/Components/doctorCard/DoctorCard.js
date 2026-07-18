// components/doctorCard/DoctorCard.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DoctorCard = ({
  doctor_image,
  name,
  specialization,
  rating,
  available_from,
  available_to,
  consultation_fee,
  onSelect,
  isActive,
  isDimmed,
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[
        styles.card,
        isActive && styles.cardActive,
        isDimmed && styles.cardDimmed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: doctor_image || undefined }}
            defaultSource={require("../../../assets/no-photo.png")}
            style={styles.avatar}
          />
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#39CCCC" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.nameSection}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialization} numberOfLines={2}>
          {specialization}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={14} color="#39CCCC" />
          <Text style={styles.infoText}>
            {available_from} - {available_to}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="pricetag-outline" size={14} color="#39CCCC" />
          <Text style={styles.infoText}>{consultation_fee}$ fee</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DoctorCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  cardActive: {
    borderColor: "#39CCCC",
  },
  cardDimmed: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ebfafa",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    color: "#052443",
    fontWeight: "600",
  },
  nameSection: {
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  specialization: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "column",
    gap: 6,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontSize: 11,
    color: "#374151",
  },
});