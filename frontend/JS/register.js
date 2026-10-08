const API_BASE_URL = "http://localhost:5126/api";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const registerForm =
            document.getElementById(
                "registerForm"
            );


        if (!registerForm) {
            return;
        }


        registerForm.addEventListener(
            "submit",
            handleRegister
        );

    }
);


// ==========================================
// DANG KY
// ==========================================

async function handleRegister(event) {

    event.preventDefault();


    const fullName =
        document
            .getElementById("name")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const phone =
        document
            .getElementById("phone")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;


    // ==========================================
    // KIEM TRA DU LIEU
    // ==========================================

    if (fullName === "") {

        showRegisterMessage(
            "Vui long nhap ho ten.",
            "danger"
        );

        return;
    }


    if (email === "") {

        showRegisterMessage(
            "Vui long nhap email.",
            "danger"
        );

        return;
    }


    if (phone === "") {

        showRegisterMessage(
            "Vui long nhap so dien thoai.",
            "danger"
        );

        return;
    }


    if (password === "") {

        showRegisterMessage(
            "Vui long nhap mat khau.",
            "danger"
        );

        return;
    }


    if (password.length < 6) {

        showRegisterMessage(
            "Mat khau phai co it nhat 6 ky tu.",
            "danger"
        );

        return;
    }


    if (password !== confirmPassword) {

        showRegisterMessage(
            "Mat khau xac nhan khong trung khop.",
            "danger"
        );

        return;
    }


    try {

        // ==========================================
        // GOI API DANG KY
        // ==========================================

        const response =
            await fetch(
                `${API_BASE_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        fullName: fullName,

                        email: email,

                        phone: phone,

                        password: password,

                        confirmPassword:
                            confirmPassword

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "Ket qua dang ky:",
            data
        );


        // ==========================================
        // DANG KY THAT BAI
        // ==========================================

        if (!response.ok) {

            showRegisterMessage(
                data.message ||
                "Dang ky that bai.",
                "danger"
            );

            return;
        }


        // ==========================================
        // DANG KY THANH CONG
        // ==========================================

        showRegisterMessage(
            "Dang ky thanh cong! Dang chuyen sang trang dang nhap...",
            "success"
        );


        // Xoa du lieu form

        document
            .getElementById("registerForm")
            .reset();


        // ==========================================
        // CHUYEN SANG TRANG DANG NHAP
        // ==========================================

        setTimeout(
            function () {

                window.location.href =
                    "Login.html";

            },
            1500
        );

    }
    catch (error) {

        console.error(
            "LOI DANG KY:",
            error
        );


        showRegisterMessage(
            "Khong the ket noi den may chu.",
            "danger"
        );

    }
}


// ==========================================
// HIEN THONG BAO
// ==========================================

function showRegisterMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "registerMessage"
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