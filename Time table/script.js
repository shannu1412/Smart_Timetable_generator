console.log("🔥 Timetable App Loaded");

// ==========================
// STORAGE
// ==========================
let subjects = [];

// ==========================
// ADD SUBJECT
// ==========================
function addSubject() {

  let name = document.getElementById("subjectName").value.trim();
  let teacher = document.getElementById("teacherName").value.trim();
  let day = document.getElementById("daySelect").value;
  let period = parseInt(document.getElementById("periodNumber").value);

  if (!name || !teacher || !period) {
    alert("⚠️ Fill all fields!");
    return;
  }

  subjects.push({ name, teacher, day, period });

  updateDropdown(); // ✅ ADD THIS

  clearForm();
  alert("✅ Subject Added");
}

// ==========================
// CLEAR FORM
// ==========================
function clearForm() {
  document.getElementById("subjectName").value = "";
  document.getElementById("teacherName").value = "";
  document.getElementById("periodNumber").value = "";
}

// ==========================
// GENERATE TIMETABLE
// ==========================
function generateTimetable() {

  let days = parseInt(document.getElementById("days").value);
  let periods = parseInt(document.getElementById("periods").value);
  let slots = document.getElementById("timeSlotsInput").value.split(",");

  if (!slots || slots.length === 0) {
    alert("⚠️ Enter time slots!");
    return;
  }

  let dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  let table = Array.from({ length: days }, () => Array(periods).fill(null));

  let facultyMap = {};

  // PLACE SUBJECTS
  subjects.forEach(sub => {

    let d = dayNames.indexOf(sub.day);
    let p = sub.period - 1;

    facultyMap[sub.name] = sub.teacher;

    // LAB MERGE (2 periods)
    if (sub.name.toLowerCase().includes("lab") && p < periods - 1) {

      table[d][p] = {
        text: `${sub.name}<br>${sub.teacher}`,
        span: 2
      };

      table[d][p + 1] = "SKIP";

    } else {
      table[d][p] = {
        text: `${sub.name}<br>${sub.teacher}`,
        span: 1
      };
    }
  });

  // COLLEGE HEADER
  let college = document.getElementById("collegeName").value;
  let address = document.getElementById("collegeAddress").value;
  let dept = document.getElementById("department").value;
  let section = document.getElementById("classSection").value;
  let room = document.getElementById("roomNo").value;

  let html = `
  <div class="timetable-box">

  <div class="college-header">
    <h2>${college}</h2>
    <p>${address}</p>
    <h3>${dept}</h3>
    <p>${section} | Room: ${room}</p>
  </div>

  <table>
  <tr>
    <th>DAY</th>
  `;

  slots.forEach(s => html += `<th>${s}</th>`);
  html += "</tr>";

  // TABLE ROWS
  for (let i = 0; i < days; i++) {

    html += `<tr><td class="day">${dayNames[i]}</td>`;

    for (let j = 0; j < periods; j++) {

      if (table[i][j] === "SKIP") continue;

      // LUNCH
      if (slots[j] && slots[j].trim().toUpperCase() === "LUNCH") {
        html += `<td class="lunch">LUNCH</td>`;
        continue;
      }

      let cell = table[i][j];

      if (cell) {
        html += `
        <td colspan="${cell.span}" 
            onclick="editCell(${i}, ${j})" 
            class="clickable">
          ${cell.text}
        </td>`;
      } else {
        html += `
        <td onclick="editCell(${i}, ${j})" class="clickable">
          -
        </td>`;
      }
    }

    html += "</tr>";
  }

  html += `</table>`;

  // FACULTY TABLE
  html += `
  <h3 class="faculty-title">FACULTY DETAILS</h3>
  <table class="faculty-table">
  <tr><th>Subject</th><th>Faculty</th></tr>
  `;

  for (let sub in facultyMap) {
    html += `<tr><td>${sub}</td><td>${facultyMap[sub]}</td></tr>`;
  }

  html += `</table></div>`;

  document.getElementById("output").innerHTML = html;
}

// ==========================
// EDIT / DELETE CELL
// ==========================
function editCell(dayIndex, periodIndex) {

  let dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  let subject = subjects.find(s =>
    dayNames.indexOf(s.day) === dayIndex &&
    (s.period - 1) === periodIndex
  );

  if (!subject) return;

  let choice = prompt("1 → Edit\n2 → Delete");

  if (choice === "1") {

    let newName = prompt("Subject Name:", subject.name);
    let newTeacher = prompt("Faculty Name:", subject.teacher);

    if (newName) subject.name = newName;
    if (newTeacher) subject.teacher = newTeacher;

  } else if (choice === "2") {

    subjects = subjects.filter(s => s !== subject);

  }

  generateTimetable();
}

// ==========================
// EXPORT
// ==========================
function saveAsPDF() {

  let element = document.getElementById("output");

  html2canvas(element).then(canvas => {
    let img = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;

    let pdf = new jsPDF();
    pdf.addImage(img, "PNG", 10, 10, 180, 0);
    pdf.save("timetable.pdf");
  });
}

function saveAsImage() {

  html2canvas(document.getElementById("output")).then(canvas => {
    let link = document.createElement("a");
    link.download = "timetable.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}

function saveAsExcel() {

  let table = document.querySelector("table");

  if (!table) {
    alert("Generate timetable first!");
    return;
  }

  let html = table.outerHTML;

  let link = document.createElement("a");
  link.href = "data:application/vnd.ms-excel," + html;
  link.download = "timetable.xls";
  link.click();
}

// ==========================
// CLEAR
// ==========================
function clearTimetable() {

  if (!confirm("Clear everything?")) return;

  subjects = [];

  document.getElementById("output").innerHTML = "";

  document.querySelectorAll("input").forEach(i => i.value = "");
}

// ==========================
function goHome() {
  window.location.href = "index.html";
}

// ==========================
// UPDATE DROPDOWN
// ==========================
function updateDropdown() {

  let dropdown = document.getElementById("subjectDropdown");
  dropdown.innerHTML = '<option value="">Select Subject</option>';

  subjects.forEach((sub, index) => {
    dropdown.innerHTML += `<option value="${index}">
      ${sub.name} (${sub.day} - P${sub.period})
    </option>`;
  });
}

function editSelected() {

  let index = document.getElementById("subjectDropdown").value;

  if (index === "") {
    alert("Select a subject first!");
    return;
  }

  let sub = subjects[index];

  let newName = prompt("Edit Subject Name:", sub.name);
  let newTeacher = prompt("Edit Faculty:", sub.teacher);

  if (newName) sub.name = newName;
  if (newTeacher) sub.teacher = newTeacher;

  updateDropdown();
  generateTimetable();
}

function deleteSelected() {

  let index = document.getElementById("subjectDropdown").value;

  if (index === "") {
    alert("Select a subject first!");
    return;
  }

  if (!confirm("Delete this subject?")) return;

  subjects.splice(index, 1);

  updateDropdown();
  generateTimetable();
}