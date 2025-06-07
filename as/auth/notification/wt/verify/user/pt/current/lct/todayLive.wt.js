// 🔗 JSON ফাইলের লিংক (GitHub থেকে লাইভ ডেটা লোড করা হবে)
const jsonUrl = "https://raw.githubusercontent.com/newspaperreports/admin/refs/heads/main/as/auth/notification/wt/verify/user/pt/current/lct/todayLive.wt.json";

// 🕒 ক্লোজ বাটন কত সেকেন্ড পরে দেখানো হবে (মিলিসেকেন্ডে)
const closeBtnDelay = 3000; // ৩ সেকেন্ড পর ক্লোজ বাটন শো হবে

// 🕓 অটো-ক্লোজ টাইমার (পপআপ কত সেকেন্ড পরে নিজে থেকে বন্ধ হবে)
const autoCloseDelay = 20000; // 20 সেকেন্ড পরে অটো ক্লোজ হবে

// ✅ UTF-8 string কে Base64 এনকোড করার ফাংশন (Unicode সাপোর্ট করে)
function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

// 📦 গ্লোবাল ভ্যারিয়েবল
let currentPopupId = null; // বর্তমান পপআপের ID ট্র্যাক করার জন্য
let lastLoggedId = null;   // কনসোলে আগের দেখানো আইডি
let enableConsoleLog = true; // কনসোলে লগ দেখাবে কিনা

// 🔃 পেজ লোড হলে এই ফাংশন চালু হবে
window.onload = function () {
  loadNotificationData(); // প্রথমবার পপআপ ডেটা লোড করবে

  // ❌ ক্লোজ বাটনের জন্য ইভেন্ট লিসেনার
  const closeBtn = document.getElementById("popupCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      localStorage.setItem("popup_closed_by_user", "1"); // ইউজার নিজে ক্লোজ করলে সেট করা হবে
      localStorage.setItem("popup_last_seen_id", currentPopupId); // পপআপ ID সেভ করা হবে
      handleCloseOrVisit(); // fade out + হাইড করবে
    });
  }

  // 🔁 প্রতি 30 সেকেন্ড পরপর JSON ফাইল থেকে নতুন ডেটা লোড করে চেক করবে
  setInterval(() => {
    loadNotificationData(); // অটো রিফ্রেশ ছাড়াই নতুন পপআপ দেখাবে
  }, 30000); // ⏱️ 30,000 মিলিসেকেন্ড = 30 সেকেন্ড
};

// 📦 JSON থেকে ডেটা লোড করে পপআপ দেখানো হবে (শুধু নতুন হলে)
async function loadNotificationData() {
  try {
    const response = await fetch(jsonUrl); // GitHub থেকে JSON ফাইল লোড
    if (!response.ok) throw new Error("❌ There was a problem loading data.");

    const data = await response.json(); // JSON ডেটা রিড করা

    // 🔒 যদি স্ট্যাটাস অফ থাকে → popup দেখাবে না
    if (data.status && data.status.toLowerCase() === "off") {
      if (enableConsoleLog) console.log("⛔ Popup status is OFF. No popup will be shown.");
      return;
    }

    // 🔍 কনসোল লগ অন/অফ করা হবে json এর console ফিল্ড দিয়ে
    enableConsoleLog = !(data.console && data.console.toLowerCase() === "off");

    // ✅ ইউনিক কনটেন্ট আইডেন্টিফায়ার তৈরি করা (title+link+image)
    const identifier = `${data.link}|${data.title}|${data.image}`;
    const encodedIdentifier = utf8ToBase64(identifier); // Base64 encode
    currentPopupId = encodedIdentifier; // বর্তমান পপআপের ID সেট করা
    const lastSeenKey = "popup_last_seen_id"; // localStorage key

    const lastSeen = localStorage.getItem(lastSeenKey); // আগের দেখা popup এর আইডি
    const popupClosedByUser = localStorage.getItem("popup_closed_by_user"); // ইউজার ম্যানুয়ালি ক্লোজ করেছে কিনা

    const popup = document.getElementById("adminNotification");

    // 🟡 পপআপ শো করা আছে এবং নতুন কনটেন্ট এসেছে → আগেরটি হাইড করে নতুনটি দেখাও
    if (popup && popup.style.display === "block") {
      if (lastSeen !== encodedIdentifier) {
        if (enableConsoleLog && lastLoggedId !== encodedIdentifier) {
          console.log("🔄 Popup is visible but new content detected. Replacing...");
          lastLoggedId = encodedIdentifier;
        }
        handleCloseOrVisit(() => {
          showNotificationFromJSON(data, encodedIdentifier, lastSeenKey);
        });
      }
      return;
    }

    // 🛑 যদি আগের কনটেন্ট একই থাকে এবং ইউজার ম্যানুয়ালি ক্লোজ করেছে → আর দেখাবে না
    if (lastSeen === encodedIdentifier && popupClosedByUser === "1") {
      if (enableConsoleLog) console.log("⛔ Previous popup closed by user. Same content. Skipping...");
      return;
    }

    // ✅ নতুন popup দেখাও
    if (enableConsoleLog && lastLoggedId !== encodedIdentifier) {
      console.log("✅ Showing new Notification.");
      lastLoggedId = encodedIdentifier;
    }

    showNotificationFromJSON(data, encodedIdentifier, lastSeenKey);
  } catch (error) {
    console.error("❌ Notification loading problem:", error);
  }
}

// 🖼️ পপআপ UI তে ডেটা বসানো ও প্রদর্শন করা হবে
function showNotificationFromJSON(data, encodedIdentifier, lastSeenKey) {
  const popup = document.getElementById("adminNotification");

  // 📄 popup এর ভিতরের কনটেন্ট বসানো (ইমেজ, টাইটেল, বাটন)
  document.getElementById("popupImg").src = data.image;
  document.getElementById("popupImgSrc").srcset = data.image;
  document.getElementById("popupTitle").textContent = data.title;
  document.getElementById("popupBtn").querySelector("span").textContent = data.buttonText;

  // 🔁 পুরাতন লিংক এলিমেন্টকে নতুন দিয়ে রিপ্লেস করা হচ্ছে
  const oldLinkEl = document.getElementById("popupLink");
  const newLinkEl = oldLinkEl.cloneNode(true); // ✅ ক্লোন নতুন এলিমেন্ট
  oldLinkEl.parentNode.replaceChild(newLinkEl, oldLinkEl); // পুরাতনটি রিপ্লেস

  newLinkEl.href = data.link; // 🔗 লিংক বসানো

  // ✅ ক্লিক ইভেন্ট অ্যাড করা (শুধুমাত্র একবার)
  newLinkEl.addEventListener("click", (e) => {
    e.preventDefault(); // ডিফল্ট লিঙ্ক ক্লিক বন্ধ
    localStorage.setItem(lastSeenKey, encodedIdentifier); // popup দেখা হয়েছে বলে মার্ক
    localStorage.setItem("popup_closed_by_user", "1"); // ✅ ভিজিট করলে ম্যানুয়ালি ক্লোজ হিসেবে গণ্য হবে
    window.open(data.link, "_blank"); // নতুন ট্যাবে লিঙ্ক ওপেন (শুধু একবার)
    handleCloseOrVisit(); // fade-out করে popup হাইড
  });

  // ✅ popup দেখানো হবে (fade-in)
  popup.style.display = "block";
  popup.classList.remove("fade-out");
  void popup.offsetWidth; // রিফ্লো ট্রিগার
  popup.classList.add("fade-in");

  // 🕒 নির্দিষ্ট সময় পরে ক্লোজ বাটন শো হবে
  setTimeout(() => {
    const closeBtn = document.getElementById("popupCloseBtn");
    if (closeBtn) closeBtn.classList.add("show");
  }, closeBtnDelay);

  // 🕒 নির্দিষ্ট সময় পরে popup অটো-ক্লোজ হবে (manual ক্লোজ নয়)
  setTimeout(() => {
    if (popup.style.display === "block") {
      handleCloseOrVisit(); // fade-out হাইড
      // ℹ️ অটো ক্লোজ হলে localStorage এ কিছু সেভ হবে না → রিফ্রেশে আবার পপআপ আসবে
    }
  }, autoCloseDelay);
}

// ❌ popup fade-out করে হাইড করে দেয়
function handleCloseOrVisit(callback) {
  const popup = document.getElementById("adminNotification");
  const closeBtn = document.getElementById("popupCloseBtn");

  if (closeBtn) closeBtn.classList.remove("show"); // ক্লোজ বাটন লুকানো
  popup.classList.remove("fade-in");
  popup.classList.add("fade-out");

  // 🕒 fade-out এর ৩০০ms পর popup হাইড হবে
  setTimeout(() => {
    popup.style.display = "none";
    if (typeof callback === "function") callback();
  }, 300);  // fade-out PopUp Hide Time
}
