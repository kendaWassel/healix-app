import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";

const API = "https://unjuicy-schizogenous-gibson.ngrok-free.dev";

export default function DoctorRegister() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [specsLoading, setSpecsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [gender, setGender] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateFileName, setCertificateFileName] = useState("");

  const [specs, setSpecs] = useState([]);

  const navigation = useNavigation();

  // تحميل التخصصات عند فتح الشاشة
  useEffect(() => {
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    setSpecsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/specializations`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to get specializations");
      }
      setSpecs(data.data);
    } catch (err) {
      setError(err.message || "Failed to get specializations. Please try again.");
    } finally {
      setSpecsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoPreview(result.assets[0].uri);
      setPhotoFile(result.assets[0]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setCertificateFileName(result.assets[0].name);
      setCertificateFile(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", {
      uri: photoFile.uri, name: "photo.jpg", type: "image/jpeg",
    });
    formData.append("category", "profile");
    const res = await fetch(`${API}/api/uploads/image`, {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true" },
      body: formData,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return (await res.json()).image_id;
  };

  const uploadFile = async () => {
    const formData = new FormData();
    formData.append("file", {
      uri: certificateFile.uri,
      name: certificateFile.name,
      type: certificateFile.mimeType || "application/pdf",
    });
    formData.append("category", "certificate");
    const res = await fetch(`${API}/api/uploads`, {
      method: "POST",
      headers: { "ngrok-skip-browser-warning": "true" },
      body: formData,
    });
    if (!res.ok) throw new Error("File upload failed");
    return (await res.json()).file_id;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const imageId = photoFile ? await uploadImage() : null;
      const fileId = certificateFile ? await uploadFile() : null;

      const user = {
        role: "doctor",
        full_name: fullName,
        email,
        doctor_image_id: imageId,
        phone,
        password,
        specialization,
        gender,
        from: formatTime(fromTime),
        to: formatTime(toTime),
        consultation_fee: parseInt(consultationFee) || 0,
        certificate_file_id: fileId,
      };

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccessMsg("Check your email for Activation link");
      setTimeout(() => navigation.navigate("Login"), 800);
    } catch (err) {
      setError(err.message || "Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (specsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#39CCCC" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* رأس مع زر رجوع */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Doctor Account Setup</Text>
        <Text style={styles.subtitle}>Fill your information to register</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        {successMsg && <Text style={styles.success}>{successMsg}</Text>}
      </View>

      {/* الصورة */}
      <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
        {photoPreview ? (
          <Image source={{ uri: photoPreview }} style={styles.photoImg} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={26} color="#39CCCC" />
            <Text style={styles.photoText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        {/* الاسم */}
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type full name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* الهاتف */}
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type phone number"
            keyboardType="numeric"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* التخصص */}
        <View style={styles.inputGroup}>
          <Ionicons name="briefcase" size={20} color="#39CCCC" />
          <Picker
            style={styles.picker}
            selectedValue={specialization}
            onValueChange={setSpecialization}
          >
            <Picker.Item label="Specialization" value="" />
            {specs.map((spec) => (
              <Picker.Item key={spec.id} label={spec.name} value={spec.name} />
            ))}
          </Picker>
        </View>

        {/* الجنس */}
        <View style={styles.inputGroup}>
          <Ionicons name="male-female" size={20} color="#39CCCC" />
          <Picker style={styles.picker} selectedValue={gender} onValueChange={setGender}>
            <Picker.Item label="Gender" value="" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Male" value="male" />
          </Picker>
        </View>

        {/* الإيميل */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* كلمة المرور */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Type Password..."
            secureTextEntry={!passwordShown}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setPasswordShown(!passwordShown)}>
            <Ionicons
              name={passwordShown ? "eye" : "eye-off"}
              size={20}
              color="#767676"
            />
          </TouchableOpacity>
        </View>

        {/* الشهادة */}
        <TouchableOpacity style={styles.inputGroup} onPress={pickDocument}>
          <Ionicons name="cloud-upload" size={20} color="#39CCCC" />
          <Text style={styles.fileText} numberOfLines={1}>
            {certificateFileName || "Medical Certificate"}
          </Text>
        </TouchableOpacity>

        {/* رسوم الاستشارة */}
        <View style={styles.inputGroup}>
          <Ionicons name="cash" size={20} color="#39CCCC" />
          <TextInput
            style={styles.input}
            placeholder="Consultation fee..."
            keyboardType="numeric"
            value={consultationFee}
            onChangeText={setConsultationFee}
          />
          <Text style={styles.dollar}>$</Text>
        </View>

        {/* ساعات العمل: من */}
        <TouchableOpacity
          style={styles.inputGroup}
          onPress={() => setShowFromPicker(true)}
        >
          <Ionicons name="time" size={20} color="#39CCCC" />
          <Text style={styles.dateText}>
            {fromTime ? formatTime(fromTime) : "From"}
          </Text>
        </TouchableOpacity>
        {showFromPicker && (
          <DateTimePicker
            value={fromTime || new Date()}
            mode="time"
            display="default"
            onChange={(event, selected) => {
              setShowFromPicker(Platform.OS === "ios");
              if (selected) setFromTime(selected);
            }}
          />
        )}

        {/* ساعات العمل: إلى */}
        <TouchableOpacity
          style={styles.inputGroup}
          onPress={() => setShowToPicker(true)}
        >
          <Ionicons name="time" size={20} color="#39CCCC" />
          <Text style={styles.dateText}>
            {toTime ? formatTime(toTime) : "To"}
          </Text>
        </TouchableOpacity>
        {showToPicker && (
          <DateTimePicker
            value={toTime || new Date()}
            mode="time"
            display="default"
            onChange={(event, selected) => {
              setShowToPicker(Platform.OS === "ios");
              if (selected) setToTime(selected);
            }}
          />
        )}

        {/* زر التسجيل */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flexGrow: 1, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#767676" },

  header: {
    alignItems: "center", paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 55 : 35, marginBottom: 16,
  },
  backArrow: { position: "absolute", left: 20, top: Platform.OS === "ios" ? 55 : 35 },
  title: { fontSize: 22, fontWeight: "bold", color: "#052443" },
  subtitle: { fontSize: 15, color: "#767676", marginTop: 6 },
  error: { color: "red", fontWeight: "600", marginTop: 8, textAlign: "center" },
  success: { color: "green", fontWeight: "600", marginTop: 8, textAlign: "center" },

  photoCircle: {
    width: 90, height: 90, borderRadius: 45, borderWidth: 1,
    borderColor: "#e0e0e0", alignSelf: "center", overflow: "hidden",
    marginBottom: 20,
  },
  photoImg: { width: "100%", height: "100%" },
  photoPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  photoText: { fontSize: 10, color: "#767676", marginTop: 4 },

  form: { paddingHorizontal: 24 },
  inputGroup: {
    flexDirection: "row", alignItems: "center", borderWidth: 1,
    borderColor: "#e0e0e0", borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 4, marginVertical: 7, gap: 10,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 10 },
  dateText: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 10 },
  picker: { flex: 1, color: "#767676" },
  fileText: { flex: 1, color: "#767676", fontSize: 14 },
  dollar: { color: "#767676", fontSize: 16 },

  button: {
    backgroundColor: "#052443", padding: 16, borderRadius: 10,
    alignItems: "center", marginTop: 18,
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});