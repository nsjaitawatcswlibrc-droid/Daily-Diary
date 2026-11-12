# DayTrack — Daily Maintain Diary, Activity Dashboard & Handwritten Stylus Journal

**DayTrack** is a personal digital operating system designed to maintain your day-by-day diary, track current & pending activities, manage personal notes, and write or draw by hand on any phone, tablet, or touchscreen with a stylus or digital pen.

---

## 🌟 Key Features

### 1. 📖 Daily Maintain Diary
- **Day-by-Day Journaling**: Fast date navigation (Today, Yesterday, Date Picker, or Previous/Next Day buttons).
- **Dual Input Modes**:
  - **Typed Entry**: Clean markdown-friendly text editor for writing reflections, work logs, and daily achievements.
  - **✍️ Pen & Touch Handwritten Mode**: Dedicated canvas that lets you write with your stylus pen (Apple Pencil, Samsung S-Pen, Surface Pen) or your finger directly on your phone or tablet screen!
- **Daily Mood Tracker**: Track how you felt each day (😊 Happy, 🚀 Productive, 😌 Peaceful, ⚡ Energetic, 😴 Tired, 🌧️ Low).
- **Tagging**: Categorize entries (e.g., *Work, Health, Sprint, Personal*).

### 2. 📊 Activity Dashboard
- **Instant Productivity Stats**: Total diary entries maintained, tasks completed, pending activities, and personal notes.
- **Current & Pending Activity Widget**: Prioritized to-do list right on the main overview.
- **Today's Status**: Shows whether you've completed today's maintain diary entry with a quick preview.
- **Recent Diary History**: Quick-access log of past days.

### 3. ✅ Current Tasks & Pending Activity Tracker
- **Priority Levels**: 🔴 High, 🟡 Medium, 🟢 Low.
- **Categorization**: 💼 Work / Job, 🏠 Personal, 🏃 Health & Fitness, 📚 Study & Learning.
- **Due Dates & Status Filters**: Filter by *All Activities*, *Pending*, and *Completed*. Search tasks in real-time.

### 4. 📝 Personal Notes
- Card-based personal scratchpad with customizable color tags (Blue, Purple, Emerald, Amber, Rose).
- Full-text search to find notes instantly.

---

## ✍️ How Touch & Stylus / Pen Handwriting Works

You asked: **"Can I write my daily work diary as I touch my phone and by pen I can write in my handwritten?"**

**YES! Absolutely.**
- Click or tap the **"Pen / Touch Handwritten"** tab inside the Daily Diary view.
- The drawing pad is powered by the **HTML5 Pointer Events & Canvas API** with `touch-action: none`.
- It supports:
  - **Touchscreens**: Write or sketch smoothly with your fingers.
  - **Active Stylus Pens**: Apple Pencil (iPad/iPhone), Samsung S-Pen (Galaxy Note / Ultra / Tab), Microsoft Surface Pen. It responds to stylus pressure for thicker or thinner strokes.
  - **Capacitive Stylus**: Any standard rubber or disc-tip pen for smartphones.
- **Pen Tools**: Choose stroke colors (Cyan, White, Green, Amber, Red, Pink), adjust pen thickness (1px to 18px), use the Eraser tool, Undo strokes, or Clear the page.
- Every handwritten entry is saved alongside your daily entry.

---

## 📱 How to Access From Different Devices (Phone, Tablet, Laptop)

You asked: **"Can I run on webpage, make where I can access from different device?"**

Here are the 2 best ways:

### Method A: Local Wi-Fi Access (Immediate & Free)
When your phone and computer are connected to the same Wi-Fi network:

1. **Open PowerShell on your PC** in this project folder:
   ```powershell
   cd C:\Users\APO_BRC\.gemini\antigravity\scratch\daily-diary
   ```
2. **Start a local web server**:
   ```powershell
   npx serve . -p 3000
   # OR with Python:
   python -m http.server 3000
   ```
3. **Find your PC's local IP address**:
   In PowerShell, run `ipconfig`. Look for your IPv4 Address (e.g., `192.168.1.15`).
4. **Open on your phone**:
   Open Chrome, Safari, or your preferred browser on your phone and go to:
   `http://192.168.1.15:3000` *(replace with your PC's IP)*.

---

### Method B: Free Cloud Hosting (Access Anywhere 24/7)
Because this application is built with vanilla HTML, CSS, and JavaScript with zero backend dependencies, you can deploy it to any free static host in 1 minute:

1. **Vercel / Netlify**: Drag-and-drop this folder onto [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com).
2. **GitHub Pages**: Push this code to a free GitHub repository and turn on GitHub Pages.
3. You will receive a permanent HTTPS link (e.g., `https://my-daily-diary.vercel.app`) that you can open anytime, anywhere on any phone, tablet, or work computer!

---

### Method C: Add to Phone Home Screen (Use like a Native App)
Once opened in your phone's browser:
- **On iPhone / iPad (Safari)**: Tap the Share button $\rightarrow$ **"Add to Home Screen"**.
- **On Android (Chrome)**: Tap the three dots menu $\rightarrow$ **"Add to Home screen"** or **"Install app"**.

---

## 💾 Data Backup & Transfer
- Open the **"Phone / Sync"** tab in the app.
- Click **"Export Backup (JSON)"** to download your complete diary history, handwriting, tasks, and notes into a portable file.
- On any other device, click **"Import Backup"** to restore your data instantly.
