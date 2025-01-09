const API_BASE = "http://localhost:5000/api";
const API_BASE_URL = 'http://localhost:5000/api/tasks/';
const tokenKey = "authToken";

function showDashboard() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  // fetchTasks();
  // roleCheck();
}

function roleCheck() {
  const token = localStorage.getItem(tokenKey);
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role;

    document.getElementById("admin-features").style.display = "none";
    document.getElementById("manager-features").style.display = "none";
    document.getElementById("user-features").style.display = "none";

    if (userRole === "Admin") {
      document.getElementById("admin-features").style.display = "block";
    } else if (userRole === "Manager") {
      document.getElementById("manager-features").style.display = "block";
    } else if (userRole === "User") {
      document.getElementById("user-features").style.display = "block";
    }
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem(tokenKey);
    alert("Session expired. Please log in again.");
    document.getElementById("auth").style.display = "block";
    document.getElementById("dashboard").style.display = "none";
  }
}

async function fetchAndRenderTasks() {
  try {
      const response = await fetch(API_BASE_URL + "/my-tasks", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // If auth is required
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');

      const tasks = await response.json();
      renderTasks(tasks);
  } catch (error) {
      console.error(error.message);
      document.getElementById('tasks').innerHTML = '<p>Error loading tasks</p>';
  }
}

function renderTasks(tasks) {
  const tasksContainer = document.getElementById('tasks');
  tasksContainer.innerHTML = tasks
      .map(
          (task) => `
      <div class="task" id="task-${task._id}">
          <h3>${task.title}</h3>
          <p>${task.description}</p>
          <p>Priority: ${task.priority}</p>
          <p>Status: ${task.status}</p>
          <p>Due Date: ${task.dueDate || 'N/A'}</p>
          <button onclick="deleteTask('${task._id}')">Delete</button>
      </div>
  `
      )
      .join('');
}

async function deleteTask(taskId) {
  try {
      const response = await fetch(`${API_BASE_URL}/${taskId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error('Failed to delete task');

      alert('Task deleted successfully');
      fetchAndRenderTasks(); // Re-fetch tasks after deletion
  } catch (error) {
      console.error(error.message);
  }
}
async function addTask() {
  const newTask = {
      title: `New Task ${Date.now()}`,
      description: 'Description for the new task',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(),
  };

  try {
      const response = await fetch(API_BASE_URL +"/client", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error('Failed to add task');

      alert('Task added successfully');
      fetchAndRenderTasks(); 
  } catch (error) {
      console.error(error.message);
  }
}


// event listeners
document.getElementById("show-register").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("auth").style.display = "none";
  document.getElementById("registration-panel").style.display = "block";
});

document.getElementById("show-login").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("registration-panel").style.display = "none";
  document.getElementById("auth").style.display = "block";
  document.getElementById("registration-form").reset();
  document.getElementById("login-form").reset();
  document.getElementById("login-username").focus();

});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem(tokenKey, data.token); // Store token
      alert("Login successful!");
      showDashboard();
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
});

document
  .getElementById("registration-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("role").value;

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! You can now log in.");
        document.getElementById("registration-panel").style.display = "none";
        document.getElementById("auth").style.display = "block";
        document.getElementById("registration-form").reset();
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("An error occurred. Please check your connection and try again.");
    }
  });

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("auth").style.display = "block";
});

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem(tokenKey);
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 > Date.now()) {
        showDashboard(); 
      } else {
        localStorage.removeItem(tokenKey); 
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem(tokenKey); 
    }
  }
});

// document.getElementById('add-task-btn').addEventListener('click', addTask);


document.addEventListener("DOMContentLoaded", () => {
  const tasksContainer = document.getElementById("tasks");
  const showTaskFormBtn = document.getElementById("show-task-form-btn");
  const taskForm = document.getElementById("task-form");
  const addTaskForm = document.getElementById("add-task-form");

  // Show the task form
  showTaskFormBtn.addEventListener("click", () => {
    taskForm.style.display = taskForm.style.display === "none" ? "block" : "none";
  });

  // Add a new task
  addTaskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const status = document.getElementById("status").value;
    const dueDate = document.getElementById("dueDate").value;

    const task = {
      id: Date.now(),
      title,
      description,
      priority,
      status,
      dueDate,
    };

    addTaskToDOM(task);
    addTaskForm.reset();
    taskForm.style.display = "none";
  });

  // Function to add a task to the DOM
  function addTaskToDOM(task) {
    const taskCard = document.createElement("div");
    taskCard.className = "task";
    taskCard.dataset.id = task.id;
    taskCard.innerHTML = `
      <h3>${task.title}</h3>
      <p><strong>Description:</strong> ${task.description}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Status:</strong> ${task.status}</p>
      <p><strong>Due Date:</strong> ${task.dueDate || "N/A"}</p>
      <button class="btn btn-delete">Delete Task</button>
    `;

    const deleteButton = taskCard.querySelector(".btn-delete");
    deleteButton.addEventListener("click", () => deleteTask(taskCard));

    tasksContainer.appendChild(taskCard);
  }
  function deleteTask(taskElement) {
    tasksContainer.removeChild(taskElement);
  }
});


fetchAndRenderTasks();