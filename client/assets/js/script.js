const API_BASE = "http://localhost:5000/api";
const tokenKey = "authToken";

function showDashboard() {
  document.getElementById("auth").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  fetchTasks();
  roleCheck();
}

async function fetchTasks() {
  const token = localStorage.getItem(tokenKey);
  if (!token) {
    alert("Please log in to view tasks.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/tasks/my-tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch tasks.");

    const tasks = await response.json();
    renderTasks(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }
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

function renderTasks(tasks) {
  const taskList = document.getElementById("tasks");
  taskList.innerHTML = tasks
    .map(
      (task) =>
        `<div>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Priority: ${task.priority}</p>
                <p>Status: ${task.status}</p>
            </div>`
    )
    .join("");
}

function renderPosts(posts) {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <p><small>Posted by: ${post.author}</small></p>
        `;
    postsContainer.appendChild(postDiv);
  });
}


function showLoader() {
  const loader = document.querySelector(".loader");
  loader.style.display = "block";
}

function hideLoader() {
  const loader = document.querySelector(".loader");
  loader.style.display = "none";
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
    alert("An error occurred. Please try again.");
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
