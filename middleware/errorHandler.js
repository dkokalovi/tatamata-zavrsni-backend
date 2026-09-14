// Middleware za rute koje ne postoje (stavlja se NAKON svih ruta).
export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Ruta ne postoji." });
}

// Centralizirani error handler - MORA biti zadnji app.use() u index.js (4 parametra
// je ono po cemu ga Express prepoznaje kao error handler, ne obican middleware).
// Svaka async ruta omotana u asyncHandler koja baci gresku zavrsi ovdje.
export function errorHandler(err, req, res, next) {
  console.error("Neuhvacena greska:", err);

  // Mongoose: neispravan format ObjectId-a (npr. netko posalje "abc" umjesto pravog ID-a)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Neispravan format ID-a." });
  }

  // Mongoose: pao je schema validation (npr. required polje nedostaje na model razini)
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Neispravni podaci.", details: err.message });
  }

  // Mongoose: duplikat unique polja (npr. email koji vec postoji, zaobislo rucnu provjeru)
  if (err.code === 11000) {
    return res.status(409).json({ message: "Zapis s tim podatkom vec postoji." });
  }

  // Multer greske (npr. prevelika datoteka, neispravan tip)
  if (err.name === "MulterError" || /Dozvoljene su samo slike/.test(err.message || "")) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({ message: "Greska na serveru." });
}
