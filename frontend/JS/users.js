const ADMIN_API_BASE_URL = "http://localhost:5126/api";

let employees = [];
let editingEmployeeId = null;


document.addEventListener("DOMContentLoaded", function () {

    checkAdminAccess();

    setupEvents();

    loadEmployees();

});


/* =========================
   KIEM TRA QUYEN ADMIN
========================= */

function checkAdminAccess() {

    const token = localStorage.getItem("accessToken");

    const currentUserText =
        localStorage.getItem("currentUser");

    if (!token) {

        window.location.href =
            "../Account/Login.html";

        return;
    }

    let currentUser = null;

    try {

        currentUser =
            currentUserText
                ? JSON.parse(currentUserText)
                : null;

    } catch (error) {

        currentUser = null;

    }

    const role =
        currentUser?.role ||
        currentUser?.Role ||
        localStorage.getItem("userRole");

    if (
        !role ||
        role.toLowerCase() !== "admin"
    ) {

        window.location.href =
            "../Home/Index.html";

        return;
    }

}


/* =========================
   EVENT
========================= */

function setupEvents() {

    const addButton =
        document.getElementById("addEmployeeBtn");

    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddModal
        );

    }


    const closeButton =
        document.getElementById("closeModalBtn");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEmployeeModal
        );

    }


    const cancelButton =
        document.getElementById("cancelModalBtn");

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeEmployeeModal
        );

    }


    const modal =
        document.getElementById("employeeModal");

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    closeEmployeeModal();

                }

            }
        );

    }


    const form =
        document.getElementById("employeeForm");

    if (form) {

        form.addEventListener(
            "submit",
            saveEmployee
        );

    }


    const searchInput =
        document.getElementById("userSearch");

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterEmployees
        );

    }


    const logoutButton =
        document.getElementById("adminSidebarLogout");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );

    }

}


/* =========================
   LOAD EMPLOYEES
========================= */

async function loadEmployees() {

    const table =
        document.getElementById("usersTable");

    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="7" class="loading-row">
                <i class="bi bi-arrow-repeat"></i>
                Đang tải dữ liệu...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${ADMIN_API_BASE_URL}/admin/employees`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


        if (response.status === 401 ||
            response.status === 403) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Không thể tải danh sách nhân viên."
            );

        }


        employees =
            Array.isArray(data)
                ? data
                : data.items || data.data || [];


        renderEmployees(employees);

    } catch (error) {

        console.error(
            "LOI LOAD EMPLOYEES:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    Không thể tải danh sách nhân viên.
                </td>
            </tr>
        `;


        showAlert(
            error.message ||
            "Có lỗi xảy ra.",
            "error"
        );

    }

}


/* =========================
   RENDER
========================= */

function renderEmployees(list) {

    const table =
        document.getElementById("usersTable");

    if (!table) {
        return;
    }


    if (!list || list.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">
                    <i class="bi bi-people"></i>
                    <br>
                    Chưa có nhân viên nào.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        list.map(function (employee, index) {

            const id =
                employee.id ??
                employee.Id;

            const name =
                employee.fullName ??
                employee.FullName ??
                "Không có tên";

            const email =
                employee.email ??
                employee.Email ??
                "";

            const phone =
                employee.phone ??
                employee.Phone ??
                "Chưa cập nhật";

            const role =
                employee.role ??
                employee.Role ??
                "Staff";

            const isActive =
                employee.isActive ??
                employee.IsActive ??
                true;


            return `
                <tr>

                    <td>
                        ${index + 1}
                    </td>


                    <td>

                        <div class="user-info">

                            <div class="user-avatar">
                                ${getInitial(name)}
                            </div>

                            <div>

                                <div class="user-name">
                                    ${escapeHtml(name)}
                                </div>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHtml(email)}
                    </td>


                    <td>
                        ${escapeHtml(phone)}
                    </td>


                    <td>
                        ${getRoleBadge(role)}
                    </td>


                    <td>
                        ${getStatusBadge(isActive)}
                    </td>


                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="table-action-btn edit-btn"
                                title="Sửa"
                                onclick="editEmployee(${id})"
                            >
                                <i class="bi bi-pencil"></i>
                            </button>


                            <button
                                type="button"
                                class="table-action-btn toggle-btn"
                                title="${isActive ? "Khóa tài khoản" : "Mở tài khoản"}"
                                onclick="toggleEmployee(${id})"
                            >
                                <i class="bi ${isActive ? "bi-lock" : "bi-unlock"}"></i>
                            </button>


                            <button
                                type="button"
                                class="table-action-btn delete-btn"
                                title="Xóa"
                                onclick="deleteEmployee(${id})"
                            >
                                <i class="bi bi-trash"></i>
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");

}


/* =========================
   ROLE
========================= */

function getRoleBadge(role) {

    const normalizedRole =
        String(role || "Staff")
            .toLowerCase();


    if (normalizedRole === "admin") {

        return `
            <span class="role-badge role-admin">
                Admin
            </span>
        `;

    }


    if (normalizedRole === "staff") {

        return `
            <span class="role-badge role-staff">
                Staff
            </span>
        `;

    }


    return `
        <span class="role-badge role-user">
            User
        </span>
    `;

}


/* =========================
   STATUS
========================= */

function getStatusBadge(isActive) {

    if (isActive) {

        return `
            <span class="status-badge status-active">
                Hoạt động
            </span>
        `;

    }


    return `
        <span class="status-badge status-inactive">
            Đã khóa
        </span>
    `;

}


/* =========================
   ADD
========================= */

function openAddModal() {

    editingEmployeeId = null;


    document.getElementById("modalTitle").textContent =
        "Thêm nhân viên";


    document.getElementById("employeeId").value =
        "";


    document.getElementById("employeeName").value =
        "";


    document.getElementById("employeeEmail").value =
        "";


    document.getElementById("employeePhone").value =
        "";


    document.getElementById("employeePassword").value =
        "";


    document.getElementById("employeePassword").required =
        true;


    document.getElementById("passwordNote").textContent =
        "Mật khẩu dùng để đăng nhập tài khoản nhân viên.";


    document
        .getElementById("employeeModal")
        .classList.add("show");

}


/* =========================
   EDIT
========================= */

function editEmployee(id) {

    const employee =
        employees.find(function (item) {

            return (
                item.id === id ||
                item.Id === id
            );

        });


    if (!employee) {

        showAlert(
            "Không tìm thấy nhân viên.",
            "error"
        );

        return;
    }


    editingEmployeeId = id;


    document.getElementById("modalTitle").textContent =
        "Sửa nhân viên";


    document.getElementById("employeeId").value =
        id;


    document.getElementById("employeeName").value =
        employee.fullName ??
        employee.FullName ??
        "";


    document.getElementById("employeeEmail").value =
        employee.email ??
        employee.Email ??
        "";


    document.getElementById("employeePhone").value =
        employee.phone ??
        employee.Phone ??
        "";


    document.getElementById("employeePassword").value =
        "";


    document.getElementById("employeePassword").required =
        false;


    document.getElementById("passwordNote").textContent =
        "Để trống nếu không muốn thay đổi mật khẩu.";


    document
        .getElementById("employeeModal")
        .classList.add("show");

}


/* =========================
   SAVE
========================= */

async function saveEmployee(event) {

    event.preventDefault();


    const name =
        document.getElementById("employeeName")
            .value
            .trim();


    const email =
        document.getElementById("employeeEmail")
            .value
            .trim();


    const phone =
        document.getElementById("employeePhone")
            .value
            .trim();


    const password =
        document.getElementById("employeePassword")
            .value;


    if (!name) {

        showAlert(
            "Vui lòng nhập họ và tên.",
            "error"
        );

        return;
    }


    if (!email) {

        showAlert(
            "Vui lòng nhập email.",
            "error"
        );

        return;
    }


    if (!editingEmployeeId && !password) {

        showAlert(
            "Vui lòng nhập mật khẩu.",
            "error"
        );

        return;
    }


    const body = {

        fullName: name,

        email: email,

        phone: phone,

        password: password

    };


    try {

        let response;


        if (editingEmployeeId) {

            response =
                await fetch(
                    `${ADMIN_API_BASE_URL}/admin/employees/${editingEmployeeId}`,
                    {
                        method: "PUT",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                );

        } else {

            response =
                await fetch(
                    `${ADMIN_API_BASE_URL}/admin/employees`,
                    {
                        method: "POST",
                        headers: {
                            ...getAuthHeaders(),
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                );

        }


        if (response.status === 401 ||
            response.status === 403) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Không thể lưu nhân viên."
            );

        }


        closeEmployeeModal();


        showAlert(
            editingEmployeeId
                ? "Cập nhật nhân viên thành công."
                : "Thêm nhân viên thành công.",
            "success"
        );


        await loadEmployees();


    } catch (error) {

        console.error(
            "LOI SAVE EMPLOYEE:",
            error
        );


        showAlert(
            error.message ||
            "Có lỗi xảy ra.",
            "error"
        );

    }

}


/* =========================
   TOGGLE
========================= */

async function toggleEmployee(id) {

    const employee =
        employees.find(function (item) {

            return (
                item.id === id ||
                item.Id === id
            );

        });


    if (!employee) {

        showAlert(
            "Không tìm thấy nhân viên.",
            "error"
        );

        return;
    }


    const name =
        employee.fullName ??
        employee.FullName ??
        "nhân viên";


    const currentStatus =
        employee.isActive ??
        employee.IsActive ??
        true;


    const newStatus =
        !currentStatus;


    const confirmMessage =
        newStatus
            ? `Bạn có muốn mở khóa tài khoản "${name}" không?`
            : `Bạn có muốn khóa tài khoản "${name}" không?`;


    if (!confirm(confirmMessage)) {
        return;
    }


    const body = {

        fullName:
            employee.fullName ??
            employee.FullName ??
            "",

        email:
            employee.email ??
            employee.Email ??
            "",

        phone:
            employee.phone ??
            employee.Phone ??
            "",

        password: "",

        isActive: newStatus

    };


    try {

        const response =
            await fetch(
                `${ADMIN_API_BASE_URL}/admin/employees/${id}`,
                {
                    method: "PUT",
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );


        if (response.status === 401 ||
            response.status === 403) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Không thể cập nhật trạng thái."
            );

        }


        showAlert(
            newStatus
                ? "Đã mở khóa tài khoản."
                : "Đã khóa tài khoản.",
            "success"
        );


        await loadEmployees();


    } catch (error) {

        console.error(
            "LOI TOGGLE EMPLOYEE:",
            error
        );


        showAlert(
            error.message ||
            "Có lỗi xảy ra.",
            "error"
        );

    }

}


/* =========================
   DELETE
========================= */

async function deleteEmployee(id) {

    const employee =
        employees.find(function (item) {

            return (
                item.id === id ||
                item.Id === id
            );

        });


    if (!employee) {

        showAlert(
            "Không tìm thấy nhân viên.",
            "error"
        );

        return;
    }


    const name =
        employee.fullName ??
        employee.FullName ??
        "nhân viên";


    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa nhân viên "${name}" không?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${ADMIN_API_BASE_URL}/admin/employees/${id}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );


        if (response.status === 401 ||
            response.status === 403) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Không thể xóa nhân viên."
            );

        }


        showAlert(
            "Xóa nhân viên thành công.",
            "success"
        );


        await loadEmployees();


    } catch (error) {

        console.error(
            "LOI DELETE EMPLOYEE:",
            error
        );


        showAlert(
            error.message ||
            "Không thể xóa nhân viên.",
            "error"
        );

    }

}


/* =========================
   SEARCH
========================= */

function filterEmployees() {

    const input =
        document.getElementById("userSearch");


    const keyword =
        input
            ? input.value.trim().toLowerCase()
            : "";


    if (!keyword) {

        renderEmployees(employees);

        return;
    }


    const filtered =
        employees.filter(function (employee) {

            const name =
                employee.fullName ??
                employee.FullName ??
                "";


            const email =
                employee.email ??
                employee.Email ??
                "";


            const phone =
                employee.phone ??
                employee.Phone ??
                "";


            return (
                String(name)
                    .toLowerCase()
                    .includes(keyword)
                ||
                String(email)
                    .toLowerCase()
                    .includes(keyword)
                ||
                String(phone)
                    .toLowerCase()
                    .includes(keyword)
            );

        });


    renderEmployees(filtered);

}


/* =========================
   CLOSE MODAL
========================= */

function closeEmployeeModal() {

    const modal =
        document.getElementById("employeeModal");


    if (modal) {

        modal.classList.remove("show");

    }


    editingEmployeeId = null;

}


/* =========================
   AUTH HEADER
========================= */

function getAuthHeaders() {

    const token =
        localStorage.getItem("accessToken");


    return {

        "Authorization":
            `Bearer ${token}`

    };

}


/* =========================
   UNAUTHORIZED
========================= */

function handleUnauthorized() {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");


    window.location.href =
        "../Account/Login.html";

}


/* =========================
   LOGOUT
========================= */

function logout() {

    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");


    window.location.href =
        "../Account/Login.html";

}


/* =========================
   ALERT
========================= */

function showAlert(message, type) {

    const alertBox =
        document.getElementById("usersAlert");


    if (!alertBox) {
        return;
    }


    alertBox.textContent =
        message;


    alertBox.className =
        `admin-alert ${type}`;


    alertBox.style.display =
        "block";


    setTimeout(function () {

        alertBox.style.display =
            "none";

    }, 4000);

}


/* =========================
   INITIAL
========================= */

function getInitial(name) {

    if (!name) {
        return "?";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}