const API_BASE_URL = "http://localhost:5126/api";

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", handleLogin);
});

async function handleLogin(event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (email === "") {
        showLoginMessage("Vui long nhap email.", "danger");
        return;
    }

    if (password === "") {
        showLoginMessage("Vui long nhap mat khau.", "danger");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log("Ket qua dang nhap:", data);

        if (!response.ok) {
            showLoginMessage(
                data.message || "Email hoac mat khau khong chinh xac.",
                "danger"
            );
            return;
        }

        // =====================================================
        // KIEM TRA TOKEN
        // =====================================================

        if (!data.token) {
            console.error("Backend khong tra ve JWT token.");

            showLoginMessage(
                "Dang nhap thanh cong nhung khong nhan duoc token.",
                "danger"
            );

            return;
        }

        // =====================================================
        // KIEM TRA USER
        // =====================================================

        if (!data.user) {
            console.error("Backend khong tra ve thong tin user.");

            showLoginMessage(
                "Dang nhap thanh cong nhung khong co thong tin tai khoan.",
                "danger"
            );

            return;
        }

        // =====================================================
        // LAY ROLE
        // =====================================================

        const role =
            data.user.role ||
            data.user.Role ||
            "User";

        console.log("Role:", role);

        // =====================================================
        // LUU JWT TOKEN
        // =====================================================

        localStorage.setItem(
            "accessToken",
            data.token
        );

        // =====================================================
        // LUU THONG TIN USER
        // =====================================================

        localStorage.setItem(
            "currentUser",
            JSON.stringify(data.user)
        );

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );

        localStorage.setItem(
            "userRole",
            role
        );

        console.log("JWT da luu.");

        console.log(
            "Tai khoan dang nhap:",
            data.user
        );

        console.log(
            "User ID:",
            data.user.id
        );

        console.log(
            "Role:",
            role
        );

        showLoginMessage(
            "Dang nhap thanh cong!",
            "success"
        );

        // =====================================================
        // CHUYEN TRANG THEO ROLE
        // =====================================================

        setTimeout(function () {

            // ADMIN
            if (
                role.toString().toLowerCase() ===
                "admin"
            ) {

                console.log(
                    "Admin dang duoc chuyen den Dashboard."
                );

                window.location.href =
                    "../Admin/Dashboard.html";

                return;
            }

            // USER
            console.log(
                "User dang duoc chuyen den Home."
            );

            window.location.href =
                "../Home/Index.html";

        }, 1000);

    } catch (error) {

        console.error(
            "LOI DANG NHAP:",
            error
        );

        showLoginMessage(
            "Khong the ket noi den may chu.",
            "danger"
        );
    }
}

function showLoginMessage(message, type) {

    const messageBox =
        document.getElementById(
            "loginMessage"
        );

    if (!messageBox) {
        return;
    }

    messageBox.textContent =
        message;

    messageBox.className =
        `alert alert-${type}`;

    messageBox.style.display =
        "block";
}