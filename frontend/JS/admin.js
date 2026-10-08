/* =========================================================
   ADMIN DASHBOARD
   CINEMA BOOKING
========================================================= */


const ADMIN_API_BASE_URL =
    "http://localhost:5126/api";


/* =========================================================
   GET TOKEN
========================================================= */

function getAdminToken() {

    return localStorage.getItem(
        "accessToken"
    );

}


/* =========================================================
   GET CURRENT USER
========================================================= */

function getAdminUser() {

    const userText =
        localStorage.getItem(
            "currentUser"
        );

    if (!userText) {

        return null;

    }


    try {

        return JSON.parse(
            userText
        );

    }
    catch (error) {

        console.error(
            "LOI DOC CURRENT USER:",
            error
        );

        return null;

    }

}


/* =========================================================
   GET ROLE
========================================================= */

function getAdminRole() {

    const user =
        getAdminUser();

    if (user) {

        return (
            user.role ||
            user.Role ||
            localStorage.getItem(
                "userRole"
            ) ||
            ""
        );

    }


    return (
        localStorage.getItem(
            "userRole"
        ) || ""
    );

}


/* =========================================================
   CHECK ADMIN
========================================================= */

function checkAdminAccess() {

    const token =
        getAdminToken();

    const role =
        getAdminRole();


    if (!token) {

        alert(
            "Vui long dang nhap tai khoan quan tri."
        );

        window.location.href =
            "../Account/Login.html";

        return false;

    }


    if (
        role.toLowerCase() !==
        "admin"
    ) {

        alert(
            "Ban khong co quyen truy cap trang quan tri."
        );

        window.location.href =
            "../Home/Index.html";

        return false;

    }


    return true;

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatAdminMoney(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    ) + " ₫";

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatAdminNumber(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    );

}


/* =========================================================
   GET ELEMENT
========================================================= */

function adminElement(
    id
) {

    return document.getElementById(
        id
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setAdminText(
    id,
    value
) {

    const element =
        adminElement(id);


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   SHOW LOADING
========================================================= */

function showAdminLoading() {

    const loading =
        adminElement(
            "adminLoading"
        );


    if (loading) {

        loading.classList.add(
            "show"
        );

    }

}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideAdminLoading() {

    const loading =
        adminElement(
            "adminLoading"
        );


    if (loading) {

        loading.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showAdminError(
    message
) {

    const errorBox =
        adminElement(
            "adminError"
        );

    const errorText =
        adminElement(
            "adminErrorText"
        );


    if (errorText) {

        errorText.textContent =
            message ||
            "Khong the tai du lieu.";

    }


    if (errorBox) {

        errorBox.classList.add(
            "show"
        );

    }

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideAdminError() {

    const errorBox =
        adminElement(
            "adminError"
        );


    if (errorBox) {

        errorBox.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   CREATE YEARS
========================================================= */

function createYearOptions() {

    const select =
        adminElement(
            "dashboardYear"
        );


    if (!select) {

        return;

    }


    const currentYear =
        new Date().getFullYear();


    select.innerHTML = "";


    for (
        let year = currentYear;
        year >= currentYear - 5;
        year--
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            year;

        option.textContent =
            year;


        select.appendChild(
            option
        );

    }

}


/* =========================================================
   SET CURRENT MONTH
========================================================= */

function setCurrentMonth() {

    const select =
        adminElement(
            "dashboardMonth"
        );


    if (!select) {

        return;

    }


    const month =
        new Date().getMonth() + 1;


    select.value =
        month.toString();

}


/* =========================================================
   UPDATE USER
========================================================= */

function updateAdminUser() {

    const user =
        getAdminUser();


    if (!user) {

        return;

    }


    const name =
        user.fullName ||
        user.FullName ||
        user.name ||
        user.Name ||
        "Administrator";


    setAdminText(
        "adminUserName",
        name
    );

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadAdminDashboard() {

    if (!checkAdminAccess()) {

        return;

    }


    hideAdminError();

    showAdminLoading();


    const token =
        getAdminToken();


    const year =
        adminElement(
            "dashboardYear"
        )?.value;


    const month =
        adminElement(
            "dashboardMonth"
        )?.value;


    try {

        let url =
            `${ADMIN_API_BASE_URL}/admin/dashboard`;


        const params =
            new URLSearchParams();


        if (year) {

            params.append(
                "year",
                year
            );

        }


        if (month) {

            params.append(
                "month",
                month
            );

        }


        if (
            params.toString()
        ) {

            url +=
                "?" +
                params.toString();

        }


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        /* =================================================
           TOKEN EXPIRED
        ================================================== */

        if (
            response.status === 401 ||
            response.status === 403
        ) {

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


            alert(
                "Phien dang nhap da het han hoac ban khong co quyen Admin."
            );


            window.location.href =
                "../Account/Login.html";


            return;

        }


        if (!response.ok) {

            const errorData =
                await response
                    .json()
                    .catch(
                        () => null
                    );


            throw new Error(
                errorData?.message ||
                "Khong the tai Dashboard."
            );

        }


        const data =
            await response.json();


        console.log(
            "ADMIN DASHBOARD:",
            data
        );


        renderAdminDashboard(
            data
        );

    }
    catch (error) {

        console.error(
            "LOI ADMIN DASHBOARD:",
            error
        );


        showAdminError(
            error.message ||
            "Khong the ket noi den Server."
        );

    }
    finally {

        hideAdminLoading();

    }

}


/* =========================================================
   RENDER DASHBOARD
========================================================= */

function renderAdminDashboard(
    data
) {

    if (!data) {

        return;

    }


    /* =====================================================
       SUPPORT DIFFERENT JSON CASE
    ===================================================== */

    const totalRevenue =
        data.totalRevenue ??
        data.TotalRevenue ??
        0;


    const ticketsSold =
        data.ticketsSold ??
        data.TicketsSold ??
        0;


    const movieCount =
        data.movies ??
        data.Movies ??
        data.movieCount ??
        data.MovieCount ??
        0;


    const activeMovieCount =
        data.activeMovies ??
        data.ActiveMovies ??
        data.activeMovieCount ??
        data.ActiveMovieCount ??
        0;


    const cinemaCount =
        data.cinemas ??
        data.Cinemas ??
        data.cinemaCount ??
        data.CinemaCount ??
        0;


    const roomCount =
        data.rooms ??
        data.Rooms ??
        data.roomCount ??
        data.RoomCount ??
        0;


    const showtimeCount =
        data.showtimes ??
        data.Showtimes ??
        data.showtimeCount ??
        data.ShowtimeCount ??
        0;


    const userCount =
        data.users ??
        data.Users ??
        data.userCount ??
        data.UserCount ??
        0;


    const staffCount =
        data.staff ??
        data.Staff ??
        data.staffCount ??
        data.StaffCount ??
        0;


    const selectedYear =
        data.year ??
        data.Year ??
        adminElement(
            "dashboardYear"
        )?.value;


    const selectedMonth =
        data.month ??
        data.Month ??
        adminElement(
            "dashboardMonth"
        )?.value;


    /* =====================================================
       MAIN CARDS
    ===================================================== */

    setAdminText(
        "totalRevenue",
        formatAdminMoney(
            totalRevenue
        )
    );


    setAdminText(
        "ticketsSold",
        formatAdminNumber(
            ticketsSold
        )
    );


    setAdminText(
        "movieCount",
        formatAdminNumber(
            movieCount
        )
    );


    setAdminText(
        "activeMovieCount",
        formatAdminNumber(
            activeMovieCount
        )
    );


    setAdminText(
        "userCount",
        formatAdminNumber(
            userCount
        )
    );


    setAdminText(
        "staffCount",
        formatAdminNumber(
            staffCount
        )
    );


    /* =====================================================
       SMALL CARDS
    ===================================================== */

    setAdminText(
        "cinemaCount",
        formatAdminNumber(
            cinemaCount
        )
    );


    setAdminText(
        "roomCount",
        formatAdminNumber(
            roomCount
        )
    );


    setAdminText(
        "showtimeCount",
        formatAdminNumber(
            showtimeCount
        )
    );


    setAdminText(
        "staffCountSmall",
        formatAdminNumber(
            staffCount
        )
    );


    /* =====================================================
       SYSTEM
    ===================================================== */

    setAdminText(
        "systemActiveMovies",
        formatAdminNumber(
            activeMovieCount
        )
    );


    setAdminText(
        "systemCinemas",
        formatAdminNumber(
            cinemaCount
        )
    );


    setAdminText(
        "systemRooms",
        formatAdminNumber(
            roomCount
        )
    );


    setAdminText(
        "systemShowtimes",
        formatAdminNumber(
            showtimeCount
        )
    );


    setAdminText(
        "systemUsers",
        formatAdminNumber(
            userCount
        )
    );


    /* =====================================================
       REVENUE PANEL
    ===================================================== */

    setAdminText(
        "revenueNumber",
        formatAdminMoney(
            totalRevenue
        )
    );


    setAdminText(
        "revenueTicketText",
        `${formatAdminNumber(ticketsSold)} vé`
    );


    const period =
        selectedMonth &&
        selectedYear
            ? `Tháng ${selectedMonth}/${selectedYear}`
            : "Tháng hiện tại";


    setAdminText(
        "revenuePeriod",
        period
    );


    setAdminText(
        "selectedPeriod",
        period
    );


    /* =====================================================
       UPDATE REVENUE LINE
    ===================================================== */

    const revenueLine =
        document.querySelector(
            ".admin-revenue-line div"
        );


    if (revenueLine) {

        if (
            Number(totalRevenue) > 0
        ) {

            revenueLine.style.width =
                "70%";

        }
        else {

            revenueLine.style.width =
                "0%";

        }

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function adminLogout() {

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


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function setupAdminSidebar() {

    const button =
        adminElement(
            "adminMobileBtn"
        );


    const sidebar =
        adminElement(
            "adminSidebar"
        );


    const overlay =
        adminElement(
            "adminSidebarOverlay"
        );


    if (
        !button ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "show"
            );

            overlay.classList.toggle(
                "show"
            );

        }
    );


    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "show"
            );

            overlay.classList.remove(
                "show"
            );

        }
    );


    const menuItems =
        sidebar.querySelectorAll(
            ".admin-menu-item"
        );


    menuItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    sidebar.classList.remove(
                        "show"
                    );

                    overlay.classList.remove(
                        "show"
                    );

                }
            );

        }
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupAdminEvents() {

    const refreshButton =
        adminElement(
            "refreshDashboardBtn"
        );


    const applyButton =
        adminElement(
            "applyDashboardFilter"
        );


    const retryButton =
        adminElement(
            "adminRetryBtn"
        );


    const logoutButton =
        adminElement(
            "adminLogoutBtn"
        );


    const sidebarLogout =
        adminElement(
            "adminSidebarLogout"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadAdminDashboard
        );

    }


    if (applyButton) {

        applyButton.addEventListener(
            "click",
            loadAdminDashboard
        );

    }


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadAdminDashboard
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            adminLogout
        );

    }


    if (sidebarLogout) {

        sidebarLogout.addEventListener(
            "click",
            adminLogout
        );

    }

}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkAdminAccess()) {

            return;

        }


        createYearOptions();

        setCurrentMonth();

        updateAdminUser();

        setupAdminSidebar();

        setupAdminEvents();

        loadAdminDashboard();

    }
);