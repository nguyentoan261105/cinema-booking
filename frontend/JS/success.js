/* =========================================================
   SUCCESS / BOOKING DETAIL
========================================================= */

const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";

let bookingData = null;
let bookingId = null;


/* =========================================================
   DOM
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    bookingId =
        new URLSearchParams(window.location.search)
            .get("bookingId");

    setupButtons();

    loadBooking();

});


/* =========================================================
   LOCAL STORAGE
========================================================= */

function getAccessToken() {

    return localStorage.getItem("accessToken");

}


function getCurrentUser() {

    const value =
        localStorage.getItem("currentUser");

    if (!value) {
        return null;
    }

    try {

        return JSON.parse(value);

    } catch (error) {

        console.error(
            "Khong doc duoc currentUser:",
            error
        );

        return null;
    }

}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    const printButton =
        document.getElementById("printTicketButton");

    const downloadButton =
        document.getElementById("downloadTicketButton");

    const historyButton =
        document.getElementById("historyButton");

    const cancelButton =
        document.getElementById("cancelTicketButton");


    if (printButton) {

        printButton.addEventListener(
            "click",
            printTicket
        );

    }


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            downloadTicket
        );

    }


    if (historyButton) {

        historyButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "History.html";

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelTicket
        );

    }

}


/* =========================================================
   LOAD BOOKING
========================================================= */

async function loadBooking() {

    const token = getAccessToken();
    const user = getCurrentUser();


    if (!token || !user) {

        alert(
            "Vui long dang nhap de xem thong tin ve."
        );

        window.location.href =
            "../Account/Login.html";

        return;

    }


    if (!bookingId) {

        alert(
            "Khong tim thay ma ve."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/bookings/${bookingId}`,
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
           TOKEN HET HAN
        ================================================= */

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


        if (!response.ok) {

            const errorData =
                await response.json()
                    .catch(() => null);

            throw new Error(
                errorData?.message ||
                "Khong the lay thong tin ve."
            );

        }


        const data =
            await response.json();


        console.log(
            "Thong tin booking:",
            data
        );


        /*
         * Backend co the tra:
         * {
         *    success: true,
         *    booking: {...}
         * }
         *
         * Hoac tra truc tiep booking.
         */

        bookingData =
            data.booking || data;


        if (!bookingData) {

            throw new Error(
                "Du lieu ve khong hop le."
            );

        }


        renderBooking();

    }
    catch (error) {

        console.error(
            "LOI LOAD BOOKING:",
            error
        );

        alert(
            error.message ||
            "Khong the tai thong tin ve."
        );

    }

}


/* =========================================================
   RENDER BOOKING
========================================================= */

function renderBooking() {

    if (!bookingData) {
        return;
    }


    /* =====================================================
       BOOKING CODE
    ===================================================== */

    const bookingCode =
        document.getElementById(
            "bookingCode"
        );


    if (bookingCode) {

        bookingCode.textContent =
            bookingData.bookingCode ||
            "CINEMA-000000";

    }



    /* =====================================================
       STATUS
    ===================================================== */

    updateBookingStatus();



    /* =====================================================
       MOVIE
    ===================================================== */

    const movie =
    bookingData.movie?.posterUrl
        ? bookingData.movie
        : bookingData.showtime?.movie ||
          bookingData.movie ||
          null;


    const movieName =
        document.getElementById(
            "movieName"
        );


    if (movieName) {

        movieName.textContent =
            movie?.title ||
            "Khong co ten phim";

    }


    const poster =
        document.getElementById(
            "moviePoster"
        );


    if (poster) {

    let posterUrl = "";

    /*
     * Uu tien posterUrl tu Database
     */
    if (movie?.posterUrl) {

        posterUrl =
            movie.posterUrl.trim();

    }


    /*
     * Xu ly duong dan tu Database
     */
    if (posterUrl) {

        if (
            posterUrl.startsWith("http://") ||
            posterUrl.startsWith("https://")
        ) {

            // Giữ nguyên URL đầy đủ

        }
        else if (
            posterUrl.startsWith("images/")
        ) {

            posterUrl =
                "../../../" +
                posterUrl;

        }
        else if (
            posterUrl.startsWith("/images/")
        ) {

            posterUrl =
                "../../../images/" +
                posterUrl.substring(8);

        }
        else if (
            posterUrl.startsWith("../")
        ) {

            // Giữ nguyên đường dẫn tương đối

        }
        else if (
            posterUrl.startsWith("/")
        ) {

            posterUrl =
                "../../../" +
                posterUrl.substring(1);

        }
        else {

            posterUrl =
                "../../../images/" +
                posterUrl;

        }

    }


    /*
     * Neu posterUrl khong co,
     * dung ID phim de tim poster.
     *
     * Spider-Man ID = 3
     * => ../../../images/movie-3.jpg
     */
    if (!posterUrl && movie?.id) {

        posterUrl =
            "../../../images/movie-" +
            movie.id +
            ".jpg";

    }


    console.log(
        "Movie:",
        movie
    );

    console.log(
        "Movie ID:",
        movie?.id
    );

    console.log(
        "Poster URL tu DB:",
        movie?.posterUrl
    );

    console.log(
        "Poster URL cuoi cung:",
        posterUrl
    );


    /*
     * Gan anh
     */
    if (posterUrl) {

        poster.src =
            posterUrl;


        /*
         * Neu anh tu posterUrl loi,
         * thu anh theo movie ID
         */
        poster.onerror =
            function () {

                this.onerror = null;


                if (movie?.id) {

                    const fallbackPoster =
                        "../../../images/movie-" +
                        movie.id +
                        ".jpg";

                    console.log(
                        "Dung poster fallback:",
                        fallbackPoster
                    );

                    this.src =
                        fallbackPoster;

                }

            };

        }

    }



    /* =====================================================
       CINEMA
    ===================================================== */

    const cinema =
        bookingData.cinema ||
        bookingData.showtime?.cinema ||
        null;


    const cinemaName =
        document.getElementById(
            "cinemaName"
        );


    if (cinemaName) {

        cinemaName.textContent =
            cinema?.name ||
            "-";

    }



    /* =====================================================
       ROOM
    ===================================================== */

    const room =
        bookingData.room ||
        bookingData.showtime?.room ||
        null;


    const roomName =
        document.getElementById(
            "roomName"
        );


    if (roomName) {

        roomName.textContent =
            room?.name ||
            "-";

    }



    /* =====================================================
       SHOWTIME
    ===================================================== */

    const startTime =
        bookingData.showtime?.startTime ||
        bookingData.startTime;


    const showDate =
        document.getElementById(
            "showDate"
        );


    const showTime =
        document.getElementById(
            "showTime"
        );


    if (showDate) {

        showDate.textContent =
            formatDate(startTime);

    }


    if (showTime) {

        showTime.textContent =
            formatTime(startTime);

    }



    /* =====================================================
       SEATS
    ===================================================== */

    const seatList =
        document.getElementById(
            "seatList"
        );


    const seats =
        bookingData.seats ||
        [];


    if (seatList) {

        const seatNames =
            seats
                .map(function (seat) {
                    return seat.name;
                })
                .filter(Boolean);


        seatList.textContent =
            seatNames.length > 0
                ? seatNames.join(", ")
                : "-";

    }



    /* =====================================================
       PAYMENT
    ===================================================== */

    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );


    const method =
        bookingData.payment?.method ||
        bookingData.paymentMethod ||
        "";


    if (paymentMethod) {

        paymentMethod.textContent =
            getPaymentMethodText(method);

    }



    /* =====================================================
       CUSTOMER
    ===================================================== */

    const customer =
        bookingData.customer ||
        {};


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


    if (customerName) {

        customerName.textContent =
            customer.name ||
            bookingData.customerName ||
            "-";

    }


    if (customerEmail) {

        customerEmail.textContent =
            customer.email ||
            bookingData.customerEmail ||
            "-";

    }


    if (customerPhone) {

        customerPhone.textContent =
            customer.phone ||
            bookingData.customerPhone ||
            "-";

    }



    /* =====================================================
       FOOD
    ===================================================== */

    renderFoods();



    /* =====================================================
       TOTAL
    ===================================================== */

    const grandTotal =
        document.getElementById(
            "grandTotal"
        );


    if (grandTotal) {

        grandTotal.textContent =
            formatMoney(
                bookingData.totalAmount
            );

    }



    /* =====================================================
       QR
    ===================================================== */

    generateQrCode();


}


/* =========================================================
   STATUS
========================================================= */

function updateBookingStatus() {

    const status =
        Number(bookingData.status);


    const ticketStatus =
        document.getElementById(
            "ticketStatus"
        );


    const successIcon =
        document.getElementById(
            "successIcon"
        );


    const successTitle =
        document.getElementById(
            "successTitle"
        );


    const successMessage =
        document.getElementById(
            "successMessage"
        );


    const cancelButton =
        document.getElementById(
            "cancelTicketButton"
        );


    const qrMessage =
        document.getElementById(
            "qrMessage"
        );



    /* =====================================================
       VE DA HUY
    ===================================================== */

    if (status === 2) {

        if (ticketStatus) {

            ticketStatus.textContent =
                "ĐÃ HỦY";

        }


        if (successIcon) {

            successIcon.textContent =
                "×";

        }


        if (successTitle) {

            successTitle.textContent =
                "Vé đã được hủy";

        }


        if (successMessage) {

            successMessage.textContent =
                "Vé này đã được hủy và không còn giá trị sử dụng.";

        }


        if (cancelButton) {

            cancelButton.style.display =
                "none";

        }


        if (qrMessage) {

            qrMessage.textContent =
                "Vé này đã được hủy và không còn giá trị sử dụng.";

        }


        return;

    }



    /* =====================================================
       VE DA SU DUNG
    ===================================================== */

    if (status === 3) {

        if (ticketStatus) {

            ticketStatus.textContent =
                "ĐÃ SỬ DỤNG";

        }


        if (successTitle) {

            successTitle.textContent =
                "Vé đã được sử dụng";

        }


        if (successMessage) {

            successMessage.textContent =
                "Vé này đã được sử dụng.";

        }


        if (cancelButton) {

            cancelButton.style.display =
                "none";

        }


        if (qrMessage) {

            qrMessage.textContent =
                "Vé này đã được sử dụng.";

        }


        return;

    }



    /* =====================================================
       VE DA THANH TOAN / CHO SUAT CHIEU
    ===================================================== */

    if (status === 1) {

        if (ticketStatus) {

            ticketStatus.textContent =
                "ĐÃ XÁC NHẬN";

        }


        if (successTitle) {

            successTitle.textContent =
                "Đặt vé thành công!";

        }


        if (successMessage) {

            successMessage.textContent =
                "Cảm ơn bạn đã sử dụng dịch vụ của CINEMA. Vé của bạn đã được xác nhận.";

        }


        if (cancelButton) {

            cancelButton.style.display =
                "inline-block";

        }


        if (qrMessage) {

            qrMessage.textContent =
                "Xuất trình mã QR này tại quầy hoặc cổng kiểm soát.";

        }


        return;

    }



    /* =====================================================
       PENDING
    ===================================================== */

    if (status === 0) {

        if (ticketStatus) {

            ticketStatus.textContent =
                "CHƯA THANH TOÁN";

        }


        if (successTitle) {

            successTitle.textContent =
                "Đặt vé thành công!";

        }


        if (successMessage) {

            successMessage.textContent =
                "Vé đã được tạo. Vui lòng hoàn tất thanh toán.";

        }


        if (cancelButton) {

            cancelButton.style.display =
                "inline-block";

        }


        if (qrMessage) {

            qrMessage.textContent =
                "Xuất trình mã QR này tại quầy hoặc cổng kiểm soát.";

        }

    }

}


/* =========================================================
   CANCEL BOOKING
========================================================= */

async function cancelTicket() {

    if (!bookingData) {

        alert(
            "Chua tai duoc thong tin ve."
        );

        return;

    }


    const status =
        Number(bookingData.status);


    if (status === 2) {

        alert(
            "Ve nay da duoc huy."
        );

        return;

    }


    if (status === 3) {

        alert(
            "Ve nay da duoc su dung, khong the huy."
        );

        return;

    }


    const bookingCode =
        bookingData.bookingCode ||
        "ve nay";


    const confirmed =
        confirm(
            `Ban co chac muon huy ve ${bookingCode}?\n\n` +
            `Sau khi huy, ghe va do an se duoc tra lai kho.`
        );


    if (!confirmed) {

        return;

    }


    const cancelButton =
        document.getElementById(
            "cancelTicketButton"
        );


    if (cancelButton) {

        cancelButton.disabled =
            true;

        cancelButton.textContent =
            "⏳ Đang hủy vé...";

    }


    try {

        const token =
            getAccessToken();


        const response =
            await fetch(
                `${API_BASE_URL}/bookings/${bookingId}/cancel`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        /* =================================================
           TOKEN HET HAN
        ================================================= */

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


        const data =
            await response.json()
                .catch(() => null);


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Khong the huy ve."
            );

        }


        if (!data?.success) {

            throw new Error(
                data?.message ||
                "Huy ve khong thanh cong."
            );

        }


        alert(
            "Huy ve thanh cong!"
        );


        /*
         * Tai lai trang de lay du lieu moi
         * tu Database.
         */

        window.location.reload();

    }
    catch (error) {

        console.error(
            "LOI HUY VE:",
            error
        );


        alert(
            error.message ||
            "Khong the huy ve."
        );


        if (cancelButton) {

            cancelButton.disabled =
                false;

            cancelButton.textContent =
                "❌ Hủy vé";

        }

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "-";

    }


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const year =
        date.getFullYear();


    return `${day}/${month}/${year}`;

}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(dateValue) {

    if (!dateValue) {

        return "-";

    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {

        return "-";

    }


    const hour =
        String(
            date.getHours()
        ).padStart(2, "0");


    const minute =
        String(
            date.getMinutes()
        ).padStart(2, "0");


    return `${hour}:${minute}`;

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "vi-VN"
    ) + " ₫";

}


/* =========================================================
   PAYMENT METHOD
========================================================= */

function getPaymentMethodText(method) {

    if (!method) {

        return "-";

    }


    const value =
        method.toString().toLowerCase();


    switch (value) {

        case "qr":
        case "qrcode":
            return "QR Code";

        case "momo":
            return "MoMo";

        case "vnpay":
            return "VNPay";

        case "bank":
        case "banking":
            return "Chuyển khoản";

        case "cash":
            return "Tiền mặt";

        default:
            return method;

    }

}


/* =========================================================
   FOOD
========================================================= */

function renderFoods() {

    const foodList =
        document.getElementById(
            "foodList"
        );


    if (!foodList) {

        return;

    }


    const foods =
        bookingData.foods ||
        [];


    if (
        !Array.isArray(foods) ||
        foods.length === 0
    ) {

        foodList.innerHTML =
            `<p class="empty-food">
                Không có đồ ăn.
            </p>`;

        return;

    }


    foodList.innerHTML = "";


    foods.forEach(function (food) {

        const name =
            food.name ||
            food.foodName ||
            food.food?.name ||
            "Đồ ăn";


        const quantity =
            Number(
                food.quantity ||
                0
            );


        const unitPrice =
            Number(
                food.unitPrice ||
                food.price ||
                food.food?.price ||
                0
            );


        const item =
            document.createElement("div");


        item.className =
            "food-item";


        item.innerHTML = `

            <span>
                ${name}
                x${quantity}
            </span>

            <strong>
                ${formatMoney(unitPrice * quantity)}
            </strong>

        `;


        foodList.appendChild(item);

    });

}


/* =========================================================
   QR CODE
========================================================= */

function generateQrCode() {

    const qr =
        document.getElementById(
            "ticketQr"
        );


    if (!qr || !bookingData) {

        return;

    }


    const status =
        Number(bookingData.status);


    /*
     * Vé đã hủy vẫn giữ thông tin QR,
     * nhưng thông báo bên dưới sẽ cho biết
     * vé không còn giá trị.
     */

    const bookingCode =
        bookingData.bookingCode ||
        `CINEMA-${bookingData.id || bookingId}`;


    const qrData =
        `CINEMA BOOKING|${bookingCode}|${bookingData.id || bookingId}`;


    qr.src =
        "https://api.qrserver.com/v1/create-qr-code/" +
        `?size=220x220&data=${encodeURIComponent(qrData)}`;

}


/* =========================================================
   PRINT
========================================================= */

function printTicket() {

    window.print();

}


/* =========================================================
   DOWNLOAD
========================================================= */

function downloadTicket() {

    if (!bookingData) {

        alert(
            "Chua co thong tin ve."
        );

        return;

    }


    const status =
        Number(bookingData.status);


    let statusText =
        "DA XAC NHAN";


    if (status === 0) {

        statusText =
            "CHUA THANH TOAN";

    }
    else if (status === 1) {

        statusText =
            "DA XAC NHAN";

    }
    else if (status === 2) {

        statusText =
            "DA HUY";

    }
    else if (status === 3) {

        statusText =
            "DA SU DUNG";

    }


    const movie =
        bookingData.movie ||
        bookingData.showtime?.movie ||
        {};


    const customer =
        bookingData.customer ||
        {};


    const seats =
        (bookingData.seats || [])
            .map(function (seat) {

                return seat.name;

            })
            .filter(Boolean)
            .join(", ");


    const content = `

CINEMA BOOKING
==============================

MA DAT VE:
${bookingData.bookingCode || "-"}

TRANG THAI:
${statusText}

PHIM:
${movie.title || "-"}

RAP:
${bookingData.cinema?.name || "-"}

PHONG:
${bookingData.room?.name || "-"}

NGAY CHIEU:
${formatDate(
    bookingData.showtime?.startTime
)}

SUAT CHIEU:
${formatTime(
    bookingData.showtime?.startTime
)}

GHE:
${seats || "-"}

KHACH HANG:
${customer.name || "-"}

EMAIL:
${customer.email || "-"}

SO DIEN THOAI:
${customer.phone || "-"}

TONG THANH TOAN:
${formatMoney(
    bookingData.totalAmount
)}

==============================
Cinema Booking
`;


    const blob =
        new Blob(
            [content],
            {
                type: "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;


    link.download =
        `${bookingData.bookingCode || "cinema-ticket"}.txt`;


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}