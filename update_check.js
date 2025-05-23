// ✅ Step 1: লোকাল ভার্সন ও "skip" চেক করা
const localVersion = localStorage.getItem('userVersion') || '1.0.0';
const skippedVersion = localStorage.getItem('skippedVersion');

// ✅ Step 2: version.json ফাইল GitHub/CDN থেকে ফেচ করা
fetch('https://cdn.jsdelivr.net/gh/newspaperreports/admin@main/version.json?v=' + Date.now())
  .then(res => res.json())
  .then(data => {
    
    // ✅ যদি নতুন ভার্সন থাকে, CSS URL থাকে, আর ইউজার স্কিপ না করে থাকে
    if (data?.currentVersion && data?.cssUrl &&
        localVersion !== data.currentVersion &&
        skippedVersion !== data.currentVersion) {
      
      // ✅ পপআপ তৈরি করা
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
          font-family:sans-serif;
          width:280px;">
          <strong>🔔 Update Available!</strong><br/>
          News Future <code>${data.currentVersion}</code> উপলব্ধ।<br/>
          <button id="updateNow" style="
            margin-top:8px;
            padding:6px 12px;
            background:#007bff;
            color:#fff;
            border:none;
            border-radius:4px;
            cursor:pointer;">Update Now</button>
          <button id="skipUpdate" style="
            margin-top:8px;
            margin-left:8px;
            padding:6px 12px;
            background:#6c757d;
            color:#fff;
            border:none;
            border-radius:4px;
            cursor:pointer;">Don't show again</button>
        </div>
      `;
      document.body.appendChild(popup);

      // ✅ ইউজার "Update Now" চাপলে CSS লোড হবে
      document.getElementById('updateNow').onclick = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = data.cssUrl + '?v=' + Date.now();  // cache-busting
        document.head.appendChild(link);

        localStorage.setItem('userVersion', data.currentVersion);
        popup.remove(); // পপআপ সরিয়ে ফেলো
      };

      // ✅ ইউজার "Don't show again" চাপলে স্কিপ করা ভার্সন সেভ হবে
      document.getElementById('skipUpdate').onclick = () => {
        localStorage.setItem('skippedVersion', data.currentVersion);
        popup.remove(); // পপআপ সরিয়ে ফেলো
      };
    }
  })
  .catch(error => console.error("🔧 Update checker error:", error));
