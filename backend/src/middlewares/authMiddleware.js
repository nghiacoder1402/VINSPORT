const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const token = authHeader.split(" ")[1];
    const match = token.match(/^user-(\d+)-(admin|user)-token$/);

    if (!match) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    req.user = {
      user_id: Number(match[1]),
      role: match[2],
      token,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền admin" });
  }

  next();
};

module.exports = { verifyToken, requireAdmin };