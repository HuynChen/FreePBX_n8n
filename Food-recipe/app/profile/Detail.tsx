import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { Alert } from "react-native";

const Detail = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy người dùng.");
      return;
    }

    try {
      const res = await axios.post(`${hostId}:80/api/updateUser`, {
        id_user: user.id,
        name: username,
        email,
        bio,
        phone,
        dob,
      });

      if (res.status === 200) {
        Alert.alert("Thông báo", "Cập nhật thành công!");
        navigation.goBack();
      } else {
        Alert.alert("Thông báo", "Cập nhật thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      Alert.alert("Lỗi", "Lỗi khi lưu thông tin.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.post(`${hostId}:80/api/getUser`, {
          id_user: user.id,
        });

        if (res.data) {
          setUsername(res.data.name || "");
          setEmail(res.data.email || "");
          setPhone(res.data.phone || "");
          setGender(res.data.gender || "");
          setDob(res.data.dob || "");
          setBio(res.data.bio || "");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between mb-5 px-5 pt-5">
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          onPress={() => navigation.goBack()}
        />
        <Text className="text-xl font-bold text-gray-800">Thông tin cá nhân</Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <Text className="font-bold text-gray-500 mt-5">Tên người dùng</Text>
        <TextInput
          className="border-b border-gray-300 text-base text-black py-2"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="font-bold text-gray-500 mt-5">Email</Text>
        <TextInput
          className="border-b border-gray-300 text-base text-black py-2"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text className="font-bold text-gray-500 mt-5">Bio</Text>
        <TextInput
          className="border-b border-gray-300 text-base text-black py-2"
          value={bio}
          onChangeText={setBio}
        />

        <Text className="font-bold text-gray-500 mt-5">Số điện thoại</Text>
        <TextInput
          className="border-b border-gray-300 text-base text-black py-2"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text className="font-bold text-gray-500 mt-5">Date of birth</Text>
        <TextInput
          className="border-b border-gray-300 text-base text-black py-2"
          value={dob}
          onChangeText={setDob}
          placeholder="DD/MM/YYYY"
        />

        <TouchableOpacity
          className="bg-green-400 mt-8 rounded-lg py-3 items-center"
          onPress={handleSave}
        >
          <Text className="text-white font-bold">LƯU THÔNG TIN</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Detail;
