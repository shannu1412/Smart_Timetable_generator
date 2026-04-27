let exams = JSON.parse(localStorage.getItem("exams")) || [];

// LOAD
window.onload = displayExams;

// ADD EXAM
function addExam() {
  let subject = document.getElementById("subject").value.trim();
  let date = document.getElementById("date").value;
  let time = document.getElementById("time").value;
  let room = document.getElementById("room").value;

  if (!subject || !date || !time) {
    alert("Fill all required fields!");
    return;
  }

  exams.push({ subject, date, time, room });

  saveExams();
  displayExams();

  // clear form
  document.getElementById("subject").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("room").value = "";
}

// DISPLAY
function displayExams() {
  let tbody = document.querySelector("#examTable tbody");
  tbody.innerHTML = "";

  exams.forEach((e, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${e.subject}</td>
        <td>${e.date}</td>
        <td>${e.time}</td>
        <td>${e.room || "-"}</td>
        <td>
          <button onclick="editExam(${i})">✏️</button>
          <button onclick="deleteExam(${i})">🗑</button>
        </td>
      </tr>
    `;
  });
}

// DELETE
function deleteExam(i) {
  exams.splice(i, 1);
  saveExams();
  displayExams();
}

// EDIT
function editExam(i) {
  let e = exams[i];

  document.getElementById("subject").value = e.subject;
  document.getElementById("date").value = e.date;
  document.getElementById("time").value = e.time;
  document.getElementById("room").value = e.room;

  exams.splice(i, 1);
  saveExams();
  displayExams();
}

// SAVE
function saveExams() {
  localStorage.setItem("exams", JSON.stringify(exams));
}

// EXPORT IMAGE
function saveAsImage() {
  let clone = document.getElementById("exportArea").cloneNode(true);

  let temp = document.createElement("div");
  temp.style.position = "fixed";
  temp.style.top = "-10000px";
  temp.appendChild(clone);
  document.body.appendChild(temp);

  html2canvas(clone).then(canvas => {
    let link = document.createElement("a");
    link.download = "ExamSchedule.png";
    link.href = canvas.toDataURL();
    link.click();
    document.body.removeChild(temp);
  });
}

// EXPORT PDF
function saveAsPDF() {
  let clone = document.getElementById("exportArea").cloneNode(true);

  let temp = document.createElement("div");
  temp.style.position = "fixed";
  temp.style.top = "-10000px";
  temp.appendChild(clone);
  document.body.appendChild(temp);

  html2canvas(clone).then(canvas => {
    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL(), "PNG", 10, 10, 190, 0);
    pdf.save("ExamSchedule.pdf");
    document.body.removeChild(temp);
  });
}

// EXPORT EXCEL
function saveAsExcel() {
  let data = "Subject,Date,Time,Room\n";

  exams.forEach(e => {
    data += `${e.subject},${e.date},${e.time},${e.room}\n`;
  });

  let blob = new Blob([data]);
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ExamSchedule.csv";
  link.click();
}

function goHome() {
  window.location.href = "index.html";
}