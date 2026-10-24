const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";

let movieId = 1;
let allShowtimes = [];
let selectedDate = "";
let selectedShowtime = null;
let selectedCinemaId = null;


// =====================================================
// KHI TRANG ĐƯỢC MỞ
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(
        window.location.search
    );

    // Lay movieId tu URL
    movieId =
        params.get("movieId") || "1";

    // Lay date tu URL
    const dateFromUrl =
        params.get("date");

    // Neu co ngay tu URL
    // thi giu nguyen ngay nay
    if (dateFromUrl) {

        selectedDate =
            dateFromUrl;

    }


    console.log(
        "Movie ID:",
        movieId
    );

    console.log(
        "Date:",
        selectedDate
    );


    loadShowtimes();

});


// =====================================================
// LOAD SUAT CHIEU
// =====================================================

async function loadShowtimes() {

    const apiUrl =
        `${API_BASE_URL}/showtimes/movie/${movieId}`;

    console.log(
        "API:",
        apiUrl
    );


    try {

        const response =
            await fetch(
                apiUrl,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "HTTP Status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "Du lieu nhan duoc:",
            data
        );


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            showNoShowtimes();

            return;

        }


        // Luu tat ca suat chieu
        allShowtimes = data;

        // Load thong tin phim
        loadMovieInfo();


        // Tao danh sach ngay
        createDateList();


        // =================================================
        // XU LY NGAY
        // =================================================

        const dates =
            getAvailableDates();

        if (dates.length === 0) {
            showNoShowtimes();
            return;
        }


        if (dates.length > 0) {

            // Neu Home da truyen ngay
            // va ngay nay co suat chieu
            if (
                selectedDate &&
                dates.includes(
                    selectedDate
                )
            ) {

                // Giu nguyen ngay da chon

                console.log(
                    "Giu ngay da chon:",
                    selectedDate
                );

            }
            else {

                // Neu khong co ngay tu URL
                // hoac ngay khong co suat
                // thi chon ngay dau tien

                selectedDate =
                    dates[0];

                console.log(
                    "Tu dong chon ngay:",
                    selectedDate
                );

            }

        }


        // Danh dau ngay dang chon
        setActiveDate();


        // Hien thi rap va suat chieu
        displayCinemas();


        // Cap nhat nut tiep tuc
        updateNextButton();

    }
    catch (error) {

        console.error(
            "LOI LOAD SUAT CHIEU:",
            error
        );


        const cinemaList =
            document.querySelector(
                ".cinema-list"
            );


        if (cinemaList) {

            cinemaList.innerHTML = `

                <div class="alert alert-danger">

                    <strong>
                        Không thể tải suất chiếu.
                    </strong>

                    <br>

                    <small>
                        ${escapeHtml(
                            error.message
                        )}
                    </small>

                </div>

            `;

        }

    }

}


// =====================================================
// LOAD THONG TIN PHIM
// =====================================================

function loadMovieInfo() {

    if (
        allShowtimes.length === 0
    ) {

        return;

    }


    const movie =
        allShowtimes[0].movie;


    if (!movie) {

        console.error(
            "Khong co thong tin movie."
        );

        return;

    }


    const movieTitle =
        document.getElementById(
            "movieTitle"
        );


    const movieDuration =
        document.getElementById(
            "movieDuration"
        );


    const moviePoster =
        document.getElementById(
            "moviePoster"
        );


    if (movieTitle) {

        movieTitle.textContent =
            movie.title;

    }


    if (movieDuration) {

        movieDuration.textContent =
            movie.durationMinutes +
            " phút";

    }


    if (moviePoster) {

        let poster =
            movie.posterUrl;


        if (
            poster &&
            poster.startsWith("/")
        ) {

            poster =
                BACKEND_URL +
                poster;

        }


        if (poster) {

            moviePoster.src =
                poster;

        }

    }

}


// =====================================================
// LAY DANH SACH NGAY
// =====================================================

function getAvailableDates() {

    const dates = [];


    allShowtimes.forEach(
        function (showtime) {

            const date =
                getDateOnly(
                    showtime.startTime
                );

            if (isPastDate(date)) {
                return;
            }


            if (
                !dates.includes(
                    date
                )
            ) {

                dates.push(
                    date
                );

            }

        }
    );


    dates.sort();


    return dates;

}


// =====================================================
// TAO DANH SACH NGAY
// =====================================================

function createDateList() {

    const dateList =
        document.getElementById(
            "dateList"
        );


    if (!dateList) {

        console.error(
            "Khong tim thay #dateList"
        );

        return;

    }


    dateList.innerHTML = "";


    const dates =
        getAvailableDates();


    dates.forEach(
        function (date) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "date-item";


            button.dataset.date =
                date;


            const dateObject =
                new Date(
                    date +
                    "T00:00:00"
                );


            const day =
                String(
                    dateObject.getDate()
                ).padStart(
                    2,
                    "0"
                );


            const month =
                dateObject.getMonth() +
                1;


            const weekday =
                getWeekday(
                    dateObject
                );


            button.innerHTML = `

                <strong>
                    ${day}
                </strong>

                <span>
                    ${weekday}
                </span>

                <small>
                    Tháng ${month}
                </small>

            `;


            button.addEventListener(
                "click",
                function () {

                    selectedDate =
                        date;


                    selectedShowtime =
                        null;


                    setActiveDate();


                    displayCinemas();


                    updateNextButton();

                }
            );


            dateList.appendChild(
                button
            );

        }
    );

}


// =====================================================
// DANH DAU NGAY DANG CHON
// =====================================================

function setActiveDate() {

    document
        .querySelectorAll(
            ".date-item"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.date ===
                    selectedDate
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );

}


// =====================================================
// HIEN THI RAP
// =====================================================

function displayCinemas() {

    const cinemaList =
        document.querySelector(
            ".cinema-list"
        );


    if (!cinemaList) {

        console.error(
            "Khong tim thay .cinema-list"
        );

        return;

    }


    cinemaList.innerHTML = "";


    // Loc suat theo ngay dang chon
    const showtimes =
        allShowtimes.filter(
            function (showtime) {

                return (
                    getDateOnly(
                        showtime.startTime
                    ) ===
                    selectedDate
                );

            }
        );


    console.log(
        "Ngay dang chon:",
        selectedDate
    );


    console.log(
        "Suat cua ngay:",
        showtimes
    );


    if (
        showtimes.length === 0
    ) {

        cinemaList.innerHTML = `

            <div class="alert alert-warning">

                Ngày này chưa có suất chiếu.

            </div>

        `;

        return;

    }


    // =================================================
    // GROUP THEO PHONG TRONG TUNG RAP
    // =================================================

    const roomGroups = {};


    showtimes.forEach(
        function (showtime) {

            if (!showtime.cinema) {

                return;

            }


            const roomId =
                showtime.room
                    ? showtime.room.id
                    : "unknown";

            const groupId =
                `${showtime.cinema.id}-${roomId}`;


            if (
                !roomGroups[groupId]
            ) {

                roomGroups[groupId] = {

                    cinemaId:
                        String(showtime.cinema.id),

                    roomName:
                        showtime.room
                            ? showtime.room.name
                            : "Phòng chiếu",

                    showtimes: []

                };

            }


            roomGroups[
                groupId
            ]
                .showtimes
                .push(
                    showtime
                );

        }
    );


    // =================================================
    // TAO GIAO DIEN PHONG CHIEU
    // =================================================

    const cinemas = Array.from(
        new Map(
            showtimes
                .filter(showtime => showtime.cinema)
                .map(showtime => [
                    String(showtime.cinema.id),
                    showtime.cinema
                ])
        ).values()
    );

    if (cinemas.length === 0) {
        cinemaList.innerHTML = `
            <div class="alert alert-warning">
                Ngày này chưa có rạp nào mở suất chiếu.
            </div>
        `;
        return;
    }

    const preferredCinemaId =
        selectedCinemaId ||
        localStorage.getItem("selectedCinemaId");
    const selectedCinema =
        cinemas.find(cinema =>
            String(cinema.id) === String(preferredCinemaId)
        ) || cinemas[0];

    selectedCinemaId = String(selectedCinema.id);

    const cinemaPicker =
        document.createElement("div");
    cinemaPicker.className = "cinema-picker mb-4";

    const cinemaLabel =
        document.createElement("label");
    cinemaLabel.className = "form-label fw-semibold";
    cinemaLabel.htmlFor = "showtimeCinemaSelect";
    cinemaLabel.textContent = "Chọn rạp";

    const cinemaSelect =
        document.createElement("select");
    cinemaSelect.id = "showtimeCinemaSelect";
    cinemaSelect.className = "form-select";

    cinemas.forEach(function (cinema) {
        const option =
            document.createElement("option");
        option.value = String(cinema.id);
        option.textContent = cinema.name;
        option.selected =
            String(cinema.id) === selectedCinemaId;
        cinemaSelect.appendChild(option);
    });

    const cinemaAddress =
        document.createElement("p");
    cinemaAddress.className = "text-muted mt-2 mb-0";
    cinemaAddress.textContent = selectedCinema.address || "";

    cinemaPicker.append(
        cinemaLabel,
        cinemaSelect,
        cinemaAddress
    );
    cinemaList.appendChild(cinemaPicker);

    cinemaSelect.addEventListener("change", function () {
        selectedCinemaId = cinemaSelect.value;
        localStorage.setItem("selectedCinemaId", selectedCinemaId);
        selectedShowtime = null;

        const selectedShowtimeElement =
            document.getElementById("selectedShowtime");
        if (selectedShowtimeElement) {
            selectedShowtimeElement.textContent =
                "Vui lòng chọn suất chiếu";
        }

        displayCinemas();
        updateNextButton();
    });

    const orderedRoomGroups =
        Object.values(roomGroups)
            .filter(room =>
                room.cinemaId === selectedCinemaId
            );

    orderedRoomGroups.forEach(function (room) {
        room.showtimes.sort(
            function (a, b) {
                return new Date(a.startTime) - new Date(b.startTime);
            }
        );
    });

    orderedRoomGroups.sort(function (a, b) {
        return a.roomName.localeCompare(b.roomName, "vi", {
            numeric: true
        });
    });

    orderedRoomGroups.forEach(
        function (room) {

            const cinemaItem =
                document.createElement(
                    "div"
                );


            cinemaItem.className =
                "cinema-item";


            cinemaItem.innerHTML = `

                <div class="cinema-info">

                    <div class="cinema-icon">

                        <i class="bi bi-door-open"></i>

                    </div>


                    <div>

                        <h4>
                            ${escapeHtml(room.roomName)}
                        </h4>

                    </div>

                </div>


                <div class="cinema-showtimes">

                </div>

            `;


            const timeContainer =
                cinemaItem.querySelector(
                    ".cinema-showtimes"
                );


            // Tao cac nut gio
            room.showtimes.forEach(
                function (showtime) {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "time-btn";


                    button.dataset.showtimeId =
                        showtime.id;


                    button.textContent =
                        formatTime(
                            showtime.startTime
                        );


                    button.addEventListener(
                        "click",
                        function () {

                            selectShowtime(
                                showtime,
                                button
                            );

                        }
                    );


                    timeContainer.appendChild(
                        button
                    );

                }
            );


            cinemaList.appendChild(
                cinemaItem
            );

        }
    );

}


// =====================================================
// CHON SUAT CHIEU
// =====================================================

function selectShowtime(
    showtime,
    button
) {

    document
        .querySelectorAll(
            ".time-btn"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    button.classList.add(
        "active"
    );


    selectedShowtime =
        showtime;

    if (showtime.cinema) {
        localStorage.setItem(
            "selectedCinemaId",
            showtime.cinema.id
        );
    }


    const selectedShowtimeElement =
        document.getElementById(
            "selectedShowtime"
        );


    if (selectedShowtimeElement) {

        const cinemaName =
            showtime.cinema
                ? showtime.cinema.name
                : "";


        const roomName =
            showtime.room
                ? showtime.room.name
                : "";


        selectedShowtimeElement.innerHTML = `

            <strong>
                ${escapeHtml(
                    cinemaName
                )}
            </strong>

            <span>

                ${escapeHtml(
                    roomName
                )}

                -

                ${formatDate(
                    showtime.startTime
                )}

                -

                ${formatTime(
                    showtime.startTime
                )}

            </span>

        `;

    }


    updateNextButton();

}


// =====================================================
// ENABLE / DISABLE NUT TIEP TUC
// =====================================================

function updateNextButton() {

    const button =
        document.getElementById(
            "continueButton"
        );


    if (!button) {

        return;

    }


    button.disabled =
        selectedShowtime === null;

}


// =====================================================
// DI DEN CHON GHE
// =====================================================

function continueBooking() {

    if (!selectedShowtime) {

        alert(
            "Vui lòng chọn suất chiếu."
        );

        return;

    }


    const url =
        "Seats.html?showtimeId=" +
        encodeURIComponent(
            selectedShowtime.id
        );


    console.log(
        "Chuyen den:",
        url
    );


    window.location.href =
        url;

}


// =====================================================
// LAY YYYY-MM-DD
// =====================================================

function getDateOnly(
    value
) {

    return String(
        value
    ).substring(
        0,
        10
    );

}


function isPastDate(value) {
    const today = new Date();
    const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    return getDateOnly(value) < todayDate;
}


// =====================================================
// FORMAT NGAY
// =====================================================

function formatDate(
    value
) {

    const parts =
        getDateOnly(
            value
        ).split("-");


    if (
        parts.length !== 3
    ) {

        return value;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


// =====================================================
// FORMAT GIO
// =====================================================

function formatTime(
    value
) {

    const text =
        String(value);


    // Xu ly ISO:
    // 2026-10-01T09:00:00
    if (
        text.includes("T")
    ) {

        return text.substring(
            11,
            16
        );

    }


    const date =
        new Date(value);


    return (
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        )
        +
        ":"
        +
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        )
    );

}


// =====================================================
// THU
// =====================================================

function getWeekday(
    date
) {

    const days = [

        "Chủ nhật",

        "Thứ 2",

        "Thứ 3",

        "Thứ 4",

        "Thứ 5",

        "Thứ 6",

        "Thứ 7"

    ];


    return days[
        date.getDay()
    ];

}


// =====================================================
// KHONG CO SUAT CHIEU
// =====================================================

function showNoShowtimes() {

    const dateList =
        document.getElementById(
            "dateList"
        );


    if (dateList) {

        dateList.innerHTML = `

            <div class="alert alert-warning">

                Phim này hiện chưa có suất chiếu
                trong các ngày sắp tới.

            </div>

        `;

    }


    const cinemaList =
        document.querySelector(
            ".cinema-list"
        );


    if (cinemaList) {

        cinemaList.innerHTML = `

            <div class="alert alert-warning">

                Phim này hiện chưa có suất chiếu
                trong các ngày sắp tới.

            </div>

        `;

    }


    const continueButton =
        document.getElementById(
            "continueButton"
        );


    if (continueButton) {

        continueButton.disabled =
            true;

    }

}


// =====================================================
// CHONG LOI HTML
// =====================================================

function escapeHtml(
    text
) {

    return String(
        text || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// BUTTON TIEP TUC
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const button =
            document.getElementById(
                "continueButton"
            );


        if (button) {

            button.addEventListener(
                "click",
                continueBooking
            );

        }

    }
);
// =====================================================
// =====================================================
// PHAN ADMIN - QUAN LY SUAT CHIEU
// Them vao CUOI file showtimes.js
// Khong anh huong phan khach hang o tren
// =====================================================
// =====================================================

const ADMIN_API_BASE_URL = "http://localhost:5126/api";

let adminShowtimes = [];
let adminMovies = [];
let adminCinemas = [];
let adminRooms = [];

let adminEditingShowtimeId = null;
let adminDeletingShowtimeId = null;


// =====================================================
// KIEM TRA CO PHAI TRANG ADMIN KHONG
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Trang Admin co showtimeTableBody
        const adminTable =
            document.getElementById(
                "showtimeTableBody"
            );


        // Neu khong co thi day la trang khach hang
        if (!adminTable) {

            return;

        }


        console.log(
            "Khoi dong quan ly suat chieu Admin..."
        );


        initAdminShowtimePage();

    }
);


// =====================================================
// KHOI TAO ADMIN
// =====================================================

async function initAdminShowtimePage() {

    adminSetupSidebar();

    adminSetupEvents();

    const token =
        adminGetToken();


    if (!token) {

        adminShowError(
            "Khong tim thay phien dang nhap Admin. Vui long dang nhap lai."
        );

        return;

    }


    await adminLoadAllData();

}


// =====================================================
// LAY TOKEN
// =====================================================

function adminGetToken() {

    return (
        localStorage.getItem(
            "accessToken"
        ) ||
        localStorage.getItem(
            "token"
        ) ||
        ""
    );

}


// =====================================================
// SIDEBAR ADMIN
// =====================================================

function adminSetupSidebar() {

    const mobileBtn =
        document.getElementById(
            "adminMobileBtn"
        );

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    const overlay =
        document.getElementById(
            "adminSidebarOverlay"
        );

    const logoutBtn =
        document.getElementById(
            "adminSidebarLogout"
        );


    if (
        mobileBtn &&
        sidebar
    ) {

        mobileBtn.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "show"
                );


                if (overlay) {

                    overlay.classList.toggle(
                        "show"
                    );

                }

            }
        );

    }


    if (
        overlay &&
        sidebar
    ) {

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

    }


}


// =====================================================
// SETUP SU KIEN
// =====================================================

function adminSetupEvents() {

    const addButton =
        document.getElementById(
            "addShowtimeBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            adminOpenAddModal
        );

    }


    const movieFilter =
        document.getElementById(
            "movieFilter"
        );

    const cinemaFilter =
        document.getElementById(
            "cinemaFilter"
        );

    const roomFilter =
        document.getElementById(
            "roomFilter"
        );

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    if (movieFilter) {

        movieFilter.addEventListener(
            "change",
            adminApplyFilters
        );

    }


    if (cinemaFilter) {

        cinemaFilter.addEventListener(
            "change",
            function () {

                adminLoadFilterRooms();

                adminApplyFilters();

            }
        );

    }


    if (roomFilter) {

        roomFilter.addEventListener(
            "change",
            adminApplyFilters
        );

    }


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            adminApplyFilters
        );

    }


    const resetButton =
        document.getElementById(
            "resetFilterBtn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            adminResetFilters
        );

    }


    const form =
        document.getElementById(
            "showtimeForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            adminSaveShowtime
        );

    }


    const cinemaSelect =
        document.getElementById(
            "showtimeCinema"
        );


    if (cinemaSelect) {

        cinemaSelect.addEventListener(
            "change",
            function () {

                adminLoadModalRooms();

            }
        );

    }


    const roomSelect =
        document.getElementById(
            "showtimeRoom"
        );


    if (roomSelect) {

        roomSelect.addEventListener(
            "change",
            adminUpdateRoomInfo
        );

    }


    const closeButton =
        document.getElementById(
            "closeShowtimeModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelShowtimeBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            adminCloseShowtimeModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            adminCloseShowtimeModal
        );

    }


    const closeDeleteButton =
        document.getElementById(
            "closeDeleteShowtimeModal"
        );


    const cancelDeleteButton =
        document.getElementById(
            "cancelDeleteShowtimeBtn"
        );


    if (closeDeleteButton) {

        closeDeleteButton.addEventListener(
            "click",
            adminCloseDeleteModal
        );

    }


    if (cancelDeleteButton) {

        cancelDeleteButton.addEventListener(
            "click",
            adminCloseDeleteModal
        );

    }


    const confirmDeleteButton =
        document.getElementById(
            "confirmDeleteShowtimeBtn"
        );


    if (confirmDeleteButton) {

        confirmDeleteButton.addEventListener(
            "click",
            adminConfirmDelete
        );

    }


    const retryButton =
        document.getElementById(
            "showtimeRetryBtn"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            adminLoadAllData
        );

    }


    window.addEventListener(
        "click",
        function (event) {

            const modal =
                document.getElementById(
                    "showtimeModal"
                );

            const deleteModal =
                document.getElementById(
                    "deleteShowtimeModal"
                );


            if (
                modal &&
                event.target === modal
            ) {

                adminCloseShowtimeModal();

            }


            if (
                deleteModal &&
                event.target === deleteModal
            ) {

                adminCloseDeleteModal();

            }

        }
    );

}


// =====================================================
// LOAD TAT CA DU LIEU
// =====================================================

async function adminLoadAllData() {

    adminShowLoading(true);

    adminHideError();


    try {

        await Promise.all([

            adminLoadMovies(),

            adminLoadCinemas(),

            adminLoadRooms(),

            adminLoadShowtimes()

        ]);


        adminRenderMovieFilter();

        adminRenderCinemaFilter();

        adminLoadFilterRooms();

        adminRenderShowtimes(
            adminShowtimes
        );

    }
    catch (error) {

        console.error(
            "LOI ADMIN SHOWTIMES:",
            error
        );


        adminShowError(
            error.message ||
            "Khong the tai du lieu."
        );

    }
    finally {

        adminShowLoading(false);

    }

}


// =====================================================
// LOAD MOVIES
// =====================================================

async function adminLoadMovies() {

    const response =
        await adminFetch(
            "/admin/movies"
        );


    if (!response.ok) {

        throw new Error(
            await adminGetApiError(
                response,
                "Khong the tai danh sach phim."
            )
        );

    }


    adminMovies =
        await response.json();


    if (
        !Array.isArray(
            adminMovies
        )
    ) {

        adminMovies = [];

    }


    console.log(
        "Movies Admin:",
        adminMovies
    );

}


// =====================================================
// LOAD CINEMAS
// =====================================================

async function adminLoadCinemas() {

    const response =
        await adminFetch(
            "/admin/cinemas"
        );


    if (!response.ok) {

        throw new Error(
            await adminGetApiError(
                response,
                "Khong the tai danh sach rap."
            )
        );

    }


    adminCinemas =
        await response.json();


    if (
        !Array.isArray(
            adminCinemas
        )
    ) {

        adminCinemas = [];

    }


    console.log(
        "Cinemas Admin:",
        adminCinemas
    );

}


// =====================================================
// LOAD ROOMS
// =====================================================

async function adminLoadRooms() {

    const response =
        await adminFetch(
            "/admin/rooms"
        );


    if (!response.ok) {

        throw new Error(
            await adminGetApiError(
                response,
                "Khong the tai danh sach phong."
            )
        );

    }


    adminRooms =
        await response.json();


    if (
        !Array.isArray(
            adminRooms
        )
    ) {

        adminRooms = [];

    }


    console.log(
        "Rooms Admin:",
        adminRooms
    );

}


// =====================================================
// LOAD SHOWTIMES
// =====================================================

async function adminLoadShowtimes() {

    const response =
        await adminFetch(
            "/admin/showtimes"
        );


    if (!response.ok) {

        throw new Error(
            await adminGetApiError(
                response,
                "Khong the tai danh sach suat chieu."
            )
        );

    }


    adminShowtimes =
        await response.json();


    if (
        !Array.isArray(
            adminShowtimes
        )
    ) {

        adminShowtimes = [];

    }


    console.log(
        "Showtimes Admin:",
        adminShowtimes
    );

}


// =====================================================
// FETCH ADMIN API
// =====================================================

async function adminFetch(
    endpoint,
    options = {}
) {

    const token =
        adminGetToken();


    const headers = {

        ...(options.headers || {})

    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";

    }


    if (token) {

        headers["Authorization"] =
            "Bearer " + token;

    }


    return fetch(
        ADMIN_API_BASE_URL +
        endpoint,
        {
            ...options,
            headers: headers
        }
    );

}


// =====================================================
// API ERROR
// =====================================================

async function adminGetApiError(
    response,
    defaultMessage
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


        return defaultMessage;

    }
    catch {

        return defaultMessage;

    }

}


// =====================================================
// FILTER PHIM
// =====================================================

function adminRenderMovieFilter() {

    const select =
        document.getElementById(
            "movieFilter"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            Tat ca phim
        </option>

    `;


    adminMovies.forEach(
        function (movie) {

            select.innerHTML += `

                <option value="${movie.id}">
                    ${adminEscapeHtml(
                        movie.title ||
                        movie.name ||
                        ""
                    )}
                </option>

            `;

        }
    );

}


// =====================================================
// FILTER RAP
// =====================================================

function adminRenderCinemaFilter() {

    const select =
        document.getElementById(
            "cinemaFilter"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            Tat ca rap
        </option>

    `;


    adminCinemas.forEach(
        function (cinema) {

            select.innerHTML += `

                <option value="${cinema.id}">
                    ${adminEscapeHtml(
                        cinema.name ||
                        ""
                    )}
                </option>

            `;

        }
    );

}


// =====================================================
// FILTER PHONG
// =====================================================

function adminLoadFilterRooms() {

    const cinemaFilter =
        document.getElementById(
            "cinemaFilter"
        );

    const roomFilter =
        document.getElementById(
            "roomFilter"
        );


    if (!roomFilter) {

        return;

    }


    const cinemaId =
        cinemaFilter
            ? Number(
                cinemaFilter.value
            )
            : 0;


    roomFilter.innerHTML = `

        <option value="">
            Tat ca phong
        </option>

    `;


    let rooms =
        adminRooms;


    if (cinemaId) {

        rooms =
            adminRooms.filter(
                function (room) {

                    return Number(
                        room.cinemaId
                    ) === cinemaId;

                }
            );

    }


    rooms.forEach(
        function (room) {

            roomFilter.innerHTML += `

                <option value="${room.id}">
                    ${adminEscapeHtml(
                        room.name ||
                        ""
                    )}
                </option>

            `;

        }
    );

}


// =====================================================
// RENDER TABLE
// =====================================================

function adminRenderShowtimes(
    showtimes
) {

    const tbody =
        document.getElementById(
            "showtimeTableBody"
        );

    const empty =
        document.getElementById(
            "showtimeEmpty"
        );

    const count =
        document.getElementById(
            "showtimeCount"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !Array.isArray(
            showtimes
        )
    ) {

        showtimes = [];

    }


    if (count) {

        count.textContent =
            showtimes.length +
            " suat chieu";

    }


    if (
        showtimes.length === 0
    ) {

        if (empty) {

            empty.style.display =
                "block";

        }

        return;

    }


    if (empty) {

        empty.style.display =
            "none";

    }


    showtimes.forEach(
        function (
            showtime,
            index
        ) {

            const movieName =
                showtime.movieName ||
                adminGetMovieName(
                    showtime.movieId
                );


            const cinemaName =
                showtime.cinemaName ||
                adminGetCinemaName(
                    showtime.cinemaId
                );


            const roomName =
                showtime.roomName ||
                adminGetRoomName(
                    showtime.roomId
                );


            const totalSeats =
                Number(
                    showtime.totalSeats ||
                    0
                );


            const soldSeats =
                Number(
                    showtime.soldSeats ||
                    0
                );


            const availableSeats =
                Math.max(
                    0,
                    totalSeats -
                    soldSeats
                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <div class="fw-semibold">

                        ${adminEscapeHtml(
                            movieName
                        )}

                    </div>

                </td>


                <td>

                    ${adminEscapeHtml(
                        cinemaName
                    )}

                </td>


                <td>

                    <span class="cinema-room-badge">

                        <i class="bi bi-door-open"></i>

                        ${adminEscapeHtml(
                            roomName
                        )}

                    </span>

                </td>


                <td>

                    <div>

                        ${adminFormatDateTime(
                            showtime.startTime
                        )}

                    </div>

                    <small class="text-muted">

                        den

                        ${adminFormatTime(
                            showtime.endTime
                        )}

                    </small>

                </td>


                <td>

                    <strong>

                        ${adminFormatMoney(
                            showtime.basePrice
                        )}

                    </strong>

                </td>


                <td>

                    <strong>
                        ${soldSeats}
                        /
                        ${totalSeats}
                    </strong>

                    <br>

                    <small class="text-muted">

                        Con
                        ${availableSeats}

                    </small>

                </td>


                <td>

                    <div class="cinema-admin-actions">


                        <button
                            type="button"
                            class="table-action-btn edit-btn"
                            title="Sua"
                            onclick="adminEditShowtime(${showtime.id})"
                        >

                            <i class="bi bi-pencil-fill"></i>

                        </button>


                        <button
                            type="button"
                            class="table-action-btn delete-btn"
                            title="Xoa"
                            onclick="adminDeleteShowtime(${showtime.id})"
                        >

                            <i class="bi bi-trash-fill"></i>

                        </button>


                    </div>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


// =====================================================
// LOC
// =====================================================

function adminApplyFilters() {

    const movieFilter =
        document.getElementById(
            "movieFilter"
        );

    const cinemaFilter =
        document.getElementById(
            "cinemaFilter"
        );

    const roomFilter =
        document.getElementById(
            "roomFilter"
        );

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    const movieId =
        movieFilter
            ? movieFilter.value
            : "";


    const cinemaId =
        cinemaFilter
            ? cinemaFilter.value
            : "";


    const roomId =
        roomFilter
            ? roomFilter.value
            : "";


    const date =
        dateFilter
            ? dateFilter.value
            : "";


    const filtered =
        adminShowtimes.filter(
            function (showtime) {


                if (
                    movieId &&
                    Number(
                        showtime.movieId
                    ) !==
                    Number(movieId)
                ) {

                    return false;

                }


                if (
                    cinemaId &&
                    Number(
                        showtime.cinemaId
                    ) !==
                    Number(cinemaId)
                ) {

                    return false;

                }


                if (
                    roomId &&
                    Number(
                        showtime.roomId
                    ) !==
                    Number(roomId)
                ) {

                    return false;

                }


                if (date) {

                    const showtimeDate =
                        String(
                            showtime.startTime
                        ).substring(
                            0,
                            10
                        );


                    if (
                        showtimeDate !==
                        date
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    adminRenderShowtimes(
        filtered
    );

}


// =====================================================
// RESET FILTER
// =====================================================

function adminResetFilters() {

    const movieFilter =
        document.getElementById(
            "movieFilter"
        );

    const cinemaFilter =
        document.getElementById(
            "cinemaFilter"
        );

    const roomFilter =
        document.getElementById(
            "roomFilter"
        );

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    if (movieFilter) {

        movieFilter.value =
            "";

    }


    if (cinemaFilter) {

        cinemaFilter.value =
            "";

    }


    if (roomFilter) {

        roomFilter.innerHTML = `

            <option value="">
                Tat ca phong
            </option>

        `;

    }


    if (dateFilter) {

        dateFilter.value =
            "";

    }


    adminLoadFilterRooms();


    adminRenderShowtimes(
        adminShowtimes
    );

}


// =====================================================
// MO MODAL THEM
// =====================================================

function adminOpenAddModal() {

    adminEditingShowtimeId =
        null;


    const form =
        document.getElementById(
            "showtimeForm"
        );


    if (form) {

        form.reset();

    }


    const title =
        document.getElementById(
            "showtimeModalTitle"
        );


    if (title) {

        title.textContent =
            "Them suat chieu";

    }


    const id =
        document.getElementById(
            "showtimeId"
        );


    if (id) {

        id.value =
            "";

    }


    adminRenderModalMovies();

    adminRenderModalCinemas();


    const roomSelect =
        document.getElementById(
            "showtimeRoom"
        );


    if (roomSelect) {

        roomSelect.innerHTML = `

            <option value="">
                -- Chon phong --
            </option>

        `;

        roomSelect.disabled =
            true;

    }


    const roomInfo =
        document.getElementById(
            "showtimeRoomInfo"
        );


    if (roomInfo) {

        roomInfo.style.display =
            "none";

    }


    const modal =
        document.getElementById(
            "showtimeModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// =====================================================
// MOVIE MODAL
// =====================================================

function adminRenderModalMovies(
    selectedId = ""
) {

    const select =
        document.getElementById(
            "showtimeMovie"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- Chon phim --
        </option>

    `;


    adminMovies.forEach(
        function (movie) {

            select.innerHTML += `

                <option value="${movie.id}">
                    ${adminEscapeHtml(
                        movie.title ||
                        movie.name ||
                        ""
                    )}
                </option>

            `;

        }
    );


    if (selectedId) {

        select.value =
            selectedId;

    }

}


// =====================================================
// CINEMA MODAL
// =====================================================

function adminRenderModalCinemas(
    selectedId = ""
) {

    const select =
        document.getElementById(
            "showtimeCinema"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            -- Chon rap --
        </option>

    `;


    adminCinemas.forEach(
        function (cinema) {

            select.innerHTML += `

                <option value="${cinema.id}">
                    ${adminEscapeHtml(
                        cinema.name ||
                        ""
                    )}
                </option>

            `;

        }
    );


    if (selectedId) {

        select.value =
            selectedId;

    }

}


// =====================================================
// ROOM MODAL
// =====================================================

function adminLoadModalRooms(
    selectedId = ""
) {

    const cinemaSelect =
        document.getElementById(
            "showtimeCinema"
        );

    const roomSelect =
        document.getElementById(
            "showtimeRoom"
        );


    if (
        !cinemaSelect ||
        !roomSelect
    ) {

        return;

    }


    const cinemaId =
        Number(
            cinemaSelect.value
        );


    roomSelect.innerHTML = `

        <option value="">
            -- Chon phong --
        </option>

    `;


    if (!cinemaId) {

        roomSelect.disabled =
            true;

        return;

    }


    const rooms =
        adminRooms.filter(
            function (room) {

                return Number(
                    room.cinemaId
                ) === cinemaId;

            }
        );


    rooms.forEach(
        function (room) {

            roomSelect.innerHTML += `

                <option value="${room.id}">
                    ${adminEscapeHtml(
                        room.name ||
                        ""
                    )}
                </option>

            `;

        }
    );


    roomSelect.disabled =
        false;


    if (selectedId) {

        roomSelect.value =
            selectedId;

    }


    adminUpdateRoomInfo();

}


// =====================================================
// ROOM INFO
// =====================================================

function adminUpdateRoomInfo() {

    const roomSelect =
        document.getElementById(
            "showtimeRoom"
        );

    const roomInfo =
        document.getElementById(
            "showtimeRoomInfo"
        );

    const roomInfoText =
        document.getElementById(
            "showtimeRoomInfoText"
        );


    if (
        !roomSelect ||
        !roomInfo ||
        !roomInfoText
    ) {

        return;

    }


    const roomId =
        Number(
            roomSelect.value
        );


    const room =
        adminRooms.find(
            function (item) {

                return Number(
                    item.id
                ) === roomId;

            }
        );


    if (!room) {

        roomInfo.style.display =
            "none";

        return;

    }


    roomInfoText.textContent =
        "Phong " +
        (
            room.name ||
            ""
        ) +
        " - " +
        (
            room.rows ||
            0
        ) +
        " hang x " +
        (
            room.columns ||
            0
        ) +
        " cot";


    roomInfo.style.display =
        "flex";

}


// =====================================================
// SUA SUAT CHIEU
// =====================================================

async function adminEditShowtime(
    id
) {

    try {

        const response =
            await adminFetch(
                "/admin/showtimes/" +
                id
            );


        if (!response.ok) {

            throw new Error(
                await adminGetApiError(
                    response,
                    "Khong the lay thong tin suat chieu."
                )
            );

        }


        const showtime =
            await response.json();


        adminEditingShowtimeId =
            id;


        const title =
            document.getElementById(
                "showtimeModalTitle"
            );


        if (title) {

            title.textContent =
                "Sua suat chieu";

        }


        const hiddenId =
            document.getElementById(
                "showtimeId"
            );


        if (hiddenId) {

            hiddenId.value =
                id;

        }


        adminRenderModalMovies(
            showtime.movieId
        );


        adminRenderModalCinemas(
            showtime.cinemaId
        );


        adminLoadModalRooms(
            showtime.roomId
        );


        const start =
            document.getElementById(
                "showtimeStart"
            );


        const end =
            document.getElementById(
                "showtimeEnd"
            );


        const price =
            document.getElementById(
                "showtimePrice"
            );


        if (start) {

            start.value =
                adminToDateTimeLocal(
                    showtime.startTime
                );

        }


        if (end) {

            end.value =
                adminToDateTimeLocal(
                    showtime.endTime
                );

        }


        if (price) {

            price.value =
                showtime.basePrice;

        }


        const modal =
            document.getElementById(
                "showtimeModal"
            );


        if (modal) {

            modal.classList.add(
                "show"
            );

        }

    }
    catch (error) {

        console.error(
            error
        );


        adminShowAlert(
            error.message,
            "danger"
        );

    }

}


// =====================================================
// LUU SUAT CHIEU
// =====================================================

async function adminSaveShowtime(
    event
) {

    event.preventDefault();


    const movie =
        document.getElementById(
            "showtimeMovie"
        );

    const room =
        document.getElementById(
            "showtimeRoom"
        );

    const start =
        document.getElementById(
            "showtimeStart"
        );

    const end =
        document.getElementById(
            "showtimeEnd"
        );

    const price =
        document.getElementById(
            "showtimePrice"
        );


    const movieId =
        movie
            ? Number(
                movie.value
            )
            : 0;


    const roomId =
        room
            ? Number(
                room.value
            )
            : 0;


    const startValue =
        start
            ? start.value
            : "";


    const endValue =
        end
            ? end.value
            : "";


    const basePrice =
        price
            ? Number(
                price.value
            )
            : 0;


    if (!movieId) {

        adminShowAlert(
            "Vui long chon phim.",
            "danger"
        );

        return;

    }


    if (!roomId) {

        adminShowAlert(
            "Vui long chon phong.",
            "danger"
        );

        return;

    }


    if (
        !startValue ||
        !endValue
    ) {

        adminShowAlert(
            "Vui long nhap day du thoi gian.",
            "danger"
        );

        return;

    }


    if (
        basePrice <= 0
    ) {

        adminShowAlert(
            "Gia ve phai lon hon 0.",
            "danger"
        );

        return;

    }


    const startTime =
        adminConvertLocalDateTime(
            startValue
        );


    const endTime =
        adminConvertLocalDateTime(
            endValue
        );


    if (
        new Date(startTime) >=
        new Date(endTime)
    ) {

        adminShowAlert(
            "Thoi gian ket thuc phai lon hon thoi gian bat dau.",
            "danger"
        );

        return;

    }


    const requestData = {

        movieId:
            movieId,

        roomId:
            roomId,

        startTime:
            startTime,

        endTime:
            endTime,

        basePrice:
            basePrice

    };


    const isEdit =
        adminEditingShowtimeId !== null;


    const endpoint =
        isEdit
            ? "/admin/showtimes/" +
              adminEditingShowtimeId
            : "/admin/showtimes";


    const method =
        isEdit
            ? "PUT"
            : "POST";


    const saveButton =
        document.getElementById(
            "saveShowtimeBtn"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML = `

            <span
                class="spinner-border spinner-border-sm"
            ></span>

            Dang luu...

        `;

    }


    try {

        const response =
            await adminFetch(
                endpoint,
                {

                    method:
                        method,

                    body:
                        JSON.stringify(
                            requestData
                        )

                }
            );


        if (!response.ok) {

            throw new Error(
                await adminGetApiError(
                    response,
                    "Khong the luu suat chieu."
                )
            );

        }


        adminCloseShowtimeModal();


        await adminLoadShowtimes();


        adminApplyFilters();


        adminShowAlert(
            isEdit
                ? "Cap nhat suat chieu thanh cong."
                : "Them suat chieu thanh cong.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "LOI LUU SUAT CHIEU:",
            error
        );


        adminShowAlert(
            error.message,
            "danger"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML = `

                <i class="bi bi-check-lg"></i>

                Luu suat chieu

            `;

        }

    }

}


// =====================================================
// XOA SUAT CHIEU
// =====================================================

function adminDeleteShowtime(
    id
) {

    adminDeletingShowtimeId =
        id;


    const showtime =
        adminShowtimes.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    const info =
        document.getElementById(
            "deleteShowtimeInfo"
        );


    if (
        info &&
        showtime
    ) {

        const movieName =
            showtime.movieName ||
            adminGetMovieName(
                showtime.movieId
            );


        const roomName =
            showtime.roomName ||
            adminGetRoomName(
                showtime.roomId
            );


        info.textContent =
            movieName +
            " - " +
            roomName +
            " - " +
            adminFormatDateTime(
                showtime.startTime
            );

    }


    const modal =
        document.getElementById(
            "deleteShowtimeModal"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// =====================================================
// XAC NHAN XOA
// =====================================================

async function adminConfirmDelete() {

    if (
        !adminDeletingShowtimeId
    ) {

        return;

    }


    const button =
        document.getElementById(
            "confirmDeleteShowtimeBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML = `

            <span
                class="spinner-border spinner-border-sm"
            ></span>

            Dang xoa...

        `;

    }


    try {

        const response =
            await adminFetch(
                "/admin/showtimes/" +
                adminDeletingShowtimeId,
                {

                    method:
                        "DELETE"

                }
            );


        if (!response.ok) {

            throw new Error(
                await adminGetApiError(
                    response,
                    "Khong the xoa suat chieu."
                )
            );

        }


        adminCloseDeleteModal();


        await adminLoadShowtimes();


        adminApplyFilters();


        adminShowAlert(
            "Xoa suat chieu thanh cong.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "LOI XOA SUAT CHIEU:",
            error
        );


        adminCloseDeleteModal();


        adminShowAlert(
            error.message,
            "danger"
        );

    }
    finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML = `

                <i class="bi bi-trash"></i>

                Xoa suat chieu

            `;

        }

    }

}


// =====================================================
// DONG MODAL
// =====================================================

function adminCloseShowtimeModal() {

    const modal =
        document.getElementById(
            "showtimeModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    adminEditingShowtimeId =
        null;

}


// =====================================================
// DONG DELETE MODAL
// =====================================================

function adminCloseDeleteModal() {

    const modal =
        document.getElementById(
            "deleteShowtimeModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    adminDeletingShowtimeId =
        null;

}


// =====================================================
// TIM TEN PHIM
// =====================================================

function adminGetMovieName(
    id
) {

    const movie =
        adminMovies.find(
            function (movie) {

                return Number(
                    movie.id
                ) === Number(id);

            }
        );


    if (!movie) {

        return "Khong ro";

    }


    return (
        movie.title ||
        movie.name ||
        "Khong ro"
    );

}


// =====================================================
// TIM TEN RAP
// =====================================================

function adminGetCinemaName(
    id
) {

    const cinema =
        adminCinemas.find(
            function (cinema) {

                return Number(
                    cinema.id
                ) === Number(id);

            }
        );


    if (!cinema) {

        return "Khong ro";

    }


    return (
        cinema.name ||
        "Khong ro"
    );

}


// =====================================================
// TIM TEN PHONG
// =====================================================

function adminGetRoomName(
    id
) {

    const room =
        adminRooms.find(
            function (room) {

                return Number(
                    room.id
                ) === Number(id);

            }
        );


    if (!room) {

        return "Khong ro";

    }


    return (
        room.name ||
        "Khong ro"
    );

}


// =====================================================
// FORMAT TIEN
// =====================================================

function adminFormatMoney(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "vi-VN"
    ) + " đ";

}


// =====================================================
// FORMAT DATE TIME
// =====================================================

function adminFormatDateTime(
    value
) {

    if (!value) {

        return "-";

    }


    const text =
        String(value);


    const date =
        text.substring(
            0,
            10
        );


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return text;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0] +
        " " +
        adminFormatTime(
            value
        )
    );

}


// =====================================================
// FORMAT TIME
// =====================================================

function adminFormatTime(
    value
) {

    if (!value) {

        return "-";

    }


    const text =
        String(value);


    if (
        text.includes("T")
    ) {

        return text.substring(
            11,
            16
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return (
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        )
    );

}


// =====================================================
// DATETIME LOCAL
// =====================================================

function adminToDateTimeLocal(
    value
) {

    if (!value) {

        return "";

    }


    const text =
        String(value);


    if (
        text.includes("T")
    ) {

        return text.substring(
            0,
            16
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return (
        date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        ) +
        "T" +
        String(
            date.getHours()
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            date.getMinutes()
        ).padStart(
            2,
            "0"
        )
    );

}


// =====================================================
// CONVERT DATETIME LOCAL
// =====================================================

function adminConvertLocalDateTime(
    value
) {

    if (!value) {

        return null;

    }


    return value + ":00";

}


// =====================================================
// ESCAPE HTML
// =====================================================

function adminEscapeHtml(
    text
) {

    return String(
        text || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// LOADING
// =====================================================

function adminShowLoading(
    show
) {

    const loading =
        document.getElementById(
            "showtimeLoading"
        );


    if (!loading) {

        return;

    }


    loading.style.display =
        show
            ? "flex"
            : "none";

}


// =====================================================
// ERROR
// =====================================================

function adminShowError(
    message
) {

    const error =
        document.getElementById(
            "showtimeError"
        );

    const text =
        document.getElementById(
            "showtimeErrorText"
        );


    if (text) {

        text.textContent =
            message;

    }


    if (error) {

        error.style.display =
            "flex";

    }

}


function adminHideError() {

    const error =
        document.getElementById(
            "showtimeError"
        );


    if (error) {

        error.style.display =
            "none";

    }

}


// =====================================================
// ALERT
// =====================================================

function adminShowAlert(
    message,
    type = "success"
) {

    const alertBox =
        document.getElementById(
            "showtimeAlert"
        );

    const alertText =
        document.getElementById(
            "showtimeAlertText"
        );


    if (
        !alertBox ||
        !alertText
    ) {

        return;

    }


    alertText.textContent =
        message;


    alertBox.className =
        "admin-alert";


    if (
        type === "danger"
    ) {

        alertBox.classList.add(
            "admin-alert-danger"
        );

    }
    else {

        alertBox.classList.add(
            "admin-alert-success"
        );

    }


    alertBox.style.display =
        "flex";


    setTimeout(
        function () {

            alertBox.style.display =
                "none";

        },
        4000
    );

}
const logoutButton = document.getElementById("adminSidebarLogout");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        const confirmLogout = confirm("Bạn có chắc muốn đăng xuất?");

        if (confirmLogout) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();

            window.location.href = "../Account/Login.html";
        }
    });
}