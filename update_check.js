// ✅ Step 1: লোকাল ভার্সন চেক করা (localStorage থেকে)
const localVersion = localStorage.getItem('userVersion') || '1.0.0';

// ✅ Step 2: version.json ফাইল GitHub/CDN থেকে ফেচ করা
fetch('https://raw.githubusercontent.com/newspaperreports/update-checker/main/version.json') // এখানে আপনার version.json লিংক দিন
  .then(res => res.json())
  .then(data => {
    // ✅ Step 3: যদি নতুন ভার্সন পাওয়া যায় এবং CSS URL থাকে
    if (data?.currentVersion && data?.cssUrl && localVersion !== data.currentVersion) {
      
      // ✅ Step 4: পপআপ তৈরি করুন
      const popup = document.createElement('div');
      popup.innerHTML = `
        <div style="
          position:fixed;
          bottom:20px;
          right:20px;
          padding:15px 20px;
          background:#fff;
          border:1px solid #ccc;
          box-shadow:0 0 10px rgba(0,0,0,0.1);
          z-index:9999;
          border-radius:8px;
          font-family:sans-serif;">
          <strong>🔔 Update Available</strong><br/>
          A new version (<code>${data.currentVersion}</code>) is available.<br/>
          <button id="updateNow" style="
            margin-top:8px;
            padding:6px 12px;
            background:#007bff;
            color:#fff;
            border:none;
            border-radius:4px;
            cursor:pointer;">Update Now</button>
        </div>
      `;
      document.body.appendChild(popup);

      // ✅ Step 5: ইউজার 'Update Now' ক্লিক করলে CSS লোড ও লোকাল ভার্সন সেট করা হবে
      document.getElementById('updateNow').onclick = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = data.cssUrl; // version.json থেকে পাঠানো লিংক
        document.head.appendChild(link);

        localStorage.setItem('userVersion', data.currentVersion); // নতুন ভার্সন সেট করুন
        popup.remove(); // পপআপ সরান
      };
    }
  })
  .catch(error => console.error("Update checker error:", error)); // ✅ সমস্যা হলে কনসোলে দেখাবে
