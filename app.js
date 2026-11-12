/**
 * DayTrack - Daily Maintain Diary, Tasks & Stylus Canvas App
 * Full offline capability, touch & stylus pen handwriting, cross-device sync.
 */

(() => {
  'use strict';

  // --- STATE ---
  const state = {
    currentDate: getTodayString(),
    currentView: 'dashboard',
    entryMode: 'typed', // 'typed' or 'handwritten'
    activeMood: '😊',
    activeFilter: 'all',
    searchQuery: '',
    noteSearchQuery: '',
    theme: 'dark',

    // Canvas tools
    penColor: '#38bdf8',
    penSize: 3,
    isEraser: false,
    undoStack: [],

    // Data stores (synced with localStorage)
    diary: {}, // key: YYYY-MM-DD -> { title, content, mood, tag, drawingData, date, updated }
    tasks: [], // [ { id, title, priority, category, dueDate, completed, createdAt } ]
    notes: []  // [ { id, title, content, color, updatedAt } ]
  };

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // --- DOM SELECTORS ---
  const elements = {
    // Nav
    navItems: document.querySelectorAll('.nav-item'),
    contentViews: document.querySelectorAll('.content-view'),
    viewTitle: document.getElementById('view-title'),
    headerDate: document.getElementById('header-date'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    sunIcon: document.querySelector('.sun-icon'),
    moonIcon: document.querySelector('.moon-icon'),
    themeLabel: document.querySelector('.theme-label'),
    badgePending: document.getElementById('badge-pending'),

    // Dashboard
    statTotalEntries: document.getElementById('stat-total-entries'),
    statTasksCompleted: document.getElementById('stat-tasks-completed'),
    statTasksPending: document.getElementById('stat-tasks-pending'),
    statTotalNotes: document.getElementById('stat-total-notes'),
    dashTaskList: document.getElementById('dash-task-list'),
    dashQuickTaskInput: document.getElementById('dash-quick-task-input'),
    dashQuickTaskBtn: document.getElementById('dash-quick-task-btn'),
    dashTodayStatus: document.getElementById('dash-today-status'),
    dashTodayPreview: document.getElementById('dash-today-preview'),
    dashRecentEntries: document.getElementById('dash-recent-entries'),
    quickWriteBtn: document.getElementById('quick-write-btn'),
    quickAddTaskBtn: document.getElementById('quick-add-task-btn'),

    // Diary
    diaryDatePicker: document.getElementById('diary-date-picker'),
    btnPrevDay: document.getElementById('btn-prev-day'),
    btnNextDay: document.getElementById('btn-next-day'),
    btnToday: document.getElementById('btn-today'),
    modeTabs: document.querySelectorAll('.mode-tab'),
    modeTypedPanel: document.getElementById('mode-typed-panel'),
    modeHandwrittenPanel: document.getElementById('mode-handwritten-panel'),
    diaryTitleInput: document.getElementById('diary-title-input'),
    diaryContentInput: document.getElementById('diary-content-input'),
    diaryTagInput: document.getElementById('diary-tag-input'),
    moodBtns: document.querySelectorAll('.mood-btn'),
    btnSaveDiary: document.getElementById('btn-save-diary'),

    // Canvas / Pen
    canvas: document.getElementById('handwriting-canvas'),
    colorDots: document.querySelectorAll('.color-dot'),
    penSizeSlider: document.getElementById('pen-size-slider'),
    penSizeVal: document.getElementById('pen-size-val'),
    btnPenEraser: document.getElementById('btn-pen-eraser'),
    btnPenUndo: document.getElementById('btn-pen-undo'),
    btnPenClear: document.getElementById('btn-pen-clear'),

    // Tasks View
    newTaskForm: document.getElementById('new-task-form'),
    taskTitleInput: document.getElementById('task-title-input'),
    taskPriorityInput: document.getElementById('task-priority-input'),
    taskCategoryInput: document.getElementById('task-category-input'),
    taskDueInput: document.getElementById('task-due-input'),
    fullTasksList: document.getElementById('full-tasks-list'),
    filterPills: document.querySelectorAll('.filter-pill'),
    taskSearchInput: document.getElementById('task-search-input'),
    countAll: document.getElementById('count-all'),
    countPending: document.getElementById('count-pending'),
    countCompleted: document.getElementById('count-completed'),

    // Notes View
    notesGrid: document.getElementById('notes-grid'),
    btnAddNote: document.getElementById('btn-add-note'),
    notesSearchInput: document.getElementById('notes-search-input'),
    noteModal: document.getElementById('note-modal'),
    modalNoteTitle: document.getElementById('modal-note-title'),
    modalNoteContent: document.getElementById('modal-note-content'),
    noteColorOpts: document.querySelectorAll('.note-color-opt'),
    btnCloseNoteModal: document.getElementById('close-note-modal'),
    btnCancelNote: document.getElementById('btn-cancel-note'),
    btnSaveNote: document.getElementById('btn-save-note'),

    // Cross-Device Sync
    btnExportData: document.getElementById('btn-export-data'),
    importFileInput: document.getElementById('import-file-input'),

    // Toast
    toast: document.getElementById('toast')
  };

  // --- STORAGE HELPERS ---
  const STORAGE_KEYS = {
    DIARY: 'daytrack_diary_data',
    TASKS: 'daytrack_tasks_data',
    NOTES: 'daytrack_notes_data',
    THEME: 'daytrack_theme_pref'
  };

  function loadData() {
    try {
      const diaryRaw = localStorage.getItem(STORAGE_KEYS.DIARY);
      if (diaryRaw) state.diary = JSON.parse(diaryRaw);

      const tasksRaw = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (tasksRaw) state.tasks = JSON.parse(tasksRaw);

      const notesRaw = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (notesRaw) state.notes = JSON.parse(notesRaw);

      const themeRaw = localStorage.getItem(STORAGE_KEYS.THEME);
      if (themeRaw) state.theme = themeRaw;
    } catch (e) {
      console.warn('Error loading stored data:', e);
    }

    // Seed sample data if totally fresh
    if (Object.keys(state.diary).length === 0 && state.tasks.length === 0 && state.notes.length === 0) {
      seedInitialData();
    }
  }

  function saveData(type) {
    try {
      if (type === 'diary' || !type) localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(state.diary));
      if (type === 'tasks' || !type) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(state.tasks));
      if (type === 'notes' || !type) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(state.notes));
      if (type === 'theme' || !type) localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    } catch (e) {
      console.error('Error saving data to localStorage:', e);
    }
  }

  function seedInitialData() {
    const today = getTodayString();
    state.diary[today] = {
      date: today,
      title: 'Starting My Digital & Handwritten Day Maintain Diary',
      content: 'Welcome to DayTrack! Today marks the start of keeping track of my daily routines, achievements, reflections, and tasks. I can write notes digitally, or sketch and write with my finger/stylus pen on my phone.\n\nKey goals for today:\n1. Organize pending priorities.\n2. Maintain consistent daily reflections.\n3. Keep work and personal thoughts balanced.',
      mood: '🚀',
      tag: 'Kickoff',
      drawingData: null,
      updated: new Date().toISOString()
    };

    state.tasks = [
      { id: '1', title: 'Plan priorities for the day', priority: 'high', category: 'work', dueDate: today, completed: true, createdAt: Date.now() - 3600000 },
      { id: '2', title: 'Complete daily activity maintain entry', priority: 'high', category: 'personal', dueDate: today, completed: false, createdAt: Date.now() - 1800000 },
      { id: '3', title: 'Try stylus handwriting mode on phone', priority: 'medium', category: 'study', dueDate: today, completed: false, createdAt: Date.now() - 900000 },
      { id: '4', title: 'Review pending task list', priority: 'low', category: 'work', dueDate: '', completed: false, createdAt: Date.now() }
    ];

    state.notes = [
      {
        id: '1',
        title: '💡 Personal Growth Principles',
        content: '- Focus on 1 high-impact task at a time.\n- Review pending activities every evening.\n- Small daily improvements compound into huge wins over months.',
        color: 'blue',
        updatedAt: 'Just now'
      },
      {
        id: '2',
        title: '📱 Phone & Cross-Device Access',
        content: 'I can access this diary directly on my phone! Open the "Phone / Sync" tab to see Wi-Fi access steps or deploy to free hosting like Vercel or GitHub Pages.',
        color: 'purple',
        updatedAt: 'Today'
      }
    ];

    saveData();
  }

  function showToast(msg) {
    elements.toast.textContent = msg;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 2200);
  }

  // --- CANVAS HANDWRITING ENGINE ---
  let ctx = null;
  let isDrawing = false;
  let lastX = 0, lastY = 0;

  function initCanvas() {
    ctx = elements.canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', () => {
      // Preserve canvas drawing on resize
      const imgData = elements.canvas.toDataURL();
      resizeCanvas();
      loadCanvasImage(imgData);
    });

    // Pointer Events for Stylus, Touch & Mouse
    elements.canvas.addEventListener('pointerdown', handlePointerDown);
    elements.canvas.addEventListener('pointermove', handlePointerMove);
    elements.canvas.addEventListener('pointerup', handlePointerUp);
    elements.canvas.addEventListener('pointercancel', handlePointerUp);
  }

  function resizeCanvas() {
    let imgData = null;
    try {
      if (elements.canvas.width > 0 && elements.canvas.height > 0 && !isCanvasBlank()) {
        imgData = elements.canvas.toDataURL();
      }
    } catch (e) {}

    const rect = elements.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 600;
    const height = Math.max(rect.height, 460);

    if (elements.canvas.width !== width * dpr || elements.canvas.height !== height * dpr) {
      elements.canvas.width = width * dpr;
      elements.canvas.height = height * dpr;
      elements.canvas.style.width = `${width}px`;
      elements.canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (imgData) {
        loadCanvasImage(imgData);
      }
    }
  }

  function getCanvasCoords(e) {
    const rect = elements.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5
    };
  }

  function pushUndo() {
    if (state.undoStack.length > 25) state.undoStack.shift();
    state.undoStack.push(elements.canvas.toDataURL());
  }

  function handlePointerDown(e) {
    e.preventDefault();
    isDrawing = true;
    pushUndo();

    const { x, y, pressure } = getCanvasCoords(e);
    lastX = x;
    lastY = y;

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Apply stylus pressure dynamics
    const dynamicSize = state.isEraser ? state.penSize * 4 : state.penSize * (0.6 + pressure * 0.8);
    ctx.lineWidth = dynamicSize;
    ctx.strokeStyle = state.isEraser ? (state.theme === 'dark' ? '#121927' : '#ffffff') : state.penColor;
  }

  function handlePointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const { x, y, pressure } = getCanvasCoords(e);

    // Smooth midpoint interpolation
    const midX = (lastX + x) / 2;
    const midY = (lastY + y) / 2;

    const dynamicSize = state.isEraser ? state.penSize * 4 : state.penSize * (0.6 + pressure * 0.8);
    ctx.lineWidth = dynamicSize;
    ctx.strokeStyle = state.isEraser ? (state.theme === 'dark' ? '#121927' : '#ffffff') : state.penColor;

    ctx.quadraticCurveTo(lastX, lastY, midX, midY);
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function handlePointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    ctx.closePath();
  }

  function clearCanvas() {
    pushUndo();
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, elements.canvas.width / dpr, elements.canvas.height / dpr);
  }

  function undoCanvas() {
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack.pop();
    loadCanvasImage(prev);
  }

  function loadCanvasImage(dataUrl) {
    if (!dataUrl) {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, elements.canvas.width / dpr, elements.canvas.height / dpr);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, elements.canvas.width / dpr, elements.canvas.height / dpr);
      ctx.drawImage(img, 0, 0, elements.canvas.width / dpr, elements.canvas.height / dpr);
    };
    img.src = dataUrl;
  }

  function isCanvasBlank() {
    if (!elements.canvas.width || !elements.canvas.height) return true;
    try {
      const imgData = ctx.getImageData(0, 0, elements.canvas.width, elements.canvas.height);
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] !== 0) return false;
      }
    } catch (e) {
      return true;
    }
    return true;
  }

  // --- NAVIGATION & ROUTING ---
  function switchView(viewName) {
    state.currentView = viewName;
    elements.contentViews.forEach(v => v.classList.remove('active'));
    elements.navItems.forEach(n => n.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewName}`);
    const targetNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);

    if (targetView) targetView.classList.add('active');
    if (targetNav) targetNav.classList.add('active');

    // Title mapping
    const titles = {
      dashboard: 'Dashboard',
      diary: 'Daily Maintain Diary',
      tasks: 'Tasks & Pending Activity',
      notes: 'My Notes',
      'device-access': 'Phone & Cross-Device Access'
    };
    elements.viewTitle.textContent = titles[viewName] || 'Dashboard';

    if (viewName === 'diary') {
      setTimeout(resizeCanvas, 50);
      loadDiaryEntryForDate(state.currentDate);
    } else if (viewName === 'dashboard') {
      updateDashboard();
    } else if (viewName === 'tasks') {
      renderTasks();
    } else if (viewName === 'notes') {
      renderNotes();
    }
  }

  // --- DIARY LOGIC ---
  function loadDiaryEntryForDate(dateStr) {
    state.currentDate = dateStr;
    elements.diaryDatePicker.value = dateStr;

    const entry = state.diary[dateStr];
    if (entry) {
      elements.diaryTitleInput.value = entry.title || '';
      elements.diaryContentInput.value = entry.content || '';
      elements.diaryTagInput.value = entry.tag || '';
      selectMood(entry.mood || '😊');
      loadCanvasImage(entry.drawingData);
    } else {
      elements.diaryTitleInput.value = '';
      elements.diaryContentInput.value = '';
      elements.diaryTagInput.value = '';
      selectMood('😊');
      loadCanvasImage(null);
    }
    state.undoStack = [];
  }

  function saveCurrentDiaryEntry() {
    const title = elements.diaryTitleInput.value.trim();
    const content = elements.diaryContentInput.value.trim();
    const tag = elements.diaryTagInput.value.trim();
    const drawingData = isCanvasBlank() ? null : elements.canvas.toDataURL();

    if (!title && !content && !drawingData) {
      // If blank, remove entry if existed
      delete state.diary[state.currentDate];
    } else {
      state.diary[state.currentDate] = {
        date: state.currentDate,
        title: title || `Diary Entry for ${formatDisplayDate(state.currentDate)}`,
        content: content,
        tag: tag || 'Daily',
        mood: state.activeMood,
        drawingData: drawingData,
        updated: new Date().toISOString()
      };
    }

    saveData('diary');
    updateDashboard();
    showToast(`Saved diary for ${state.currentDate}!`);
  }

  function selectMood(emoji) {
    state.activeMood = emoji;
    elements.moodBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === emoji);
    });
  }

  function navigateDay(offset) {
    saveCurrentDiaryEntry();
    const [y, m, d] = state.currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    loadDiaryEntryForDate(`${year}-${month}-${day}`);
  }

  // --- TASKS LOGIC ---
  function addTask(title, priority = 'medium', category = 'personal', dueDate = '') {
    if (!title.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      priority,
      category,
      dueDate,
      completed: false,
      createdAt: Date.now()
    };
    state.tasks.unshift(newTask);
    saveData('tasks');
    renderTasks();
    updateDashboard();
    showToast('Task added!');
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveData('tasks');
      renderTasks();
      updateDashboard();
    }
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData('tasks');
    renderTasks();
    updateDashboard();
    showToast('Task deleted');
  }

  function renderTasks() {
    let filtered = state.tasks;

    if (state.activeFilter === 'pending') {
      filtered = filtered.filter(t => !t.completed);
    } else if (state.activeFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }

    // Counts
    const allCount = state.tasks.length;
    const pendingCount = state.tasks.filter(t => !t.completed).length;
    const completedCount = allCount - pendingCount;

    elements.countAll.textContent = allCount;
    elements.countPending.textContent = pendingCount;
    elements.countCompleted.textContent = completedCount;
    elements.badgePending.textContent = pendingCount;

    if (filtered.length === 0) {
      elements.fullTasksList.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-dim);">
          No tasks found in this view. Add one above!
        </div>
      `;
      return;
    }

    elements.fullTasksList.innerHTML = filtered.map(task => `
      <div class="task-card-item" data-id="${task.id}">
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-action="toggle">
          <div class="task-details">
            <h4 class="${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</h4>
            <div class="task-meta-tags">
              <span class="priority-tag ${task.priority}">${task.priority.toUpperCase()}</span>
              <span class="category-tag">📂 ${capitalize(task.category)}</span>
              ${task.dueDate ? `<span class="due-tag">📅 Due: ${task.dueDate}</span>` : ''}
            </div>
          </div>
        </div>
        <button class="task-delete-btn" data-action="delete" title="Delete Task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');
  }

  // --- NOTES LOGIC ---
  let editingNoteId = null;
  let selectedNoteColor = 'blue';

  function openNoteModal(noteId = null) {
    editingNoteId = noteId;
    if (noteId) {
      const note = state.notes.find(n => n.id === noteId);
      if (note) {
        document.getElementById('note-modal-title').textContent = 'Edit Note';
        elements.modalNoteTitle.value = note.title;
        elements.modalNoteContent.value = note.content;
        selectedNoteColor = note.color || 'blue';
      }
    } else {
      document.getElementById('note-modal-title').textContent = 'New Note';
      elements.modalNoteTitle.value = '';
      elements.modalNoteContent.value = '';
      selectedNoteColor = 'blue';
    }

    elements.noteColorOpts.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.color === selectedNoteColor);
    });

    elements.noteModal.classList.remove('hidden');
    elements.modalNoteTitle.focus();
  }

  function closeNoteModal() {
    elements.noteModal.classList.add('hidden');
    editingNoteId = null;
  }

  function saveNote() {
    const title = elements.modalNoteTitle.value.trim();
    const content = elements.modalNoteContent.value.trim();

    if (!title && !content) return;

    if (editingNoteId) {
      const note = state.notes.find(n => n.id === editingNoteId);
      if (note) {
        note.title = title || 'Untitled Note';
        note.content = content;
        note.color = selectedNoteColor;
        note.updatedAt = 'Just now';
      }
    } else {
      state.notes.unshift({
        id: Date.now().toString(),
        title: title || 'Untitled Note',
        content,
        color: selectedNoteColor,
        updatedAt: 'Just now'
      });
    }

    saveData('notes');
    closeNoteModal();
    renderNotes();
    updateDashboard();
    showToast('Note saved!');
  }

  function deleteNote(id) {
    state.notes = state.notes.filter(n => n.id !== id);
    saveData('notes');
    renderNotes();
    updateDashboard();
    showToast('Note deleted');
  }

  function renderNotes() {
    let filtered = state.notes;
    if (state.noteSearchQuery.trim()) {
      const q = state.noteSearchQuery.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      elements.notesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-dim);">
          No notes found. Click "New Note" to jot down your thoughts!
        </div>
      `;
      return;
    }

    elements.notesGrid.innerHTML = filtered.map(note => `
      <div class="note-card color-${note.color || 'blue'}" data-id="${note.id}">
        <div class="note-header">
          <h4>${escapeHtml(note.title)}</h4>
          <button class="task-delete-btn" data-action="delete-note" title="Delete">✕</button>
        </div>
        <div class="note-body">${escapeHtml(note.content)}</div>
        <div class="note-footer">
          <span>${note.updatedAt}</span>
          <span style="text-transform: capitalize;">${note.color}</span>
        </div>
      </div>
    `).join('');
  }

  // --- DASHBOARD UPDATES ---
  function updateDashboard() {
    // Stats
    const totalEntries = Object.keys(state.diary).length;
    const completedTasks = state.tasks.filter(t => t.completed).length;
    const pendingTasks = state.tasks.filter(t => !t.completed).length;
    const totalNotes = state.notes.length;

    elements.statTotalEntries.textContent = totalEntries;
    elements.statTasksCompleted.textContent = completedTasks;
    elements.statTasksPending.textContent = pendingTasks;
    elements.statTotalNotes.textContent = totalNotes;
    elements.badgePending.textContent = pendingTasks;

    // Current & Pending Activities List (Top 5 pending)
    const pendingList = state.tasks.filter(t => !t.completed).slice(0, 5);
    if (pendingList.length === 0) {
      elements.dashTaskList.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-dim); font-size: 0.88rem;">
          🎉 All caught up! No pending activities.
        </div>
      `;
    } else {
      elements.dashTaskList.innerHTML = pendingList.map(task => `
        <div class="dash-task-item" data-id="${task.id}">
          <div class="dash-task-left">
            <input type="checkbox" data-action="dash-toggle">
            <span class="dash-task-text">${escapeHtml(task.title)}</span>
          </div>
          <span class="priority-tag ${task.priority}">${task.priority}</span>
        </div>
      `).join('');
    }

    // Today's Maintain Diary Preview
    const today = getTodayString();
    const todayEntry = state.diary[today];

    if (todayEntry) {
      elements.dashTodayStatus.textContent = `Completed (${todayEntry.mood})`;
      const hasHandwriting = todayEntry.drawingData ? '✍️ Includes Handwritten Pad' : '';
      elements.dashTodayPreview.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700;">${todayEntry.mood} ${escapeHtml(todayEntry.title)}</h4>
          <span style="font-size: 0.75rem; color: var(--primary);">${hasHandwriting}</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; max-height: 90px; overflow: hidden; text-overflow: ellipsis;">
          ${escapeHtml(todayEntry.content || 'Handwritten entry saved on pad.')}
        </p>
      `;
    } else {
      elements.dashTodayStatus.textContent = 'Not written yet';
      elements.dashTodayPreview.innerHTML = `
        <div style="text-align: center; padding: 0.5rem;">
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            You haven't maintained your diary entry for today yet.
          </p>
          <button class="btn btn-sm btn-primary" data-go-view="diary">Write Today's Diary</button>
        </div>
      `;
    }

    // Recent Diary Entries History
    const dates = Object.keys(state.diary).sort().reverse().slice(0, 4);
    if (dates.length === 0) {
      elements.dashRecentEntries.innerHTML = `
        <div style="color: var(--text-dim); font-size: 0.82rem; text-align: center; padding: 1rem;">
          No past diary entries recorded yet.
        </div>
      `;
    } else {
      elements.dashRecentEntries.innerHTML = dates.map(d => {
        const ent = state.diary[d];
        return `
          <div class="recent-entry-item" data-date="${d}">
            <div class="recent-entry-top">
              <span>📅 ${formatDisplayDate(d)}</span>
              <span>${ent.mood} ${ent.tag || ''}</span>
            </div>
            <div class="recent-entry-title">${escapeHtml(ent.title)}</div>
          </div>
        `;
      }).join('');
    }
  }

  // --- CROSS-DEVICE BACKUP & RESTORE ---
  function exportData() {
    const backupObj = {
      app: 'DayTrack',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      diary: state.diary,
      tasks: state.tasks,
      notes: state.notes
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DayTrack_Backup_${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully!');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.diary) state.diary = { ...state.diary, ...imported.diary };
        if (imported.tasks) state.tasks = imported.tasks;
        if (imported.notes) state.notes = imported.notes;

        saveData();
        updateDashboard();
        renderTasks();
        renderNotes();
        showToast('Backup restored successfully!');
      } catch (err) {
        alert('Invalid backup file. Please select a valid DayTrack JSON backup.');
      }
    };
    reader.readAsText(file);
  }

  // --- THEME ---
  function applyTheme(th) {
    state.theme = th;
    if (th === 'light') {
      document.body.classList.replace('theme-dark', 'theme-light');
      elements.sunIcon.classList.add('hidden');
      elements.moonIcon.classList.remove('hidden');
      elements.themeLabel.textContent = 'Light Mode';
    } else {
      document.body.classList.replace('theme-light', 'theme-dark');
      elements.sunIcon.classList.remove('hidden');
      elements.moonIcon.classList.add('hidden');
      elements.themeLabel.textContent = 'Dark Mode';
    }
    saveData('theme');
  }

  // --- EVENT LISTENERS ---
  function setupEvents() {
    // Nav Items
    elements.navItems.forEach(item => {
      item.addEventListener('click', () => switchView(item.dataset.view));
    });

    // Theme Toggle
    elements.btnThemeToggle.addEventListener('click', () => {
      applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Header Quick Buttons
    elements.quickWriteBtn.addEventListener('click', () => {
      switchView('diary');
    });

    elements.quickAddTaskBtn.addEventListener('click', () => {
      switchView('tasks');
      elements.taskTitleInput.focus();
    });

    // Dashboard Quick Add
    elements.dashQuickTaskBtn.addEventListener('click', () => {
      const val = elements.dashQuickTaskInput.value;
      if (val.trim()) {
        addTask(val, 'medium', 'personal', getTodayString());
        elements.dashQuickTaskInput.value = '';
      }
    });

    elements.dashQuickTaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = elements.dashQuickTaskInput.value;
        if (val.trim()) {
          addTask(val, 'medium', 'personal', getTodayString());
          elements.dashQuickTaskInput.value = '';
        }
      }
    });

    // Dashboard dynamic click handlers
    document.addEventListener('click', (e) => {
      const goViewBtn = e.target.closest('[data-go-view]');
      if (goViewBtn) {
        switchView(goViewBtn.dataset.goView);
        return;
      }

      const recentItem = e.target.closest('.recent-entry-item');
      if (recentItem) {
        const d = recentItem.dataset.date;
        state.currentDate = d;
        switchView('diary');
        return;
      }

      const dashCheck = e.target.closest('[data-action="dash-toggle"]');
      if (dashCheck) {
        const taskId = dashCheck.closest('.dash-task-item').dataset.id;
        toggleTask(taskId);
        return;
      }
    });

    // Diary View
    elements.diaryDatePicker.addEventListener('change', (e) => {
      saveCurrentDiaryEntry();
      loadDiaryEntryForDate(e.target.value);
    });

    elements.btnPrevDay.addEventListener('click', () => navigateDay(-1));
    elements.btnNextDay.addEventListener('click', () => navigateDay(1));
    elements.btnToday.addEventListener('click', () => {
      saveCurrentDiaryEntry();
      loadDiaryEntryForDate(getTodayString());
    });

    elements.btnSaveDiary.addEventListener('click', saveCurrentDiaryEntry);

    // Mode Switch: Typed vs Handwritten
    elements.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.modeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.entryMode;
        state.entryMode = mode;
        if (mode === 'typed') {
          elements.modeTypedPanel.classList.add('active');
          elements.modeHandwrittenPanel.classList.remove('active');
        } else {
          elements.modeTypedPanel.classList.remove('active');
          elements.modeHandwrittenPanel.classList.add('active');
          setTimeout(resizeCanvas, 50);
        }
      });
    });

    // Mood Selector
    elements.moodBtns.forEach(btn => {
      btn.addEventListener('click', () => selectMood(btn.dataset.mood));
    });

    // Canvas Pen Controls
    elements.colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        elements.colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        state.penColor = dot.dataset.color;
        state.isEraser = false;
        elements.btnPenEraser.classList.remove('active');
      });
    });

    elements.penSizeSlider.addEventListener('input', (e) => {
      state.penSize = Number(e.target.value);
      elements.penSizeVal.textContent = `${state.penSize}px`;
    });

    elements.btnPenEraser.addEventListener('click', () => {
      state.isEraser = !state.isEraser;
      elements.btnPenEraser.classList.toggle('active', state.isEraser);
    });

    elements.btnPenUndo.addEventListener('click', undoCanvas);
    elements.btnPenClear.addEventListener('click', () => {
      if (confirm('Clear the entire handwritten pad?')) clearCanvas();
    });

    // Tasks View
    elements.newTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask(
        elements.taskTitleInput.value,
        elements.taskPriorityInput.value,
        elements.taskCategoryInput.value,
        elements.taskDueInput.value
      );
      elements.taskTitleInput.value = '';
    });

    elements.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFilter = pill.dataset.filter;
        renderTasks();
      });
    });

    elements.taskSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTasks();
    });

    elements.fullTasksList.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-action="toggle"]');
      if (toggle) {
        const id = toggle.closest('.task-card-item').dataset.id;
        toggleTask(id);
        return;
      }
      const del = e.target.closest('[data-action="delete"]');
      if (del) {
        const id = del.closest('.task-card-item').dataset.id;
        deleteTask(id);
        return;
      }
    });

    // Notes View
    elements.btnAddNote.addEventListener('click', () => openNoteModal());
    elements.btnCloseNoteModal.addEventListener('click', closeNoteModal);
    elements.btnCancelNote.addEventListener('click', closeNoteModal);
    elements.btnSaveNote.addEventListener('click', saveNote);

    elements.noteColorOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        elements.noteColorOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedNoteColor = opt.dataset.color;
      });
    });

    elements.notesSearchInput.addEventListener('input', (e) => {
      state.noteSearchQuery = e.target.value;
      renderNotes();
    });

    elements.notesGrid.addEventListener('click', (e) => {
      const delBtn = e.target.closest('[data-action="delete-note"]');
      if (delBtn) {
        e.stopPropagation();
        const id = delBtn.closest('.note-card').dataset.id;
        deleteNote(id);
        return;
      }
      const card = e.target.closest('.note-card');
      if (card) {
        openNoteModal(card.dataset.id);
      }
    });

    // Cross-Device Sync
    elements.btnExportData.addEventListener('click', exportData);
    elements.importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importData(e.target.files[0]);
      }
    });
  }

  // Helper Functions
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- INITIALIZATION ---
  function init() {
    loadData();
    applyTheme(state.theme);
    elements.headerDate.textContent = formatDisplayDate(getTodayString());
    elements.diaryDatePicker.value = state.currentDate;

    initCanvas();
    setupEvents();

    updateDashboard();
    renderTasks();
    renderNotes();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
