import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import images from "@/constant/images";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { Modal, TextInput } from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useUser, useClerk } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { router } from "expo-router";
import { Recipe } from "@/type";
import { handlePressRecipe } from "@/constant/constant";

type TabParamList = {
  Profile: undefined;
  Favorite: undefined;
  Explore: undefined;
  Login: undefined;
  Detail: undefined;
};

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<TabParamList>>();
  const [editingBio, setEditingBio] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(user?.imageUrl || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recipes, setRecipes] = useState<Array<Recipe>>([]);
  const isFocused = useIsFocused();
  const hostId = process.env.EXPO_PUBLIC_LOCAL_HOST_ID;

  useLayoutEffect(() => {
    navigation.setOptions({ animation: "slide_from_right" });
  }, [navigation]);

  interface UserData {
    bio?: string;
    image_url?: string;
  }

  const fakeLoadData = (message: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      fetchUserData();
      fetchUserPost();
      Alert.alert("Thông báo!", message, [{ text: "OK" }]);
    }, 3000);
  };
  const fetchUserData = async () => {
    if (!user?.id) {
      console.log("Không có user.id");
      return;
    }
    try {
      const res = await axios.post<UserData>(`${hostId}:80/api/getUser`, {
        id_user: user.id,
      });
      setBio(res.data.bio || "");
      setAvatar(res.data.image_url || user.imageUrl);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu hồ sơ.");
    }
  };

  const fetchUserPost = async () => {
    try {
      const res = await axios.post(`${hostId}:80/api/getMyRecipes`, {
        id_user: user?.id,
      });
      console.log("Công thức nhận được:", res.data);
      setRecipes(res.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.log("Không có công thức cá nhân nào.");
        setRecipes([]); 
      } else {
        console.error("Lỗi khi lấy công thức cá nhân:", error);
      }
    }
  };

  useEffect(() => {
    if (user && isFocused) {
      fetchUserData();
      fetchUserPost();
    }
  }, [user, isFocused]);

  const handleSettingsPress = () => {
    Alert.alert(
      "Cài đặt hồ sơ",
      "Bạn muốn thực hiện thao tác gì?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Thông tin cá nhân",
          onPress: () => router.push("/profile/Detail"),
        },
        {
          text: "Thay đổi ảnh đại diện",
          onPress: async () => {
            Alert.alert("Chọn ảnh", "Bạn muốn thực hiện thao tác nào?", [
              {
                text: "Chụp ảnh",
                onPress: handleTakePhoto,
              },
              {
                text: "Chọn từ thư viện",
                onPress: handleSelectPhoto,
              },
              {
                text: "Hủy",
                style: "cancel",
              },
            ]);
          },
        },
        {
          text: "Thêm giới thiệu hồ sơ",
          onPress: handleAddBio,
        },
      ],
      { cancelable: true }
    );
  };

  const uploadToCloudinary = async (imageUri: string) => {
    const data = new FormData();

    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    } as any);

    data.append("upload_preset", "mepeyyon");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dnynvkw0b/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const json = await res.json();
      const secureUrl = json.secure_url;
      console.log("Đã tải lên Cloudinary:", secureUrl);
      return secureUrl;
    } catch (error) {
      console.error("Lỗi khi upload lên Cloudinary:", error);
      throw error;
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Quyền bị từ chối",
        "Vui lòng cấp quyền truy cập camera trong cài đặt."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      updateAvatar(uri);
    } else {
      console.log("Không có ảnh nào được chụp hoặc bị lỗi.");
    }
  };

  const handleSelectPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Quyền bị từ chối",
        "Vui lòng cấp quyền truy cập camera trong cài đặt."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      updateAvatar(uri);
    } else {
      console.log("Không có ảnh nào được chọn hoặc bị lỗi.");
    }
  };

  const updateAvatar = async (uri: string) => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }
    try {
      const cloudUrl = await uploadToCloudinary(uri);
      await axios.post(`${hostId}:80/api/updateUser`, {
        id_user: user.id,
        image_url: cloudUrl,
      });
      fakeLoadData("Ảnh đại diện đã được cập nhật!");
      setAvatar(cloudUrl);
      console.log("Ảnh mới:", cloudUrl);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải ảnh lên Cloudinary");
    }
  };

  const handleAddBio = () => {
    setEditingBio(bio);
    setModalVisible(true);
  };

  const handleBio = async () => {
    if (!user?.id) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }

    const trimmedBio = editingBio.trim();

    if (trimmedBio === "") {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung giới thiệu.");
      return;
    }

    if (trimmedBio.length > 100) {
      Alert.alert("Lỗi", "Giới thiệu không được vượt quá 100 ký tự.");
      return;
    }

    try {
      setModalVisible(false);
      setBio(trimmedBio);

      const res = await axios.post<{ user: UserData }>(
        `${hostId}:80/api/updateUser`,
        {
          id_user: user.id,
          bio: trimmedBio,
        }
      );

      if (res.data?.user?.bio) {
        setBio(res.data.user.bio);
        fakeLoadData("Giới thiệu hồ sơ đã được cập nhật!");
      }

      console.log("Cập nhật thành công:", res.data);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật:", error?.message || error);
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    }
  };

  const handleLogOut = () => {
    Alert.alert("Thông báo!", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      { text: "Đăng xuất", onPress: () => signOut() },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {isLoading && (
        <Modal
          visible={true}
          transparent
          animationType="none"
        >
          <View className="flex-1 justify-center items-center bg-black/60">
            <View className="bg-green-500 px-6 py-4 rounded-xl items-center">
              <ActivityIndicator
                size="large"
                color="#fff"
              />
              <Text className="text-white mt-2 text-base">Đang tải...</Text>
            </View>
          </View>
        </Modal>
      )}
      {/* Ảnh nền */}
      <View className={`relative h-52`}>
        <Image
          source={images.thumbnail}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute bottom-0 w-full h-5 bg-gray-100 rounded-t-[32px]" />
        <View className="absolute w-full px-2">
          <View className="flex-row justify-between items-center p-3">
            <Text className="text-2xl font-semibold " >Thông tin cá nhân</Text>
            <MaterialIcons
              onPress={handleSettingsPress}
              name="settings"
              size={24}
              color="#0B9A61"
            />
          </View>
        </View>
      </View>

      {/* Avatar */}
      <View className="absolute w-full items-center top-[100px]">
        <Image
          source={{ uri: avatar || user?.imageUrl }}
          className="w-48 h-48 rounded-full border-4 border-white"
        />
      </View>

      {/* Thông tin người dùng */}
      <View className="items-center mt-28">
        <Text className="text-2xl font-bold">{user?.fullName}</Text>
        <View className="flex-row items-center">
          <Text className="text-gray-500 text-lg">
            {bio || "Chưa có giới thiệu..."}
          </Text>
          <TouchableOpacity onPress={handleAddBio}>
            <Ionicons name="pencil" size={20} color="#0B9A61" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách công thức nấu ăn */}
      <View className="mt-5 px-4">
        <View className="flex-row justify-between">
          <Text className="text-xl font-semibold">Công thức cá nhân</Text>
          <TouchableOpacity
            className="flex-row"
            onPress={() => router.push("../Explore")}
          >
            <Text className="text-green-500">Tất cả</Text>
            <Feather
              name="chevron-right"
              size={20}
              color="#0B9A61"
            />
          </TouchableOpacity>
        </View>
        {recipes.length === 0 ? (
          <Text className="mt-3 text-gray-500">Bạn chưa có bài viết nào.</Text>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={recipes.slice(0, 3)}
            renderItem={({ item }) => (
              <TouchableOpacity className="mr-4 mt-3" onPress={() => handlePressRecipe(item)}>
                <Image
                  className="w-64 h-40 rounded-lg"
                  source={{ uri: item.image }}
                />
                <Text className="text-xl font-medium mt-2">{item.title}</Text>
                <Text
                  className="text-l mb-3 w-[230px]"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Các chức năng */}
      <View className="flex-1 bg-white px-5 pt-5">
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center py-4 border-b border-gray-200"
          onPress={() => router.push("../Favorite")}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color="#0B9A61"
          />
          <Text className="flex-1 text-lg text-800 ml-4">Yêu thích</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color="#0B9A61"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex-row items-center py-4 border-b border-gray-200"
          onPress={handleLogOut}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#0B9A61"
          />
          <Text className="flex-1 text-lg text-800 ml-4">Đăng xuất</Text>
          <Ionicons
            name="chevron-forward-outline"
            size={20}
            color="#0B9A61"
          />
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/30 px-4"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white w-full rounded-xl p-6 space-y-4"
          >
            <Text className="text-xl font-semibold  mb-2">
              Giới thiệu hồ sơ
            </Text>
            <TextInput
              maxLength={100}
              placeholder="Nhập nội dung giới thiệu..."
              className="border border-gray-300 rounded-lg p-3 text-base"
              value={editingBio}
              onChangeText={setEditingBio}
              multiline
            />
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-gray-500 text-base">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-6"
                onPress={() => {
                  handleBio();
                }}
              >
                <Text className="text-green-600 font-semibold text-base">
                  Lưu
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Profile;
