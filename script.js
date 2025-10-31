
// Application State
let tasks = [];
let currentFilters = {
    search: '',
    status: 'all',
    subject: 'all'
};

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskFormCard = document.getElementById('taskFormCard');
const taskForm = document.getElementById('taskForm');
const taskFormElement = document.getElementById('taskFormElement');
const cancelForm = document.getElementById('cancelForm');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const subjectFilter = document.getElementById('subjectFilter');
const resetFilters = document.getElementById('resetFilters');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');

// Stats elements
const totalTasks = document.getElementById('totalTasks');
const completedTasks = document.getElementById('completedTasks');
const dueTodayTasks = document.getElementById('dueTodayTasks');
const overdueTasks = document.getElementById('overdueTasks');

// Form elements
const taskTitle = document.getElementById('taskTitle');
const taskSubject = document.getElementById('taskSubject');
const taskDeadline = document.getElementById('taskDeadline');
const taskDescription = document.getElementById('taskDescription');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    loadTasks();
    setupEventListeners();
    updateStats();
    renderTasks();
    updateSubjectFilter();
});

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Local Storage Management
function saveTasks() {
    localStorage.setItem('eduTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('eduTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Event Listeners
function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    addTaskBtn.addEventListener('click', showTaskForm);
    cancelForm.addEventListener('click', hideTaskForm);
    taskFormElement.addEventListener('submit', handleTaskSubmit);
    
    searchInput.addEventListener('input', handleSearch);
    statusFilter.addEventListener('change', handleStatusFilter);
    subjectFilter.addEventListener('change', handleSubjectFilter);
    resetFilters.addEventListener('click', handleResetFilters);
}

// Task Form Management
function showTaskForm() {
    taskFormCard.classList.add('hidden');
    taskForm.classList.remove('hidden');
}

function hideTaskForm() {
    taskFormCard.classList.remove('hidden');
    taskForm.classList.add('hidden');
    resetForm();
}

function resetForm() {
    taskFormElement.reset();
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = taskTitle.value.trim();
    const subject = taskSubject.value || 'Other';
    const deadline = taskDeadline.value;
    const description = taskDescription.value.trim();
    
    if (!title || !deadline) return;
    
    const newTask = {
        id: generateId(),
        title,
        subject,
        deadline,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    updateStats();
    renderTasks();
    updateSubjectFilter();
    hideTaskForm();
}

// Task Management
function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        updateStats();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    updateStats();
    renderTasks();
    updateSubjectFilter();
}

// Filtering
function handleSearch(e) {
    currentFilters.search = e.target.value;
    renderTasks();
    updateResetButton();
}

function handleStatusFilter(e) {
    currentFilters.status = e.target.value;
    renderTasks();
    updateResetButton();
}

function handleSubjectFilter(e) {
    currentFilters.subject = e.target.value;
    renderTasks();
    updateResetButton();
}

function handleResetFilters() {
    currentFilters = { search: '', status: 'all', subject: 'all' };
    searchInput.value = '';
    statusFilter.value = 'all';
    subjectFilter.value = 'all';
    renderTasks();
    updateResetButton();
}

function updateResetButton() {
    const hasActiveFilters = currentFilters.search || 
                           currentFilters.status !== 'all' || 
                           currentFilters.subject !== 'all';
    
    resetFilters.classList.toggle('hidden', !hasActiveFilters);
}

// Rendering
function updateStats() {
    const now = new Date();
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const dueToday = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline.toDateString() === now.toDateString() && !task.completed;
    }).length;
    const overdue = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline < now && !task.completed;
    }).length;
    
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    dueTodayTasks.textContent = dueToday;
    overdueTasks.textContent = overdue;
}

function updateSubjectFilter() {
    const subjects = [...new Set(tasks.map(task => task.subject))].sort();
    const currentValue = subjectFilter.value;
    
    // Clear current options except "All Subjects"
    subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    
    // Add subject options
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
    
    // Restore selected value if it still exists
    if (subjects.includes(currentValue)) {
        subjectFilter.value = currentValue;
    }
}

function filterTasks() {
    return tasks.filter(task => {
        // Search filter
        const matchesSearch = !currentFilters.search || 
                            task.title.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                            task.description.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
                            task.subject.toLowerCase().includes(currentFilters.search.toLowerCase());
        
        // Status filter
        const now = new Date();
        const deadline = new Date(task.deadline);
        const isOverdue = deadline < now && !task.completed;
        const isDueToday = deadline.toDateString() === now.toDateString();
        
        const matchesStatus = currentFilters.status === 'all' ||
                            (currentFilters.status === 'completed' && task.completed) ||
                            (currentFilters.status === 'pending' && !task.completed) ||
                            (currentFilters.status === 'overdue' && isOverdue) ||
                            (currentFilters.status === 'due-today' && isDueToday && !task.completed);
        
        // Subject filter
        const matchesSubject = currentFilters.subject === 'all' || task.subject === currentFilters.subject;
        
        return matchesSearch && matchesStatus && matchesSubject;
    });
}

function sortTasks(filteredTasks) {
    return filteredTasks.sort((a, b) => {
        // Completed tasks go to bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        const now = new Date();
        const aDeadline = new Date(a.deadline);
        const bDeadline = new Date(b.deadline);
        const aIsOverdue = aDeadline < now && !a.completed;
        const bIsOverdue = bDeadline < now && !b.completed;
        const aIsDueToday = aDeadline.toDateString() === now.toDateString();
        const bIsDueToday = bDeadline.toDateString() === now.toDateString();
        
        // Overdue tasks first
        if (aIsOverdue !== bIsOverdue) {
            return aIsOverdue ? -1 : 1;
        }
        
        // Due today tasks next
        if (aIsDueToday !== bIsDueToday) {
            return aIsDueToday ? -1 : 1;
        }
        
        // Sort by deadline
        return aDeadline.getTime() - bDeadline.getTime();
    });
}

function renderTasks() {
    const filteredTasks = filterTasks();
    const sortedTasks = sortTasks(filteredTasks);
    
    if (sortedTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.remove('hidden');
        
        // Update empty state message
        const titleEl = document.getElementById('emptyStateTitle');
        const messageEl = document.getElementById('emptyStateMessage');
        
        if (tasks.length === 0) {
            titleEl.textContent = 'No tasks yet';
            messageEl.textContent = 'Add your first task to get started with organizing your assignments!';
        } else {
            titleEl.textContent = 'No tasks match your filters';
            messageEl.textContent = 'Try adjusting your search or filter criteria.';
        }
    } else {
        emptyState.classList.add('hidden');
        tasksList.innerHTML = sortedTasks.map(task => createTaskHTML(task)).join('');
        
        // Add event listeners to task elements
        sortedTasks.forEach(task => {
            const checkbox = document.getElementById(`checkbox-${task.id}`);
            const deleteBtn = document.getElementById(`delete-${task.id}`);
            
            if (checkbox) {
                checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteTask(task.id));
            }
        });
    }
}

function createTaskHTML(task) {
    const now = new Date();
    const deadline = new Date(task.deadline);
    const isOverdue = deadline < now && !task.completed;
    const isDueToday = deadline.toDateString() === now.toDateString();
    const timeUntilDeadline = deadline.getTime() - now.getTime();
    const daysUntilDeadline = Math.ceil(timeUntilDeadline / (1000 * 60 * 60 * 24));
    
    const status = getDeadlineStatus(task, isOverdue, isDueToday, daysUntilDeadline);
    const formattedDeadline = formatDeadline(task.deadline);
    
    return `
        <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue && !task.completed ? 'overdue' : ''}">
            <div class="task-content">
                <input 
                    type="checkbox" 
                    id="checkbox-${task.id}"
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                >
                
                <div class="task-details">
                    <div class="task-header">
                        <h4 class="task-title ${task.completed ? 'completed' : ''}">${escapeHtml(task.title)}</h4>
                        <button class="task-delete" id="delete-${task.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="m18 6-12 12"/>
                                <path d="m6 6 12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    ${task.description ? `
                        <p class="task-description ${task.completed ? 'completed' : ''}">${escapeHtml(task.description)}</p>
                    ` : ''}
                    
                    <div class="task-footer">
                        <div class="task-badges">
                            <span class="badge badge-outline">${escapeHtml(task.subject)}</span>
                            <span class="badge badge-${status.variant}">
                                ${status.icon ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${status.icon}</svg>` : ''}
                                ${status.text}
                            </span>
                        </div>
                        <span class="task-deadline">Due: ${formattedDeadline}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getDeadlineStatus(task, isOverdue, isDueToday, daysUntilDeadline) {
    if (task.completed) {
        return { text: 'Completed', variant: 'default', icon: null };
    }
    if (isOverdue) {
        return { 
            text: 'Overdue', 
            variant: 'destructive', 
            icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
        };
    }
    if (isDueToday) {
        return { 
            text: 'Due Today', 
            variant: 'destructive', 
            icon: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>'
        };
    }
    if (daysUntilDeadline === 1) {
        return { 
            text: 'Due Tomorrow', 
            variant: 'secondary', 
            icon: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>'
        };
    }
    if (daysUntilDeadline <= 7) {
        return { 
            text: `${daysUntilDeadline} days left`, 
            variant: 'secondary', 
            icon: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>'
        };
    }
    return { 
        text: `${daysUntilDeadline} days left`, 
        variant: 'outline', 
        icon: '<circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>'
    };
}

function formatDeadline(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Utility Functions
function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});
