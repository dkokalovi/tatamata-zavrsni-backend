import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import auth, { requireAdmin } from "../middleware/auth.js";

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

beforeAll(() => {
  
  process.env.JWT_SECRET = "test-secret";
});

describe("auth middleware", () => {
  it("vraca 401 ako Authorization zaglavlje nedostaje", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("vraca 401 za nevazeci/neispravan token", () => {
    const req = { headers: { authorization: "Bearer ovo-nije-valjan-jwt" } };
    const res = mockRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Nevazeci token." })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("propusta zahtjev i postavlja req.userId/req.userRole za valjan token", () => {
    const token = jwt.sign({ id: "user123", role: "client" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = vi.fn();

    auth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.userId).toBe("user123");
    expect(req.userRole).toBe("client");
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("requireAdmin middleware", () => {
  it("vraca 403 ako korisnik nema ulogu admin", () => {
    const req = { userRole: "client" };
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("propusta zahtjev ako korisnik ima ulogu admin", () => {
    const req = { userRole: "admin" };
    const res = mockRes();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
