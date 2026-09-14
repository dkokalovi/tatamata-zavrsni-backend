import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Niste prijavljeni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: "Nevazeci token." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Nemate ovlasti (samo admin)." });
  }
  next();
}
