# ZUNORO — Release Package

इस पैकेज में साफ़ किया गया वेब ऐप, PWA install files और Android APK बनाने के लिए Capacitor setup है।

## क्या साफ़ किया गया
- वीडियो प्लेयर से अनावश्यक “plays on this device” काउंटर हटाया।
- खाली description UI हटाई।
- ZUNORO के black/gold ब्रांड को बरकरार रखा।
- SEO/social metadata, PWA manifest, offline app-shell cache और app icons जोड़े।
- मौजूदा फीचर्स/डेटा लॉजिक को जानबूझकर बड़े स्तर पर rewrite नहीं किया।

## वेबसाइट पब्लिक करना
1. `index.html`, `manifest.webmanifest`, `sw.js`, दोनों icons और `robots.txt` को एक ही public hosting folder में रखें।
2. GitHub पर नया repository बनाकर इस folder की सभी files upload करें।
3. Repository Settings → Pages में Deploy from a branch चुनें और `main` / root चुनें।
4. GitHub Pages का URL मिलने के बाद custom domain जोड़ सकते हैं। HTTPS चालू रखें।
5. Google Search Console में अपनी वास्तविक वेबसाइट verify करके sitemap/URL indexing submit करें। केवल नाम `ZUNORO` रखने से Google पर तुरंत पहला परिणाम आने की गारंटी नहीं होती।

## Android APK बनाना
इस package में APK binary नहीं है; यह Android wrapper source/config है। APK बनाने के लिए Node.js और Android Studio/Android SDK चाहिए।

```bash
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio में Build → Build Bundle(s) / APK(s) → Build APK(s) चुनें। Release APK के लिए अपना signing key बनाकर signed build तैयार करें।

## जरूरी सीमाएँ — publish करने से पहले
- इस HTML build में वीडियो/बुक uploads और login/profile data मुख्यतः उसी device/browser के local storage/IndexedDB में रहते हैं।
- “Public” visibility अभी server पर upload नहीं करती। दूसरे users को आपके uploads दिखाने के लिए Firebase/Supabase या अपना backend + object storage + authentication जोड़ना होगा।
- Google/Facebook/phone login का production OAuth/SMS flow और shared chat/community के लिए backend credentials/configuration चाहिए।
- इस build में sample/demo video catalogue मौजूद है; उसे अपनी licensed/public content से बदलें।
- Public website और APK का final QA वास्तविक HTTPS URL और Android device पर करना होगा।

## नया (v2) — क्या बदला
- गोल्डन Z का opening animation, नया गोल्डन Z app icon (`icon-*.png`, `assets/`)।
- Upload form छोटा: Type, File, Title (+ Anime/Series में नाम और episode)।
- Video के नीचे: ♡ Like / 💬 Comments → नंबर वाले episodes (1,2,3) → Up Next (1–6) → More Series & Dramas।
- Account: Continue Watching अब सच में चलता है, Saved Videos सही tab खोलता है, Logout पर confirm।
- APK: GitHub → Actions → "Build ZUNORO APK" → Run workflow (APK artifact में मिलेगा)।
