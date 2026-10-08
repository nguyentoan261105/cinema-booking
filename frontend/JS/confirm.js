const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";

let showtimeId = null;
let movieId = null;
let date = null;
let time = null;
let cinema = null;
let seatsParam = null;
let foodParam = null;

let selectedSeats = [];
let foodProducts = {};

let ticketTotal = 0;
let foodTotal = 0;
let grandTotal = 0;

document.addEventListener("DOMContentLoaded", function () {

    /*
        KIEM TRA DANG NHAP
    */

    if (!isUserLoggedIn()) {

        alert("Vui long dang nhap de tiep tuc dat ve.");

        window.location.href =
            "../Account/Login.html";

        return;
    }


    /*
        LAY THONG TIN TAI KHOAN
    */

    fillCurrentUser();


    const params =
        new URLSearchParams(
            window.location.search
        );

    showtimeId =
        params.get("showtimeId");

    movieId =
        params.get("movieId");

    date =
        params.get("date");

    time =
        params.get("time");

    cinema =
        params.get("cinema");

    seatsParam =
        params.get("seats");

    foodParam =
        params.get("food");


    /*
        KIEM TRA SHOWTIME
    */

    if (!showtimeId) {

        alert("Khong tim thay suat chieu.");

        return;
    }


    /*
        LAY DANH SACH GHE
    */

    selectedSeats =
        seatsParam
            ? seatsParam
                .split(",")
                .filter(
                    x => x.trim() !== ""
                )
            : [];


    /*
        LOAD DU LIEU
    */

    loadConfirmData();


    /*
        NUT QUAY LAI
    */

    const backFoodButton =
        document.getElementById(
            "backFoodButton"
        );

    if (backFoodButton) {

        backFoodButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    createBookingUrl(
                        "Food.html"
                    );

            }
        );

    }


    /*
        NUT THANH TOAN
    */

    const paymentButton =
        document.getElementById(
            "paymentButton"
        );

    if (paymentButton) {

        paymentButton.addEventListener(
            "click",
            function () {

                goToPayment();

            }
        );

    }

});


/*
==================================================
KIEM TRA JWT
==================================================
*/

function isUserLoggedIn() {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    const currentUser =
        localStorage.getItem(
            "currentUser"
        );

    const isLoggedIn =
        localStorage.getItem(
            "isLoggedIn"
        );

    return (
        token &&
        currentUser &&
        isLoggedIn === "true"
    );

}


/*
==================================================
LAY USER DANG DANG NHAP
==================================================
*/

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
            "Loi doc currentUser:",
            error
        );

        return null;

    }

}


/*
==================================================
LAY ACCESS TOKEN
==================================================
*/

function getAccessToken() {

    return localStorage.getItem(
        "accessToken"
    );

}


/*
==================================================
TU DIEN THONG TIN USER
==================================================
*/

function fillCurrentUser() {

    const user =
        getCurrentUser();

    if (!user) {

        return;

    }


    const customerName =
        document.getElementById(
            "customerName"
        );

    const customerEmail =
        document.getElementById(
            "customerEmail"
        );

    const customerPhone =
        document.getElementById(
            "customerPhone"
        );


    if (
        customerName &&
        user.fullName
    ) {

        customerName.value =
            user.fullName;

    }


    if (
        customerEmail &&
        user.email
    ) {

        customerEmail.value =
            user.email;

    }


    if (
        customerPhone &&
        user.phone
    ) {

        customerPhone.value =
            user.phone;

    }

}


/*
==================================================
LOAD DU LIEU XAC NHAN
==================================================
*/

async function loadConfirmData() {

    try {

        /*
            LAY THONG TIN SUAT CHIEU
        */

        const showtimeResponse =
            await fetch(
                `${API_BASE_URL}/showtimes/${showtimeId}`
            );

        if (!showtimeResponse.ok) {

            throw new Error(
                "Khong the lay thong tin suat chieu."
            );

        }

        const showtime =
            await showtimeResponse.json();


        /*
            LAY THONG TIN GHE
        */

        const seatsResponse =
            await fetch(
                `${API_BASE_URL}/seats/showtime/${showtimeId}`
            );

        if (!seatsResponse.ok) {

            throw new Error(
                "Khong the lay thong tin ghe."
            );

        }

        const seatsData =
            await seatsResponse.json();


        /*
            LAY THONG TIN FOOD
        */

        const foodResponse =
            await fetch(
                `${API_BASE_URL}/foods`
            );

        if (!foodResponse.ok) {

            throw new Error(
                "Khong the lay danh sach do an."
            );

        }

        const foods =
            await foodResponse.json();


        /*
            LUU FOOD
        */

        foodProducts = {};

        foods.forEach(
            function (food) {

                foodProducts[
                    String(food.id)
                ] = {

                    id: food.id,

                    name: food.name,

                    price:
                        Number(food.price) || 0,

                    imageUrl:
                        food.imageUrl || ""

                };

            }
        );


        /*
            HIEN THONG TIN PHIM + RAP
        */

        displayShowtime(
            showtime
        );


        /*
            TINH TIEN GHE
        */

        calculateTicketPrice(
            seatsData.seats || []
        );


        /*
            HIEN FOOD
        */

        displayFood();


        /*
            TONG TIEN
        */

        calculateGrandTotal();

    }
    catch (error) {

        console.error(
            "Loi:",
            error
        );

        alert(
            "Khong the tai thong tin xac nhan dat ve."
        );

    }

}


/*
==================================================
HIEN THONG TIN SUAT CHIEU
==================================================
*/

function displayShowtime(showtime) {

    const movie =
        showtime.movie || {};

    const room =
        showtime.room || {};

    const cinemaInfo =
        showtime.cinema || {};


    /*
        MOVIE ID
    */

    if (movie.id) {

        movieId =
            movie.id;

    }


    /*
        TEN PHIM
    */

    const movieName =
        document.getElementById(
            "movieName"
        );

    if (movieName) {

        movieName.textContent =
            movie.title ||
            "Khong co ten phim";

    }


    /*
        POSTER
    */

    const moviePoster =
        document.getElementById(
            "moviePoster"
        );

    if (moviePoster) {

        let posterUrl =
            movie.posterUrl || "";

        if (
            posterUrl.startsWith("/")
        ) {

            posterUrl =
                BACKEND_URL +
                posterUrl;

        }

        if (!posterUrl) {

            posterUrl =
                "../../../images/movie-1.jpg";

        }

        moviePoster.src =
            posterUrl;

    }


    /*
        TEN RAP
    */

    const cinemaName =
        document.getElementById(
            "cinemaName"
        );

    if (cinemaName) {

        cinema =
            cinemaInfo.name || "";

        cinemaName.textContent =
            cinema || "-";

    }


    /*
        NGAY + GIO
    */

    const startTime =
        showtime.startTime;


    if (startTime) {

        date =
            formatDate(
                startTime
            );

        time =
            formatTime(
                startTime
            );

    }


    /*
        NGAY
    */

    const showDate =
        document.getElementById(
            "showDate"
        );

    if (showDate) {

        showDate.textContent =
            date || "-";

    }


    /*
        GIO
    */

    const showTime =
        document.getElementById(
            "showTime"
        );

    if (showTime) {

        showTime.textContent =
            time || "-";

    }


    /*
        GHE
    */

    const seatList =
        document.getElementById(
            "seatList"
        );

    if (seatList) {

        seatList.textContent =
            selectedSeats.length > 0
                ? selectedSeats.join(", ")
                : "-";

    }


    /*
        SO GHE
    */

    const ticketCount =
        document.getElementById(
            "ticketCount"
        );

    if (ticketCount) {

        ticketCount.textContent =
            selectedSeats.length;

    }

}


/*
==================================================
TINH TIEN VE
==================================================
*/

function calculateTicketPrice(apiSeats) {

    ticketTotal = 0;


    selectedSeats.forEach(
        function (seatName) {

            const seat =
                apiSeats.find(
                    function (item) {

                        return (
                            String(item.rowName) +
                            String(item.number)
                        ).toUpperCase()
                        ===
                        seatName.toUpperCase();

                    }
                );


            if (seat) {

                ticketTotal +=
                    Number(seat.price) || 0;

            }

        }
    );


    /*
        HIEN GIA VE
    */

    const ticketPrice =
        document.getElementById(
            "ticketPrice"
        );

    if (ticketPrice) {

        ticketPrice.textContent =
            formatMoney(
                ticketTotal
            );

    }


    /*
        HIEN TONG TIEN VE
    */

    const summaryTicketPrice =
        document.getElementById(
            "summaryTicketPrice"
        );

    if (summaryTicketPrice) {

        summaryTicketPrice.textContent =
            formatMoney(
                ticketTotal
            );

    }

}


/*
==================================================
HIEN FOOD
==================================================
*/

function displayFood() {

    const foodList =
        document.getElementById(
            "foodList"
        );


    if (!foodList) {

        return;

    }


    foodList.innerHTML = "";

    foodTotal = 0;


    /*
        KHONG CO FOOD
    */

    if (!foodParam) {

        showEmptyFood();

        updateFoodTotal();

        return;

    }


    const foodItems =
        foodParam
            .split(",")
            .filter(
                item =>
                    item.trim() !== ""
            );


    foodItems.forEach(
        function (item) {

            const parts =
                item.split(":");


            const foodId =
                parts[0];


            const quantity =
                parseInt(parts[1]) || 0;


            if (
                !foodProducts[foodId] ||
                quantity <= 0
            ) {

                return;

            }


            const product =
                foodProducts[foodId];


            const total =
                product.price *
                quantity;


            foodTotal +=
                total;


            /*
                TAO FOOD ITEM
            */

            const foodElement =
                document.createElement(
                    "div"
                );


            foodElement.className =
                "food-item";


            foodElement.innerHTML = `

                <div class="food-info">

                    <strong>
                        ${escapeHtml(
                            product.name
                        )}
                    </strong>

                    <span>
                        ${formatMoney(
                            product.price
                        )}
                        × ${quantity}
                    </span>

                </div>

                <strong>
                    ${formatMoney(
                        total
                    )}
                </strong>

            `;


            foodList.appendChild(
                foodElement
            );

        }
    );


    /*
        NEU KHONG CO FOOD HOP LE
    */

    if (foodTotal === 0) {

        showEmptyFood();

    }


    updateFoodTotal();

}


/*
==================================================
HIEN KHONG CO FOOD
==================================================
*/

function showEmptyFood() {

    const foodList =
        document.getElementById(
            "foodList"
        );


    if (!foodList) {

        return;

    }


    foodList.innerHTML = `

        <p class="empty-food">
            Khong co do an hoac thuc uong.
        </p>

    `;

}


/*
==================================================
UPDATE TONG TIEN FOOD
==================================================
*/

function updateFoodTotal() {

    const foodTotalElement =
        document.getElementById(
            "foodTotal"
        );


    if (foodTotalElement) {

        foodTotalElement.textContent =
            formatMoney(
                foodTotal
            );

    }


    const summaryFoodPrice =
        document.getElementById(
            "summaryFoodPrice"
        );


    if (summaryFoodPrice) {

        summaryFoodPrice.textContent =
            formatMoney(
                foodTotal
            );

    }

}


/*
==================================================
TONG TIEN
==================================================
*/

function calculateGrandTotal() {

    grandTotal =
        ticketTotal +
        foodTotal;


    const grandTotalElement =
        document.getElementById(
            "grandTotal"
        );


    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatMoney(
                grandTotal
            );

    }

}


/*
==================================================
DI DEN PAYMENT
==================================================
*/

function goToPayment() {

    /*
        KIEM TRA DANG NHAP
    */

    if (!isUserLoggedIn()) {

        alert(
            "Phien dang nhap khong ton tai. Vui long dang nhap lai."
        );

        window.location.href =
            "../Account/Login.html";

        return;

    }


    const customerNameElement =
        document.getElementById(
            "customerName"
        );

    const customerEmailElement =
        document.getElementById(
            "customerEmail"
        );

    const customerPhoneElement =
        document.getElementById(
            "customerPhone"
        );


    const customerName =
        customerNameElement
            ? customerNameElement.value.trim()
            : "";

    const customerEmail =
        customerEmailElement
            ? customerEmailElement.value.trim()
            : "";

    const customerPhone =
        customerPhoneElement
            ? customerPhoneElement.value.trim()
            : "";


    if (!customerName) {

        alert(
            "Vui long nhap ho ten."
        );

        if (customerNameElement) {

            customerNameElement.focus();

        }

        return;

    }


    if (!customerEmail) {

        alert(
            "Vui long nhap email."
        );

        if (customerEmailElement) {

            customerEmailElement.focus();

        }

        return;

    }


    if (!customerPhone) {

        alert(
            "Vui long nhap so dien thoai."
        );

        if (customerPhoneElement) {

            customerPhoneElement.focus();

        }

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    params.set(
        "customerName",
        customerName
    );

    params.set(
        "customerEmail",
        customerEmail
    );

    params.set(
        "customerPhone",
        customerPhone
    );


    window.location.href =
        "Payment.html?" +
        params.toString();

}


/*
==================================================
TAO URL BOOKING
==================================================
*/

function createBookingUrl(page) {

    const params =
        new URLSearchParams();


    if (showtimeId) {

        params.set(
            "showtimeId",
            showtimeId
        );

    }


    if (movieId) {

        params.set(
            "movieId",
            movieId
        );

    }


    if (date) {

        params.set(
            "date",
            date
        );

    }


    if (time) {

        params.set(
            "time",
            time
        );

    }


    if (cinema) {

        params.set(
            "cinema",
            cinema
        );

    }


    if (seatsParam) {

        params.set(
            "seats",
            seatsParam
        );

    }


    if (foodParam) {

        params.set(
            "food",
            foodParam
        );

    }


    return (
        page +
        "?" +
        params.toString()
    );

}


/*
==================================================
FORMAT MONEY
==================================================
*/

function formatMoney(value) {

    return new Intl.NumberFormat(
        "vi-VN",
        {
            style: "currency",
            currency: "VND"
        }
    ).format(
        Number(value) || 0
    );

}


/*
==================================================
FORMAT DATE
==================================================
*/

function formatDate(dateTime) {

    if (!dateTime) {

        return "-";

    }


    const date =
        new Date(
            dateTime
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return String(
        date.getDate()
    ).padStart(2, "0")
    + "/"
    + String(
        date.getMonth() + 1
    ).padStart(2, "0")
    + "/"
    + date.getFullYear();

}


/*
==================================================
FORMAT TIME
==================================================
*/

function formatTime(dateTime) {

    if (!dateTime) {

        return "-";

    }


    const date =
        new Date(
            dateTime
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return String(
        date.getHours()
    ).padStart(2, "0")
    + ":"
    + String(
        date.getMinutes()
    ).padStart(2, "0");

}


/*
==================================================
ESCAPE HTML
==================================================
*/

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text ?? "";

    return div.innerHTML;

}