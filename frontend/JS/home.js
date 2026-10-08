const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";

let allMovies = [];
let allCinemas = [];
let allShowtimes = [];


// =====================================================
// KHI TRANG ĐƯỢC MỞ
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    loadHomeData();

});


// =====================================================
// LOAD TOÀN BỘ DỮ LIỆU TRANG CHỦ
// =====================================================

async function loadHomeData() {

    try {

        const results = await Promise.all([
            fetch(`${API_BASE_URL}/movies`),
            fetch(`${API_BASE_URL}/cinemas`),
            fetch(`${API_BASE_URL}/showtimes`)
        ]);


        // =================================================
        // KIỂM TRA API
        // =================================================

        if (!results[0].ok) {
            throw new Error(
                "Khong the tai danh sach phim."
            );
        }

        if (!results[1].ok) {
            throw new Error(
                "Khong the tai danh sach rap."
            );
        }

        if (!results[2].ok) {
            throw new Error(
                "Khong the tai danh sach suat chieu."
            );
        }


        // =================================================
        // ĐỌC JSON
        // =================================================

        allMovies =
            await results[0].json();

        allCinemas =
            await results[1].json();

        allShowtimes =
            await results[2].json();


        console.log(
            "Movies:",
            allMovies
        );

        console.log(
            "Cinemas:",
            allCinemas
        );

        console.log(
            "Showtimes:",
            allShowtimes
        );


        // =================================================
        // HIỂN THỊ DỮ LIỆU
        // =================================================

        displayQuickBooking();

        displayMovies();

    }
    catch (error) {

        console.error(
            "LOI LOAD DU LIEU TRANG CHU:",
            error
        );

        showHomeError(
            error.message
        );

    }

}


// =====================================================
// HIỂN THỊ PHIM ĐANG CHIẾU
// =====================================================

function displayMovies() {

    const movieSection =
        document.querySelector(
            ".movie-section .row.g-4"
        );


    if (!movieSection) {

        console.error(
            "Khong tim thay khu vuc phim."
        );

        return;

    }


    movieSection.innerHTML = "";


    // =================================================
    // LỌC PHIM ACTIVE
    // =================================================

    let movies =
        allMovies.filter(function (movie) {

            if (
                typeof movie.isActive ===
                "boolean"
            ) {

                return movie.isActive;

            }

            return true;

        });


    // =================================================
    // CHỈ HIỂN THỊ 4 PHIM
    // =================================================

    movies =
        movies.slice(0, 4);


    if (
        movies.length === 0
    ) {

        movieSection.innerHTML = `

            <div class="col-12">

                <div class="alert alert-warning">

                    Hiện chưa có phim đang chiếu.

                </div>

            </div>

        `;

        return;

    }


    // =================================================
    // TẠO CARD PHIM
    // =================================================

    movies.forEach(function (movie) {

        const movieItem =
            document.createElement("div");


        movieItem.className =
            "col-lg-3 col-md-6";


        const title =
            movie.title ||
            "Khong co ten";


        const description =
            movie.description ||
            "";


        const duration =
            movie.durationMinutes ||
            0;


        let posterUrl =
            movie.posterUrl ||
            "";


        // =================================================
        // XỬ LÝ URL ẢNH
        // =================================================

        if (
            posterUrl.startsWith("/")
        ) {

            posterUrl =
                BACKEND_URL +
                posterUrl;

        }


        if (!posterUrl) {

            posterUrl =
                "https://via.placeholder.com/300x450?text=No+Image";

        }


        movieItem.innerHTML = `

            <div class="movie-card">

                <div class="movie-poster">

                    <img
                        src="${escapeHtml(posterUrl)}"
                        alt="${escapeHtml(title)}"
                        onerror="
                            this.onerror=null;
                            this.src='https://via.placeholder.com/300x450?text=No+Image';
                        "
                    >

                    <span class="movie-status">
                        ĐANG CHIẾU
                    </span>

                    <div class="movie-overlay">

                        <a
                            href="../Movies/Details.html?id=${movie.id}"
                            class="movie-detail-btn">

                            <i class="bi bi-info-circle"></i>

                            Chi tiết

                        </a>

                    </div>

                </div>


                <div class="movie-info">

                    <h4>
                        ${escapeHtml(title)}
                    </h4>


                    <div class="movie-meta">

                        <span>

                            <i class="bi bi-clock"></i>

                            ${duration} phút

                        </span>


                        <span>

                            <i class="bi bi-star-fill"></i>

                            0.0

                        </span>

                    </div>


                    <p>
                        ${escapeHtml(description)}
                    </p>


                    <a
                        href="../Booking/Showtimes.html?movieId=${movie.id}"
                        class="btn-movie-book">

                        Đặt vé

                    </a>

                </div>

            </div>

        `;


        movieSection.appendChild(
            movieItem
        );

    });

}


// =====================================================
// ĐẶT VÉ NHANH
// =====================================================

function displayQuickBooking() {

    const movieSelect =
        document.getElementById(
            "movieSelect"
        );


    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    const dateSelect =
        document.getElementById(
            "dateSelect"
        );


    if (!movieSelect) {
        return;
    }


    if (!cinemaSelect) {
        return;
    }


    if (!dateSelect) {
        return;
    }


    // =================================================
    // LOAD PHIM
    // =================================================

    movieSelect.innerHTML = `

        <option value="">
            Chọn phim
        </option>

    `;


    allMovies.forEach(function (movie) {

        const option =
            document.createElement("option");


        option.value =
            movie.id;


        option.textContent =
            movie.title;


        movieSelect.appendChild(
            option
        );

    });


    // =================================================
    // LOAD RẠP
    // =================================================

    cinemaSelect.innerHTML = `

        <option value="">
            Chọn rạp
        </option>

    `;


    allCinemas.forEach(function (cinema) {

        const option =
            document.createElement("option");


        option.value =
            cinema.id;


        option.textContent =
            cinema.name;


        cinemaSelect.appendChild(
            option
        );

    });


    // =================================================
    // LOAD NGÀY
    // =================================================

    loadAvailableDates();


    // =================================================
    // KHI CHỌN PHIM
    // =================================================

    movieSelect.addEventListener(
        "change",
        function () {

            loadCinemasByMovie();

            loadAvailableDates();

        }
    );


    // =================================================
    // KHI CHỌN RẠP
    // =================================================

    cinemaSelect.addEventListener(
        "change",
        function () {

            loadAvailableDates();

        }
    );

}


// =====================================================
// LOAD RẠP THEO PHIM
// =====================================================

function loadCinemasByMovie() {

    const movieSelect =
        document.getElementById(
            "movieSelect"
        );


    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    if (
        !movieSelect ||
        !cinemaSelect
    ) {

        return;

    }


    const movieId =
        Number(
            movieSelect.value
        );


    cinemaSelect.innerHTML = `

        <option value="">
            Chọn rạp
        </option>

    `;


    if (!movieId) {

        allCinemas.forEach(
            function (cinema) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    cinema.id;

                option.textContent =
                    cinema.name;

                cinemaSelect.appendChild(
                    option
                );

            }
        );

        return;

    }


    // =================================================
    // LẤY ID RẠP CÓ SUẤT CHIẾU PHIM
    // =================================================

    const cinemaIds = [];


    allShowtimes.forEach(
        function (showtime) {

            if (
                Number(showtime.movieId) !==
                movieId
            ) {

                return;

            }


            if (
                !showtime.cinema
            ) {

                return;

            }


            const cinemaId =
                Number(
                    showtime.cinema.id
                );


            if (
                !cinemaIds.includes(
                    cinemaId
                )
            ) {

                cinemaIds.push(
                    cinemaId
                );

            }

        }
    );


    // =================================================
    // HIỂN THỊ RẠP
    // =================================================

    allCinemas.forEach(
        function (cinema) {

            if (
                !cinemaIds.includes(
                    Number(cinema.id)
                )
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                cinema.id;


            option.textContent =
                cinema.name;


            cinemaSelect.appendChild(
                option
            );

        }
    );

}


// =====================================================
// LOAD NGÀY CÓ SUẤT CHIẾU
// =====================================================

function loadAvailableDates() {

    const movieSelect =
        document.getElementById(
            "movieSelect"
        );


    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    const dateSelect =
        document.getElementById(
            "dateSelect"
        );


    if (
        !movieSelect ||
        !cinemaSelect ||
        !dateSelect
    ) {

        return;

    }


    const movieId =
        Number(
            movieSelect.value
        );


    const cinemaId =
        Number(
            cinemaSelect.value
        );


    dateSelect.innerHTML = `

        <option value="">
            Chọn ngày
        </option>

    `;


    // =================================================
    // LỌC SUẤT CHIẾU
    // =================================================

    const dates = [];


    allShowtimes.forEach(
        function (showtime) {

            if (
                movieId &&
                Number(showtime.movieId) !==
                movieId
            ) {

                return;

            }


            if (
                cinemaId &&
                showtime.cinema &&
                Number(showtime.cinema.id) !==
                cinemaId
            ) {

                return;

            }


            const date =
                getDateOnly(
                    showtime.startTime
                );


            if (
                !dates.includes(date)
            ) {

                dates.push(date);

            }

        }
    );


    dates.sort();


    // =================================================
    // HIỂN THỊ NGÀY
    // =================================================

    dates.forEach(
        function (date) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                date;


            option.textContent =
                formatDate(date);


            dateSelect.appendChild(
                option
            );

        }
    );

}


// =====================================================
// TÌM SUẤT CHIẾU
// =====================================================

function searchShowtime() {

    const movieSelect =
        document.getElementById(
            "movieSelect"
        );


    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    const dateSelect =
        document.getElementById(
            "dateSelect"
        );


    const movieId =
        movieSelect
            ? movieSelect.value
            : "";


    const cinemaId =
        cinemaSelect
            ? cinemaSelect.value
            : "";


    const date =
        dateSelect
            ? dateSelect.value
            : "";


    // =================================================
    // KIỂM TRA
    // =================================================

    if (!movieId) {

        alert(
            "Vui lòng chọn phim."
        );

        return;

    }


    if (!cinemaId) {

        alert(
            "Vui lòng chọn rạp."
        );

        return;

    }


    if (!date) {

        alert(
            "Vui lòng chọn ngày."
        );

        return;

    }


    // =================================================
    // LƯU RẠP ĐÃ CHỌN
    // =================================================

    localStorage.setItem(
        "selectedCinemaId",
        cinemaId
    );


    // =================================================
    // CHUYỂN SANG TRANG SUẤT CHIẾU
    // =================================================

    const url =
        `../Booking/Showtimes.html?movieId=${encodeURIComponent(movieId)}&date=${encodeURIComponent(date)}`;


    console.log(
        "Chuyen den:",
        url
    );


    window.location.href =
        url;

}


// =====================================================
// LẤY YYYY-MM-DD
// =====================================================

function getDateOnly(value) {

    return String(
        value
    ).substring(
        0,
        10
    );

}


// =====================================================
// FORMAT NGÀY
// =====================================================

function formatDate(value) {

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
// ESCAPE HTML
// =====================================================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}


// =====================================================
// HIỂN THỊ LỖI
// =====================================================

function showHomeError(message) {

    console.error(
        message
    );


    const movieSection =
        document.querySelector(
            ".movie-section .row.g-4"
        );


    if (movieSection) {

        movieSection.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    Không thể tải dữ liệu từ hệ thống.

                    <br>

                    <small>
                        ${escapeHtml(message)}
                    </small>

                </div>

            </div>

        `;

    }

}