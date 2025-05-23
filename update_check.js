// ✅ Step 1: লোকাল ভার্সন চেক করা (localStorage থেকে)
const localVersion = localStorage.getItem('userVersion') || '1.0.0';

// ✅ Step 2: version.json ফাইল GitHub/CDN থেকে ফেচ করা (cache-busting সহ)
fetch('https://cdn.jsdelivr.net/gh/newspaperreports/admin@main/version.json?v=' + Date.now())
  .then(res => res.json())
  .then(data => {
    // ✅ Step 3: যদি নতুন ভার্সন পাওয়া যায় এবং CSS URL থাকে এবং ভার্সন আলাদা হয়
    if (data?.currentVersion && data?.cssUrl && localVersion !== data.currentVersion) {
      
      // ✅ Step 4: পপআপ তৈরি করুন ইউজারের কাছে আপডেট জানানোর জন্য
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

      // ✅ Step 5: ইউজার 'Update Now' ক্লিক করলে CSS লোড হবে (cache-busting সহ)
      document.getElementById('updateNow').onclick = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        // cache-busting করার জন্য Date.now() যোগ করা হয়েছে যাতে ব্রাউজার নতুন CSS ফাইল লোড করে
        link.href = data.cssUrl + '?v=' + Date.now();
        document.head.appendChild(link);

        // ✅ নতুন ভার্সন localStorage এ সেভ করা হবে যাতে পরবর্তীবার আপডেট না দেখতে হয়
        localStorage.setItem('userVersion', data.currentVersion);

        // ✅ পপআপ সরিয়ে দিন
        popup.remove();
      };
    }
  })
  // ✅ Step 6: কোন এরর হলে কনসোলে দেখাবে
  .catch(error => console.error("Update checker error:", error));
