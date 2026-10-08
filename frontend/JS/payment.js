const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";

let showtimeId = null;

let bookingInfo = {
    movieId: null,
    movieName: "",
    moviePoster: "",
    cinema: "",
    room: "",
    date: "",
    time: "",
    seats: [],
    foods: [],
    customerName: "",
    customerEmail: "",
    customerPhone: ""
};

let ticketTotal = 0;
let foodTotal = 0;
let grandTotal = 0;


// ========================================
// KHOI DONG
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // ========================================
        // KIEM TRA DANG NHAP
        // ========================================

        if (!isUserLoggedIn()) {

            alert(
                "Vui long dang nhap de tiep tuc thanh toan."
            );

            window.location.href =
                "../Account/Login.html";

            return;
        }


        // ========================================
        // LAY THONG TIN USER DANG DANG NHAP
        // ========================================

        const currentUser =
            getCurrentUser();

        if (!currentUser) {

            alert(
                "Khong tim thay thong tin tai khoan. Vui long dang nhap lai."
            );

            logoutUser();

            return;
        }


        // ========================================
        // LAY PARAM URL
        // ========================================

        const params =
            new URLSearchParams(
                window.location.search
            );

        showtimeId =
            params.get("showtimeId");

        bookingInfo.movieId =
            params.get("movieId");

        bookingInfo.date =
            params.get("date") || "";

        bookingInfo.time =
            params.get("time") || "";

        bookingInfo.cinema =
            params.get("cinema") || "";

        bookingInfo.seats =
            (params.get("seats") || "")
                .split(",")
                .map(function (x) {
                    return x.trim();
                })
                .filter(function (x) {
                    return x !== "";
                });


        // ========================================
        // LAY THONG TIN KHACH HANG
        // ========================================
        // Uu tien thong tin tu tai khoan dang nhap

        bookingInfo.customerName =
            currentUser.fullName || "";

        bookingInfo.customerEmail =
            currentUser.email || "";

        bookingInfo.customerPhone =
            currentUser.phone || "";


        // ========================================
        // LAY FOOD
        // ========================================

        const foodParam =
            params.get("food") || "";

        bookingInfo.foods =
            parseFoodParam(
                foodParam
            );


        // ========================================
        // LOAD DATA
        // ========================================

        loadPaymentData();

        setupPaymentMethods();

        setupButtons();

    }
);


// ========================================
// KIEM TRA DANG NHAP
// ========================================

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
        !!token &&
        !!currentUser &&
        isLoggedIn === "true"
    );
}


// ========================================
// LAY USER HIEN TAI
// ========================================

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


// ========================================
// LAY JWT TOKEN
// ========================================

function getAccessToken() {

    return localStorage.getItem(
        "accessToken"
    );
}


// ========================================
// DANG XUAT
// ========================================

function logoutUser() {

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


// ========================================
// LOAD DU LIEU
// ========================================

async function loadPaymentData() {

    try {

        if (!showtimeId) {

            alert(
                "Khong tim thay suat chieu."
            );

            return;
        }


        // ========================================
        // SHOWTIME
        // ========================================

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


        // ========================================
        // SEAT
        // ========================================

        const seatResponse =
            await fetch(
                `${API_BASE_URL}/seats/showtime/${showtimeId}`
            );

        if (!seatResponse.ok) {

            throw new Error(
                "Khong the lay thong tin ghe."
            );
        }

        const seatData =
            await seatResponse.json();


        // ========================================
        // FOOD
        // ========================================

        const foodResponse =
            await fetch(
                `${API_BASE_URL}/foods`
            );

        if (!foodResponse.ok) {

            throw new Error(
                "Khong the lay thong tin do an."
            );
        }

        const foods =
            await foodResponse.json();


        // ========================================
        // THONG TIN SHOWTIME
        // ========================================

        const movie =
            showtime.movie || {};

        const cinema =
            showtime.cinema || {};

        const room =
            showtime.room || {};


        bookingInfo.movieId =
            movie.id ||
            bookingInfo.movieId;

        bookingInfo.movieName =
            movie.title || "";

        bookingInfo.moviePoster =
            movie.posterUrl || "";

        bookingInfo.cinema =
            cinema.name ||
            bookingInfo.cinema;

        bookingInfo.room =
            room.name || "";

        bookingInfo.date =
            getDateFromDateTime(
                showtime.startTime
            );

        bookingInfo.time =
            getTimeFromDateTime(
                showtime.startTime
            );


        // ========================================
        // TINH TIEN GHE
        // ========================================

        const apiSeats =
            seatData.seats || [];

        ticketTotal = 0;


        bookingInfo.seats.forEach(
            function (seatName) {

                const seat =
                    apiSeats.find(
                        function (x) {

                            const name =
                                (x.rowName || "") +
                                (x.number || "");

                            return (
                                name.toUpperCase() ===
                                seatName.toUpperCase()
                            );
                        }
                    );


                if (seat) {

                    ticketTotal +=
                        Number(
                            seat.price
                        ) || 0;
                }
            }
        );


        // ========================================
        // TINH TIEN FOOD
        // ========================================

        foodTotal = 0;


        bookingInfo.foods.forEach(
            function (item) {

                const food =
                    foods.find(
                        function (x) {

                            return (
                                Number(x.id) ===
                                Number(item.foodId)
                            );
                        }
                    );


                if (food) {

                    item.name =
                        food.name || "";

                    item.price =
                        Number(
                            food.price
                        ) || 0;

                    item.total =
                        item.price *
                        item.quantity;

                    foodTotal +=
                        item.total;
                }
            }
        );


        // ========================================
        // TONG TIEN
        // ========================================

        grandTotal =
            ticketTotal +
            foodTotal;


        // ========================================
        // HIEN THI
        // ========================================

        displayPaymentInfo();

    }
    catch (error) {

        console.error(
            "Loi:",
            error
        );

        alert(
            "Khong the tai thong tin thanh toan."
        );
    }
}


// ========================================
// HIEN THI THONG TIN
// ========================================

function displayPaymentInfo() {

    const movieName =
        document.getElementById(
            "movieName"
        );

    const cinemaName =
        document.getElementById(
            "cinemaName"
        );

    const showDate =
        document.getElementById(
            "showDate"
        );

    const showTime =
        document.getElementById(
            "showTime"
        );

    const seatList =
        document.getElementById(
            "seatList"
        );

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

    const ticketTotalElement =
        document.getElementById(
            "ticketTotal"
        );

    const foodTotalElement =
        document.getElementById(
            "foodTotal"
        );

    const grandTotalElement =
        document.getElementById(
            "grandTotal"
        );


    // ========================================
    // PHIM
    // ========================================

    if (movieName) {

        movieName.textContent =
            bookingInfo.movieName ||
            "Khong co ten phim";
    }


    // ========================================
    // RAP
    // ========================================

    if (cinemaName) {

        cinemaName.textContent =
            bookingInfo.cinema +
            (
                bookingInfo.room
                    ? " - " +
                      bookingInfo.room
                    : ""
            );
    }


    // ========================================
    // NGAY
    // ========================================

    if (showDate) {

        showDate.textContent =
            formatDate(
                bookingInfo.date
            );
    }


    // ========================================
    // GIO
    // ========================================

    if (showTime) {

        showTime.textContent =
            bookingInfo.time || "";
    }


    // ========================================
    // GHE
    // ========================================

    if (seatList) {

        seatList.textContent =
            bookingInfo.seats.length > 0
                ? bookingInfo.seats.join(", ")
                : "Chua chon ghe";
    }


    // ========================================
    // KHACH HANG
    // ========================================

    setElementValue(
        customerName,
        bookingInfo.customerName,
        "Chua co thong tin"
    );

    setElementValue(
        customerEmail,
        bookingInfo.customerEmail,
        "Chua co thong tin"
    );

    setElementValue(
        customerPhone,
        bookingInfo.customerPhone,
        "Chua co thong tin"
    );


    // ========================================
    // TIEN VE
    // ========================================

    if (ticketTotalElement) {

        ticketTotalElement.textContent =
            formatMoney(
                ticketTotal
            );
    }


    // ========================================
    // TIEN FOOD
    // ========================================

    if (foodTotalElement) {

        foodTotalElement.textContent =
            formatMoney(
                foodTotal
            );
    }


    // ========================================
    // TONG TIEN
    // ========================================

    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatMoney(
                grandTotal
            );
    }
}


// ========================================
// SET GIA TRI CHO INPUT / SPAN / DIV / P
// ========================================

function setElementValue(
    element,
    value,
    defaultValue
) {

    if (!element) {
        return;
    }


    const finalValue =
        value || defaultValue;


    if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT"
    ) {

        element.value =
            value || "";
    }
    else {

        element.textContent =
            finalValue;
    }
}


// ========================================
// PHUONG THUC THANH TOAN
// ========================================

function setupPaymentMethods() {

    const methods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );

    const detailCard =
        document.getElementById(
            "paymentDetailCard"
        );


    methods.forEach(
        function (method) {

            method.addEventListener(
                "change",
                function () {

                    methods.forEach(
                        function (item) {

                            const parent =
                                item.closest(
                                    ".payment-method"
                                );

                            if (parent) {

                                parent.classList.remove(
                                    "active"
                                );
                            }
                        }
                    );


                    const currentParent =
                        method.closest(
                            ".payment-method"
                        );

                    if (currentParent) {

                        currentParent.classList.add(
                            "active"
                        );
                    }


                    showPaymentDetail(
                        method.value,
                        detailCard
                    );
                }
            );
        }
    );


    const checked =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (checked) {

        const parent =
            checked.closest(
                ".payment-method"
            );

        if (parent) {

            parent.classList.add(
                "active"
            );
        }


        showPaymentDetail(
            checked.value,
            detailCard
        );
    }
}


// ========================================
// CHI TIET THANH TOAN
// ========================================

function showPaymentDetail(
    method,
    detailCard
) {

    if (!detailCard) {
        return;
    }


    // ========================================
    // QR
    // ========================================

    if (method === "qr") {

        detailCard.innerHTML = `

            <div class="payment-detail">

                <h5>
                    <i class="bi bi-qr-code"></i>
                    Thanh toan QR
                </h5>

                <p>
                    Quet ma QR de thanh toan.
                </p>

                <div class="qr-box">

                    <img
                        src="../../../images/qr-payment.png"
                        alt="QR Payment"
                        onerror="
                            this.style.display='none';
                        "
                    >

                </div>

                <p class="small text-muted">
                    Day la phuong thuc thanh toan demo.
                </p>

            </div>

        `;

        return;
    }


    // ========================================
    // MOMO
    // ========================================

    if (method === "momo") {

        detailCard.innerHTML = `

            <div class="payment-detail">

                <h5>
                    <i class="bi bi-wallet2"></i>
                    Thanh toan MoMo
                </h5>

                <p>
                    Thanh toan qua vi MoMo.
                </p>

                <div class="alert alert-info">
                    Phuong thuc MoMo dang o che do demo.
                </div>

            </div>

        `;

        return;
    }


    // ========================================
    // VNPAY
    // ========================================

    if (method === "vnpay") {

        detailCard.innerHTML = `

            <div class="payment-detail">

                <h5>
                    <i class="bi bi-credit-card"></i>
                    Thanh toan VNPay
                </h5>

                <p>
                    Thanh toan qua cong thanh toan VNPay.
                </p>

                <div class="alert alert-info">
                    Phuong thuc VNPay dang o che do demo.
                </div>

            </div>

        `;

        return;
    }


    // ========================================
    // BANK
    // ========================================

    if (method === "bank") {

        detailCard.innerHTML = `

            <div class="payment-detail">

                <h5>
                    <i class="bi bi-bank"></i>
                    Chuyen khoan ngan hang
                </h5>

                <p>
                    Vui long chuyen khoan theo thong tin:
                </p>

                <div class="bank-info">

                    <p>
                        <strong>Ngan hang:</strong>
                        Vietcombank
                    </p>

                    <p>
                        <strong>So tai khoan:</strong>
                        0123456789
                    </p>

                    <p>
                        <strong>Chu tai khoan:</strong>
                        CINEMA BOOKING
                    </p>

                    <p>
                        <strong>Noi dung:</strong>
                        CINEMA
                    </p>

                </div>

                <div class="mb-3">

                    <label class="form-label">
                        Ma giao dich
                    </label>

                    <input
                        type="text"
                        id="bankTransactionCode"
                        class="form-control"
                        placeholder="Nhap ma giao dich"
                    >

                </div>

            </div>

        `;

        return;
    }


    // ========================================
    // CASH
    // ========================================

    if (method === "cash") {

        detailCard.innerHTML = `

            <div class="payment-detail">

                <h5>
                    <i class="bi bi-cash-stack"></i>
                    Thanh toan tai quay
                </h5>

                <div class="alert alert-warning">

                    Ban se thanh toan truc tiep
                    tai quay truoc khi xem phim.

                </div>

            </div>

        `;
    }
}


// ========================================
// BUTTON
// ========================================

function setupButtons() {

    const backButton =
        document.getElementById(
            "backButton"
        );

    const payButton =
        document.getElementById(
            "payButton"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                goBackToConfirm();

            }
        );
    }


    if (payButton) {

        payButton.addEventListener(
            "click",
            function () {

                createBooking();

            }
        );
    }
}


// ========================================
// QUAY LAI CONFIRM
// ========================================

function goBackToConfirm() {

    const params =
        new URLSearchParams();


    if (showtimeId) {

        params.set(
            "showtimeId",
            showtimeId
        );
    }


    if (bookingInfo.movieId) {

        params.set(
            "movieId",
            bookingInfo.movieId
        );
    }


    if (bookingInfo.date) {

        params.set(
            "date",
            bookingInfo.date
        );
    }


    if (bookingInfo.time) {

        params.set(
            "time",
            bookingInfo.time
        );
    }


    if (bookingInfo.cinema) {

        params.set(
            "cinema",
            bookingInfo.cinema
        );
    }


    if (bookingInfo.seats.length > 0) {

        params.set(
            "seats",
            bookingInfo.seats.join(",")
        );
    }


    if (bookingInfo.foods.length > 0) {

        params.set(
            "food",
            bookingInfo.foods
                .map(
                    function (x) {

                        return (
                            x.foodId +
                            ":" +
                            x.quantity
                        );
                    }
                )
                .join(",")
        );
    }


    // ========================================
    // GIU THONG TIN KHACH HANG
    // ========================================

    params.set(
        "customerName",
        bookingInfo.customerName
    );

    params.set(
        "customerEmail",
        bookingInfo.customerEmail
    );

    params.set(
        "customerPhone",
        bookingInfo.customerPhone
    );


    window.location.href =
        "../Booking/Confirm.html?" +
        params.toString();
}


// ========================================
// TAO BOOKING
// ========================================

async function createBooking() {

    // ========================================
    // KIEM TRA DANG NHAP
    // ========================================

    if (!isUserLoggedIn()) {

        alert(
            "Phien dang nhap da het. Vui long dang nhap lai."
        );

        window.location.href =
            "../Account/Login.html";

        return;
    }


    // ========================================
    // LAY USER HIEN TAI
    // ========================================

    const currentUser =
        getCurrentUser();

    const accessToken =
        getAccessToken();


    if (!currentUser || !accessToken) {

        alert(
            "Khong tim thay thong tin tai khoan. Vui long dang nhap lai."
        );

        logoutUser();

        return;
    }


    // ========================================
    // LAY INPUT
    // ========================================

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

    const payButton =
        document.getElementById(
            "payButton"
        );


    if (
        !customerName ||
        !customerEmail ||
        !customerPhone
    ) {

        alert(
            "Khong tim thay o thong tin khach hang."
        );

        return;
    }


    // ========================================
    // LAY GIA TRI
    // ========================================

    const name =
        getElementValue(
            customerName
        );

    const email =
        getElementValue(
            customerEmail
        );

    const phone =
        getElementValue(
            customerPhone
        );


    // ========================================
    // VALIDATE
    // ========================================

    if (!name) {

        alert(
            "Vui long nhap ho ten."
        );

        customerName.focus();

        return;
    }


    if (!email) {

        alert(
            "Vui long nhap email."
        );

        customerEmail.focus();

        return;
    }


    if (!isValidEmail(email)) {

        alert(
            "Email khong hop le."
        );

        customerEmail.focus();

        return;
    }


    if (!phone) {

        alert(
            "Vui long nhap so dien thoai."
        );

        customerPhone.focus();

        return;
    }


    if (!showtimeId) {

        alert(
            "Khong tim thay suat chieu."
        );

        return;
    }


    if (bookingInfo.seats.length === 0) {

        alert(
            "Ban chua chon ghe."
        );

        return;
    }


    // ========================================
    // PHUONG THUC THANH TOAN
    // ========================================

    const selectedMethod =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selectedMethod) {

        alert(
            "Vui long chon phuong thuc thanh toan."
        );

        return;
    }


    const paymentMethod =
        selectedMethod.value;


    // ========================================
    // BANK
    // ========================================

    if (paymentMethod === "bank") {

        const transactionCode =
            document.getElementById(
                "bankTransactionCode"
            );


        if (
            !transactionCode ||
            !transactionCode.value.trim()
        ) {

            alert(
                "Vui long nhap ma giao dich ngan hang."
            );


            if (transactionCode) {

                transactionCode.focus();

            }

            return;
        }
    }


    // ========================================
    // KIEM TRA EMAIL VOI TAI KHOAN
    // ========================================

    if (
        currentUser.email &&
        email.toLowerCase() !==
        currentUser.email.toLowerCase()
    ) {

        alert(
            "Email thanh toan phai trung voi email cua tai khoan dang dang nhap."
        );

        return;
    }


    // ========================================
    // REQUEST
    // ========================================

    const requestData = {

        showtimeId:
            Number(showtimeId),

        seats:
            bookingInfo.seats,

        foods:
            bookingInfo.foods.map(
                function (item) {

                    return {

                        foodId:
                            Number(
                                item.foodId
                            ),

                        quantity:
                            Number(
                                item.quantity
                            )
                    };
                }
            ),

        customerName:
            name,

        customerEmail:
            email,

        customerPhone:
            phone,

        paymentMethod:
            paymentMethod
    };


    try {

        if (payButton) {

            payButton.disabled =
                true;

            payButton.innerHTML = `

                <span
                    class="spinner-border spinner-border-sm me-2">
                </span>

                Dang xu ly...

            `;
        }


        // ========================================
        // GOI API BOOKING
        // ========================================

        const response =
            await fetch(
                `${API_BASE_URL}/bookings`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${accessToken}`
                    },

                    body:
                        JSON.stringify(
                            requestData
                        )
                }
            );


        // ========================================
        // DOC RESPONSE
        // ========================================

        let data = {};

        try {

            data =
                await response.json();

        }
        catch (error) {

            console.error(
                "Khong doc duoc response:",
                error
            );

        }


        // ========================================
        // JWT KHONG HOP LE
        // ========================================

        if (
            response.status === 401
        ) {

            alert(
                "Phien dang nhap da het. Vui long dang nhap lai."
            );

            logoutUser();

            return;
        }


        // ========================================
        // LOI
        // ========================================

        if (!response.ok) {

            if (
                response.status === 409 &&
                data.seats &&
                data.seats.length > 0
            ) {

                alert(
                    "Cac ghe sau da duoc dat:\n\n" +
                    data.seats.join(", ") +
                    "\n\nVui long quay lai chon ghe khac."
                );
            }
            else {

                alert(
                    data.message ||
                    "Khong the dat ve."
                );
            }


            if (payButton) {

                payButton.disabled =
                    false;

                payButton.innerHTML =
                    "Thanh toan";
            }

            return;
        }


        // ========================================
        // THANH CONG
        // ========================================

        const successParams =
            new URLSearchParams();


        // ========================================
        // BOOKING
        // ========================================

        successParams.set(
            "bookingId",
            data.bookingId || ""
        );

        successParams.set(
            "bookingCode",
            data.bookingCode || ""
        );

        successParams.set(
            "total",
            data.totalAmount ||
            grandTotal
        );


        // ========================================
        // MOVIE
        // ========================================

        successParams.set(
            "movieId",
            bookingInfo.movieId || ""
        );

        successParams.set(
            "movie",
            bookingInfo.movieName || ""
        );


        // ========================================
        // RAP
        // ========================================

        successParams.set(
            "cinema",
            bookingInfo.cinema || ""
        );

        successParams.set(
            "room",
            bookingInfo.room || ""
        );


        // ========================================
        // NGAY
        // ========================================

        successParams.set(
            "date",
            bookingInfo.date || ""
        );


        // ========================================
        // GIO
        // ========================================

        successParams.set(
            "time",
            bookingInfo.time || ""
        );


        // ========================================
        // GHE
        // ========================================

        successParams.set(
            "seats",
            bookingInfo.seats.join(",")
        );


        // ========================================
        // DO AN
        // ========================================

        const foodParam =
            bookingInfo.foods
                .map(
                    function (item) {

                        return (
                            Number(
                                item.foodId
                            ) +
                            ":" +
                            Number(
                                item.quantity
                            )
                        );
                    }
                )
                .join(",");


        successParams.set(
            "food",
            foodParam
        );


        // ========================================
        // KHACH HANG
        // ========================================

        successParams.set(
            "customerName",
            currentUser.fullName ||
            name
        );

        successParams.set(
            "customerEmail",
            currentUser.email ||
            email
        );

        successParams.set(
            "customerPhone",
            currentUser.phone ||
            phone
        );


        // ========================================
        // PHUONG THUC THANH TOAN
        // ========================================

        successParams.set(
            "paymentMethod",
            paymentMethod
        );


        // ========================================
        // CHUYEN SANG SUCCESS
        // ========================================

        window.location.href =
            "Success.html?" +
            successParams.toString();

    }
    catch (error) {

        console.error(
            "Booking error:",
            error
        );

        alert(
            "Khong ket noi duoc toi server."
        );


        if (payButton) {

            payButton.disabled =
                false;

            payButton.innerHTML =
                "Thanh toan";
        }
    }
}


// ========================================
// LAY GIA TRI ELEMENT
// ========================================

function getElementValue(element) {

    if (!element) {
        return "";
    }


    if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT"
    ) {

        return (
            element.value || ""
        ).trim();
    }


    return (
        element.textContent || ""
    ).trim();
}


// ========================================
// FOOD PARAM
// ========================================

function parseFoodParam(foodParam) {

    if (!foodParam) {
        return [];
    }


    return foodParam
        .split(",")
        .map(
            function (item) {

                const parts =
                    item.split(":");


                return {

                    foodId:
                        Number(
                            parts[0]
                        ),

                    quantity:
                        Number(
                            parts[1]
                        ) || 0,

                    name:
                        "",

                    price:
                        0,

                    total:
                        0
                };
            }
        )
        .filter(
            function (item) {

                return (
                    item.foodId > 0 &&
                    item.quantity > 0
                );
            }
        );
}


// ========================================
// VALIDATE EMAIL
// ========================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


// ========================================
// FORMAT MONEY
// ========================================

function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "vi-VN"
    ) + "đ";
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        String(dateValue)
            .substring(
                0,
                10
            );


    const parts =
        date.split("-");


    if (parts.length !== 3) {
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


// ========================================
// GET DATE
// ========================================

function getDateFromDateTime(
    dateTime
) {

    if (!dateTime) {
        return "";
    }


    return String(
        dateTime
    ).substring(
        0,
        10
    );
}


// ========================================
// GET TIME
// ========================================

function getTimeFromDateTime(
    dateTime
) {

    if (!dateTime) {
        return "";
    }


    return String(
        dateTime
    ).substring(
        11,
        16
    );
}