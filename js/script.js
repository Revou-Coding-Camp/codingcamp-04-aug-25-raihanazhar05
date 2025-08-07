// script.js

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const descInput = document.getElementById('desc-input');
const filterInput = document.getElementById('filter-input');
const todoList = document.getElementById('todo-list');
const sortBySelect = document.getElementById('sort-by');
const sortOrderSelect = document.getElementById('sort-order');
const darkToggle = document.getElementById('dark-toggle');

sortBySelect.addEventListener('change', sortAndRenderTasks);
sortOrderSelect.addEventListener('change', sortAndRenderTasks);

document.addEventListener('DOMContentLoaded', loadTasks);
todoForm.addEventListener('submit', addTask);
filterInput.addEventListener('input', filterTasks);
todoList.addEventListener('click', handleListClick);

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark-mode', isDark);
  darkToggle.checked = isDark;
});

darkToggle.addEventListener('change', () => {
  const isDark = darkToggle.checked;
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
});

// Load and display tasks
function loadTasks() {
  sortAndRenderTasks();
}

// Add task
function addTask(e) {
  e.preventDefault();

  const taskText = todoInput.value.trim();
  const taskDate = dateInput.value;
  const taskDesc = descInput.value.trim();

  if (taskText === '' || taskDate === '') {
    alert('Please enter both a task and a date.');
    return;
  }

  const completed = false;
  createTaskElement(taskText, taskDate, completed, taskDesc);
  saveTaskToStorage(taskText, taskDate, completed, taskDesc);
  todoForm.reset();
}

// Create task element
function createTaskElement(text, date, completed, desc = '') {
  const li = document.createElement('li');
  li.setAttribute('data-text', text);
  li.setAttribute('data-date', date);
  li.setAttribute('data-desc', desc);

  const taskContent = document.createElement('span');
  taskContent.className = 'task-text';
  taskContent.textContent = text;

  const dateSpan = document.createElement('span');
  dateSpan.className = 'task-date';
  dateSpan.textContent = formatDate(date);

  const statusSpan = document.createElement('span');
  statusSpan.className = 'task-status';
  const statusText = completed ? 'Completed' : 'Ongoing';
  statusSpan.textContent = statusText;
  statusSpan.classList.add(completed ? 'completed' : 'ongoing');

  const descSpan = document.createElement('div');
  descSpan.className = 'task-desc';
  descSpan.textContent = desc;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-btn';
  toggleBtn.textContent = completed ? 'Mark as Ongoing' : 'Mark as Completed';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.textContent = 'Edit';

  li.appendChild(taskContent);
  li.appendChild(dateSpan);
  li.appendChild(statusSpan);
  if (desc) li.appendChild(descSpan); // only show if exists
  li.appendChild(toggleBtn);
  li.appendChild(deleteBtn);
  li.appendChild(editBtn);

  todoList.appendChild(li);
}

// Handle clicks in the list (delete, toggle, edit)
function handleListClick(e) {
  const li = e.target.closest('li');
  if (!li) return;

  const taskText = li.getAttribute('data-text');
  const taskDate = li.getAttribute('data-date');

  const tasks = getTasksFromStorage();
  const taskIndex = tasks.findIndex(t => t.text === taskText && t.date === taskDate);
  const task = tasks[taskIndex];

  if (!task) return;

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Delete this task?')) {
      todoList.removeChild(li);
      deleteTaskFromStorage(taskText, taskDate);
    }
  }

  if (e.target.classList.contains('toggle-btn')) {
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const statusSpan = li.querySelector('.task-status');
    statusSpan.textContent = task.completed ? 'Completed' : 'Ongoing';
    statusSpan.classList.toggle('completed', task.completed);
    statusSpan.classList.toggle('ongoing', !task.completed);
    e.target.textContent = task.completed ? 'Mark as Ongoing' : 'Mark as Completed';
  }

  if (e.target.classList.contains('edit-btn')) {
    const newText = prompt('Edit task name:', task.text);
    const newDate = prompt('Edit date (YYYY-MM-DD):', task.date);
    const newDesc = prompt('Edit description (optional):', task.desc || '');

    if (newText && newDate) {
      tasks[taskIndex].text = newText.trim();
      tasks[taskIndex].date = newDate;
      tasks[taskIndex].desc = newDesc.trim();
      localStorage.setItem('tasks', JSON.stringify(tasks));
      sortAndRenderTasks();
    }
  }
}

// Filter tasks
function filterTasks(e) {
  const search = e.target.value.toLowerCase();
  document.querySelectorAll('#todo-list li').forEach(item => {
    const text = item.querySelector('.task-text').textContent.toLowerCase();
    item.style.display = text.includes(search) ? '' : 'none';
  });
}

// Storage functions
function saveTaskToStorage(text, date, completed, desc = '') {
  const tasks = getTasksFromStorage();
  tasks.push({ text, date, completed, desc });
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTaskFromStorage(text, date) {
  let tasks = getTasksFromStorage();
  tasks = tasks.filter(task => !(task.text === text && task.date === date));
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
  return localStorage.getItem('tasks')
    ? JSON.parse(localStorage.getItem('tasks'))
    : [];
}

// Format date
function formatDate(dateStr) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function sortAndRenderTasks() {
  const sortBy = sortBySelect.value;
  const sortOrder = sortOrderSelect.value;
  const tasks = getTasksFromStorage();

  let sortedTasks = [...tasks];

  if (sortBy === 'date') {
    sortedTasks.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy === 'status') {
    sortedTasks.sort((a, b) => {
      const statusA = a.completed ? 1 : 0;
      const statusB = b.completed ? 1 : 0;
      return sortOrder === 'asc' ? statusA - statusB : statusB - statusA;
    });
  }

  todoList.innerHTML = '';
  sortedTasks.forEach(task =>
    createTaskElement(task.text, task.date, task.completed, task.desc)
  );
}
