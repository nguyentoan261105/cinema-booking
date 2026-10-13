
const API_BASE_URL = "http://localhost:5126/api";

let allBookings = [];
let filteredBookings = [];
let selectedBooking = null;
let bookingDetailModal = null;
let searchTimeout = null;

// KHOI TAO
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("bookingDetailModal");

    if (modal && window.bootstrap) {
        bookingDetailModal = new bootstrap.Modal(modal);
    }

    bindBookingEvents();
    loadBookings();
});

// LAY TOKEN ADMIN
function getAdminToken() {
    return (
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwtToken") ||
        ""
    );
}

// GOI API
async function bookingApi(url, options = {}) {
    const token = getAdminToken();

    if (!token) {
        throw new Error("Ban chua dang nhap. Vui long dang nhap Admin.");
    }

    const headers = {
        Accept: "application/json",
        Authorization: "Bearer " + token,
        ...(options.headers || {})
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(API_BASE_URL + url, {
        ...options,
        headers
    });

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (response.status === 401) {
        throw new Error("Phien dang nhap het han. Vui long dang nhap lai.");
    }

    if (response.status === 403) {
        throw new Error("Tai khoan khong co quyen Admin.");
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.title ||
            "Loi API HTTP " + response.status
        );
    }

    return data;
}

// GAN SU KIEN
function bindBookingEvents() {
    document.getElementById("refreshBookingsBtn")
        ?.addEventListener("click", loadBookings);

    document.getElementById("filterBookingsBtn")
        ?.addEventListener("click", applyBookingFilters);

    document.getElementById("resetBookingsBtn")
        ?.addEventListener("click", resetBookingFilters);

    document.getElementById("bookingSearch")
        ?.addEventListener("input", function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyBookingFilters, 250);
        });

    [
        "bookingStatus",
        "bookingFromDate",
        "bookingToDate"
    ].forEach(function (id) {
        document.getElementById(id)
            ?.addEventListener("change", applyBookingFilters);
    });

    document.getElementById("bookingsTable")
        ?.addEventListener("click", function (event) {
            const detailButton = event.target.closest("[data-booking-detail]");
            const cancelButton = event.target.closest("[data-booking-cancel]");

            if (detailButton) {
                viewBookingDetail(Number(detailButton.dataset.bookingDetail));
            }

            if (cancelButton) {
                cancelBooking(Number(cancelButton.dataset.bookingCancel));
            }
        });

    document.getElementById("cancelBookingDetailBtn")
        ?.addEventListener("click", function () {
            if (selectedBooking) {
                cancelBooking(selectedBooking.id);
            }
        });
}

// TAI DANH SACH DAT VE
async function loadBookings() {
    const table = document.getElementById("bookingsTable");
    const refreshButton = document.getElementById("refreshBookingsBtn");

    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <div class="spinner-border text-danger"></div>
                    <p class="mt-2">Dang tai danh sach dat ve...</p>
                </td>
            </tr>`;
    }

    if (refreshButton) refreshButton.disabled = true;

    try {
        const data = await bookingApi("/admin/bookings");

        if (Array.isArray(data)) {
            allBookings = data;
        } else {
            allBookings = data?.bookings || data?.items || [];
        }

        updateBookingStats();
        applyBookingFilters();
        hideBookingAlert();
    } catch (error) {
        console.error("LOI TAI DAT VE:", error);
        allBookings = [];
        filteredBookings = [];
        updateBookingStats();
        renderBookingTable([]);

        showBookingAlert("danger", error.message);
    } finally {
        if (refreshButton) refreshButton.disabled = false;
    }
}

// THONG KE
function updateBookingStats() {
    const pending = allBookings.filter(x => Number(x.status) === 0).length;
    const paid = allBookings.filter(x => Number(x.status) === 1).length;

    const revenue = allBookings.reduce(function (sum, booking) {
        const status = Number(booking.status);

        if (status === 1 || status === 3) {
            return sum + Number(booking.totalAmount || 0);
        }

        return sum;
    }, 0);

    setText("totalBookings", allBookings.length);
    setText("pendingBookings", pending);
    setText("paidBookings", paid);
    setText("bookingRevenue", formatMoney(revenue));
}

// LOC DAT VE
function applyBookingFilters() {
    const search = (
        document.getElementById("bookingSearch")?.value || ""
    ).trim().toLowerCase();

    const statusValue =
        document.getElementById("bookingStatus")?.value ?? "";

    const fromDate =
        document.getElementById("bookingFromDate")?.value || "";

    const toDate =
        document.getElementById("bookingToDate")?.value || "";

    filteredBookings = allBookings.filter(function (booking) {
        const user = getBookingUser(booking);
        const movie = getBookingMovie(booking);

        const searchableText = [
            booking.bookingCode,
            booking.id,
            user.fullName,
            user.name,
            user.email,
            movie.title
        ].join(" ").toLowerCase();

        if (search && !searchableText.includes(search)) return false;

        if (
            statusValue !== "" &&
            Number(booking.status) !== Number(statusValue)
        ) {
            return false;
        }

        const createdDate = getDateOnly(booking.createdAt);

        if (fromDate && (!createdDate || createdDate < fromDate)) {
            return false;
        }

        if (toDate && (!createdDate || createdDate > toDate)) {
            return false;
        }

        return true;
    });

    filteredBookings.sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    renderBookingTable(filteredBookings);

    setText(
        "bookingResultText",
        "Hien thi " + filteredBookings.length +
        " / " + allBookings.length + " dat ve"
    );
}

function resetBookingFilters() {
    setValue("bookingSearch", "");
    setValue("bookingStatus", "");
    setValue("bookingFromDate", "");
    setValue("bookingToDate", "");
    applyBookingFilters();
}

// HIEN THI BANG
function renderBookingTable(bookings) {
    const table = document.getElementById("bookingsTable");
    if (!table) return;

    if (!bookings.length) {
        table.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-secondary"></i>
                    <p class="mt-2">Khong tim thay dat ve nao.</p>
                </td>
            </tr>`;
        return;
    }

    table.innerHTML = bookings.map(function (booking) {
        const user = getBookingUser(booking);
        const movie = getBookingMovie(booking);
        const showtime = getBookingShowtime(booking);
        const seats = getBookingSeats(booking);
        const status = getBookingStatus(booking.status);
        const code = booking.bookingCode || ("VE-" + booking.id);

        const canCancel =
            Number(booking.status) === 0 ||
            Number(booking.status) === 1;

        return `
            <tr>
                <td>
                    <span class="booking-code">${escapeHtml(code)}</span>
                </td>
                <td>
                    <div class="booking-customer-name">
                        ${escapeHtml(user.fullName || user.name || "Khach hang")}
                    </div>
                    <div class="booking-customer-email">
                        ${escapeHtml(user.email || "")}
                    </div>
                </td>
                <td>${escapeHtml(movie.title || "Chua co ten phim")}</td>
                <td>${escapeHtml(formatDateTime(showtime.startTime || booking.startTime))}</td>
                <td>
                    <div class="booking-seat-list">
                        ${seats.length
                            ? seats.map(seat => `
                                <span class="booking-seat-chip">
                                    ${escapeHtml(getSeatName(seat))}
                                </span>`).join("")
                            : "--"}
                    </div>
                </td>
                <td>
                    <span class="booking-total">
                        ${formatMoney(booking.totalAmount)}
                    </span>
                </td>
                <td>
                    <span class="booking-status ${status.className}">
                        <i class="bi ${status.icon}"></i>
                        ${status.text}
                    </span>
                </td>
                <td>${escapeHtml(formatDateTime(booking.createdAt))}</td>
                <td>
                    <div class="booking-action-group">
                        <button type="button"
                            class="booking-action-btn detail"
                            data-booking-detail="${Number(booking.id)}"
                            title="Xem chi tiet">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button type="button"
                            class="booking-action-btn cancel"
                            data-booking-cancel="${Number(booking.id)}"
                            title="Huy ve"
                            ${canCancel ? "" : "disabled"}>
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join("");
}

// XEM CHI TIET
async function viewBookingDetail(id) {
    const body = document.getElementById("bookingDetailBody");

    if (body) {
        body.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-danger"></div>
                <p class="mt-2">Dang tai chi tiet dat ve...</p>
            </div>`;
    }

    bookingDetailModal?.show();

    try {
        const data = await bookingApi("/admin/bookings/" + id);
        const booking = data?.booking || data;

        if (!booking || booking.id == null) {
            throw new Error("Khong tim thay thong tin dat ve.");
        }

        selectedBooking = booking;
        renderBookingDetail(booking);
    } catch (error) {
        console.error("LOI CHI TIET:", error);

        if (body) {
            body.innerHTML = `
                <div class="alert alert-danger">
                    ${escapeHtml(error.message)}
                </div>`;
        }

        selectedBooking = null;
        updateCancelDetailButton();
    }
}

function renderBookingDetail(booking) {
    const body = document.getElementById("bookingDetailBody");
    const codeElement = document.getElementById("bookingDetailCode");

    if (!body) return;

    const user = getBookingUser(booking);
    const movie = getBookingMovie(booking);
    const cinema = getBookingCinema(booking);
    const room = getBookingRoom(booking);
    const showtime = getBookingShowtime(booking);
    const seats = getBookingSeats(booking);
    const foods = getBookingFoods(booking);
    const payment = booking.payment || null;
    const status = getBookingStatus(booking.status);
    const code = booking.bookingCode || ("VE-" + booking.id);

    if (codeElement) codeElement.textContent = "Ma dat ve: " + code;

    const seatTotal = Number(
        booking.ticketTotal ??
        seats.reduce((sum, seat) => sum + Number(seat.price || 0), 0)
    );

    const foodTotal = Number(
        booking.foodTotal ??
        foods.reduce((sum, food) => sum + Number(food.total || 0), 0)
    );

    body.innerHTML = `
        <div class="booking-detail-grid">
            <div class="booking-detail-card">
                <h6><i class="bi bi-person"></i> Thong tin khach hang</h6>
                ${detailLine("Ho ten", user.fullName || user.name || "--")}
                ${detailLine("Email", user.email || "--")}
                ${detailLine("So dien thoai", user.phone || "--")}
                ${detailLine("Ngay dat", formatDateTime(booking.createdAt))}
            </div>

            <div class="booking-detail-card">
                <h6><i class="bi bi-film"></i> Thong tin suat chieu</h6>
                ${detailLine("Phim", movie.title || "--")}
                ${detailLine("Rap", cinema.name || "--")}
                ${detailLine("Dia chi", cinema.address || "--")}
                ${detailLine("Phong", room.name || "--")}
                ${detailLine("Thoi gian", formatDateTime(showtime.startTime))}
            </div>

            <div class="booking-detail-card">
                <h6><i class="bi bi-ticket-perforated"></i> Danh sach ghe</h6>
                ${seats.length
                    ? seats.map(seat =>
                        detailLine(getSeatName(seat), formatMoney(seat.price))
                    ).join("")
                    : '<p class="text-secondary">Khong co thong tin ghe.</p>'}
                ${detailLine("Tong tien ve", formatMoney(seatTotal))}
            </div>

            <div class="booking-detail-card">
                <h6><i class="bi bi-cup-straw"></i> Do an va thuc uong</h6>
                ${foods.length
                    ? `<div class="table-responsive">
                        <table class="booking-food-table">
                            <thead><tr><th>Ten</th><th>SL</th><th>Thanh tien</th></tr></thead>
                            <tbody>
                                ${foods.map(function (food) {
                                    const quantity = Number(food.quantity || 0);
                                    const price = Number(food.price ?? food.unitPrice ?? 0);
                                    const total = Number(food.total ?? price * quantity);

                                    return `<tr>
                                        <td>${escapeHtml(food.name || "Do an")}</td>
                                        <td>${quantity}</td>
                                        <td>${formatMoney(total)}</td>
                                    </tr>`;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>`
                    : '<p class="text-secondary">Khong co do an.</p>'}
                ${detailLine("Tong tien do an", formatMoney(foodTotal))}
            </div>

            <div class="booking-detail-card">
                <h6><i class="bi bi-credit-card"></i> Thanh toan</h6>
                ${detailLine("Phuong thuc", payment?.methodText || payment?.method || "--")}
                ${detailLine("Trang thai thanh toan", payment?.statusText || payment?.status || "--")}
                ${detailLine("Ma dat ve", code)}
                ${detailLine("Trang thai ve", status.text)}
            </div>
        </div>

        <div class="booking-detail-total">
            <span>Tong thanh toan</span>
            <strong>${formatMoney(booking.totalAmount)}</strong>
        </div>`;

    updateCancelDetailButton();
}

function detailLine(label, value) {
    return `
        <div class="booking-detail-line">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value ?? "--")}</strong>
        </div>`;
}

function updateCancelDetailButton() {
    const button = document.getElementById("cancelBookingDetailBtn");
    if (!button) return;

    const status = Number(selectedBooking?.status);
    const canCancel = selectedBooking && (status === 0 || status === 1);

    button.disabled = !canCancel;
    button.style.display = canCancel ? "" : "none";
}

// HUY DAT VE
async function cancelBooking(id) {
    const booking = allBookings.find(
        item => Number(item.id) === Number(id)
    ) || (
        selectedBooking && Number(selectedBooking.id) === Number(id)
            ? selectedBooking
            : null
    );

    if (!booking) {
        showBookingAlert("warning", "Khong tim thay dat ve can huy.");
        return;
    }

    const status = Number(booking.status);

    if (status !== 0 && status !== 1) {
        showBookingAlert("warning", "Trang thai ve hien tai khong the huy.");
        return;
    }

    const code = booking.bookingCode || ("VE-" + booking.id);

    if (!confirm("Ban co chac chan muon huy dat ve " + code + "?")) {
        return;
    }

    try {
        await bookingApi(
            "/admin/bookings/" + encodeURIComponent(id) + "/cancel",
            { method: "PUT" }
        );

        showBookingAlert("success", "Huy dat ve thanh cong.");

        bookingDetailModal?.hide();
        selectedBooking = null;

        await loadBookings();
    } catch (error) {
        console.error("LOI HUY VE:", error);
        showBookingAlert("danger", error.message || "Khong the huy dat ve.");
    }
}

// LAY THONG TIN DAT VE
function getBookingUser(booking) {
    return booking.user || booking.customer || booking.applicationUser || {};
}

function getBookingMovie(booking) {
    return booking.movie || booking.showtime?.movie || {};
}

function getBookingCinema(booking) {
    return booking.cinema ||
        booking.showtime?.cinema ||
        booking.showtime?.room?.cinema ||
        {};
}

function getBookingRoom(booking) {
    return booking.room || booking.showtime?.room || {};
}

function getBookingShowtime(booking) {
    return booking.showtime || {};
}

function getBookingSeats(booking) {
    if (Array.isArray(booking.seats)) return booking.seats;

    if (Array.isArray(booking.bookingDetails)) {
        return booking.bookingDetails.map(function (detail) {
            const seat = detail.seat || {};

            return {
                id: seat.id,
                name: seat.name ||
                    (seat.rowName != null
                        ? seat.rowName + (seat.number ?? "")
                        : ""),
                rowName: seat.rowName,
                number: seat.number,
                type: seat.type,
                price: detail.price ?? seat.price
            };
        });
    }

    return [];
}

function getBookingFoods(booking) {
    if (Array.isArray(booking.foods)) return booking.foods;

    if (Array.isArray(booking.bookingFoods)) {
        return booking.bookingFoods.map(function (item) {
            const food = item.food || {};
            const price = Number(item.unitPrice ?? food.price ?? 0);
            const quantity = Number(item.quantity || 0);

            return {
                id: food.id,
                name: food.name,
                quantity,
                price,
                total: price * quantity
            };
        });
    }

    return [];
}

function getSeatName(seat) {
    if (seat.name) return String(seat.name);
    if (seat.seatName) return String(seat.seatName);

    if (seat.rowName != null) {
        return String(seat.rowName) + String(seat.number ?? "");
    }

    return "--";
}

// TRANG THAI VE
function getBookingStatus(value) {
    const statuses = {
        0: {
            text: "Cho thanh toan",
            className: "pending",
            icon: "bi-hourglass-split"
        },
        1: {
            text: "Da thanh toan",
            className: "paid",
            icon: "bi-check-circle"
        },
        2: {
            text: "Da huy",
            className: "cancelled",
            icon: "bi-x-circle"
        },
        3: {
            text: "Da su dung",
            className: "used",
            icon: "bi-ticket-perforated"
        }
    };

    return statuses[Number(value)] || {
        text: "Khong xac dinh",
        className: "cancelled",
        icon: "bi-question-circle"
    };
}

// DINH DANG DU LIEU
function formatMoney(value) {
    return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function formatDateTime(value) {
    if (!value) return "--";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}

function getDateOnly(value) {
    if (!value) return "";

    const text = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
        return text.substring(0, 10);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

// CHONG CHEN HTML
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// THONG BAO
function showBookingAlert(type, message) {
    const alertElement = document.getElementById("bookingsAlert");

    if (!alertElement) {
        window.alert(message);
        return;
    }

    alertElement.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${escapeHtml(message)}
            <button type="button" class="btn-close"
                data-bs-dismiss="alert" aria-label="Dong"></button>
        </div>`;

    alertElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}

function hideBookingAlert() {
    const alertElement = document.getElementById("bookingsAlert");
    if (alertElement) alertElement.innerHTML = "";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value ?? "";
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value;
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