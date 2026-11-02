//---------- 1. Connect to the database (Supabase) ----------
const SUPABASE_URL = 'https://jdyqyzfdmahqshqbiadx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xNXIvvcgLuqQQB1uCk6-Ig_4s2HlJv5';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
    { id: 'a1', title: 'Project Dream House', course: 'AUTOCAD', dueDate: '2026-10-19', status: 'pending', description: 'Build your Dream House using the Requirements in your module.' },
    { id: 'a2', title: 'SQL Query Practice', course: 'OLIMFBDS', dueDate: '2026-10-21', status: 'pending', description: 'Write 5 SELECT queries filtering and sorting data.' },
    { id: 'a3', title: 'Multidisciplinary Project Design', course: 'OLCOEPRO', dueDate: '2026-10-22', status: 'pending', description: '300-word essay about engineering.' },
    { id: 'a4', title: 'Data Management', course: 'OLMATH', dueDate: '2026-10-10', status: 'submitted', description: 'Survey 40 students about their Daily Allowancae.' }
  ],
  notifications: [
    { id: 'n1', message: 'New material posted in OLIMFBDS', time: '2 hours ago', read: false },
    { id: 'n2', message: 'Grade updated: OLMATH – 92%', time: '1 day ago', read: false },
    { id: 'n3', message: 'Class reminder: Database lecture tomorrow 9AM', time: '2 days ago', read: true }
  ],
  classPosts: [],
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
  welcomeName: document.getElementById('welcomeName'),
  logoutBtn: document.getElementById('logoutBtn'),
  views: {
    dashboard: document.getElementById('view-dashboard'),
    courses: document.getElementById('view-courses'),
    assignments: document.getElementById('view-assignments'),
    grades: document.getElementById('view-grades'),
    notifications: document.getElementById('view-notifications'),
    courseDetail: document.getElementById('view-course-detail')
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
  if (viewName === 'admin' && !state.user?.isStaff) return;
  Object.values(el.views).forEach(v => v.classList.add('hidden'));
  if (el.views) {
    Object.values(el.views).forEach(v => v?.classList.add('hidden'));
}
if (el.navItems) {
    el.navItems.forEach(n => n?.classList.remove('active'));
}
  el.views[viewName].classList.remove('hidden');
  el.navItems.forEach(n => n.classList.remove('active'));
  document.querySelectorAll(`[data-view="${viewName}"]`).forEach(n => n.classList.add('active'));
  el.pageCrumb.textContent = viewName === 'courseDetail' ? 'Course Details' :
    viewName.charAt(0).toUpperCase() + viewName.slice(1);
  state.activeView = viewName;
  if (viewName === 'admin') loadAdmin();
 if (window.innerWidth < 900 && el.sidebar) el.sidebar.classList.remove('open');
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
  const activities = state.classPosts
    .filter(post => post.kind === 'activity')
    .map(post => ({
      id: `post-${post.id}`,
      title: post.title,
      course: post.course_id || 'All courses',
      dueDate: post.due_date || new Date(post.created_at),
      status: post.status || 'pending',
      description: post.content
    }));
  return [...state.assignments, ...activities];
}

function formatDate(d) {
  const date = new Date(d);
  const opts = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', opts);
}

function getDaysRemaining(d) {
  const due = new Date(d);
  const now = new Date();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function updateNotificationBadge() {
  const unread = [...state.notifications, ...getAnnouncementNotifications()]
    .filter(n => !n.read).length;
  el.notificationDot.style.display = unread > 0 ? 'block' : 'none';
}

function getAnnouncementNotifications() {
  return state.classPosts
    .filter(post => post.kind === 'announcement')
    .map(post => ({
      id: `post-${post.id}`,
      message: `${post.title}: ${post.content}`,
      time: formatDate(post.created_at),
      read: Boolean(post.read)
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
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  el.dashboardDeadlines.innerHTML = upcoming.map(a => {
    const days = getDaysRemaining(a.dueDate);
    const cls = days <= 3 ? 'urgent' : 'normal';
    return `
      <div class="deadline-item ${cls}">
        <strong>${escapeHtml(a.title)}</strong>
          <p class="muted">${escapeHtml(getCourseName(a.course))} · Due ${formatDate(a.dueDate)} (${days} days left)</p>
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
  el.dialogTitle.textContent = a.title;
  el.dialogDescription.textContent = a.description;
  el.assignmentAnswer.value = '';
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
  const notifications = [...state.notifications, ...getAnnouncementNotifications()];
  el.notificationsList.innerHTML = notifications.map(n => `
    <div class="notification-item ${!n.read ? 'unread' : ''}" data-id="${n.id}">
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
  const role = metadata.role === 'teacher' ? 'Teacher' : 'Student';

  state.user = { accountId, role: role.toLowerCase(), email: user.email };
  el.welcomeName.textContent = accountId;
  el.userNameTop.textContent = accountId;
  el.userRoleTop.textContent = `${role} account`;
  el.userAvatar.textContent = accountId.slice(0, 2).toUpperCase();
  el.loginRole.value = state.user.role;
  el.teacherToolsNav.classList.toggle('hidden', !isTeacher);
  el.loginScreen.classList.add('hidden');
  el.app.classList.remove('hidden');

  renderStats();
  renderDashboardCourses();
  renderDeadlines();
  renderCourses();
  renderAssignments();
  renderGrades();
  renderNotifications();
  loadClassPosts();
  showToast(`Welcome, ${accountId}!`);
}

function updatePostKindFields() {
  const isActivity = el.postKind.value === 'activity';
  el.postCourseField.classList.toggle('hidden', !isActivity);
  el.postDueDateField.classList.toggle('hidden', !isActivity);
  el.postCourse.required = false;
  el.postDueDate.required = isActivity;
}

function renderTeacherPosts() {
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

    state.classPosts = data || [];
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

function getClassPostErrorMessage(error) {
  if (error && error.code === 'PGRST205') {
    return 'Class posts are not set up yet. Run supabase_setup.sql in the Supabase SQL Editor.';
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
  if (!title || !content || (kind === 'activity' && !el.postDueDate.value)) {
    setTeacherPostMessage('Complete the title, instructions, and activity due date.', 'error');
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
        due_date: kind === 'activity' ? el.postDueDate.value : null,
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
  el.teacherPostMessage.textContent = message;
  el.teacherPostMessage.className = `auth-message${type ? ` ${type}` : ''}`;
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

async function handleLogout() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  } catch (error) {
    showToast(`Could not log out: ${error.message || 'Please try again.'}`);
    return;
  }
  state.user = null;
  state.classPosts = [];
  el.teacherToolsNav.classList.add('hidden');
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
el.postKind.addEventListener('change', updatePostKindFields);
el.teacherPostForm.addEventListener('submit', publishClassPost);
el.logoutBtn.addEventListener('click', handleLogout);
el.mobileMenu.addEventListener('click', () => el.sidebar.classList.toggle('open'));
el.backToCourses.addEventListener('click', () => showView('courses'));

document.querySelectorAll('[data-view]').forEach(btn => {
  if (btn.dataset.view) {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  }
});

el.courseSearch.addEventListener('input', (e) => renderCourses(e.target.value));
el.assignmentFilter.addEventListener('change', (e) => renderAssignments(e.target.value));

el.markAllRead.addEventListener('click', () => {
  state.notifications.forEach(n => n.read = true);
  state.classPosts.forEach(post => {
    if (post.kind === 'announcement') post.read = true;
  });
  renderNotifications();
  showToast('All marked as read ✓');
});

el.closeAssignmentDialog.addEventListener('click', () => el.assignmentDialog.close());
el.cancelAssignment.addEventListener('click', () => el.assignmentDialog.close());
el.assignmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = el.assignmentDialog.dataset.id;
  const a = state.assignments.find(x => x.id === id);
  if (a) {
    a.status = 'submitted';
    renderAssignments(el.assignmentFilter.value);
    renderDeadlines();
    updateAssignmentCount();
    showToast(`Submitted: ${item.title} ✅`);
  }
  el.assignmentDialog.close();
});

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
  el.postCourse.appendChild(option);
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

document.getElementById('moduleForm').addEventListener('submit', async (e) => {
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
