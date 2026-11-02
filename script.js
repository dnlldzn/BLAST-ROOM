//---------- 1. Connect to the database (Supabase) ----------
const SUPABASE_URL = 'https://jdyqyzfdmahqshqbiadx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xNXIvvcgLuqQQB1uCk6-Ig_4s2HlJv5';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const ASSIGNMENT_SUBMISSIONS_BUCKET = 'assignment-submissions';
const MAX_ASSIGNMENT_FILE_SIZE = 50 * 1024 * 1024;
let authMode = 'login';

// === APP STATE ===
const state = {
  user: null,
  activeView: 'dashboard',
  courses: [
    { id: 'AUTOCAD', name: 'AUTOCAD', instructor: 'Mr. Robin Gonzales', progress: 50, modules: { total: 12, completed: 6 }, color: '#1677b8' },
    { id: 'OLIMFBDS', name: 'OLIMFBDS', instructor: 'Mr. Robin Gonzales', progress: 33, modules: { total: 9, completed: 3 }, color: '#238fc7' },
    { id: 'OLCOEPRO', name: 'OLCOEPRO', instructor: 'Mr. Robin Gonzales', progress: 75, modules: { total: 8, completed: 6 }, color: '#805337' },
    { id: 'OLMATH', name: 'OLMATH01', instructor: 'Ms. Mary Joyce Luceño', progress: 25, modules: { total: 12, completed: 3 }, color: '#b68b5b' }
  ],
  assignments: [
    { id: 'a1', title: 'Project Dream House', course: 'AUTOCAD', dueDate: '2026-11-05', status: 'pending', description: 'Build your Dream House using the Requirements in your module.' },
    { id: 'a2', title: 'SQL Query Practice', course: 'OLIMFBDS', dueDate: '2026-10-31', status: 'pending', description: 'Write 5 SELECT queries filtering and sorting data.' },
    { id: 'a3', title: 'Multidisciplinary Project Design', course: 'OLCOEPRO', dueDate: '2026-11-07', status: 'pending', description: '300-word essay about engineering.' },
    { id: 'a4', title: 'Data Management', course: 'OLMATH', dueDate: '2026-10-20', status: 'submitted', description: 'Survey 40 students about their Daily Allowancae.' }
  ],
  notifications: [
    { id: 'n1', message: 'New material posted in OLIMFBDS', time: '2 hours ago', read: false },
    { id: 'n2', message: 'Grade updated: OLMATH – 92%', time: '1 day ago', read: false },
    { id: 'n3', message: 'Class reminder: Database lecture tomorrow 9AM', time: '2 days ago', read: true }
  ],
  classPosts: [],
  readClassPostIds: new Set(),
  classPostsChannel: null,
  submissions: [],
  grades: {
    overall: 88.5, letter: 'B+',
    courses: [
      { id: 'AUTOCAD', completed: 4, total: 5, average: 90.2 },
      { id: 'OLIMFBDS', completed: 2, total: 4, average: 85.0 },
      { id: 'OLCOEPRO', completed: 5, total: 5, average: 91.5 },
      { id: 'OLMATH', completed: 1, total: 3, average: 82.0 }
    ]
  },
  aiOpen: false
};

// === DOM ELEMENTS ===
const el = {
  loginScreen: document.getElementById('loginScreen'),
  dashboardDate: document.getElementById('dashboardDate'),
  app: document.getElementById('app'),
  loginForm: document.getElementById('loginForm'),
  loginRole: document.getElementById('loginRole'),
  studentIdField: document.getElementById('studentIdField'),
  loginStudentId: document.getElementById('loginStudentId'),
  loginEmail: document.getElementById('loginEmail'),
  loginPassword: document.getElementById('loginPassword'),
  authSubmit: document.getElementById('authSubmit'),
  authMessage: document.getElementById('authMessage'),
  authModeToggle: document.getElementById('authModeToggle'),
  authSwitchPrompt: document.getElementById('authSwitchPrompt'),
  teacherToolsNav: document.getElementById('teacherToolsNav'),
  teacherPostForm: document.getElementById('teacherPostForm'),
  postKind: document.getElementById('postKind'),
  postTitle: document.getElementById('postTitle'),
  postCourseField: document.getElementById('postCourseField'),
  postCourse: document.getElementById('postCourse'),
  postDueDateField: document.getElementById('postDueDateField'),
  postDueDate: document.getElementById('postDueDate'),
  postContent: document.getElementById('postContent'),
  publishPostButton: document.getElementById('publishPostButton'),
  teacherPostMessage: document.getElementById('teacherPostMessage'),
  teacherPostsList: document.getElementById('teacherPostsList'),
  sidebar: document.getElementById('sidebar'),
  mobileMenu: document.getElementById('mobileMenu'),
  pageCrumb: document.getElementById('pageCrumb'),
  userNameTop: document.getElementById('userNameTop'),
  userRoleTop: document.getElementById('userRoleTop'),
  userAvatar: document.getElementById('userAvatar'),
  accountMenuToggle: document.getElementById('accountMenuToggle'),
  accountMenu: document.getElementById('accountMenu'),
  accountLogoutBtn: document.getElementById('accountLogoutBtn'),
  welcomeName: document.getElementById('welcomeName'),
  logoutBtn: document.getElementById('logoutBtn'),
  profileForm: document.getElementById('profileForm'),
  profileFullName: document.getElementById('profileFullName'),
  profileStudentId: document.getElementById('profileStudentId'),
  profileStudentIdField: document.getElementById('profileStudentIdField'),
  profileEmail: document.getElementById('profileEmail'),
  profileMessage: document.getElementById('profileMessage'),
  saveProfileButton: document.getElementById('saveProfileButton'),
  settingsForm: document.getElementById('settingsForm'),
  settingsEmail: document.getElementById('settingsEmail'),
  settingsPassword: document.getElementById('settingsPassword'),
  settingsPasswordConfirm: document.getElementById('settingsPasswordConfirm'),
  settingsMessage: document.getElementById('settingsMessage'),
  saveSettingsButton: document.getElementById('saveSettingsButton'),
  views: {
    dashboard: document.getElementById('view-dashboard'),
    courses: document.getElementById('view-courses'),
    assignments: document.getElementById('view-assignments'),
    grades: document.getElementById('view-grades'),
    notifications: document.getElementById('view-notifications'),
    teacher: document.getElementById('view-teacher'),
    courseDetail: document.getElementById('view-course-detail'),
    profile: document.getElementById('view-profile'),
    settings: document.getElementById('view-settings')
  },
  navItems: document.querySelectorAll('.nav-item[data-view]'),
  statCourses: document.getElementById('statCourses'),
  statPending: document.getElementById('statPending'),
  statAverage: document.getElementById('statAverage'),
  statModules: document.getElementById('statModules'),
  dashboardCourses: document.getElementById('dashboardCourses'),
  dashboardDeadlines: document.getElementById('dashboardDeadlines'),
  coursesGrid: document.getElementById('coursesGrid'),
  assignmentFilter: document.getElementById('assignmentFilter'),
  assignmentsTable: document.getElementById('assignmentsTable'),
  gradeAverage: document.getElementById('gradeAverage'),
  gradeLetter: document.getElementById('gradeLetter'),
  gradesTable: document.getElementById('gradesTable'),
  notificationsList: document.getElementById('notificationsList'),
  markAllRead: document.getElementById('markAllRead'),
  notificationDot: document.querySelector('.notification-dot'),
  toast: document.getElementById('toast'),
  aiWidget: document.getElementById('aiWidget'),
  aiMessages: document.getElementById('aiMessages'),
  aiForm: document.getElementById('aiForm'),
  aiInput: document.getElementById('aiInput'),
  aiCourseFilter: document.getElementById('aiCourseFilter'),
  closeAi: document.getElementById('closeAi'),
  openAiFromBanner: document.getElementById('openAiFromBanner'),
  sidebarAskAi: document.getElementById('sidebarAskAi'),
  quickPrompts: document.querySelectorAll('[data-prompt]'),
  assignmentDialog: document.getElementById('assignmentDialog'),
  dialogTitle: document.getElementById('dialogTitle'),
  dialogDescription: document.getElementById('dialogDescription'),
  assignmentAnswer: document.getElementById('assignmentAnswer'),
  assignmentFiles: document.getElementById('assignmentFiles'),
  assignmentFileList: document.getElementById('assignmentFileList'),
  assignmentSubmissionMessage: document.getElementById('assignmentSubmissionMessage'),
  submitAssignmentButton: document.getElementById('submitAssignmentButton'),
  assignmentForm: document.getElementById('assignmentForm'),
  closeAssignmentDialog: document.getElementById('closeAssignmentDialog'),
  cancelAssignment: document.getElementById('cancelAssignment'),
  backToCourses: document.getElementById('backToCourses'),
  courseDetailContent: document.getElementById('courseDetailContent'),
  courseSearch: document.getElementById('courseSearch'),
  assignmentCount: document.getElementById('assignmentCount')
};

// === UTILITY ===
function showView(viewName) {
    closeAccountMenu();
    if (viewName === 'admin' && !state.user?.isStaff) return;
    if (viewName === 'teacher' && state.user?.role !== 'teacher') return;
    
    if (el.views) {
        Object.values(el.views).forEach(v => v?.classList.add('hidden'));
        if (el.views[viewName]) {
            el.views[viewName].classList.remove('hidden');
        }
    }
    
    if (el.navItems) {
        el.navItems.forEach(n => n?.classList.remove('active'));
    }
    
    document.querySelectorAll(`[data-view="${viewName}"]`).forEach(n => n?.classList.add('active'));
    
    if (el.pageCrumb) {
        el.pageCrumb.textContent = viewName === 'courseDetail' ? 'Course Details' : viewName.charAt(0).toUpperCase() + viewName.slice(1);
    }
    
    state.activeView = viewName;
    if (viewName === 'profile') populateProfileForm();
    if (viewName === 'settings') populateSettingsForm();
    if (viewName === 'admin') loadAdmin();
    if (window.innerWidth < 900 && el.sidebar) {
        el.sidebar.classList.remove('open');
    }

}
function closeAccountMenu() {
  el.accountMenu.classList.add('hidden');
  el.accountMenuToggle.setAttribute('aria-expanded', 'false');
}

function populateProfileForm() {
  if (!state.user) return;
  el.profileFullName.value = state.user.fullName;
  el.profileStudentId.value = state.user.studentId;
  el.profileEmail.textContent = state.user.email;
  const isStudent = state.user.role === 'student';
  el.profileStudentIdField.classList.toggle('hidden', !isStudent);
  el.profileStudentId.required = isStudent;
}

function populateSettingsForm() {
  if (!state.user) return;
  el.settingsEmail.value = state.user.email;
  el.settingsPassword.value = '';
  el.settingsPasswordConfirm.value = '';
}

function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 3000);
}

function getCourseName(id) {
  const c = state.courses.find(x => x.id === id);
  return c ? c.name : id;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function getAssignments() {
  const getStatus = (id, defaultStatus = 'pending') =>
    state.submissions.some(submission => submission.assignment_id === id)
      ? 'submitted'
      : defaultStatus;
  const activities = state.classPosts
    .filter(post => post.kind === 'activity')
    .map(post => ({
      id: `post-${post.id}`,
      title: post.title,
      course: post.course_id || 'All courses',
      dueDate: post.due_date || new Date(post.created_at),
      status: getStatus(`post-${post.id}`, post.status || 'pending'),
      description: post.content
    }));
  return [
    ...state.assignments.map(assignment => ({
      ...assignment,
      status: getStatus(assignment.id, assignment.status)
    })),
    ...activities
  ];
}

function parseCalendarDate(value) {
  const dateOnly = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
}

function getLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCalendarDayNumber(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function formatDate(d) {
  const date = parseCalendarDate(d);
  const opts = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', opts);
}

function getDaysRemaining(d) {
  const due = parseCalendarDate(d);
  return getCalendarDayNumber(due) - getCalendarDayNumber(new Date());
}

function renderDashboardDate() {
  el.dashboardDate.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

function updateNotificationBadge() {
  const unread = [...state.notifications, ...getClassPostNotifications()]
    .filter(n => !n.read).length;
  el.notificationDot.style.display = unread > 0 ? 'block' : 'none';
}

function getClassPostNotifications() {
  return state.classPosts
    .map(post => ({
      id: `post-${post.id}`,
      kind: post.kind === 'activity' ? 'New activity' : 'New announcement',
      message: `${post.title}: ${post.content}`,
      time: formatDate(post.created_at),
      read: state.user?.role === 'teacher' ||
        state.readClassPostIds.has(String(post.id))
    }));
}

function updateAssignmentCount() {
  const pending = getAssignments().filter(a => a.status === 'pending').length;
  el.assignmentCount.textContent = pending;
  el.statPending.textContent = pending;
}

// === RENDER FUNCTIONS ===
function renderStats() {
  el.statCourses.textContent = state.courses.length;
  const totalCompleted = state.courses.reduce((s, c) => s + c.modules.completed, 0);
  const totalModules = state.courses.reduce((s, c) => s + c.modules.total, 0);
  el.statModules.textContent = `${totalCompleted}/${totalModules}`;
  el.statAverage.textContent = state.grades.overall + '%';
  updateAssignmentCount();
}

function renderDashboardCourses() {
  el.dashboardCourses.innerHTML = state.courses.slice(0, 3).map(c => `
    <div class="course-card" data-course="${c.id}">
      <h3>${c.name}</h3>
      <p class="muted">${c.instructor} · ${c.modules.completed}/${c.modules.total} modules</p>
      <div class="course-progress">
        <div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%"></div></div>
      </div>
    </div>
  `).join('');
  el.dashboardCourses.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', () => openCourseDetail(card.dataset.course));
  });
}

function renderDeadlines() {
  const upcoming = getAssignments()
    .filter(a => a.status === 'pending')
    .sort((a, b) => getCalendarDayNumber(parseCalendarDate(a.dueDate)) -
      getCalendarDayNumber(parseCalendarDate(b.dueDate)));
  el.dashboardDeadlines.innerHTML = upcoming.map(a => {
    const days = getDaysRemaining(a.dueDate);
    const cls = days <= 3 ? 'urgent' : 'normal';
    return `
      <div class="deadline-item ${cls}">
        <strong>${escapeHtml(a.title)}</strong>
          <p class="muted">${escapeHtml(getCourseName(a.course))} · Due ${formatDate(a.dueDate)} (${
      days < 0
        ? `${Math.abs(days)} days overdue`
        : days === 0
          ? 'Due today'
          : `${days} day${days === 1 ? '' : 's'} left`
    })</p>
      </div>
    `;
  }).join('');
}

function renderCourses(search = '') {
  const filtered = state.courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );
  el.coursesGrid.innerHTML = filtered.map(c => `
    <div class="course-full-card" data-course="${c.id}">
      <div class="course-banner" style="background:linear-gradient(135deg,${c.color},${c.color}cc)"></div>
      <div class="course-body">
        <span class="course-tag">${c.progress}% Complete</span>
        <h3>${c.name}</h3>
        <p class="muted">${c.instructor}</p>
        <div class="course-progress">
          <div class="progress-bar"><div class="progress-fill" style="width:${c.progress}%"></div></div>
        </div>
      </div>
    </div>
  `).join('');
  el.coursesGrid.querySelectorAll('.course-full-card').forEach(card => {
    card.addEventListener('click', () => openCourseDetail(card.dataset.course));
  });
}

function openCourseDetail(courseId) {
  const c = state.courses.find(x => x.id === courseId);
  if (!c) return;
  const courseAssignments = getAssignments().filter(a =>
    a.course === courseId || a.course === 'All courses'
  );
  el.courseDetailContent.innerHTML = `
    <h2 style="font-size:1.5rem; font-weight:700; margin-bottom:0.5rem;">${c.name}</h2>
    <p class="muted" style="margin-bottom:1.5rem;">Instructor: ${c.instructor}</p>
    <div style="background:white; padding:1.5rem; border-radius:12px; box-shadow:var(--shadow); margin-bottom:1.5rem;">
      <p><strong>Progress:</strong> ${c.progress}%</p>
      <div class="progress-bar" style="margin:0.5rem 0 1rem;"><div class="progress-fill" style="width:${c.progress}%"></div></div>
      <p><strong>Modules:</strong> ${c.modules.completed} of ${c.modules.total} completed</p>
    </div>
    <h3 style="font-weight:600; margin-bottom:0.8rem;">Modules</h3>
    <div id="courseModules" class="muted" style="display:grid; gap:0.8rem; margin-bottom:1.5rem;">Loading…</div>
    <h3 style="font-weight:600; margin-bottom:0.8rem;">Course Assignments</h3>
    <div style="display:grid; gap:0.8rem;">
      ${courseAssignments.length ? courseAssignments.map(a => `
        <div class="module-item" style="background:white; border-radius:8px; border:none; box-shadow:var(--shadow);">
          <span class="module-status ${a.status === 'pending' ? 'pending' : ''}">${a.status === 'pending' ? '⏳' : '✓'}</span>
          <div>
            <strong>${escapeHtml(a.title)}</strong>
            <p class="muted" style="font-size:0.85rem;">Due: ${formatDate(a.dueDate)}</p>
          </div>
          <button class="primary-btn" style="margin-left:auto; padding:0.4rem 0.8rem; font-size:0.85rem;" data-assignment="${a.id}">
            ${a.status === 'pending' ? 'Submit' : 'View'}
          </button>
        </div>
      `).join('') : '<p class="muted">No assignments yet.</p>'}
    </div>
  `;
  el.courseDetailContent.querySelectorAll('[data-assignment]').forEach(btn => {
    btn.addEventListener('click', () => openAssignmentDialog(btn.dataset.assignment));
  });
  showView('courseDetail');
  loadCourseModules(courseId);
}

function renderAssignments(filter = 'all') {
  let list = getAssignments();
  if (filter === 'pending') list = list.filter(a => a.status === 'pending');
  if (filter === 'submitted') list = list.filter(a => a.status === 'submitted');
  el.assignmentsTable.innerHTML = list.map(a => `
    <tr>
      <td><strong>${escapeHtml(a.title)}</strong></td>
      <td>${escapeHtml(getCourseName(a.course))}</td>
      <td>${formatDate(a.dueDate)}</td>
      <td class="status-${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</td>
      <td><button class="text-button" data-assignment="${a.id}">${a.status === 'pending' ? 'Submit →' : 'View'}</button></td>
    </tr>
  `).join('');
  el.assignmentsTable.querySelectorAll('[data-assignment]').forEach(btn => {
    btn.addEventListener('click', () => openAssignmentDialog(btn.dataset.assignment));
  });
}

function openAssignmentDialog(assignmentId) {
  const a = getAssignments().find(item => item.id === assignmentId);
  if (!a) return;
  const submission = state.submissions.find(item => item.assignment_id === assignmentId);
  el.dialogTitle.textContent = a.title;
  el.dialogDescription.textContent = a.description;
  el.assignmentAnswer.value = submission?.response || '';
  el.assignmentAnswer.required = !submission?.attachments?.length;
  el.assignmentFiles.value = '';
  el.assignmentFileList.replaceChildren();
  setAssignmentSubmissionMessage('');
  el.assignmentDialog.showModal();
  el.assignmentDialog.dataset.id = assignmentId;
}

function renderGrades() {
  el.gradeAverage.textContent = state.grades.overall + '%';
  el.gradeLetter.textContent = state.grades.letter;
  el.gradesTable.innerHTML = state.grades.courses.map(g => {
    const course = state.courses.find(c => c.id === g.id);
    let standing = 'Average';
    if (g.average >= 90) standing = 'Excellent';
    else if (g.average >= 80) standing = 'Good';
    else if (g.average >= 75) standing = 'Satisfactory';
    else standing = 'Needs Improvement';
    return `
      <tr>
        <td><strong>${course?.name || g.id}</strong></td>
        <td>${course?.instructor || '—'}</td>
        <td>${g.completed}/${g.total}</td>
        <td><strong>${g.average}%</strong></td>
        <td>${standing}</td>
      </tr>
    `;
  }).join('');
}

function renderNotifications() {
  updateNotificationBadge();
  const notifications = [...getClassPostNotifications(), ...state.notifications];
  el.notificationsList.innerHTML = notifications.map(n => `
    <div class="notification-item ${!n.read ? 'unread' : ''}" data-id="${n.id}">
      ${n.kind ? `<strong>${escapeHtml(n.kind)}</strong>` : ''}
      <p>${escapeHtml(n.message)}</p>
      <small class="muted">${escapeHtml(n.time)}</small>
    </div>
  `).join('');
}

// === AI CHAT ===
const courseMaterialsStorageKey = 'blastoise-course-materials';
const searchStopWords = new Set([
  'a', 'about', 'an', 'and', 'are', 'can', 'do', 'does', 'for', 'how',
  'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'please', 'tell', 'that',
  'the', 'this', 'to', 'what', 'where', 'which', 'who', 'with', 'you'
]);

function toggleAi() {
  state.aiOpen = !state.aiOpen;
  el.aiWidget.classList.toggle('hidden', !state.aiOpen);
}

function initializeAiCourseFilter() {
  state.courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.name;
    el.aiCourseFilter.appendChild(option);
  });
}

function createInitialCourseMaterials() {
  const materials = state.assignments.map(assignment => ({
    id: `assignment-${assignment.id}`,
    courseId: assignment.course,
    title: assignment.title,
    content: assignment.description
  }));
  materials.push({
    id: 'olimfbds-sql-query-basics',
    courseId: 'OLIMFBDS',
    title: 'SQL query basics',
    content: 'Use SELECT column names FROM table_name to choose data. WHERE filters rows that meet a condition. ORDER BY sorts the results; ASC sorts in ascending order and DESC sorts in descending order. Example: SELECT name, daily_allowance FROM students WHERE daily_allowance > 100 ORDER BY daily_allowance DESC. The SQL Query Practice assignment asks for five SELECT queries that filter and sort data.'
  });
  return materials;
}

function getCourseMaterials() {
  const savedMaterials = window.localStorage.getItem(courseMaterialsStorageKey);
  if (savedMaterials === null) {
    const initialMaterials = createInitialCourseMaterials();
    window.localStorage.setItem(
      courseMaterialsStorageKey,
      JSON.stringify(initialMaterials)
    );
    return initialMaterials;
  }

  const materials = JSON.parse(savedMaterials);
  if (!Array.isArray(materials) || materials.some(material =>
    !material || typeof material.id !== 'string' ||
    typeof material.courseId !== 'string' ||
    typeof material.title !== 'string' ||
    typeof material.content !== 'string'
  )) {
    throw new Error('Saved course materials have an invalid format.');
  }
  return materials;
}

function getSearchTerms(text) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .map(term => {
      if (term.length > 5 && term.endsWith('ing')) return term.slice(0, -3);
      if (term.length > 4 && term.endsWith('ies')) return `${term.slice(0, -3)}y`;
      if (term.length > 4 && term.endsWith('ed')) return term.slice(0, -2);
      if (term.length > 3 && term.endsWith('s')) return term.slice(0, -1);
      return term;
    })
    .filter(term => term.length > 1 && !searchStopWords.has(term)))];
}

function retrieveCourseMaterials(question) {
  const terms = getSearchTerms(question);
  if (!terms.length) return [];

  const selectedCourse = el.aiCourseFilter.value;
  return getCourseMaterials()
    .filter(material => selectedCourse === 'all' || material.courseId === selectedCourse)
    .map(material => {
      const titleTerms = new Set(getSearchTerms(material.title));
      const searchableContent = new Set(getSearchTerms(material.content));
      const matchedTerms = terms.filter(term =>
        titleTerms.has(term) || searchableContent.has(term)
      );
      const titleMatches = terms.filter(term => titleTerms.has(term)).length;
      return {
        material,
        score: matchedTerms.length + titleMatches * 2
      };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(result => result.material);
}

function addAiMessage(text, sender = 'assistant') {
  const div = document.createElement('div');
  div.className = `chat-message ${sender}`;
  if (sender === 'assistant') {
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '✦';
    div.appendChild(avatar);
  }
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  bubble.appendChild(paragraph);
  div.appendChild(bubble);
  el.aiMessages.appendChild(div);
  el.aiMessages.scrollTop = el.aiMessages.scrollHeight;
}

function handleAiResponse(userText) {
  try {
    const matches = retrieveCourseMaterials(userText);
    if (!matches.length) {
      addAiMessage(
        'I couldn’t find an answer in the saved materials for that question. ' +
        'Try a course or assignment topic, or choose a different course filter.'
      );
      return;
    }

    const excerpts = matches.map(material =>
      `${material.content}\nSource: ${getCourseName(material.courseId)} · ${material.title}`
    );
    addAiMessage(`Here’s what I found in your course materials:\n\n${excerpts.join('\n\n')}`);
  } catch (error) {
    console.error('Unable to retrieve saved course materials:', error);
    addAiMessage(
      'I couldn’t access the saved course materials. Please check the browser’s ' +
      'site storage and try again.'
    );
  }
}

// === LOGIN / SIGN UP / LOGOUT ===
function setAuthMessage(message, type = '') {
  el.authMessage.textContent = message;
  el.authMessage.className = `auth-message${type ? ` ${type}` : ''}`;
}

function setAuthMode(mode) {
  const isSignup = mode === 'signup' && el.loginRole.value === 'student';
  authMode = isSignup ? 'signup' : 'login';
  el.studentIdField.classList.toggle('hidden', !isSignup);
  el.loginStudentId.required = isSignup;
  el.loginStudentId.autocomplete = isSignup ? 'username' : 'off';
  el.loginPassword.autocomplete = isSignup ? 'new-password' : 'current-password';
  el.loginPassword.minLength = isSignup ? 6 : 0;
  el.authSubmit.innerHTML = isSignup ? 'Create student account <span>→</span>'
    : el.loginRole.value === 'teacher' ? 'Teacher log in <span>→</span>'
      : 'Log in to Blastoise Room <span>→</span>';
  el.authSwitchPrompt.closest('.auth-switch').classList.toggle(
    'hidden',
    el.loginRole.value === 'teacher'
  );
  el.authModeToggle.textContent = isSignup ? 'Log in' : 'Create an account';
  el.authSwitchPrompt.textContent = isSignup ? 'Already have an account?' : 'New student?';
  setAuthMessage('');
}

function showAuthenticatedApp(user) {
  const metadata = user.user_metadata || {};
  const accountId = metadata.student_id || user.email || 'Student';
  const isTeacher = user.app_metadata?.role === 'teacher' || metadata.role === 'teacher';
  const role = isTeacher ? 'Teacher' : 'Student';

  state.user = {
    id: user.id,
    accountId,
    fullName: metadata.full_name || metadata.name || '',
    studentId: metadata.student_id || '',
    userMetadata: metadata,
    role: role.toLowerCase(),
    email: user.email
  };
  const displayName = state.user.fullName || accountId;
  el.welcomeName.textContent = displayName;
  el.userNameTop.textContent = displayName;
  el.userRoleTop.textContent = `${role} account`;
  el.userAvatar.textContent = displayName.slice(0, 2).toUpperCase();
  el.profileFullName.value = state.user.fullName;
  el.profileStudentId.value = state.user.studentId;
  el.profileEmail.textContent = state.user.email;
  el.loginRole.value = state.user.role;
  el.teacherToolsNav?.classList.toggle('hidden', !isTeacher);
  if (el.postCourse) {
    el.postCourse.innerHTML = '<option value="">All courses</option>' +
      state.courses.map(course =>
        `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`
      ).join('');
  }
  el.loginScreen.classList.add('hidden');
  el.app.classList.remove('hidden');

  renderDashboardDate();
  renderStats();
  renderDashboardCourses();
  renderDeadlines();
  renderCourses();
  renderAssignments();
  renderGrades();
  renderNotifications();
  loadClassPosts();
  startClassPostNotifications();
  loadMySubmissions();
  showToast(`Welcome, ${displayName}!`);
}

function updatePostKindFields() {
  if (!el.postKind) return;

  const isActivity = el.postKind.value === 'activity';
  el.postCourseField?.classList.toggle('hidden', !isActivity);
  el.postDueDateField?.classList.toggle('hidden', !isActivity);
  if (el.postCourse) el.postCourse.required = false;
  if (el.postDueDate) {
    el.postDueDate.required = isActivity;
    el.postDueDate.min = getLocalDateInputValue();
  }
}

function renderTeacherPosts() {
  if (!el.teacherPostsList) return;

  if (!state.classPosts.length) {
    el.teacherPostsList.innerHTML = '<p class="muted">No class posts have been published yet.</p>';
    return;
  }
  el.teacherPostsList.innerHTML = state.classPosts.map(post => `
    <article class="teacher-post-item">
      <span class="course-tag">${post.kind === 'activity' ? 'Activity' : 'Announcement'}</span>
      <strong>${escapeHtml(post.title)}</strong>
      <p>${escapeHtml(post.content)}</p>
      <small class="muted">${escapeHtml(post.course_id ? getCourseName(post.course_id) : 'All courses')}${
    post.due_date ? ` · Due ${escapeHtml(formatDate(post.due_date))}` : ''
  } · ${escapeHtml(post.created_at ? formatDate(post.created_at) : 'Recently')}</small>
    </article>
  `).join('');
}

async function loadClassPosts() {
  try {
    const { data, error } = await supabaseClient
      .from('class_posts')
      .select('id, kind, title, content, course_id, due_date, author_id, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;

    if (state.user?.role === 'student') {
      const { data: readPosts, error: readError } = await supabaseClient
        .from('class_post_reads')
        .select('post_id')
        .eq('user_id', state.user.id);
      if (readError) throw readError;
      state.readClassPostIds = new Set(
        (readPosts || []).map(post => String(post.post_id))
      );
    }

    const postsById = new Map(state.classPosts.map(post => [String(post.id), post]));
    (data || []).forEach(post => postsById.set(String(post.id), post));
    state.classPosts = [...postsById.values()]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderAssignments(el.assignmentFilter.value);
    renderDeadlines();
    renderNotifications();
    renderTeacherPosts();
    updateAssignmentCount();
  } catch (error) {
    console.error('Unable to load class posts:', error);
    showToast(getClassPostErrorMessage(error));
  }
}

function startClassPostNotifications() {
  if (state.user?.role !== 'student') return;

  state.classPostsChannel = supabaseClient
    .channel(`class-posts-${state.user.id}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'class_posts' },
      ({ new: post }) => {
        if (!state.user || state.user.role !== 'student') return;
        if (state.classPosts.some(existing => String(existing.id) === String(post.id))) return;

        state.classPosts = [post, ...state.classPosts]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        renderAssignments(el.assignmentFilter.value);
        renderDeadlines();
        renderNotifications();
        updateAssignmentCount();
        showToast(`New ${post.kind === 'activity' ? 'activity' : 'announcement'}: ${post.title}`);
      }
    )
    .subscribe((status, error) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Live class-post notifications are unavailable:', error || status);
        showToast('Live notifications are unavailable. Refresh to check for new posts.');
      }
    });
}

function getClassPostErrorMessage(error) {
  if (error && error.code === 'PGRST205') {
    return 'Class posts or notification reads are not set up yet. Run supabase_setup.sql in the Supabase SQL Editor.';
  }
  return `Could not access class posts: ${error?.message || 'Please try again.'}`;
}

async function publishClassPost(event) {
  event.preventDefault();
  if (state.user?.role !== 'teacher') {
    setTeacherPostMessage('Only signed-in teachers can publish class posts.', 'error');
    return;
  }

  const kind = el.postKind.value;
  const title = el.postTitle.value.trim();
  const content = el.postContent.value.trim();
  const dueDate = kind === 'activity' ? el.postDueDate.value : '';
  if (!title || !content || (kind === 'activity' && !dueDate)) {
    setTeacherPostMessage('Complete the title, instructions, and activity due date.', 'error');
    return;
  }
  if (kind === 'activity' && dueDate < getLocalDateInputValue()) {
    el.postDueDate.min = getLocalDateInputValue();
    setTeacherPostMessage('Choose an activity due date that is today or later.', 'error');
    el.postDueDate.focus();
    return;
  }

  el.publishPostButton.disabled = true;
  setTeacherPostMessage('Publishing…');
  try {
    const { data, error } = await supabaseClient
      .from('class_posts')
      .insert({
        kind,
        title,
        content,
        course_id: kind === 'activity' ? (el.postCourse.value || null) : null,
        due_date: kind === 'activity' ? dueDate : null,
        author_id: state.user.id
      })
      .select('id, kind, title, content, course_id, due_date, author_id, created_at')
      .single();
    if (error) throw error;

    state.classPosts.unshift(data);
    renderAssignments(el.assignmentFilter.value);
    renderDeadlines();
    renderNotifications();
    renderTeacherPosts();
    updateAssignmentCount();
    el.teacherPostForm.reset();
    updatePostKindFields();
    setTeacherPostMessage('Your post has been published.', 'success');
  } catch (error) {
    console.error('Unable to publish class post:', error);
    setTeacherPostMessage(getClassPostErrorMessage(error), 'error');
  } finally {
    el.publishPostButton.disabled = false;
  }
}

function setTeacherPostMessage(message, type = '') {
  if (!el.teacherPostMessage) return;

  el.teacherPostMessage.textContent = message;
  el.teacherPostMessage.className = `auth-message${type ? ` ${type}` : ''}`;
}

function setAssignmentSubmissionMessage(message, type = '') {
  el.assignmentSubmissionMessage.textContent = message;
  el.assignmentSubmissionMessage.className =
    `auth-message${type ? ` ${type}` : ''}`;
}

function updateAssignmentFileList() {
  const files = Array.from(el.assignmentFiles.files || []);
  el.assignmentFileList.replaceChildren();
  const existingSubmission = state.submissions.find(
    submission => submission.assignment_id === el.assignmentDialog.dataset.id
  );
  el.assignmentAnswer.required =
    files.length === 0 && !existingSubmission?.attachments?.length;

  files.forEach(file => {
    const item = document.createElement('li');
    const size = file.size < 1024 * 1024
      ? `${Math.ceil(file.size / 1024)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    item.textContent = `${file.name} (${size})`;
    el.assignmentFileList.appendChild(item);
  });
}

function getAssignmentSubmissionErrorMessage(error) {
  if (error?.code === '42P01' || error?.code === 'PGRST205') {
    return 'Assignment submissions are not set up yet. Run supabase_setup.sql in the Supabase SQL Editor.';
  }
  return error?.message || 'Please try again.';
}

async function loadMySubmissions() {
  try {
    const { data, error } = await supabaseClient
      .from('assignment_submissions')
      .select('assignment_id, response, attachments, submitted_at')
      .eq('user_id', state.user.id);
    if (error) throw error;

    state.submissions = data || [];
    renderAssignments(el.assignmentFilter.value);
    renderDeadlines();
    updateAssignmentCount();
  } catch (error) {
    console.error('Unable to load assignment submissions:', error);
    showToast(
      `Could not load previous submissions: ${getAssignmentSubmissionErrorMessage(error)}`
    );
  }
}

async function submitAssignment(event) {
  event.preventDefault();
  const assignmentId = el.assignmentDialog.dataset.id;
  const assignment = getAssignments().find(item => item.id === assignmentId);
  if (!assignment) {
    setAssignmentSubmissionMessage('This assignment could not be found.', 'error');
    return;
  }

  const files = Array.from(el.assignmentFiles.files || []);
  const oversizedFile = files.find(file => file.size > MAX_ASSIGNMENT_FILE_SIZE);
  if (oversizedFile) {
    setAssignmentSubmissionMessage(
      `${oversizedFile.name} exceeds the 50 MB per-file limit.`,
      'error'
    );
    return;
  }

  const response = el.assignmentAnswer.value.trim();
  const previousSubmission = state.submissions.find(
    submission => submission.assignment_id === assignmentId
  );
  if (!response && !files.length && !previousSubmission?.attachments?.length) {
    setAssignmentSubmissionMessage('Enter your work or attach at least one file.', 'error');
    return;
  }

  el.submitAssignmentButton.disabled = true;
  setAssignmentSubmissionMessage(files.length ? 'Uploading your files…' : 'Submitting…');
  const uploadedPaths = [];
  try {
    const attachments = files.length
      ? []
      : previousSubmission?.attachments || [];

    for (const [index, file] of files.entries()) {
      const safeName = file.name.replace(/[\\/#?%]/g, '_');
      const path = `${state.user.id}/${encodeURIComponent(assignmentId)}/${crypto.randomUUID()}-${safeName}`;
      setAssignmentSubmissionMessage(`Uploading file ${index + 1} of ${files.length}…`);
      const { error } = await supabaseClient.storage
        .from(ASSIGNMENT_SUBMISSIONS_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type || 'application/octet-stream',
          upsert: false
        });
      if (error) throw error;

      uploadedPaths.push(path);
      attachments.push({
        path,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size
      });
    }

    const { data, error } = await supabaseClient
      .from('assignment_submissions')
      .upsert({
        user_id: state.user.id,
        assignment_id: assignmentId,
        response,
        attachments,
        submitted_at: new Date().toISOString()
      }, { onConflict: 'user_id,assignment_id' })
      .select('assignment_id, response, attachments, submitted_at')
      .single();
    if (error) throw error;

    const previousPaths = files.length
      ? (previousSubmission?.attachments || []).map(file => file.path).filter(Boolean)
      : [];
    state.submissions = [
      ...state.submissions.filter(item => item.assignment_id !== assignmentId),
      data
    ];
    renderAssignments(el.assignmentFilter.value);
    renderDeadlines();
    updateAssignmentCount();
    el.assignmentDialog.close();
    el.assignmentForm.reset();
    el.assignmentFileList.replaceChildren();
    showToast(`Submitted: ${assignment.title} ✅`);

    if (previousPaths.length) {
      try {
        const { error: cleanupError } = await supabaseClient.storage
          .from(ASSIGNMENT_SUBMISSIONS_BUCKET)
          .remove(previousPaths);
        if (cleanupError) throw cleanupError;
      } catch (cleanupError) {
        console.error('Unable to remove replaced submission files:', cleanupError);
        showToast('Submission saved, but replaced files could not be removed.');
      }
    }
  } catch (error) {
    let cleanupMessage = '';
    if (uploadedPaths.length) {
      try {
        const { error: cleanupError } = await supabaseClient.storage
          .from(ASSIGNMENT_SUBMISSIONS_BUCKET)
          .remove(uploadedPaths);
        if (cleanupError) throw cleanupError;
      } catch (cleanupError) {
        console.error('Unable to clean up incomplete submission uploads:', cleanupError);
        cleanupMessage = ' Some uploaded files may need cleanup.';
      }
    }
    console.error('Unable to submit assignment:', error);
    setAssignmentSubmissionMessage(
      `Could not submit your work: ${getAssignmentSubmissionErrorMessage(error)}${cleanupMessage}`,
      'error'
    );
  } finally {
    el.submitAssignmentButton.disabled = false;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = el.loginEmail.value.trim();
  const password = el.loginPassword.value;
  const expectedRole = el.loginRole.value;
  const studentId = el.loginStudentId.value.trim();
  if (authMode === 'signup' && !studentId) {
    setAuthMessage('Enter your student ID.', 'error');
    el.loginStudentId.focus();
    return;
  }

  el.authSubmit.disabled = true;
  el.authModeToggle.disabled = true;
  el.loginRole.disabled = true;
  setAuthMessage(authMode === 'signup' ? 'Creating your account…' : 'Signing in…');

  try {
    if (authMode === 'signup') {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            student_id: studentId
          }
        }
      });
      if (error) throw error;

      if (data.session) {
        showAuthenticatedApp(data.user);
      } else {
        setAuthMode('login');
        el.loginEmail.value = email;
        setAuthMessage(
          'Account created. Check your email for a confirmation link, then log in.',
          'success'
        );
      }
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    const actualRole = data.user.app_metadata?.role === 'teacher' ? 'teacher' : 'student';
    if (actualRole !== expectedRole) {
      const { error: signOutError } = await supabaseClient.auth.signOut();
      if (signOutError) throw signOutError;
      throw new Error(`This account is not registered as a ${expectedRole}.`);
    }
    showAuthenticatedApp(data.user);
  } catch (error) {
    setAuthMessage(error.message || 'Authentication failed. Please try again.', 'error');
  } finally {
    el.authSubmit.disabled = false;
    el.authModeToggle.disabled = false;
    el.loginRole.disabled = false;
  }
}

function setAccountMessage(element, message, type = '') {
  element.textContent = message;
  element.className = `auth-message${type ? ` ${type}` : ''}`;
}

async function handleProfileSave(e) {
  e.preventDefault();
  if (!state.user) return;

  const fullName = el.profileFullName.value.trim();
  const studentId = el.profileStudentId.value.trim();
  if (!fullName || (state.user.role === 'student' && !studentId)) {
    setAccountMessage(el.profileMessage, 'Complete the required profile fields.', 'error');
    return;
  }

  const metadata = { ...state.user.userMetadata, full_name: fullName };
  if (state.user.role === 'student') metadata.student_id = studentId;

  el.saveProfileButton.disabled = true;
  setAccountMessage(el.profileMessage, 'Saving your profile…');
  try {
    const { data, error } = await supabaseClient.auth.updateUser({ data: metadata });
    if (error) throw error;

    state.user.userMetadata = data.user.user_metadata || metadata;
    state.user.fullName = fullName;
    if (state.user.role === 'student') {
      state.user.studentId = studentId;
      state.user.accountId = studentId;
    }
    const displayName = fullName || state.user.accountId;
    el.welcomeName.textContent = displayName;
    el.userNameTop.textContent = displayName;
    el.userAvatar.textContent = displayName.slice(0, 2).toUpperCase();
    setAccountMessage(el.profileMessage, 'Your profile has been saved.', 'success');
    showToast('Profile updated.');
  } catch (error) {
    setAccountMessage(
      el.profileMessage,
      `Could not save your profile: ${error.message || 'Please try again.'}`,
      'error'
    );
  } finally {
    el.saveProfileButton.disabled = false;
  }
}

async function handleSettingsSave(e) {
  e.preventDefault();
  if (!state.user) return;

  const email = el.settingsEmail.value.trim();
  const password = el.settingsPassword.value;
  const passwordConfirm = el.settingsPasswordConfirm.value;
  if (password && password !== passwordConfirm) {
    setAccountMessage(el.settingsMessage, 'Your passwords do not match.', 'error');
    el.settingsPasswordConfirm.focus();
    return;
  }
  if (!password && passwordConfirm) {
    setAccountMessage(el.settingsMessage, 'Enter a new password to confirm.', 'error');
    el.settingsPassword.focus();
    return;
  }

  const updates = {};
  if (email !== state.user.email) updates.email = email;
  if (password) updates.password = password;
  if (!Object.keys(updates).length) {
    setAccountMessage(el.settingsMessage, 'There are no settings changes to save.', 'error');
    return;
  }

  el.saveSettingsButton.disabled = true;
  setAccountMessage(el.settingsMessage, 'Saving your settings…');
  try {
    const { data, error } = await supabaseClient.auth.updateUser(updates);
    if (error) throw error;

    state.user.email = data.user.email || state.user.email;
    el.profileEmail.textContent = state.user.email;
    el.settingsEmail.value = state.user.email;
    el.settingsPassword.value = '';
    el.settingsPasswordConfirm.value = '';
    const message = updates.email && updates.password
      ? 'Check your new email address to confirm the change. Your password has also been updated.'
      : updates.email
        ? 'Check your new email address to confirm the change.'
        : 'Your password has been updated.';
    setAccountMessage(el.settingsMessage, message, 'success');
  } catch (error) {
    setAccountMessage(
      el.settingsMessage,
      `Could not save your settings: ${error.message || 'Please try again.'}`,
      'error'
    );
  } finally {
    el.saveSettingsButton.disabled = false;
  }
}

async function handleLogout() {
  closeAccountMenu();
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  } catch (error) {
    showToast(`Could not log out: ${error.message || 'Please try again.'}`);
    return;
  }
  state.user = null;
  state.classPosts = [];
  state.readClassPostIds = new Set();
  state.submissions = [];
  const classPostsChannel = state.classPostsChannel;
  state.classPostsChannel = null;
  if (classPostsChannel) {
    try {
      await supabaseClient.removeChannel(classPostsChannel);
    } catch (error) {
      console.error('Unable to stop live class-post notifications:', error);
    }
  }
  el.teacherToolsNav?.classList.add('hidden');
  el.loginScreen.classList.remove('hidden');
  el.app.classList.add('hidden');
  showView('dashboard');
  el.loginForm.reset();
  el.loginRole.value = 'student';
  setAuthMode('login');
}

// === EVENT BINDINGS ===
el.loginForm.addEventListener('submit', handleLogin);
el.authModeToggle.addEventListener('click', () => {
  setAuthMode(authMode === 'login' ? 'signup' : 'login');
});
el.loginRole.addEventListener('change', () => setAuthMode('login'));
el.postKind?.addEventListener('change', updatePostKindFields);
el.postDueDate?.addEventListener('focus', () => {
  el.postDueDate.min = getLocalDateInputValue();
});
el.teacherPostForm?.addEventListener('submit', publishClassPost);
el.logoutBtn.addEventListener('click', handleLogout);
el.accountLogoutBtn.addEventListener('click', handleLogout);
el.accountMenuToggle.addEventListener('click', () => {
  const isExpanded = el.accountMenuToggle.getAttribute('aria-expanded') === 'true';
  el.accountMenu.classList.toggle('hidden', isExpanded);
  el.accountMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
});
document.addEventListener('click', event => {
  if (!el.accountMenu.contains(event.target) &&
      !el.accountMenuToggle.contains(event.target)) {
    closeAccountMenu();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAccountMenu();
});
el.profileForm.addEventListener('submit', handleProfileSave);
el.settingsForm.addEventListener('submit', handleSettingsSave);
el.mobileMenu.addEventListener('click', () => el.sidebar.classList.toggle('open'));
el.backToCourses.addEventListener('click', () => showView('courses'));

document.querySelectorAll('[data-view]').forEach(btn => {
  if (btn.dataset.view) {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  }
});

el.courseSearch.addEventListener('input', (e) => renderCourses(e.target.value));
el.assignmentFilter.addEventListener('change', (e) => renderAssignments(e.target.value));
updatePostKindFields();

el.markAllRead.addEventListener('click', async () => {
  const unreadPosts = state.user?.role === 'student'
    ? state.classPosts.filter(post => !state.readClassPostIds.has(String(post.id)))
    : [];
  if (unreadPosts.length) {
    const readRecords = unreadPosts.map(post => ({
      user_id: state.user.id,
      post_id: post.id
    }));
    const { error } = await supabaseClient
      .from('class_post_reads')
      .upsert(readRecords, {
        onConflict: 'user_id,post_id',
        ignoreDuplicates: true
      });
    if (error) {
      console.error('Unable to save notification read status:', error);
      showToast(`Could not mark teacher posts as read: ${error.message}`);
      return;
    }
    unreadPosts.forEach(post => state.readClassPostIds.add(String(post.id)));
  }

  state.notifications.forEach(n => n.read = true);
  renderNotifications();
  showToast('All marked as read ✓');
});

el.closeAssignmentDialog.addEventListener('click', () => el.assignmentDialog.close());
el.cancelAssignment.addEventListener('click', () => el.assignmentDialog.close());
el.assignmentFiles.addEventListener('change', updateAssignmentFileList);
el.assignmentForm.addEventListener('submit', submitAssignment);

el.openAiFromBanner.addEventListener('click', toggleAi);
el.sidebarAskAi.addEventListener('click', toggleAi);
el.closeAi.addEventListener('click', toggleAi);
initializeAiCourseFilter();
el.aiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = el.aiInput.value.trim();
  if (!text) return;
  addAiMessage(text, 'user');
  el.aiInput.value = '';
  handleAiResponse(text);
});
el.quickPrompts.forEach(btn => {
  btn.addEventListener('click', () => {
    addAiMessage(btn.dataset.prompt, 'user');
    handleAiResponse(btn.dataset.prompt);
  });
});

// === INIT ===
renderDashboardDate();
setAuthMode('login');
async function restoreSession() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (data.session) showAuthenticatedApp(data.session.user);
  } catch (error) {
    setAuthMessage(
      `Could not restore your session: ${error.message || 'Please try again.'}`,
      'error'
    );
  }
}
state.courses.forEach(course => {
  const option = document.createElement('option');
  option.value = course.id;
  option.textContent = course.name;
  el.postCourse?.appendChild(option);
});
updatePostKindFields();
restoreSession();
// === ADMIN DASHBOARD + MODULE MANAGEMENT ===
// The checks below only hide things. Real protection is the row-level rules in setup.sql.
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

async function loadCourseModules(courseId) {
  const box = document.getElementById('courseModules');
  const { data, error } = await supabaseClient.from('modules')
    .select('title, content').eq('course_id', courseId).order('created_at');
  if (error) { box.textContent = 'Could not load modules.'; return; }
  box.innerHTML = data.length ? data.map(m => `
    <div class="module-item" style="background:white; border-radius:8px; border:none; box-shadow:var(--shadow);">
      <div><strong>${esc(m.title)}</strong><p class="muted">${esc(m.content)}</p></div>
    </div>`).join('') : 'No modules yet.';
}

async function loadAdmin() {
  if (!state.user?.isStaff) return;
  const countOf = (table, filter) => {
    const q = supabaseClient.from(table).select('*', { count: 'exact', head: true });
    return filter ? filter(q) : q;
  };
  const [stu, mod, sub, rows] = await Promise.all([
    countOf('profiles', q => q.eq('role', 'student')),
    countOf('modules'),
    countOf('submissions'),
    supabaseClient.from('submissions').select('assignment_id')
  ]);
  document.getElementById('adminStudents').textContent = stu.count ?? '–';
  document.getElementById('adminModuleCount').textContent = mod.count ?? '–';
  document.getElementById('adminSubmissions').textContent = sub.count ?? '–';

  const per = {};
  (rows.data || []).forEach(r => { per[r.assignment_id] = (per[r.assignment_id] || 0) + 1; });
  document.getElementById('adminSubmissionStats').innerHTML = state.assignments.map(a => {
    const n = per[a.id] || 0;
    const pct = stu.count ? Math.min(100, Math.round(n / stu.count * 100)) : 0;
    return `<div class="deadline-item"><strong>${esc(a.title)}</strong>
      <p class="muted">${n} of ${stu.count ?? 0} students (${pct}%)</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
  }).join('');

  const select = document.getElementById('moduleCourse');
  if (!select.options.length) {
    select.innerHTML = state.courses.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  }
  loadAdminModules();
}

async function loadAdminModules() {
  const list = document.getElementById('adminModules');
  const { data, error } = await supabaseClient.from('modules')
    .select('*').order('created_at', { ascending: false });
  if (error) { list.textContent = error.message; return; }
  const byId = Object.fromEntries(data.map(m => [m.id, m]));
  list.innerHTML = data.map(m => `
    <div class="module-item">
      <div><strong>${esc(m.title)}</strong><p class="muted">${esc(getCourseName(m.course_id))}</p></div>
      <span class="module-actions">
        <button class="text-button" data-edit="${m.id}">Edit</button>
        <button class="text-button" data-del="${m.id}">Delete</button>
      </span>
    </div>`).join('') || '<p class="muted">No modules yet.</p>';

  list.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => {
    const title = prompt('Module title', byId[b.dataset.edit].title);
    if (!title || !title.trim()) return;
    const { error } = await supabaseClient.from('modules')
      .update({ title: title.trim() }).eq('id', b.dataset.edit);
    if (error) { showToast(error.message); return; }
    loadAdminModules();
  }));
  list.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Delete this module?')) return;
    const { error } = await supabaseClient.from('modules').delete().eq('id', b.dataset.del);
    if (error) { showToast(error.message); return; }
    showToast('Module deleted');
    loadAdmin();
  }));
}

document.getElementById('moduleForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.from('modules').insert({
    course_id: document.getElementById('moduleCourse').value,
    title: document.getElementById('moduleTitle').value.trim(),
    content: document.getElementById('moduleContent').value.trim()
  });
  if (error) { showToast(`Could not add module: ${error.message}`); return; }
  e.target.reset();
  showToast('Module added');
  loadAdmin();
});
