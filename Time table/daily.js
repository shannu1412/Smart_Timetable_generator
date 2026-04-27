// ==========================
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// INIT
window.onload = function () {
  document.getElementById("todayDate").innerText =
    new Date().toDateString();

  displayTasks();

  if ("Notification" in window) {
    Notification.requestPermission();
  }
};

// ADD TASK
function addTask() {
  let text = document.getElementById("taskInput").value.trim();
  let time = document.getElementById("taskTime").value;
  let priority = document.getElementById("taskPriority").value;

  if (!text) return alert("Enter task!");

  tasks.push({
    text,
    time,
    priority,
    done: false,
    notified: false,
    date: new Date().toISOString().split("T")[0]
  });

  saveTasks();
  displayTasks();

  document.getElementById("taskInput").value = "";
  document.getElementById("taskTime").value = "";
}

// DISPLAY + EDIT UI
function displayTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((t, i) => {
    list.innerHTML += `
      <li class="task-item ${t.priority} ${t.done ? "done" : ""}">

        <div id="view-${i}">
          <span onclick="toggleTask(${i})">
            ${t.text} ${t.time ? `(${t.time})` : ""}
          </span>
        </div>

        <div id="edit-${i}" style="display:none;">
          <input type="text" id="editText-${i}" value="${t.text}">
          <input type="time" id="editTime-${i}" value="${t.time || ""}">
          <select id="editPriority-${i}">
            <option value="low" ${t.priority=="low"?"selected":""}>Low</option>
            <option value="medium" ${t.priority=="medium"?"selected":""}>Medium</option>
            <option value="high" ${t.priority=="high"?"selected":""}>High</option>
          </select>
        </div>

        <div>
          <button onclick="toggleTask(${i})">✔</button>
          <button onclick="editTask(${i})">✏️</button>
          <button onclick="deleteTask(${i})">🗑</button>
        </div>

      </li>
    `;
  });
}

// EDIT
function editTask(i) {
  let view = document.getElementById(`view-${i}`);
  let edit = document.getElementById(`edit-${i}`);

  if (edit.style.display === "none") {
    view.style.display = "none";
    edit.style.display = "block";
  } else {
    saveEdit(i);
  }
}

function saveEdit(i) {
  let text = document.getElementById(`editText-${i}`).value.trim();
  let time = document.getElementById(`editTime-${i}`).value;
  let priority = document.getElementById(`editPriority-${i}`).value;

  if (!text) return alert("Task cannot be empty!");

  tasks[i].text = text;
  tasks[i].time = time;
  tasks[i].priority = priority;
  tasks[i].notified = false;

  saveTasks();
  displayTasks();
}

// TOGGLE
function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  saveTasks();
  displayTasks();
}

// DELETE
function deleteTask(i) {
  tasks.splice(i, 1);
  saveTasks();
  displayTasks();
}

// SAVE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// REMINDER
setInterval(() => {
  let now = new Date().toTimeString().slice(0,5);

  tasks.forEach(t => {
    if (t.time === now && !t.notified) {
      new Notification("Reminder", { body: t.text });
      alert("⏰ " + t.text);
      t.notified = true;
    }
  });

  saveTasks();
}, 5000);

// CALENDAR
function loadByDate() {
  let d = document.getElementById("calendarDate").value;
  let list = document.getElementById("calendarTasks");

  list.innerHTML = "";

  tasks.filter(t => t.date === d).forEach(t => {
    list.innerHTML += `<li>${t.text} (${t.time})</li>`;
  });
}

// EXPORT (CLONE METHOD)
function saveAsImage() {
  let clone = document.getElementById("exportArea").cloneNode(true);

  let temp = document.createElement("div");
  temp.style.position = "fixed";
  temp.style.top = "-10000px";
  temp.appendChild(clone);
  document.body.appendChild(temp);

  html2canvas(clone, { scale: 2 }).then(canvas => {
    let link = document.createElement("a");
    link.download = "Tasks.png";
    link.href = canvas.toDataURL();
    link.click();
    document.body.removeChild(temp);
  });
}

function saveAsPDF() {
  let clone = document.getElementById("exportArea").cloneNode(true);

  let temp = document.createElement("div");
  temp.style.position = "fixed";
  temp.style.top = "-10000px";
  temp.appendChild(clone);
  document.body.appendChild(temp);

  html2canvas(clone, { scale: 2 }).then(canvas => {
    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL(), "PNG", 10, 10, 190, 0);
    pdf.save("Tasks.pdf");
    document.body.removeChild(temp);
  });
}

function saveAsExcel() {
  let data = "Task,Time,Priority,Status\n";
  tasks.forEach(t => {
    data += `${t.text},${t.time},${t.priority},${t.done?"Done":"Pending"}\n`;
  });

  let blob = new Blob([data]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Tasks.csv";
  link.click();
}

function goHome() {
  window.location.href = "index.html";
}