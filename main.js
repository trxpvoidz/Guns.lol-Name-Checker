const genres = {
  rare: ["xq", "vx", "qx", "lx", "zx", "v1", "x0", "ox", "rx"],
  dark: ["grim", "void", "night", "shade", "sin", "death"],
  cool: ["ice", "nova", "sky", "tech", "storm", "flash"],
  lofi: ["wave", "beat", "vinyl", "tape", "dust", "lofi"]
};

let stopFlag = false;
const log = msg => {
  const el = document.createElement("div");
  el.textContent = msg;
  document.getElementById("console").appendChild(el);
};

function generateName(genre) {
  const base = genres[genre];
  let part1 = base[Math.floor(Math.random() * base.length)];
  let part2 = Math.random().toString(36).substring(2, 4);
  return (part1 + part2).toLowerCase();
}

async function checkUsername(name) {
  log("🔍 Checking: " + name);
  try {
    const res = await fetch("/.netlify/functions/check?name=" + name);
    const json = await res.json();
    if (json.available) {
      log("✅ Available: " + name);
      window.open("https://guns.lol/" + name, "_blank");
    } else {
      log("❌ Taken: " + name);
    }
  } catch (e) {
    log("❗ Error checking " + name + ": " + e.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startScan() {
  stopFlag = false;
  const genre = document.getElementById("genre").value;
  while (!stopFlag) {
    const name = generateName(genre);
    await checkUsername(name);
    await sleep(5000); // delay to avoid rate limit
  }
}

function stopScan() {
  stopFlag = true;
  log("⛔ Scanning stopped.");
}

function checkManual() {
  const name = document.getElementById("manualName").value.trim();
  if (name) checkUsername(name);
}
