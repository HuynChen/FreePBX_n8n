const User = require("../../models/user");

// Đăng nhập và tạo user nếu chưa có
const login = async (req, res) => {
  try {
    const {
      id_user,
      name,
      image_url,
      email,
      bio,
      favorites,
      phone,
      dob,
      recentlyLogin,
    } = req.body;

    let user = await User.findOne({ id_user });
    if (!user) {
      user = new User({
        id_user,
        name,
        image_url,
        email,
        bio,
        favorites,
        phone,
        dob,
        recentlyLogin,
      });
      await user.save();
    }

    console.log("Đăng nhập thành công tài khoản:", email);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy thông tin người dùng
const getUser = async (req, res) => {
  try {
    const id_user = req.body.id_user;
    if (!id_user) {
      return res.status(400).json({ message: "ID người dùng là bắt buộc" });
    }

    const user = await User.findOne({ id_user });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { id_user, name, email, bio, image_url, phone, dob } = req.body;

    if (!id_user) {
      return res.status(400).json({ message: "ID người dùng là bắt buộc" });
    }

    const user = await User.findOne({ id_user });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (image_url !== undefined) user.image_url = image_url;
    if (phone !== undefined) user.phone = phone.trim();
    if (dob !== undefined) user.dob = dob.trim();

    await user.save();

    console.log("Cập nhật thành công người dùng:", id_user);
    res.status(200).json({
      message: "Cập nhật người dùng thành công",
      user: {
        id_user: user.id_user,
        name: user.name,
        email: user.email,
        bio: user.bio,
        image_url: user.image_url,
        phone: user.phone,
        dob: user.dob,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = { login, getUser, updateUser };
