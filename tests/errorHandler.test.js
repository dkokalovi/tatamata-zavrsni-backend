import { describe, it, expect, vi } from "vitest";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler.js";

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("errorHandler", () => {
  it("vraca 400 za Mongoose CastError (neispravan ObjectId)", () => {
    const res = mockRes();
    const err = { name: "CastError" };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Neispravan format ID-a." })
    );
  });

  it("vraca 400 za Mongoose ValidationError uz detalje", () => {
    const res = mockRes();
    const err = { name: "ValidationError", message: "kategorije je obavezno polje" };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Neispravni podaci." })
    );
  });

  it("vraca 409 za duplikat unique polja (npr. vec postojeci email)", () => {
    const res = mockRes();
    const err = { code: 11000 };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Zapis s tim podatkom vec postoji." })
    );
  });

  it("vraca 400 za Multer gresku (npr. prevelika datoteka)", () => {
    const res = mockRes();
    const err = { name: "MulterError", message: "File too large" };

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("vraca 500 za nepoznatu/neocekivanu gresku (fallback)", () => {
    const res = mockRes();
    const err = new Error("Nesto sasvim neocekivano");

    errorHandler(err, {}, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Greska na serveru." })
    );
  });
});

describe("notFoundHandler", () => {
  it("vraca 404 za nepostojecu rutu", () => {
    const res = mockRes();

    notFoundHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Ruta ne postoji." })
    );
  });
});
