document.addEventListener("DOMContentLoaded", function () {
    fetchEmployees();
    setupEventListeners();
    setupRealtimeValidation();
});

let employees = [];
let editMode = false;
let editEmployeeId = null;
let deleteEmployeeId = null;

// ---------------- Event Listeners ----------------
function setupEventListeners() {
    const employeeForm = document.getElementById("employeeForm");
    employeeForm.addEventListener("submit", function (e) {
        e.preventDefault();
        saveEmployee();
    });

    // Search functionality
    const searchInput = document.getElementById("searchEmployees");
    if (searchInput) {
        searchInput.addEventListener("input", filterEmployees);
    }

    // Sort functionality
    const sortBy = document.getElementById("sortBy");
    if (sortBy) {
        sortBy.addEventListener("change", filterEmployees);
    }
}

// ---------------- Real-time Validation ----------------
function setupRealtimeValidation() {
    const empId = document.getElementById("empId");
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const cnic = document.getElementById("cnic");
    const emergency = document.getElementById("emergency");
    const salary = document.getElementById("salary");

    if (empId) {
        empId.addEventListener("input", () => {
            showFieldError(empId, empId.value.trim() === "" ? "Employee ID is required" : "");
        });
    }

    if (name) {
        name.addEventListener("input", () => {
            showFieldError(name, name.value.trim() === "" ? "Name is required" : "");
        });
    }

    if (email) {
        email.addEventListener("input", () => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            showFieldError(email, !regex.test(email.value.trim()) ? "Invalid email format" : "");
        });
    }

    if (phone) {
        phone.addEventListener("input", () => {
            showFieldError(phone, !/^\d{11}$/.test(phone.value.replace(/[-\s]/g, '')) ? "Phone must be 11 digits" : "");
        });
    }

    if (cnic) {
        cnic.addEventListener("input", () => {
            showFieldError(cnic, !/^\d{5}-\d{7}-\d{1}$/.test(cnic.value) ? "Format: 12345-1234567-1" : "");
        });
    }

    if (emergency) {
        emergency.addEventListener("input", () => {
            showFieldError(emergency, emergency.value.trim() === "" ? "Emergency contact is required" : "");
        });
    }

    if (salary) {
        salary.addEventListener("input", () => {
            showFieldError(salary, salary.value.trim() === "" || isNaN(salary.value) ? "Salary must be a number" : "");
        });
    }
}

function showFieldError(inputEl, message) {
    let errorEl = inputEl.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("error-text")) {
        errorEl = document.createElement("div");
        errorEl.className = "error-text";
        errorEl.style.color = "red";
        errorEl.style.fontSize = "12px";
        errorEl.style.marginTop = "4px";
        inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
    }
    errorEl.textContent = message;
}

// ---------------- Fetch & Display ----------------
function fetchEmployees() {
    fetch('/api/employees')
        .then(res => res.json())
        .then(data => {
            employees = data;
            displayEmployees(employees);
            updateStatistics(employees);
        })
        .catch(error => {
            console.error('Error fetching employees:', error);
            showNotification('Error loading employees', 'error');
        });
}

function displayEmployees(employeeList) {
    const tableBody = document.getElementById("employeeTableBody");
    tableBody.innerHTML = "";

    if (employeeList.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #6b7280;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    No employees found
                </td>
            </tr>
        `;
        return;
    }

    employeeList.forEach(emp => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), var(--accent-color)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                    ${emp.name.charAt(0).toUpperCase()}
                </div>
            </td>
            <td><strong>${emp.employee_id}</strong></td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.phone}</td>
            <td>${emp.cnic}</td>
            <td>${emp.emergency}</td>
            <td><strong>Rs. ${parseInt(emp.salary).toLocaleString()}</strong></td>
            <td>
                <button class="action-btn edit-btn" onclick="editEmployee('${emp.employee_id}')" title="Edit Employee">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="openDeleteModal('${emp.employee_id}')" title="Delete Employee">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateStatistics(employeeList) {
    const totalEmployees = employeeList.length;
    const totalSalary = employeeList.reduce((sum, emp) => sum + parseInt(emp.salary), 0);

    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('totalSalary').textContent = `Rs. ${totalSalary.toLocaleString()}`;
}

function filterEmployees() {
    const searchTerm = document.getElementById("searchEmployees").value.toLowerCase();
    const sortBy = document.getElementById("sortBy").value;

    let filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm) ||
                            emp.email.toLowerCase().includes(searchTerm) ||
                            emp.employee_id.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });

    filteredEmployees.sort((a, b) => {
        switch(sortBy) {
            case 'name': return a.name.localeCompare(b.name);
            case 'salary': return parseInt(b.salary) - parseInt(a.salary);
            default: return 0;
        }
    });

    displayEmployees(filteredEmployees);
}

// ---------------- Modal Controls ----------------
function openModal() {
    document.getElementById("employeeModal").style.display = "block";
    document.getElementById("modalTitle").innerText = editMode ? "Edit Employee" : "Add Employee";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById("employeeModal").style.display = "none";
    document.getElementById("employeeForm").reset();
    document.getElementById("empId").disabled = false;
    editMode = false;
    editEmployeeId = null;
    document.body.style.overflow = "auto";
}

function openDeleteModal(employeeId) {
    deleteEmployeeId = employeeId;
    document.getElementById("deleteModal").style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
    deleteEmployeeId = null;
    document.body.style.overflow = "auto";
}

// ---------------- Save / Edit / Delete ----------------
function saveEmployee() {
    const employee = {
        id: document.getElementById("empId").value.trim(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        cnic: document.getElementById("cnic").value.trim(),
        emergency_contact: document.getElementById("emergency").value.trim(),
        role: "Employee",
        salary: document.getElementById("salary").value.trim()
    };

    // ✅ Validation
    if (!validateEmployee(employee)) return;

    const url = editMode ? `/api/employees/${editEmployeeId}` : "/employees/add";
    const method = editMode ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            closeModal();
            fetchEmployees();
            showNotification(
                editMode ? 'Employee updated successfully!' : 'Employee added successfully!',
                'success'
            );
        } else {
            showNotification(data.message || 'Error saving employee', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving employee:', error);
        showNotification('Error saving employee', 'error');
    });
}
