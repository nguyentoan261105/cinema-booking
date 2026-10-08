document.addEventListener("DOMContentLoaded", function () {
    updateAccountMenu();
});

// =========================================================
// KIEM TRA DANG NHAP
// =========================================================
function isUserLoggedIn() {
    const token = localStorage.getItem("accessToken");
    const currentUser = localStorage.getItem("currentUser");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    return (
        token &&
        currentUser &&
        isLoggedIn === "true"
    );
}

// =========================================================
// LAY USER HIEN TAI
// =========================================================
function getCurrentUser() {
    const currentUser =
        localStorage.getItem("currentUser");

    if (!currentUser) {
        return null;
    }

    try {
        return JSON.parse(currentUser);
    } catch (error) {
        console.error(
            "Loi doc currentUser:",
            error
        );

        return null;
    }
}

// =========================================================
// LAY JWT TOKEN
// =========================================================
function getAccessToken() {
    return localStorage.getItem("accessToken");
}

// =========================================================
// CAP NHAT MENU TAI KHOAN
// =========================================================
function updateAccountMenu() {
    const loginLink =
        document.getElementById("loginLink");

    const registerLink =
        document.getElementById("registerLink");

    const userWelcome =
        document.getElementById("userWelcome");

    const userName =
        document.getElementById("userName");

    const logoutLink =
        document.getElementById("logoutLink");

    const loggedIn = isUserLoggedIn();

    // =====================================================
    // CHUA DANG NHAP
    // =====================================================
    if (!loggedIn) {
        if (loginLink) {
            loginLink.style.display = "inline-flex";
        }

        if (registerLink) {
            registerLink.style.display = "inline-flex";
        }

        if (userWelcome) {
            userWelcome.style.display = "none";
        }

        if (logoutLink) {
            logoutLink.style.display = "none";
        }

        return;
    }

    // =====================================================
    // DA DANG NHAP
    // =====================================================
    const user = getCurrentUser();

    if (!user) {
        logout();
        return;
    }

    if (loginLink) {
        loginLink.style.display = "none";
    }

    if (registerLink) {
        registerLink.style.display = "none";
    }

    if (userWelcome) {
        userWelcome.style.display = "inline-flex";
    }

    if (userName) {
        userName.textContent =
            user.fullName || "Nguoi dung";
    }

    if (logoutLink) {
        logoutLink.style.display = "inline-flex";
    }
}

// =========================================================
// DANG XUAT
// =========================================================
function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    window.location.href =
        "../Account/Login.html";
}

// =========================================================
// YEU CAU DANG NHAP
// =========================================================
function requireLogin() {
    if (!isUserLoggedIn()) {
        alert("Vui long dang nhap de tiep tuc.");

        window.location.href =
            "../Account/Login.html";

        return false;
    }

    return true;
}