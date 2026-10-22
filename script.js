const API_URL = "http://localhost:8080/api/students";

const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTableBody");
const messageBox = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

const idField = document.getElementById("studentId");
const rollField = document.getElementById("rollNumber");
const nameField = document.getElementById("name");
const branchField = document.getElementById("branch");
const emailField = document.getElementById("email");

let messageTimer;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => messageBox.classList.add("hidden"), 3500);
}

// VIEW ALL
async function loadStudents() {
  try {
    const res = await fetch(API_URL);
    const students = await res.json();
    renderTable(students);
  } catch (err) {
    showMessage("Cannot connect to the server. Is the backend running?", "error");
  }
}

function renderTable(students) {
  tableBody.innerHTML = "";

  if (students.length === 0) {
    const row = tableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = "No student records found.";
    cell.style.textAlign = "center";
    return;
  }

  students.forEach((s) => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = s.rollNumber;
    row.insertCell().textContent = s.name;
    row.insertCell().textContent = s.branch;
    row.insertCell().textContent = s.email;

    const actions = row.insertCell();

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => startEdit(s);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete";
    delBtn.onclick = () => deleteStudent(s.id);

    actions.append(editBtn, " ", delBtn);
  });
}

// ADD / EDIT (same form)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const student = {
    rollNumber: rollField.value.trim(),
    name: nameField.value.trim(),
    branch: branchField.value.trim(),
    email: emailField.value.trim(),
  };

  const id = idField.value;
  const isEdit = id !== "";

  try {
    const res = await fetch(isEdit ? `${API_URL}/${id}` : API_URL, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    const data = await res.json();

    if (res.ok) {
      showMessage(data.message, "success");
      resetForm();
      loadStudents();
    } else {
      showMessage(data.message || "Something went wrong", "error");
    }
  } catch (err) {
    showMessage("Cannot connect to the server.", "error");
  }
});

function startEdit(s) {
  idField.value = s.id;
  rollField.value = s.rollNumber;
  nameField.value = s.name;
  branchField.value = s.branch;
  emailField.value = s.email;
  submitBtn.textContent = "Update Student";
  cancelBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  form.reset();
  idField.value = "";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
}

cancelBtn.addEventListener("click", resetForm);

// DELETE
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    showMessage(data.message, res.ok ? "success" : "error");
    loadStudents();
  } catch (err) {
    showMessage("Cannot connect to the server.", "error");
  }
}

loadStudents();