const localVersion = localStorage.getItem('userVersion') || '1.0.0';

fetch('https://cdn.jsdelivr.net/gh/newspaperreports/yt-downloader-online/main/test.css')
  .then(res => res.json())
  .then(data => {
    if (data?.currentVersion && data?.cssUrl && localVersion !== data.currentVersion) {
      const popup = document.createElement('div');
      popup.innerHTML = `
        <div style="position:fixed;bottom:20px;right:20px;padding:15px 20px;background:#fff;border:1px solid #ccc;box-shadow:0 0 10px rgba(0,0,0,0.1);z-index:9999;border-radius:8px;font-family:sans-serif;">
          <strong>🔔 Update Available</strong><br/>
          A new version is available.<br/>
          <button id="updateNow" style="margin-top:8px;padding:6px 12px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">Update Now</button>
        </div>
      `;
      document.body.appendChild(popup);

      document.getElementById('updateNow').onclick = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = data.cssUrl;
        document.head.appendChild(link);

        localStorage.setItem('userVersion', data.currentVersion);
        popup.remove();
      };
    }
  });
