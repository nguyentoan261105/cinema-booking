/* =========================
   CINEMA
========================= */

const API_BASE_URL = "http://localhost:5126/api";


/* =========================================================
   CUSTOMER ELEMENTS
========================================================= */

const cinemaList =
    document.getElementById("cinemaList");

const cinemaLoading =
    document.getElementById("cinemaLoading");

const cinemaError =
    document.getElementById("cinemaError");

const cinemaErrorMessage =
    document.getElementById("cinemaErrorMessage");

const cinemaEmpty =
    document.getElementById("cinemaEmpty");

const cinemaCount =
    document.getElementById("cinemaCount");

const searchCinema =
    document.getElementById("searchCinema");

const retryButton =
    document.getElementById("retryButton");


/* =========================================================
   CUSTOMER DATA
========================================================= */

let cinemas = [];


/* =========================================================
   CUSTOMER LOAD CINEMAS
========================================================= */

async function loadCinemas() {

    if (
        !cinemaList ||
        !cinemaLoading ||
        !cinemaError ||
        !cinemaEmpty ||
        !cinemaCount
    ) {
        return;
    }


    showLoading();


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cinemas`
            );


        if (!response.ok) {

            throw new Error(
                "Khong the tai danh sach rap."
            );

        }


        const data =
            await response.json();


        console.log(
            "Danh sach rap:",
            data
        );


        if (Array.isArray(data)) {

            cinemas = data;

        }
        else if (
            data &&
            Array.isArray(data.cinemas)
        ) {

            cinemas = data.cinemas;

        }
        else {

            cinemas = [];

        }


        hideLoading();


        renderCinemas(cinemas);

    }
    catch (error) {

        console.error(
            "Loi load cinemas:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   CUSTOMER RENDER
========================================================= */

function renderCinemas(data) {

    if (!cinemaList) {
        return;
    }


    cinemaList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        if (cinemaEmpty) {

            cinemaEmpty.style.display =
                "block";

        }


        if (cinemaCount) {

            cinemaCount.textContent =
                "0 rạp";

        }


        return;

    }


    if (cinemaEmpty) {

        cinemaEmpty.style.display =
            "none";

    }


    if (cinemaCount) {

        cinemaCount.textContent =
            `${data.length} rạp`;

    }


    data.forEach(
        cinema => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "cinema-card";


            const cinemaId =
                cinema.id;


            const cinemaName =
                cinema.name ||
                "Cinema";


            const cinemaAddress =
                cinema.address ||
                "Chưa cập nhật địa chỉ";


            const rooms =
                cinema.rooms ||
                cinema.Rooms ||
                [];


            const roomCount =
                Array.isArray(rooms)
                    ? rooms.length
                    : 0;


            card.innerHTML = `

                <div class="cinema-card-top">

                    <div class="cinema-card-icon">

                        <i class="bi bi-building"></i>

                    </div>

                </div>


                <div class="cinema-card-body">

                    <h3>
                        ${cinemaName}
                    </h3>


                    <div class="cinema-address">

                        <i class="bi bi-geo-alt-fill"></i>

                        <span>
                            ${cinemaAddress}
                        </span>

                    </div>


                    <div class="cinema-room">

                        <i class="bi bi-door-open-fill"></i>

                        <span>

                            ${
                                roomCount > 0
                                    ? `${roomCount} phòng chiếu`
                                    : "Thông tin phòng đang cập nhật"
                            }

                        </span>

                    </div>


                    <a
                        href="#"
                        class="cinema-button"
                        onclick="
                            viewCinema(${cinemaId});
                            return false;
                        "
                    >

                        Xem suất chiếu

                        <i class="bi bi-arrow-right"></i>

                    </a>

                </div>

            `;


            cinemaList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   VIEW CINEMA
========================================================= */

function viewCinema(cinemaId) {

    localStorage.setItem(
        "selectedCinemaId",
        cinemaId
    );


    window.location.href =
        "../Movies/Index.html";

}


/* =========================================================
   CUSTOMER SEARCH
========================================================= */

if (searchCinema) {

    searchCinema.addEventListener(
        "input",
        function () {

            const keyword =
                this.value
                    .trim()
                    .toLowerCase();


            if (!keyword) {

                renderCinemas(
                    cinemas
                );

                return;

            }


            const filtered =
                cinemas.filter(
                    cinema => {

                        const name =
                            (
                                cinema.name ||
                                ""
                            )
                            .toLowerCase();


                        const address =
                            (
                                cinema.address ||
                                ""
                            )
                            .toLowerCase();


                        return (
                            name.includes(
                                keyword
                            ) ||
                            address.includes(
                                keyword
                            )
                        );

                    }
                );


            renderCinemas(
                filtered
            );

        }
    );

}


/* =========================================================
   CUSTOMER RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function () {

            loadCinemas();

        }
    );

}


/* =========================================================
   CUSTOMER LOADING
========================================================= */

function showLoading() {

    if (!cinemaLoading) {
        return;
    }


    cinemaLoading.style.display =
        "block";


    if (cinemaError) {

        cinemaError.style.display =
            "none";

    }


    if (cinemaEmpty) {

        cinemaEmpty.style.display =
            "none";

    }


    if (cinemaList) {

        cinemaList.innerHTML =
            "";

    }


    if (cinemaCount) {

        cinemaCount.textContent =
            "Đang tải...";

    }

}


/* =========================================================
   CUSTOMER HIDE LOADING
========================================================= */

function hideLoading() {

    if (cinemaLoading) {

        cinemaLoading.style.display =
            "none";

    }


    if (cinemaError) {

        cinemaError.style.display =
            "none";

    }

}


/* =========================================================
   CUSTOMER ERROR
========================================================= */

function showError(message) {

    if (cinemaLoading) {

        cinemaLoading.style.display =
            "none";

    }


    if (cinemaEmpty) {

        cinemaEmpty.style.display =
            "none";

    }


    if (cinemaError) {

        cinemaError.style.display =
            "block";

    }


    if (cinemaErrorMessage) {

        cinemaErrorMessage.textContent =
            message ||
            "Không thể tải danh sách rạp.";

    }

}


/* =========================================================
   CUSTOMER START
========================================================= */

/*
    Chi chay neu day la trang khach hang
*/

if (cinemaList) {

    loadCinemas();

}


/* =========================================================
   ADMIN - QUAN LY RAP
========================================================= */

let adminCinemas = [];

let adminEditingCinemaId = null;


/* =========================================================
   ADMIN START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const adminTable =
            document.getElementById(
                "cinemasTable"
            );


        /*
            Neu khong phai trang Admin
            thi dung tai day
        */

        if (!adminTable) {

            return;

        }


        adminCheckCinemaPermission();

        adminLoadCinemaUser();

        adminLoadCinemas();

        adminSetupCinemaEvents();

    }
);


/* =========================================================
   CHECK ADMIN
========================================================= */

function adminCheckCinemaPermission() {

    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (!token) {

        window.location.href =
            "../Account/Login.html";

        return;

    }


    let currentUser = null;


    try {

        currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );

    }
    catch (error) {

        currentUser = null;

    }


    const roleFromStorage =
        localStorage.getItem(
            "userRole"
        );


    const roleFromUser =
        currentUser
            ? currentUser.role
            : "";


    const role =
        roleFromStorage ||
        roleFromUser ||
        "";


    if (
        role.toLowerCase() !==
        "admin"
    ) {

        alert(
            "Bạn không có quyền truy cập trang quản trị."
        );


        window.location.href =
            "../Home/Index.html";

        return;

    }

}


/* =========================================================
   LOAD ADMIN USER
========================================================= */

function adminLoadCinemaUser() {

    try {

        const currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        if (!currentUser) {

            return;

        }


        const userName =
            document.getElementById(
                "adminUserName"
            );


        if (userName) {

            userName.textContent =
                currentUser.fullName ||
                currentUser.name ||
                "Administrator";

        }

    }
    catch (error) {

        console.log(
            "Khong the tai thong tin admin."
        );

    }

}


/* =========================================================
   ADMIN EVENTS
========================================================= */

function adminSetupCinemaEvents() {

    const addButton =
        document.getElementById(
            "addCinemaBtn"
        );


    const closeButton =
        document.getElementById(
            "closeCinemaModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelCinemaBtn"
        );


    const form =
        document.getElementById(
            "cinemaForm"
        );


    const search =
        document.getElementById(
            "cinemaSearch"
        );


    const logoutButton =
        document.getElementById(
            "adminSidebarLogout"
        );


    /* THEM RAP */

    if (addButton) {

        addButton.addEventListener(
            "click",
            adminOpenAddCinema
        );

    }


    /* DONG MODAL */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            adminCloseCinemaModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            adminCloseCinemaModal
        );

    }


    /* FORM */

    if (form) {

        form.addEventListener(
            "submit",
            adminSaveCinema
        );

    }


    /* TIM KIEM */

    if (search) {

        search.addEventListener(
            "input",
            function () {

                adminRenderCinemas(
                    search.value
                );

            }
        );

    }


    /* LOGOUT */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            adminCinemaLogout
        );

    }


    /* CLICK NGOAI MODAL */

    const modal =
        document.getElementById(
            "cinemaModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    adminCloseCinemaModal();

                }

            }
        );

    }

}


/* =========================================================
   LOAD CINEMAS ADMIN
========================================================= */

async function adminLoadCinemas() {

    const table =
        document.getElementById(
            "cinemasTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="
                    text-align:center;
                    padding:30px;
                "
            >
                Đang tải dữ liệu...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/cinemas`,
                {
                    method: "GET",

                    headers:
                        adminCinemaHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminCinemaGetError(
                    response
                )
            );

        }


        const data =
            await response.json();


        console.log(
            "Danh sach rap Admin:",
            data
        );


        if (Array.isArray(data)) {

            adminCinemas =
                data;

        }
        else if (
            data &&
            Array.isArray(data.data)
        ) {

            adminCinemas =
                data.data;

        }
        else if (
            data &&
            Array.isArray(data.items)
        ) {

            adminCinemas =
                data.items;

        }
        else {

            adminCinemas = [];

        }


        adminRenderCinemas("");

    }
    catch (error) {

        console.error(
            "Loi tai danh sach rap Admin:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#dc3545;
                    "
                >

                    Không thể tải danh sách rạp.

                    <br><br>

                    ${adminCinemaEscapeHtml(
                        error.message
                    )}

                </td>
            </tr>
        `;

    }

}


/* =========================================================
   RENDER ADMIN CINEMAS
========================================================= */

function adminRenderCinemas(
    keyword = ""
) {

    const table =
        document.getElementById(
            "cinemasTable"
        );


    if (!table) {

        return;

    }


    const search =
        String(keyword)
            .toLowerCase()
            .trim();


    const filtered =
        adminCinemas.filter(
            function (cinema) {

                const name =
                    String(
                        cinema.name || ""
                    )
                    .toLowerCase();


                const address =
                    String(
                        cinema.address || ""
                    )
                    .toLowerCase();


                return (
                    name.includes(search) ||
                    address.includes(search)
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    Không tìm thấy rạp nào.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        filtered
            .map(
                function (cinema, index) {

                    return adminCreateCinemaRow(
                        cinema,
                        index + 1
                    );

                }
            )
            .join("");

}


/* =========================================================
   CREATE ADMIN ROW
========================================================= */

function adminCreateCinemaRow(
    cinema,
    index
) {

    const rooms =
        cinema.rooms ||
        cinema.Rooms ||
        [];


    const roomCount =
        Array.isArray(rooms)
            ? rooms.length
            : (
                cinema.roomCount ??
                cinema.roomsCount ??
                0
            );


    return `
        <tr>

            <td>
                ${index}
            </td>


            <td>

                <div
                    class="cinema-admin-name"
                >

                    <div
                        class="cinema-admin-icon"
                    >

                        <i class="bi bi-building"></i>

                    </div>


                    <div>

                        <div class="movie-name">

                            ${adminCinemaEscapeHtml(
                                cinema.name ||
                                "Chưa có tên"
                            )}

                        </div>

                    </div>

                </div>

            </td>


            <td>

                <div
                    class="cinema-admin-address"
                >

                    <i class="bi bi-geo-alt-fill"></i>

                    <span>

                        ${adminCinemaEscapeHtml(
                            cinema.address ||
                            "Chưa cập nhật"
                        )}

                    </span>

                </div>

            </td>


            <td>

                <span
                    class="cinema-room-badge"
                >

                    <i class="bi bi-door-open-fill"></i>

                    ${roomCount} phòng

                </span>

            </td>


            <td>

                <div
                    class="cinema-admin-actions"
                >

                    <button
                        type="button"
                        class="
                            table-action-btn
                            edit-btn
                        "
                        title="Sửa"
                        onclick="
                            adminEditCinema(
                                ${cinema.id}
                            )
                        "
                    >

                        <i class="bi bi-pencil-fill"></i>

                    </button>


                    <button
                        type="button"
                        class="
                            table-action-btn
                            delete-btn
                        "
                        title="Xóa"
                        onclick="
                            adminDeleteCinema(
                                ${cinema.id}
                            )
                        "
                    >

                        <i class="bi bi-trash-fill"></i>

                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   OPEN ADD CINEMA
========================================================= */

function adminOpenAddCinema() {

    adminEditingCinemaId =
        null;


    const modal =
        document.getElementById(
            "cinemaModal"
        );


    const title =
        document.getElementById(
            "cinemaModalTitle"
        );


    const form =
        document.getElementById(
            "cinemaForm"
        );


    const id =
        document.getElementById(
            "cinemaId"
        );


    if (form) {

        form.reset();

    }


    if (id) {

        id.value =
            "";

    }


    if (title) {

        title.textContent =
            "Thêm rạp";

    }


    if (modal) {

        modal.style.display =
            "flex";

    }

}


/* =========================================================
   EDIT CINEMA
========================================================= */

function adminEditCinema(id) {

    const cinema =
        adminCinemas.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    if (!cinema) {

        adminCinemaShowAlert(
            "Không tìm thấy rạp.",
            "error"
        );

        return;

    }


    adminEditingCinemaId =
        cinema.id;


    const idInput =
        document.getElementById(
            "cinemaId"
        );


    const nameInput =
        document.getElementById(
            "cinemaName"
        );


    const addressInput =
        document.getElementById(
            "cinemaAddress"
        );


    const title =
        document.getElementById(
            "cinemaModalTitle"
        );


    if (idInput) {

        idInput.value =
            cinema.id;

    }


    if (nameInput) {

        nameInput.value =
            cinema.name || "";

    }


    if (addressInput) {

        addressInput.value =
            cinema.address || "";

    }


    if (title) {

        title.textContent =
            "Chỉnh sửa rạp";

    }


    const modal =
        document.getElementById(
            "cinemaModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function adminCloseCinemaModal() {

    const modal =
        document.getElementById(
            "cinemaModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    adminEditingCinemaId =
        null;

}


/* =========================================================
   SAVE CINEMA
========================================================= */

async function adminSaveCinema(
    event
) {

    event.preventDefault();


    const nameInput =
        document.getElementById(
            "cinemaName"
        );


    const addressInput =
        document.getElementById(
            "cinemaAddress"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const address =
        addressInput
            ? addressInput.value.trim()
            : "";


    if (!name) {

        adminCinemaShowAlert(
            "Vui lòng nhập tên rạp.",
            "error"
        );

        return;

    }


    if (!address) {

        adminCinemaShowAlert(
            "Vui lòng nhập địa chỉ rạp.",
            "error"
        );

        return;

    }


    const data = {

        name:
            name,

        address:
            address

    };


    const isEdit =
        adminEditingCinemaId !==
        null;


    const url =
        isEdit
            ? `${API_BASE_URL}/admin/cinemas/${adminEditingCinemaId}`
            : `${API_BASE_URL}/admin/cinemas`;


    const method =
        isEdit
            ? "PUT"
            : "POST";


    const saveButton =
        document.getElementById(
            "saveCinemaBtn"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML =
            "Đang lưu...";

    }


    try {

        const response =
            await fetch(
                url,
                {
                    method:
                        method,

                    headers:
                        adminCinemaHeaders(
                            true
                        ),

                    body:
                        JSON.stringify(
                            data
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminCinemaGetError(
                    response
                )
            );

        }


        adminCloseCinemaModal();


        adminCinemaShowAlert(
            isEdit
                ? "Cập nhật rạp thành công."
                : "Thêm rạp thành công.",
            "success"
        );


        await adminLoadCinemas();

    }
    catch (error) {

        console.error(
            "Loi luu rap:",
            error
        );


        adminCinemaShowAlert(
            error.message ||
            "Không thể lưu rạp.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                `
                    <i class="bi bi-check-lg"></i>
                    Lưu
                `;

        }

    }

}


/* =========================================================
   DELETE CINEMA
========================================================= */

async function adminDeleteCinema(
    id
) {

    const cinema =
        adminCinemas.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    if (!cinema) {

        return;

    }


    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa rạp "${cinema.name}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/cinemas/${id}`,
                {
                    method:
                        "DELETE",

                    headers:
                        adminCinemaHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminCinemaGetError(
                    response
                )
            );

        }


        await adminLoadCinemas();


        adminCinemaShowAlert(
            "Xóa rạp thành công.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Loi xoa rap:",
            error
        );


        adminCinemaShowAlert(
            error.message ||
            "Không thể xóa rạp.",
            "error"
        );

    }

}


/* =========================================================
   ADMIN HEADERS
========================================================= */

function adminCinemaHeaders(
    json = false
) {

    const headers = {};


    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (token) {

        headers["Authorization"] =
            "Bearer " + token;

    }


    if (json) {

        headers["Content-Type"] =
            "application/json";

    }


    return headers;

}


/* =========================================================
   ADMIN ERROR
========================================================= */

async function adminCinemaGetError(
    response
) {

    try {

        const data =
            await response.json();


        if (data.message) {

            return data.message;

        }


        if (data.title) {

            return data.title;

        }


        if (data.error) {

            return data.error;

        }


        if (data.errors) {

            return Object.values(
                data.errors
            )
            .flat()
            .join(" ");

        }

    }
    catch (error) {

        // Bo qua loi parse JSON
    }


    return `Lỗi HTTP ${response.status}`;

}


/* =========================================================
   ADMIN ALERT
========================================================= */

function adminCinemaShowAlert(
    message,
    type
) {

    const alertBox =
        document.getElementById(
            "cinemasAlert"
        );


    if (!alertBox) {

        return;

    }


    alertBox.textContent =
        message;


    alertBox.style.display =
        "block";


    if (type === "error") {

        alertBox.style.background =
            "#ffe3e3";

        alertBox.style.color =
            "#dc3545";

    }
    else {

        alertBox.style.background =
            "#dff6e7";

        alertBox.style.color =
            "#198754";

    }


    setTimeout(
        function () {

            alertBox.style.display =
                "none";

        },
        3500
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function adminCinemaEscapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}


/* =========================================================
   LOGOUT
========================================================= */

function adminCinemaLogout() {

    const confirmed =
        confirm(
            "Bạn có chắc muốn đăng xuất không?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        "accessToken"
    );


    localStorage.removeItem(
        "currentUser"
    );


    localStorage.removeItem(
        "isLoggedIn"
    );


    localStorage.removeItem(
        "userRole"
    );


    window.location.href =
        "../Account/Login.html";

}