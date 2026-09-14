import { describe, it, expect } from "vitest";
import Company, { KATEGORIJE } from "../models/Company.js";

describe("Company shema - validacija", () => {
  it("odbija firmu bez ijedne kategorije", () => {
    const company = new Company({
      naziv: "Test obrt",
      telefon: "099 123 4567",
      email: "test@test.hr",
      kategorije: [],
    });

    const err = company.validateSync();

    expect(err).toBeTruthy();
    expect(err.errors.kategorije).toBeDefined();
  });

  it("odbija firmu s kategorijom koja nije na dozvoljenom popisu", () => {
    const company = new Company({
      naziv: "Test obrt",
      telefon: "099 123 4567",
      email: "test@test.hr",
      kategorije: ["nepostojeca_kategorija"],
    });

    const err = company.validateSync();

    // Mongoose enum validacija na nizu baca gresku po indeksu elementa
    // (npr. "kategorije.0"), ne po samom nazivu polja "kategorije".
    expect(err).toBeTruthy();
    expect(err.errors["kategorije.0"]).toBeDefined();
  });

  it("odbija firmu bez obaveznih polja (naziv, telefon, email)", () => {
    const company = new Company({ kategorije: ["krov"] });

    const err = company.validateSync();

    expect(err).toBeTruthy();
    expect(err.errors.naziv).toBeDefined();
    expect(err.errors.telefon).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it("prolazi validaciju uz barem jednu ispravnu kategoriju i sva obavezna polja", () => {
    const company = new Company({
      naziv: "AquaServis obrt",
      telefon: "099 123 4567",
      email: "aquaservis@test.hr",
      kategorije: ["vodoinstalacije", "vlaga_i_fleke"],
    });

    const err = company.validateSync();

    expect(err).toBeUndefined();
  });

  it("KATEGORIJE popis sadrzi ocekivan broj i sadrzaj kategorija", () => {
    expect(KATEGORIJE).toContain("krov");
    expect(KATEGORIJE).toContain("ostalo");
    expect(KATEGORIJE.length).toBeGreaterThan(0);
  });
});
