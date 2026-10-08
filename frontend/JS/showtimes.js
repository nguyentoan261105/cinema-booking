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

    // Lay cinemaId tu URL
    const cinemaIdFromUrl =
        params.get("cinemaId");

    // Lay date tu URL
    const dateFromUrl =
        params.get("date");


    // Neu co cinemaId tu URL
    // thi uu tien dung cinemaId nay
    if (cinemaIdFromUrl) {

        selectedCinemaId =
            cinemaIdFromUrl;

        // Luu lai de cac trang khac co the dung
        localStorage.setItem(
            "selectedCinemaId",
            cinemaIdFromUrl
        );

    }
    else {

        // Neu khong co cinemaId tren URL
        // thi lay tu localStorage
        selectedCinemaId =
            localStorage.getItem(
                "selectedCinemaId"
            );

    }


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
        "Cinema ID:",
        selectedCinemaId
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


        // =================================================
        // LOC THEO RAP
        // =================================================

        if (selectedCinemaId) {

            const cinemaId =
                Number(
                    selectedCinemaId
                );


            allShowtimes =
                allShowtimes.filter(
                    function (showtime) {

                        return (
                            showtime.cinema &&
                            Number(
                                showtime.cinema.id
                            ) === cinemaId
                        );

                    }
                );


            console.log(
                "Suat sau khi loc theo rap:",
                allShowtimes
            );


            if (
                allShowtimes.length === 0
            ) {

                showNoShowtimes();

                return;

            }

        }


        // Load thong tin phim
        loadMovieInfo();


        // Tao danh sach ngay
        createDateList();


        // =================================================
        // XU LY NGAY
        // =================================================

        const dates =
            getAvailableDates();


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
    // GROUP THEO RAP
    // =================================================

    const cinemaGroups = {};


    showtimes.forEach(
        function (showtime) {

            if (!showtime.cinema) {

                return;

            }


            const cinemaId =
                showtime.cinema.id;


            if (
                !cinemaGroups[cinemaId]
            ) {

                cinemaGroups[cinemaId] = {

                    id:
                        cinemaId,

                    name:
                        showtime.cinema.name,

                    address:
                        showtime.cinema.address,

                    showtimes: []

                };

            }


            cinemaGroups[
                cinemaId
            ]
                .showtimes
                .push(
                    showtime
                );

        }
    );


    // =================================================
    // TAO GIAO DIEN RAP
    // =================================================

    Object.values(
        cinemaGroups
    ).forEach(
        function (cinema) {

            const cinemaItem =
                document.createElement(
                    "div"
                );


            cinemaItem.className =
                "cinema-item";


            cinemaItem.innerHTML = `

                <div class="cinema-info">

                    <div class="cinema-icon">

                        <i class="bi bi-building"></i>

                    </div>


                    <div>

                        <h4>
                            ${escapeHtml(
                                cinema.name
                            )}
                        </h4>

                        <p>
                            ${escapeHtml(
                                cinema.address ||
                                ""
                            )}
                        </p>

                    </div>

                </div>


                <div class="cinema-showtimes">

                </div>

            `;


            const timeContainer =
                cinemaItem.querySelector(
                    ".cinema-showtimes"
                );


            // Sap xep gio
            cinema.showtimes.sort(
                function (a, b) {

                    return (
                        new Date(
                            a.startTime
                        ) -
                        new Date(
                            b.startTime
                        )
                    );

                }
            );


            // Tao cac nut gio
            cinema.showtimes.forEach(
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
                tại rạp đang chọn.

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
                tại rạp đang chọn.

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