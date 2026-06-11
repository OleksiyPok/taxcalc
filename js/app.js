const ids = [
  "km",
  "lper100",
  "fuelPrice",
  "amort",
  "driveH",
  "driveM",
  "waitH",
  "waitM",
  "parking",
  "mode",
];
const blurIds = [
  "km",
  "lper100",
  "fuelPrice",
  "amort",
  "driveH",
  "driveM",
  "waitH",
  "waitM",
  "parking",
];
const modal = document.getElementById("settingsModal");
const settingsBtn = document.getElementById("settingsBtn");
const DRIVE_MIN_STEP = 15;
const WAIT_MIN_STEP = 5;

function readNum(id) {
  const v = parseFloat(document.getElementById(id).value);
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

function setTimeParts(hId, mId, h, m) {
  document.getElementById(hId).value = Math.max(0, Math.floor(h));
  document.getElementById(mId).value = Math.min(59, Math.max(0, m));
}

function applyTimeFromParts(hId, mId, minStep) {
  let h = readNum(hId);
  let m = readNum(mId);

  m = Math.round(m / minStep) * minStep;
  if (m >= 60) {
    h += Math.floor(m / 60);
    m = m % 60;
  }

  setTimeParts(hId, mId, h, m);
}

function setTimeMinutes(hId, mId, total, minStep) {
  const rounded = Math.round(total / minStep) * minStep;
  setTimeParts(hId, mId, Math.floor(rounded / 60), rounded % 60);
}

function getDriveMinutes() {
  return readNum("driveH") * 60 + readNum("driveM");
}

function getWaitMinutes() {
  return readNum("waitH") * 60 + readNum("waitM");
}

function stepTimeH(hId, mId, dir) {
  setTimeParts(hId, mId, readNum(hId) + dir, readNum(mId));
  calc();
}

function stepTimeM(hId, mId, dir, minStep) {
  let h = readNum(hId);
  let m = readNum(mId) + dir * minStep;

  while (m >= 60) {
    h += 1;
    m -= 60;
  }
  while (m < 0) {
    if (h > 0) {
      h -= 1;
      m += 60;
    } else {
      m = 0;
      break;
    }
  }

  setTimeParts(hId, mId, h, m);
  calc();
}

function stepNumber(id, dir) {
  const input = document.getElementById(id);

  const current = parseFloat(input.value) || 0;
  const step = parseFloat(input.step) || 1;

  const decimals = step.toString().includes(".")
    ? step.toString().split(".")[1].length
    : 0;

  const next = Math.max(
    0,
    Math.round((current + dir * step) * 10 ** decimals) / 10 ** decimals
  );

  input.value = next.toFixed(decimals);

  calc();
}

function normalizeNumber(id) {
  const input = document.getElementById(id);

  const value = parseFloat(input.value);
  const step = parseFloat(input.step) || 1;

  if (!Number.isFinite(value)) {
    input.value = 0;
    return;
  }

  const decimals = step.toString().includes(".")
    ? step.toString().split(".")[1].length
    : 0;

  input.value = Number(value).toFixed(decimals);
}

function calc() {
  const km = readNum("km");
  const l = readNum("lper100");
  const price = readNum("fuelPrice");
  const amort = readNum("amort");
  const driveMinutes = getDriveMinutes();
  const waitMinutes = getWaitMinutes();
  const parking = readNum("parking");
  const rate = readNum("mode");

  const fuel = (l / 100) * price * km;
  const wear = km * amort;
  const time = ((driveMinutes + waitMinutes) / 60) * rate;
  const total = fuel + wear + time + parking;

  document.getElementById("total").textContent = "€" + total.toFixed(2);
  document.getElementById("breakdown").innerHTML =
    "Fuel: €" +
    fuel.toFixed(2) +
    "<br>" +
    "Wear &amp; tear: €" +
    wear.toFixed(2) +
    "<br>" +
    "Time: €" +
    time.toFixed(2) +
    "<br>" +
    "Parking: €" +
    parking.toFixed(2);

  const data = {};
  ids.forEach(function (id) {
    data[id] = document.getElementById(id).value;
  });
  try {
    localStorage.setItem("tripCalc", JSON.stringify(data));
  } catch (e) {}
}

function loadSaved() {
  try {
    const raw = localStorage.getItem("tripCalc");
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.driveH !== undefined && data.driveM !== undefined) {
      setTimeParts("driveH", "driveM", data.driveH, data.driveM);
    } else if (data.hours !== undefined) {
      const v = parseFloat(data.hours);
      const minutes = v <= 12 ? Math.round(v * 60) : v;
      setTimeMinutes("driveH", "driveM", minutes, DRIVE_MIN_STEP);
    }

    if (data.waitH !== undefined && data.waitM !== undefined) {
      setTimeParts("waitH", "waitM", data.waitH, data.waitM);
    } else if (data.wait !== undefined) {
      setTimeMinutes("waitH", "waitM", parseFloat(data.wait), WAIT_MIN_STEP);
    }

    ids.forEach(function (id) {
      if (
        id === "driveH" ||
        id === "driveM" ||
        id === "waitH" ||
        id === "waitM"
      )
        return;
      if (data[id] !== undefined) document.getElementById(id).value = data[id];
    });
  } catch (e) {}
}

function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  settingsBtn.setAttribute("aria-expanded", "true");
  document.getElementById("modalClose").focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  settingsBtn.setAttribute("aria-expanded", "false");
  settingsBtn.focus();
}

settingsBtn.addEventListener("click", openModal);
document.getElementById("modalClose").addEventListener("click", closeModal);

modal.addEventListener("click", function (e) {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

function handleStepClick(e) {
  const btn = e.target.closest(".btn-step");
  if (!btn) return;
  const resetField = btn.dataset.reset;
  if (resetField) {
    document.getElementById(resetField).value = 0;
    calc();
    return;
  }
  const dir = parseInt(btn.dataset.dir, 10);
  const step = btn.dataset.step;

  if (step === "driveH") stepTimeH("driveH", "driveM", dir);
  else if (step === "driveM")
    stepTimeM("driveH", "driveM", dir, DRIVE_MIN_STEP);
  else if (step === "waitH") stepTimeH("waitH", "waitM", dir);
  else if (step === "waitM") stepTimeM("waitH", "waitM", dir, WAIT_MIN_STEP);
  else if (step === "km") stepNumber("km", dir);
  else if (step === "parking") stepNumber("parking", dir);
  else if (step === "lper100") stepNumber("lper100", dir);
  else if (step === "fuelPrice") stepNumber("fuelPrice", dir);
  else if (step === "amort") stepNumber("amort", dir);
}

document.addEventListener("click", handleStepClick);

document.getElementById("driveM").addEventListener("input", function () {
  applyTimeFromParts("driveH", "driveM", DRIVE_MIN_STEP);
});
document.getElementById("driveH").addEventListener("input", function () {
  if (readNum("driveH") < 0)
    setTimeParts("driveH", "driveM", 0, readNum("driveM"));
});
document.getElementById("waitM").addEventListener("input", function () {
  applyTimeFromParts("waitH", "waitM", WAIT_MIN_STEP);
});
document.getElementById("waitH").addEventListener("input", function () {
  if (readNum("waitH") < 0) setTimeParts("waitH", "waitM", 0, readNum("waitM"));
});

document.getElementById("calcBtn").addEventListener("click", calc);
blurIds.forEach(function (id) {
  document.getElementById(id).addEventListener("blur", function () {
    if (id === "driveH" || id === "driveM")
      applyTimeFromParts("driveH", "driveM", DRIVE_MIN_STEP);
    if (id === "waitH" || id === "waitM")
      applyTimeFromParts("waitH", "waitM", WAIT_MIN_STEP);
    if (
      id === "km" ||
      id === "parking" ||
      id === "lper100" ||
      id === "fuelPrice" ||
      id === "amort"
    ) {
      normalizeNumber(id);
    }

    calc();
  });
});
document.getElementById("mode").addEventListener("change", calc);

loadSaved();
applyTimeFromParts("driveH", "driveM", DRIVE_MIN_STEP);
applyTimeFromParts("waitH", "waitM", WAIT_MIN_STEP);
calc();
