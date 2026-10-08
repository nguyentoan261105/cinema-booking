/* =========================
   BOOKING HISTORY
========================= */

const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";


/* =========================
   ELEMENTS
========================= */

const bookingList =
    document.getElementById("bookingList");

const emptyBooking =
    document.getElementById("emptyBooking");

const filterButtons =
    document.querySelectorAll(".filter-button");


/* =========================
   DATA
========================= */

let bookings = [];


/* =========================
   FORMAT MONEY
========================= */

function formatMoney(value) {

    return Number(value || 0).toLocaleString("vi-VN") + " đ";

}


/* =========================
   FORMAT DATE
========================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "";
    }

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;

}


/* =========================
   FORMAT TIME
========================= */

function formatTime(dateValue) {

    if (!dateValue) {
        return "";
    }


    /*
        Neu API tra DateTime:

        2026-10-01T19:30:00
    */

    const date =
        new Date(dateValue);


    if (!isNaN(date.getTime())) {

        const hour =
            String(
                date.getHours()
            ).padStart(
                2,
                "0"
            );

        const minute =
            String(
                date.getMinutes()
            ).padStart(
                2,
                "0"
            );

        return `${hour}:${minute}`;

    }


    /*
        Truong hop API tra TimeSpan:

        19:30:00
    */

    if (
        typeof dateValue ===
        "string"
    ) {

        return dateValue.substring(
            0,
            5
        );

    }


    return "";

}


/* =========================
   GET CURRENT USER
========================= */

function getCurrentUser() {

    const currentUser =
        localStorage.getItem(
            "currentUser"
        );


    if (!currentUser) {
        return null;
    }


    try {

        return JSON.parse(
            currentUser
        );

    }
    catch (error) {

        console.error(
            "Khong doc duoc currentUser:",
            error
        );

        return null;

    }

}


/* =========================
   GET ACCESS TOKEN
========================= */

function getAccessToken() {

    return localStorage.getItem(
        "accessToken"
    );

}


/* =========================
   CHECK LOGIN
========================= */

function isLoggedIn() {

    const token =
        getAccessToken();

    const user =
        getCurrentUser();

    return !!token && !!user;

}


/* =========================
   GET BOOKING STATUS
========================= */

function getBookingStatus(booking) {

    const status =
        Number(
            booking.status
        );


    /*
        2 = Da huy
    */

    if (status === 2) {

        return "cancelled";

    }


    /*
        3 = Da su dung
    */

    if (status === 3) {

        return "completed";

    }


    /*
        0 = Chua thanh toan
    */

    if (status === 0) {

        return "upcoming";

    }


    /*
        1 = Da thanh toan

        Kiem tra thoi gian chieu
    */

    if (status === 1) {

        if (
            !booking.showtime ||
            !booking.showtime.startTime
        ) {

            return "upcoming";

        }


        const showTime =
            new Date(
                booking.showtime.startTime
            );


        if (
            !isNaN(
                showTime.getTime()
            )
        ) {

            const now =
                new Date();


            if (
                showTime < now
            ) {

                return "completed";

            }

        }


        return "upcoming";

    }


    return "upcoming";

}


/* =========================
   GET STATUS TEXT
========================= */

function getStatusText(booking) {

    const status =
        Number(
            booking.status
        );


    switch (status) {

        case 0:
            return "Chua thanh toan";

        case 1:
            return "Da thanh toan";

        case 2:
            return "Da huy";

        case 3:
            return "Da su dung";

        default:
            return "Khong xac dinh";

    }

}


/* =========================
   GET MOVIE
========================= */

function getBookingMovie(booking) {

    /*
        Truong hop API tra:

        booking.movie
    */

    if (
        booking &&
        booking.movie
    ) {

        return booking.movie;

    }


    /*
        Truong hop API tra:

        booking.showtime.movie
    */

    if (
        booking &&
        booking.showtime &&
        booking.showtime.movie
    ) {

        return booking.showtime.movie;

    }


    return null;

}


/* =========================
   GET POSTER URL
========================= */

function getPosterUrl(booking) {

    const movie =
        getBookingMovie(
            booking
        );


    /*
        Lay PosterUrl tu database
    */

    let poster =
        movie?.posterUrl ||
        movie?.PosterUrl ||
        "";


    if (!poster) {

        console.warn(
            "Booking khong co PosterUrl:",
            booking
        );

        return "";

    }


    poster =
        String(
            poster
        ).trim();


    /*
        ========================================
        Truong hop 1:
        http://...
        ========================================
    */

    if (
        poster.startsWith(
            "http://"
        ) ||
        poster.startsWith(
            "https://"
        )
    ) {

        return poster;

    }


    /*
        ========================================
        Truong hop 2:

        /images/movie-3.jpg

        => http://localhost:5126/images/movie-3.jpg
        ========================================
    */

    if (
        poster.startsWith("/")
    ) {

        return (
            BACKEND_URL +
            poster
        );

    }


    /*
        ========================================
        Truong hop 3:

        images/movie-3.jpg

        => http://localhost:5126/images/movie-3.jpg
        ========================================
    */

    if (
        poster.startsWith(
            "images/"
        )
    ) {

        return (
            BACKEND_URL +
            "/" +
            poster
        );

    }


    /*
        ========================================
        Truong hop 4:

        movie-3.jpg

        => http://localhost:5126/images/movie-3.jpg
        ========================================
    */

    return (
        BACKEND_URL +
        "/images/" +
        poster
    );

}


/* =========================
   LOAD BOOKING HISTORY
========================= */

async function loadBookingHistory() {

    /*
        =========================
        KIEM TRA DANG NHAP
        =========================
    */

    if (!isLoggedIn()) {

        bookingList.innerHTML = `

            <div class="alert alert-warning">

                <i class="bi bi-person-circle"></i>

                Vui long dang nhap de xem lich su dat ve.

            </div>

        `;

        emptyBooking.style.display =
            "none";

        return;

    }


    /*
        =========================
        LOADING
        =========================
    */

    bookingList.innerHTML = `

        <div class="text-center py-5">

            <div class="spinner-border"></div>

            <p class="mt-3">
                Dang tai lich su dat ve...
            </p>

        </div>

    `;


    try {

        const accessToken =
            getAccessToken();


        /*
            =========================
            GOI API BANG JWT
            =========================

            GET /api/bookings/history

            UserId duoc lay tu JWT.
        */

        const response =
            await fetch(
                `${API_BASE_URL}/bookings/history`,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        /*
            =========================
            TOKEN HET HAN
            =========================
        */

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
                "Phien dang nhap da het han. Vui long dang nhap lai."
            );


            window.location.href =
                "../Account/Login.html";


            return;

        }


        /*
            =========================
            KIEM TRA HTTP
            =========================
        */

        if (!response.ok) {

            const errorData =
                await response
                    .json()
                    .catch(
                        () => null
                    );


            throw new Error(
                errorData?.message ||
                "Khong the lay lich su dat ve."
            );

        }


        /*
            =========================
            DOC JSON
            =========================
        */

        const data =
            await response.json();


        console.log(
            "Du lieu lich su:",
            data
        );


        /*
            API tra:

            {
                success: true,
                count: ...,
                bookings: [...]
            }
        */

        if (!data.success) {

            throw new Error(
                data.message ||
                "Khong the lay lich su dat ve."
            );

        }


        bookings =
            data.bookings || [];


        /*
            =========================
            RENDER
            =========================
        */

        renderBookings(
            "all"
        );

    }
    catch (error) {

        console.error(
            "Loi lay lich su:",
            error
        );


        bookingList.innerHTML = `

            <div class="alert alert-danger">

                <i class="bi bi-exclamation-triangle"></i>

                Khong the tai lich su dat ve.

                <br>

                <small>
                    ${error.message}
                </small>

            </div>

        `;


        emptyBooking.style.display =
            "none";

    }

}


/* =========================
   RENDER BOOKINGS
========================= */

function renderBookings(
    filter = "all"
) {

    bookingList.innerHTML = "";


    /*
        =========================
        LOC BOOKING
        =========================
    */

    let filteredBookings =
        bookings;


    if (
        filter !== "all"
    ) {

        filteredBookings =
            bookings.filter(
                booking =>
                    getBookingStatus(
                        booking
                    ) === filter
            );

    }


    /*
        =========================
        KHONG CO BOOKING
        =========================
    */

    if (
        filteredBookings.length === 0
    ) {

        emptyBooking.style.display =
            "block";

        return;

    }


    emptyBooking.style.display =
        "none";


    /*
        =========================
        RENDER TUNG BOOKING
        =========================
    */

    filteredBookings.forEach(
        booking => {


            /* =====================
               CREATE CARD
            ===================== */

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "booking-card";


            /* =====================
               MOVIE
            ===================== */

            const movie =
                getBookingMovie(
                    booking
                );


            const movieTitle =
                movie?.title ||
                "Khong co ten phim";


            /* =====================
               POSTER
            ===================== */

            const poster =
                getPosterUrl(
                    booking
                );


            console.log(
                "Poster booking",
                booking.id,
                ":",
                poster
            );


            /* =====================
               CINEMA
            ===================== */

            const cinemaName =
                booking.cinema?.name ||
                booking.showtime?.room?.cinema?.name ||
                "";


            /* =====================
               ROOM
            ===================== */

            const roomName =
                booking.room?.name ||
                booking.showtime?.room?.name ||
                "";


            /* =====================
               DATE
            ===================== */

            const date =
                formatDate(
                    booking.showtime?.startTime
                );


            /* =====================
               TIME
            ===================== */

            const time =
                formatTime(
                    booking.showtime?.startTime
                );


            /* =====================
               SEATS
            ===================== */

            const seats =
                (booking.seats || [])
                    .map(
                        seat =>
                            seat.name ||
                            seat.seatNumber ||
                            ""
                    )
                    .filter(
                        seat =>
                            seat !== ""
                    )
                    .join(
                        ", "
                    );


            /* =====================
               STATUS
            ===================== */

            const status =
                getBookingStatus(
                    booking
                );


            const statusText =
                getStatusText(
                    booking
                );


            /* =====================
               DETAIL URL
            ===================== */

            const detailUrl =
                "Success.html" +
                "?bookingId=" +
                encodeURIComponent(
                    booking.id
                );


            /* =====================
               POSTER HTML
            ===================== */

            let posterHtml = "";


            if (poster) {

                posterHtml = `

                    <img
                        src="${poster}"
                        alt="${escapeHtml(movieTitle)}"
                        class="booking-poster-image"
                        onerror="handlePosterError(this)"
                    >

                `;

            }
            else {

                posterHtml = `

                    <div class="poster-placeholder">

                        <i class="bi bi-film"></i>

                        <span>
                            Khong co anh
                        </span>

                    </div>

                `;

            }


            /* =====================
               HTML
            ===================== */

            card.innerHTML = `

                <div class="booking-poster">

                    ${posterHtml}

                </div>


                <div class="booking-info">

                    <div class="booking-code">

                        ${escapeHtml(
                            booking.bookingCode || ""
                        )}

                    </div>


                    <h2>

                        ${escapeHtml(
                            movieTitle
                        )}

                    </h2>


                    <p>

                        <strong>Rap:</strong>

                        ${escapeHtml(
                            cinemaName
                        )}

                    </p>


                    <p>

                        <strong>Phong:</strong>

                        ${escapeHtml(
                            roomName
                        )}

                    </p>


                    <p>

                        <strong>Ngay:</strong>

                        ${date}

                    </p>


                    <p>

                        <strong>Suat:</strong>

                        ${time}

                    </p>


                    <p>

                        <strong>Ghe:</strong>

                        ${escapeHtml(
                            seats || "Khong co"
                        )}

                    </p>


                    <span
                        class="booking-status status-${status}"
                    >

                        ${statusText}

                    </span>

                </div>


                <div class="booking-right">

                    <div class="booking-price">

                        ${formatMoney(
                            booking.totalAmount
                        )}

                    </div>


                    <a
                        href="${detailUrl}"
                        class="detail-button"
                    >

                        Xem chi tiet

                    </a>

                </div>

            `;


            bookingList.appendChild(
                card
            );

        }
    );

}


/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}


/* =========================
   POSTER ERROR
========================= */

function handlePosterError(image) {

    console.error(
        "Khong tai duoc poster:",
        image.src
    );


    /*
        Khong hien icon anh bi loi.
    */

    image.style.display =
        "none";


    /*
        Tao placeholder
        neu anh bi loi.
    */

    const parent =
        image.parentElement;


    if (
        parent &&
        !parent.querySelector(
            ".poster-placeholder"
        )
    ) {

        const placeholder =
            document.createElement(
                "div"
            );


        placeholder.className =
            "poster-placeholder";


        placeholder.innerHTML = `

            <i class="bi bi-film"></i>

            <span>
                Khong tai duoc anh
            </span>

        `;


        parent.appendChild(
            placeholder
        );

    }

}


/* =========================
   FILTER
========================= */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {


                /*
                    Bo active tat ca button
                */

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                    Active button dang chon
                */

                this.classList.add(
                    "active"
                );


                /*
                    Lay filter
                */

                const filter =
                    this.dataset.filter;


                /*
                    Render lai
                */

                renderBookings(
                    filter
                );

            }
        );

    }
);


/* =========================
   START
========================= */

loadBookingHistory();