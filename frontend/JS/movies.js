const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";

let allMovies = [];

let selectedCinemaId =
    localStorage.getItem("selectedCinemaId");

let selectedCinema = null;


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSelectedCinema();

        loadMovies();

    }
);


// ==============================
// LOAD MOVIES
// ==============================

async function loadMovies() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/movies`
            );


        if (!response.ok) {

            throw new Error(
                "Khong the lay danh sach phim."
            );

        }


        allMovies =
            await response.json();


        console.log(
            "Danh sach phim tu database:",
            allMovies
        );


        displayMovies(
            allMovies
        );


    } catch (error) {

        console.error(
            "Loi:",
            error
        );


        const movieList =
            document.getElementById(
                "movieList"
            );


        if (movieList) {

            movieList.innerHTML = "";

        }


        const movieCount =
            document.getElementById(
                "movieCount"
            );


        if (movieCount) {

            movieCount.textContent =
                "Khong the tai phim";

        }


        const noMovie =
            document.getElementById(
                "noMovie"
            );


        if (noMovie) {

            noMovie.style.display =
                "block";

        }

    }

}


// ==============================
// DISPLAY MOVIES
// ==============================

function displayMovies(movies) {

    const container =
        document.getElementById(
            "movieList"
        );


    if (!container) {

        console.error(
            "Khong tim thay movieList."
        );

        return;

    }


    const noMovie =
        document.getElementById(
            "noMovie"
        );


    const movieCount =
        document.getElementById(
            "movieCount"
        );


    container.innerHTML = "";


    // ==========================
    // KHONG CO PHIM
    // ==========================

    if (
        !movies ||
        movies.length === 0
    ) {

        if (movieCount) {

            movieCount.textContent =
                "0 phim";

        }


        if (noMovie) {

            noMovie.style.display =
                "block";

        }


        return;

    }


    // ==========================
    // CO PHIM
    // ==========================

    if (noMovie) {

        noMovie.style.display =
            "none";

    }


    if (movieCount) {

        movieCount.textContent =
            `${movies.length} phim`;

    }


    // ==========================
    // TAO CARD PHIM
    // ==========================

    movies.forEach(
        movie => {

            const movieItem =
                document.createElement(
                    "div"
                );


            // GIU NGUYEN CLASS CU

            movieItem.className =
                "col-lg-3 col-md-6 movie-item";


            // ======================
            // DU LIEU
            // ======================

            const title =
                movie.title ||
                "Khong co ten";


            const description =
                movie.description ||
                "";


            const duration =
                movie.durationMinutes ||
                0;


            const genre =
                movie.genre ||
                "";


            const rating =
                movie.rating !== null &&
                movie.rating !== undefined
                    ? Number(movie.rating).toFixed(1)
                    : "0.0";


            // CHI TRUE MOI LA DANG HOAT DONG

            const isActive =
                movie.isActive === true;


            // ======================
            // DATA FILTER
            // ======================

            movieItem.dataset.name =
                title.toLowerCase();


            movieItem.dataset.genre =
                genre.toLowerCase();


            movieItem.dataset.status =
                isActive
                    ? "active"
                    : "inactive";


            // ======================
            // IMAGE
            // ======================

            let posterUrl =
                movie.posterUrl ||
                "";


            if (
                posterUrl.startsWith("/")
            ) {

                posterUrl =
                    BACKEND_URL +
                    posterUrl;

            }


            // ======================
            // MOVIE CARD
            // ======================

            movieItem.innerHTML = `

                <div class="movie-card">

                    <div class="movie-poster">

                        <img
                            src="${posterUrl}"
                            alt="${escapeHtml(title)}"
                            onerror="this.onerror=null; this.src='https://via.placeholder.com/300x450?text=No+Image';"
                        >

                        <span class="movie-status">

                            ${isActive
                                ? "ĐANG HOẠT ĐỘNG"
                                : "NGỪNG HOẠT ĐỘNG"}

                        </span>


                        <div class="movie-overlay">

                            <a
                                href="Details.html?id=${movie.id}"
                                class="movie-detail-btn"
                            >

                                <i class="bi bi-eye"></i>

                                Xem chi tiết

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

                                ${rating}

                            </span>

                        </div>


                        <p>

                            ${escapeHtml(description)}

                        </p>


                        <a
                            href="../Booking/Showtimes.html?movieId=${movie.id}"
                            class="btn-movie-book"
                        >

                            Đặt vé

                        </a>

                    </div>

                </div>

            `;


            container.appendChild(
                movieItem
            );

        }
    );

}


// ==============================
// SEARCH + FILTER
// ==============================

function filterMovies() {

    const searchInput =
        document.getElementById(
            "movieSearch"
        );


    const genreFilter =
        document.getElementById(
            "genreFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    // ==========================
    // TU KHOA TIM KIEM
    // ==========================

    const keyword =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    // ==========================
    // THE LOAI
    // ==========================

    const selectedGenre =
        genreFilter
            ? genreFilter.value
                .toLowerCase()
                .trim()
            : "";


    // ==========================
    // TRANG THAI
    // ==========================

    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    console.log(
        "=============================="
    );

    console.log(
        "Tu khoa tim kiem:",
        keyword
    );

    console.log(
        "The loai:",
        selectedGenre
    );

    console.log(
        "Trang thai:",
        selectedStatus
    );


    // ==========================
    // LOC PHIM
    // ==========================

    const filteredMovies =
        allMovies.filter(
            movie => {

                // ======================
                // TEN PHIM
                // ======================

                const title =
                    (
                        movie.title ||
                        ""
                    )
                    .toLowerCase()
                    .trim();


                const matchesSearch =
                    keyword === "" ||
                    title.includes(keyword);


                // ======================
                // THE LOAI
                // ======================

                const movieGenre =
                    (
                        movie.genre ||
                        ""
                    )
                    .toLowerCase()
                    .trim();


                const matchesGenre =
                    selectedGenre === "" ||
                    movieGenre.includes(
                        selectedGenre
                    );


                // ======================
                // TRANG THAI HOAT DONG
                // ======================

                const isActive =
                    movie.isActive === true;


                let matchesStatus = true;


                // Dang hoat dong

                if (
                    selectedStatus === "now" ||
                    selectedStatus === "active"
                ) {

                    matchesStatus =
                        isActive === true;

                }


                // Ngung hoat dong

                else if (
                    selectedStatus === "coming" ||
                    selectedStatus === "inactive"
                ) {

                    matchesStatus =
                        isActive === false;

                }


                // ======================
                // KET HOP CAC BO LOC
                // ======================

                return (
                    matchesSearch &&
                    matchesGenre &&
                    matchesStatus
                );

            }
        );


    console.log(
        "So phim sau khi loc:",
        filteredMovies.length
    );


    console.log(
        "Ket qua loc:",
        filteredMovies
    );


    // Hien thi ket qua

    displayMovies(
        filteredMovies
    );

}


// ==============================
// ESCAPE HTML
// ==============================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}


// ==============================
// SELECTED CINEMA
// ==============================

async function loadSelectedCinema() {

    if (!selectedCinemaId) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/cinemas/${selectedCinemaId}`
            );


        if (!response.ok) {

            return;

        }


        selectedCinema =
            await response.json();


        console.log(
            "Rap dang chon:",
            selectedCinema
        );


        displaySelectedCinema();


    }
    catch (error) {

        console.error(
            "Khong the tai thong tin rap:",
            error
        );

    }

}


// ==============================
// DISPLAY SELECTED CINEMA
// ==============================

function displaySelectedCinema() {

    const cinemaBox =
        document.getElementById(
            "selectedCinema"
        );


    if (
        !cinemaBox ||
        !selectedCinema
    ) {

        return;

    }


    cinemaBox.innerHTML = `

        <div class="selected-cinema-content">

            <i class="bi bi-building"></i>

            <div>

                <small>
                    Rap dang chon
                </small>

                <strong>

                    ${escapeHtml(
                        selectedCinema.name
                    )}

                </strong>

                <span>

                    <i class="bi bi-geo-alt"></i>

                    ${escapeHtml(
                        selectedCinema.address || ""
                    )}

                </span>

            </div>

        </div>


        <button
            type="button"
            onclick="changeCinema()"
            class="btn-change-cinema"
        >

            Đổi rạp

        </button>

    `;


    cinemaBox.style.display =
        "flex";

}


// ==============================
// CHANGE CINEMA
// ==============================

function changeCinema() {

    localStorage.removeItem(
        "selectedCinemaId"
    );

    localStorage.removeItem(
        "selectedCinema"
    );

    window.location.href =
        "../Cinema/Index.html";

}
    // ============================================================
// ============================================================
// QUAN LY PHIM ADMIN
// CHI CHAY KHI TRANG CO moviesTable
// KHONG ANH HUONG CODE CU CUA TRANG KHACH HANG
// ============================================================
// ============================================================


// ==============================
// ADMIN VARIABLES
// ==============================

let adminMovies = [];

let adminEditingMovieId = null;


// ==============================
// ADMIN DOM
// ==============================

const adminMoviesTable =
    document.getElementById("moviesTable");


// ==============================
// CHI KHOI DONG ADMIN
// ==============================

if (adminMoviesTable) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            adminCheckPermission();

            adminLoadUserInfo();

            adminLoadMovies();

            adminSetupEvents();

        }
    );

}


// ==============================
// CHECK ADMIN
// ==============================

function adminCheckPermission() {

    const token =
        localStorage.getItem("accessToken");


    if (!token) {

        window.location.href =
            "../Account/Login.html";

        return;

    }


    let currentUser = null;


    try {

        currentUser =
            JSON.parse(
                localStorage.getItem("currentUser")
            );

    }
    catch (error) {

        currentUser = null;

    }


    const roleFromStorage =
        localStorage.getItem("userRole");


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

    }

}


// ==============================
// LOAD ADMIN INFO
// ==============================

function adminLoadUserInfo() {

    try {

        const currentUser =
            JSON.parse(
                localStorage.getItem("currentUser")
            );


        if (!currentUser) {

            return;

        }


        const userName =
            document.getElementById(
                "adminUserName"
            );


        const userEmail =
            document.getElementById(
                "adminUserEmail"
            );


        if (userName) {

            userName.textContent =
                currentUser.fullName ||
                currentUser.name ||
                "Administrator";

        }


        if (userEmail) {

            userEmail.textContent =
                currentUser.email ||
                "admin@cinema.com";

        }

    }
    catch (error) {

        console.log(
            "Khong the tai thong tin admin."
        );

    }

}


// ==============================
// ADMIN EVENTS
// ==============================

function adminSetupEvents() {

    const addButton =
        document.getElementById(
            "addMovieBtn"
        );


    const closeButton =
        document.getElementById(
            "closeMovieModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelMovieBtn"
        );


    const movieForm =
        document.getElementById(
            "movieForm"
        );


    const search =
        document.getElementById(
            "movieSearch"
        );


    const poster =
        document.getElementById(
            "moviePosterUrl"
        );


    const logout =
        document.getElementById(
            "adminSidebarLogout"
        );


    // THEM PHIM

    if (addButton) {

        addButton.addEventListener(
            "click",
            adminOpenAddMovie
        );

    }


    // DONG MODAL

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            adminCloseMovieModal
        );

    }


    // HUY

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            adminCloseMovieModal
        );

    }


    // FORM

    if (movieForm) {

        movieForm.addEventListener(
            "submit",
            adminSaveMovie
        );

    }


    // TIM KIEM

    if (search) {

        search.addEventListener(
            "input",
            function () {

                adminRenderMovies(
                    search.value
                );

            }
        );

    }


    // POSTER PREVIEW

    if (poster) {

        poster.addEventListener(
            "input",
            adminPreviewPoster
        );

    }


    // LOGOUT

    if (logout) {

        logout.addEventListener(
            "click",
            adminLogout
        );

    }


    // CLICK NGOAI MODAL

    const modal =
        document.getElementById(
            "movieModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    adminCloseMovieModal();

                }

            }
        );

    }

}


// ==============================
// LOAD MOVIES ADMIN
// ==============================

async function adminLoadMovies() {

    const table =
        document.getElementById(
            "moviesTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML = `
        <tr>
            <td
                colspan="8"
                style="text-align:center;">
                Đang tải dữ liệu...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/movies`,
                {
                    method: "GET",
                    headers: adminGetHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminGetError(response)
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            adminMovies = data;

        }
        else if (
            Array.isArray(data.data)
        ) {

            adminMovies =
                data.data;

        }
        else if (
            Array.isArray(data.items)
        ) {

            adminMovies =
                data.items;

        }
        else {

            adminMovies = [];

        }


        adminRenderMovies(
            ""
        );

    }
    catch (error) {

        console.error(
            "Loi tai danh sach phim admin:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="
                        text-align:center;
                        color:#dc3545;
                        padding:25px;
                    ">
                    Không thể tải danh sách phim.
                    ${adminEscapeHtml(
                        error.message
                    )}
                </td>
            </tr>
        `;

    }

}


// ==============================
// RENDER ADMIN MOVIES
// ==============================

function adminRenderMovies(
    keyword = ""
) {

    const table =
        document.getElementById(
            "moviesTable"
        );


    if (!table) {

        return;

    }


    const search =
        String(keyword)
            .toLowerCase()
            .trim();


    const filtered =
        adminMovies.filter(
            function (movie) {

                const title =
                    String(
                        movie.title || ""
                    )
                    .toLowerCase();


                const genre =
                    String(
                        movie.genre || ""
                    )
                    .toLowerCase();


                const director =
                    String(
                        movie.director || ""
                    )
                    .toLowerCase();


                const actors =
                    String(
                        movie.actors || ""
                    )
                    .toLowerCase();


                return (
                    title.includes(search) ||
                    genre.includes(search) ||
                    director.includes(search) ||
                    actors.includes(search)
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:30px;
                    ">
                    Không tìm thấy phim nào.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        filtered
            .map(
                function (movie, index) {

                    return adminCreateMovieRow(
                        movie,
                        index + 1
                    );

                }
            )
            .join("");

}


// ==============================
// CREATE MOVIE ROW
// ==============================

function adminCreateMovieRow(
    movie,
    index
) {

    const isActive =
        movie.isActive === true;


    let poster =
        movie.posterUrl || "";


    if (
        poster.startsWith("/")
    ) {

        poster =
            BACKEND_URL +
            poster;

    }


    const posterHtml =
        poster
            ? `
                <img
                    src="${adminEscapeAttribute(
                        poster
                    )}"
                    class="movie-poster"
                    alt="Poster"
                    onerror="
                        this.style.display='none';
                    ">
              `
            : `
                <div
                    class="movie-poster"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#eee;
                    ">
                    🎬
                </div>
              `;


    const rating =
        movie.rating !== null &&
        movie.rating !== undefined
            ? Number(
                movie.rating
              ).toFixed(1)
            : "-";


    return `
        <tr>

            <td>
                ${index}
            </td>


            <td>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:12px;
                    ">

                    <div class="movie-poster-cell">

                        ${posterHtml}

                    </div>


                    <div>

                        <div class="movie-name">

                            ${adminEscapeHtml(
                                movie.title ||
                                "Chưa có tên"
                            )}

                        </div>


                        <div class="movie-description">

                            ${adminEscapeHtml(
                                movie.description ||
                                ""
                            )}

                        </div>

                    </div>

                </div>

            </td>


            <td>

                ${adminEscapeHtml(
                    movie.genre ||
                    "-"
                )}

            </td>


            <td>

                ${
                    movie.durationMinutes
                        ? movie.durationMinutes +
                          " phút"
                        : "-"
                }

            </td>


            <td>

                ${
                    adminFormatDate(
                        movie.releaseDate
                    )
                }

            </td>


            <td>

                <span class="movie-rating">

                    ⭐ ${rating}

                </span>

            </td>


            <td>

                ${
                    isActive

                        ? `
                            <span class="
                                movie-status
                                active
                            ">
                                Hoạt động
                            </span>
                          `

                        : `
                            <span class="
                                movie-status
                                inactive
                            ">
                                Ngừng hoạt động
                            </span>
                          `
                }

            </td>


            <td>

                <div class="movie-actions">


                    <button
                        type="button"
                        class="
                            movie-action-btn
                            movie-edit-btn
                        "
                        title="Sửa"
                        onclick="
                            adminEditMovie(
                                ${movie.id}
                            )
                        ">

                        ✎

                    </button>


                    <button
                        type="button"
                        class="
                            movie-action-btn
                            movie-status-btn
                        "
                        title="${
                            isActive
                                ? "Tắt phim"
                                : "Bật phim"
                        }"
                        onclick="
                            adminToggleMovie(
                                ${movie.id}
                            )
                        ">

                        ${
                            isActive
                                ? "◉"
                                : "○"
                        }

                    </button>


                    <button
                        type="button"
                        class="
                            movie-action-btn
                            movie-delete-btn
                        "
                        title="Xóa"
                        onclick="
                            adminDeleteMovie(
                                ${movie.id}
                            )
                        ">

                        🗑

                    </button>


                </div>

            </td>

        </tr>
    `;

}


// ==============================
// OPEN ADD
// ==============================

function adminOpenAddMovie() {

    adminEditingMovieId =
        null;


    const modal =
        document.getElementById(
            "movieModal"
        );


    const title =
        document.getElementById(
            "movieModalTitle"
        );


    const form =
        document.getElementById(
            "movieForm"
        );


    const active =
        document.getElementById(
            "movieIsActive"
        );


    const preview =
        document.getElementById(
            "moviePreview"
        );


    if (title) {

        title.textContent =
            "Thêm phim";

    }


    if (form) {

        form.reset();

    }


    if (active) {

        active.checked =
            true;

    }


    if (preview) {

        preview.style.display =
            "none";

    }


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// ==============================
// EDIT
// ==============================

function adminEditMovie(id) {

    const movie =
        adminMovies.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    if (!movie) {

        adminShowAlert(
            "Không tìm thấy phim.",
            "error"
        );

        return;

    }


    adminEditingMovieId =
        movie.id;


    document.getElementById(
        "movieId"
    ).value =
        movie.id;


    document.getElementById(
        "movieTitle"
    ).value =
        movie.title || "";


    document.getElementById(
        "movieDescription"
    ).value =
        movie.description || "";


    document.getElementById(
        "movieDuration"
    ).value =
        movie.durationMinutes || "";


    document.getElementById(
        "movieReleaseDate"
    ).value =
        movie.releaseDate
            ? String(
                movie.releaseDate
            ).substring(0, 10)
            : "";


    document.getElementById(
        "moviePosterUrl"
    ).value =
        movie.posterUrl || "";


    document.getElementById(
        "movieTrailerUrl"
    ).value =
        movie.trailerUrl || "";


    document.getElementById(
        "movieRating"
    ).value =
        movie.rating ?? "";


    document.getElementById(
        "movieGenre"
    ).value =
        movie.genre || "";


    document.getElementById(
        "movieDirector"
    ).value =
        movie.director || "";


    document.getElementById(
        "movieActors"
    ).value =
        movie.actors || "";


    document.getElementById(
        "movieIsActive"
    ).checked =
        movie.isActive === true;


    const title =
        document.getElementById(
            "movieModalTitle"
        );


    if (title) {

        title.textContent =
            "Chỉnh sửa phim";

    }


    adminPreviewPoster();


    const modal =
        document.getElementById(
            "movieModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// ==============================
// CLOSE MODAL
// ==============================

function adminCloseMovieModal() {

    const modal =
        document.getElementById(
            "movieModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }


    adminEditingMovieId =
        null;

}


// ==============================
// SAVE MOVIE
// ==============================

async function adminSaveMovie(
    event
) {

    event.preventDefault();


    const title =
        document.getElementById(
            "movieTitle"
        ).value.trim();


    const duration =
        Number(
            document.getElementById(
                "movieDuration"
            ).value
        );


    if (!title) {

        adminShowAlert(
            "Vui lòng nhập tên phim.",
            "error"
        );

        return;

    }


    if (
        !duration ||
        duration <= 0
    ) {

        adminShowAlert(
            "Thời lượng phim không hợp lệ.",
            "error"
        );

        return;

    }


    let rating = null;


    const ratingValue =
        document.getElementById(
            "movieRating"
        ).value;


    if (
        ratingValue !== ""
    ) {

        rating =
            Number(
                ratingValue
            );


        if (
            rating < 0 ||
            rating > 10
        ) {

            adminShowAlert(
                "Rating phải từ 0 đến 10.",
                "error"
            );

            return;

        }

    }


    const data = {

        title:
            title,

        description:
            document.getElementById(
                "movieDescription"
            ).value.trim(),

        durationMinutes:
            duration,

        releaseDate:
            document.getElementById(
                "movieReleaseDate"
            ).value ||
            null,

        posterUrl:
            document.getElementById(
                "moviePosterUrl"
            ).value.trim(),

        trailerUrl:
            document.getElementById(
                "movieTrailerUrl"
            ).value.trim(),

        rating:
            rating,

        genre:
            document.getElementById(
                "movieGenre"
            ).value.trim(),

        director:
            document.getElementById(
                "movieDirector"
            ).value.trim(),

        actors:
            document.getElementById(
                "movieActors"
            ).value.trim(),

        isActive:
            document.getElementById(
                "movieIsActive"
            ).checked

    };


    const isEdit =
        adminEditingMovieId !==
        null;


    const url =
        isEdit
            ? `${API_BASE_URL}/admin/movies/${adminEditingMovieId}`
            : `${API_BASE_URL}/admin/movies`;


    const method =
        isEdit
            ? "PUT"
            : "POST";


    const saveButton =
        document.getElementById(
            "saveMovieBtn"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
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
                        adminGetHeaders(
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
                await adminGetError(
                    response
                )
            );

        }


        adminCloseMovieModal();


        adminShowAlert(
            isEdit
                ? "Cập nhật phim thành công."
                : "Thêm phim thành công.",
            "success"
        );


        await adminLoadMovies();

    }
    catch (error) {

        console.error(
            "Loi luu phim:",
            error
        );


        adminShowAlert(
            error.message ||
            "Không thể lưu phim.",
            "error"
        );

    }
    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "Lưu";

        }

    }

}


// ==============================
// TOGGLE
// ==============================

async function adminToggleMovie(
    id
) {

    const movie =
        adminMovies.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    if (!movie) {

        return;

    }


    const isActive =
        movie.isActive === true;


    const action =
        isActive
            ? "tắt"
            : "bật";


    const confirmResult =
        confirm(
            `Bạn có chắc muốn ${action} phim "${movie.title}"?`
        );


    if (!confirmResult) {

        return;

    }


    const data = {

        title:
            movie.title || "",

        description:
            movie.description || "",

        durationMinutes:
            movie.durationMinutes || 1,

        releaseDate:
            movie.releaseDate
                ? String(
                    movie.releaseDate
                ).substring(0, 10)
                : null,

        posterUrl:
            movie.posterUrl || "",

        trailerUrl:
            movie.trailerUrl || "",

        rating:
            movie.rating ??
            null,

        genre:
            movie.genre || "",

        director:
            movie.director || "",

        actors:
            movie.actors || "",

        isActive:
            !isActive

    };


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/movies/${id}`,
                {
                    method:
                        "PUT",

                    headers:
                        adminGetHeaders(
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
                await adminGetError(
                    response
                )
            );

        }


        await adminLoadMovies();


        adminShowAlert(
            isActive
                ? "Đã tắt phim."
                : "Đã bật phim.",
            "success"
        );

    }
    catch (error) {

        adminShowAlert(
            error.message ||
            "Không thể thay đổi trạng thái phim.",
            "error"
        );

    }

}


// ==============================
// DELETE
// ==============================

async function adminDeleteMovie(
    id
) {

    const movie =
        adminMovies.find(
            function (item) {

                return Number(
                    item.id
                ) === Number(id);

            }
        );


    if (!movie) {

        return;

    }


    const confirmed =
        confirm(
            `Bạn có chắc muốn xóa phim "${movie.title}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/movies/${id}`,
                {
                    method:
                        "DELETE",

                    headers:
                        adminGetHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminGetError(
                    response
                )
            );

        }


        await adminLoadMovies();


        adminShowAlert(
            "Xóa phim thành công.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Loi xoa phim:",
            error
        );


        adminShowAlert(
            error.message ||
            "Không thể xóa phim.",
            "error"
        );

    }

}


// ==============================
// POSTER PREVIEW
// ==============================

function adminPreviewPoster() {

    const input =
        document.getElementById(
            "moviePosterUrl"
        );


    const preview =
        document.getElementById(
            "moviePreview"
        );


    const image =
        document.getElementById(
            "moviePreviewImage"
        );


    if (
        !input ||
        !preview ||
        !image
    ) {

        return;

    }


    const url =
        input.value.trim();


    if (!url) {

        preview.style.display =
            "none";

        return;

    }


    if (
        url.startsWith("/")
    ) {

        image.src =
            BACKEND_URL +
            url;

    }
    else {

        image.src =
            url;

    }


    preview.style.display =
        "block";

}


// ==============================
// ADMIN HEADERS
// ==============================

function adminGetHeaders(
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


// ==============================
// ERROR
// ==============================

async function adminGetError(
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

    }


    return `Lỗi HTTP ${response.status}`;

}


// ==============================
// ALERT
// ==============================

function adminShowAlert(
    message,
    type
) {

    const alertBox =
        document.getElementById(
            "moviesAlert"
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


// ==============================
// FORMAT DATE
// ==============================

function adminFormatDate(
    value
) {

    if (!value) {

        return "-";

    }


    const date =
        String(value)
            .substring(0, 10);


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return date;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]
    );

}


// ==============================
// ESCAPE HTML
// ==============================

function adminEscapeHtml(
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


// ==============================
// ESCAPE ATTRIBUTE
// ==============================

function adminEscapeAttribute(
    text
) {

    return adminEscapeHtml(
        text
    );

}


// ==============================
// LOGOUT
// ==============================

function adminLogout() {

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