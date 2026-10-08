const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";


// =====================================================
// CUSTOMER - BIEN DAT GHE
// =====================================================

let showtimeId = null;
let seats = [];
let selectedSeats = [];

let showtimeInfo = {
    movieTitle: "",
    moviePoster: "",
    cinema: "",
    address: "",
    room: "",
    startTime: "",
    endTime: ""
};


// =====================================================
// CUSTOMER - KHI TRANG LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    /*
        Chi chay phan khach hang neu trang
        co #seatMap.

        Admin Seats.html dung #seatGrid
        nen se khong chay phan nay.
    */

    const seatMap =
        document.getElementById("seatMap");

    if (!seatMap) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    showtimeId =
        params.get("showtimeId");


    if (!showtimeId) {

        alert(
            "Không tìm thấy suất chiếu."
        );

        return;
    }


    loadSeats();

    setupContinueButton();

});


// =====================================================
// CUSTOMER - LAY GHE TU DATABASE
// =====================================================

async function loadSeats() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/seats/showtime/${showtimeId}`
            );


        if (!response.ok) {

            throw new Error(
                "Không thể lấy danh sách ghế."
            );

        }


        const data =
            await response.json();


        seats =
            data.seats || [];


        showtimeInfo =
            data.showtime || {};


        displayShowtimeInfo();

        displaySeats();

        updateSummary();

    }
    catch (error) {

        console.error(
            "Lỗi:",
            error
        );


        alert(
            "Không thể tải danh sách ghế."
        );

    }

}


// =====================================================
// CUSTOMER - HIEN THI THONG TIN PHIM / RAP
// =====================================================

function displayShowtimeInfo() {

    const movie =
        showtimeInfo.movie || {};


    const cinema =
        showtimeInfo.cinema || {};


    const room =
        showtimeInfo.room || {};


    const movieTitle =
        document.getElementById(
            "movieTitle"
        );


    const showtimeInfoElement =
        document.getElementById(
            "showtimeInfo"
        );


    if (movieTitle) {

        movieTitle.textContent =
            movie.title ||
            "Không có tên phim";

    }


    if (showtimeInfoElement) {

        showtimeInfoElement.textContent =
            (
                cinema.name || ""
            ) +
            " - " +
            (
                room.name || ""
            ) +
            " - " +
            formatDateTime(
                showtimeInfo.startTime
            );

    }


    showtimeInfo.movieTitle =
        movie.title || "";


    showtimeInfo.moviePoster =
        movie.posterUrl || "";


    showtimeInfo.cinema =
        cinema.name || "";


    showtimeInfo.address =
        cinema.address || "";


    showtimeInfo.room =
        room.name || "";

}


// =====================================================
// CUSTOMER - HIEN THI GHE
// =====================================================

function displaySeats() {

    const seatMap =
        document.getElementById(
            "seatMap"
        );


    if (!seatMap) {

        return;

    }


    seatMap.innerHTML = "";


    const rows = {};


    seats.forEach(function (seat) {

        if (!rows[seat.rowName]) {

            rows[seat.rowName] = [];

        }


        rows[seat.rowName].push(
            seat
        );

    });


    Object.keys(rows)
        .sort()
        .forEach(function (rowName) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "seat-row";


            const rowLabel =
                document.createElement(
                    "div"
                );


            rowLabel.className =
                "row-name";


            rowLabel.textContent =
                rowName;


            row.appendChild(
                rowLabel
            );


            rows[rowName]
                .sort(function (a, b) {

                    return (
                        Number(a.number) -
                        Number(b.number)
                    );

                })
                .forEach(function (seat) {

                    const button =
                        document.createElement(
                            "button"
                        );


                    let className =
                        "seat";


                    /*
                        Type:
                        0 = Standard
                        1 = VIP
                        2 = Couple
                    */

                    if (
                        Number(seat.type) === 1
                    ) {

                        className +=
                            " vip";

                    }
                    else if (
                        Number(seat.type) === 2
                    ) {

                        className +=
                            " couple";

                    }


                    /*
                        Status:
                        0 = Available
                        1 = Held
                        2 = Booked
                    */

                    if (
                        Number(seat.status) === 2
                    ) {

                        className +=
                            " occupied";

                    }
                    else if (
                        Number(seat.status) === 1
                    ) {

                        className +=
                            " occupied";

                    }
                    else {

                        className +=
                            " available";

                    }


                    button.className =
                        className;


                    const seatName =
                        seat.rowName +
                        seat.number;


                    button.textContent =
                        seatName;


                    button.dataset.seat =
                        seatName;


                    button.dataset.seatId =
                        seat.id;


                    button.dataset.price =
                        seat.price;


                    button.dataset.type =
                        seat.type;


                    button.dataset.status =
                        seat.status;


                    if (
                        Number(seat.status) === 2
                    ) {

                        button.addEventListener(
                            "click",
                            function () {

                                alert(
                                    "Ghế " +
                                    seatName +
                                    " đã được đặt."
                                );

                            }
                        );

                    }
                    else if (
                        Number(seat.status) === 1
                    ) {

                        button.addEventListener(
                            "click",
                            function () {

                                alert(
                                    "Ghế " +
                                    seatName +
                                    " đang được giữ."
                                );

                            }
                        );

                    }
                    else {

                        button.addEventListener(
                            "click",
                            function () {

                                selectSeat(
                                    seat,
                                    button
                                );

                            }
                        );

                    }


                    row.appendChild(
                        button
                    );

                });


            seatMap.appendChild(
                row
            );

        });

}


// =====================================================
// CUSTOMER - CHON / BO CHON GHE
// =====================================================

function selectSeat(
    seat,
    button
) {

    const seatName =
        seat.rowName +
        seat.number;


    const index =
        selectedSeats.findIndex(
            function (x) {

                return x.id === seat.id;

            }
        );


    if (index !== -1) {

        selectedSeats.splice(
            index,
            1
        );


        button.classList.remove(
            "selected"
        );

    }
    else {

        if (
            selectedSeats.length >= 8
        ) {

            alert(
                "Bạn chỉ được chọn tối đa 8 ghế."
            );

            return;

        }


        selectedSeats.push({

            id:
                seat.id,

            name:
                seatName,

            price:
                Number(
                    seat.price
                ) || 0,

            type:
                Number(
                    seat.type
                ) || 0

        });


        button.classList.add(
            "selected"
        );

    }


    updateSummary();

}


// =====================================================
// CUSTOMER - CAP NHAT TOM TAT
// =====================================================

function updateSummary() {

    const selectedSeatsElement =
        document.getElementById(
            "selectedSeats"
        );


    const normalCount =
        document.getElementById(
            "normalCount"
        );


    const vipCount =
        document.getElementById(
            "vipCount"
        );


    const totalPrice =
        document.getElementById(
            "totalPrice"
        );


    if (selectedSeatsElement) {

        if (
            selectedSeats.length === 0
        ) {

            selectedSeatsElement.textContent =
                "Chưa chọn ghế";

        }
        else {

            selectedSeatsElement.textContent =
                selectedSeats
                    .map(
                        function (seat) {

                            return seat.name;

                        }
                    )
                    .join(", ");

        }

    }


    let normal = 0;

    let vip = 0;

    let total = 0;


    selectedSeats.forEach(
        function (seat) {

            total +=
                seat.price;


            if (
                seat.type === 1
            ) {

                vip++;

            }
            else {

                normal++;

            }

        }
    );


    if (normalCount) {

        normalCount.textContent =
            normal;

    }


    if (vipCount) {

        vipCount.textContent =
            vip;

    }


    if (totalPrice) {

        totalPrice.textContent =
            formatMoney(
                total
            );

    }


    updateContinueButton();

}


// =====================================================
// CUSTOMER - NUT TIEP TUC
// =====================================================

function setupContinueButton() {

    const button =
        document.getElementById(
            "continueSeatButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            if (
                selectedSeats.length === 0
            ) {

                alert(
                    "Vui lòng chọn ít nhất 1 ghế."
                );

                return;

            }


            goToFood();

        }
    );

}


// =====================================================
// CUSTOMER - BAT / TAT NUT TIEP TUC
// =====================================================

function updateContinueButton() {

    const button =
        document.getElementById(
            "continueSeatButton"
        );


    if (!button) {

        return;

    }


    if (
        selectedSeats.length === 0
    ) {

        button.disabled =
            true;


        button.innerHTML =
            'Chọn ghế để tiếp tục ' +
            '<i class="bi bi-arrow-right"></i>';

    }
    else {

        button.disabled =
            false;


        button.innerHTML =
            'Tiếp tục chọn đồ ăn ' +
            '<i class="bi bi-arrow-right"></i>';

    }

}


// =====================================================
// CUSTOMER - CHUYEN SANG FOOD
// =====================================================

function goToFood() {

    const seatNames =
        selectedSeats
            .map(
                function (seat) {

                    return seat.name;

                }
            )
            .join(",");


    const params =
        new URLSearchParams();


    params.set(
        "showtimeId",
        showtimeId
    );


    params.set(
        "seats",
        seatNames
    );


    if (
        showtimeInfo.movie &&
        showtimeInfo.movie.id
    ) {

        params.set(
            "movieId",
            showtimeInfo.movie.id
        );

    }


    window.location.href =
        "Food.html?" +
        params.toString();

}


// =====================================================
// FORMAT TIEN
// =====================================================

function formatMoney(value) {

    return (
        Number(value || 0)
            .toLocaleString("vi-VN") +
        "đ"
    );

}


// =====================================================
// FORMAT DATETIME
// =====================================================

function formatDateTime(
    dateTime
) {

    if (!dateTime) {

        return "";

    }


    const date =
        dateTime.substring(
            0,
            10
        );


    const time =
        dateTime.substring(
            11,
            16
        );


    const parts =
        date.split("-");


    if (
        parts.length !== 3
    ) {

        return time;

    }


    return (
        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0] +
        " - " +
        time
    );

}


// =====================================================
// =====================================================
// ADMIN - QUAN LY GHE
// =====================================================
// =====================================================


let adminRooms = [];

let adminCinemas = [];

let adminSeats = [];

let adminSelectedRoomId = null;


// =====================================================
// ADMIN - KHI TRANG LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const seatGrid =
            document.getElementById(
                "seatGrid"
            );


        /*
            Neu khong phai trang Admin Seats
            thi dung lai.
        */

        if (!seatGrid) {

            return;

        }


        adminCheckSeatPermission();

        adminLoadSeatUser();

        adminLoadCinemas();

        adminSetupSeatEvents();

    }
);


// =====================================================
// ADMIN - KIEM TRA QUYEN
// =====================================================

function adminCheckSeatPermission() {

    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (!token) {

        window.location.href =
            "../Account/Login.html";

        return;

    }


    let currentUser = null;


    try {

        currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );

    }
    catch (error) {

        currentUser = null;

    }


    const roleFromStorage =
        localStorage.getItem(
            "userRole"
        );


    const roleFromUser =
        currentUser
            ? (
                currentUser.role ||
                ""
            )
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

        return;

    }

}


// =====================================================
// ADMIN - HIEN THI TEN ADMIN
// =====================================================

function adminLoadSeatUser() {

    try {

        const currentUser =
            JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


        if (!currentUser) {

            return;

        }


        const userName =
            document.getElementById(
                "adminUserName"
            );


        if (userName) {

            userName.textContent =
                currentUser.fullName ||
                currentUser.name ||
                "Administrator";

        }

    }
    catch (error) {

        console.log(
            "Khong the tai thong tin admin."
        );

    }

}


// =====================================================
// ADMIN - SETUP EVENTS
// =====================================================

function adminSetupSeatEvents() {

    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    const roomSelect =
        document.getElementById(
            "roomSelect"
        );


    const seatForm =
        document.getElementById(
            "seatForm"
        );


    const closeButton =
        document.getElementById(
            "closeSeatModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelSeatBtn"
        );


    const logoutButton =
        document.getElementById(
            "adminSidebarLogout"
        );


    /*
        CHON RAP
    */

    if (cinemaSelect) {

        cinemaSelect.addEventListener(
            "change",
            function () {

                const cinemaId =
                    this.value;


                adminFilterRooms(
                    cinemaId
                );

            }
        );

    }


    /*
        CHON PHONG
    */

    if (roomSelect) {

        roomSelect.addEventListener(
            "change",
            function () {

                adminSelectedRoomId =
                    this.value
                        ? Number(this.value)
                        : null;


                adminLoadSeats(
                    adminSelectedRoomId
                );

            }
        );

    }


    /*
        FORM SUA GHE
    */

    if (seatForm) {

        seatForm.addEventListener(
            "submit",
            adminSaveSeat
        );

    }


    /*
        DONG MODAL
    */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            adminCloseSeatModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            adminCloseSeatModal
        );

    }


    /*
        CLICK RA NGOAI MODAL
    */

    const modal =
        document.getElementById(
            "seatModal"
        );


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    adminCloseSeatModal();

                }

            }
        );

    }


    /*
        LOGOUT
    */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            adminSeatLogout
        );

    }

}


// =====================================================
// ADMIN - LOAD CINEMAS
// =====================================================

async function adminLoadCinemas() {

    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    if (!cinemaSelect) {

        return;

    }


    cinemaSelect.innerHTML = `

        <option value="">

            Đang tải danh sách rạp...

        </option>

    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/cinemas`,
                {
                    method: "GET",

                    headers:
                        adminSeatHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminSeatGetError(
                    response
                )
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(data)
        ) {

            adminCinemas =
                data;

        }
        else if (
            Array.isArray(data.data)
        ) {

            adminCinemas =
                data.data;

        }
        else if (
            Array.isArray(data.items)
        ) {

            adminCinemas =
                data.items;

        }
        else {

            adminCinemas = [];

        }


        adminRenderCinemaSelect();

        /*
            Sau khi co danh sach rap,
            tai danh sach phong.
        */

        await adminLoadRooms();

    }
    catch (error) {

        console.error(
            "Loi tai danh sach rap:",
            error
        );


        cinemaSelect.innerHTML = `

            <option value="">

                Không thể tải danh sách rạp

            </option>

        `;


        adminSeatShowAlert(
            error.message ||
            "Không thể tải danh sách rạp.",
            "error"
        );

    }

}


// =====================================================
// ADMIN - RENDER CINEMA SELECT
// =====================================================

function adminRenderCinemaSelect() {

    const cinemaSelect =
        document.getElementById(
            "cinemaSelect"
        );


    if (!cinemaSelect) {

        return;

    }


    cinemaSelect.innerHTML = `

        <option value="">

            -- Chọn rạp --

        </option>

    `;


    adminCinemas.forEach(
        function (cinema) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                cinema.id;


            option.textContent =
                cinema.name ||
                "Không có tên rạp";


            cinemaSelect.appendChild(
                option
            );

        }
    );

}


// =====================================================
// ADMIN - LOAD ROOMS
// =====================================================

async function adminLoadRooms() {

    const roomSelect =
        document.getElementById(
            "roomSelect"
        );


    if (!roomSelect) {

        return;

    }


    roomSelect.disabled =
        true;


    roomSelect.innerHTML = `

        <option value="">

            Đang tải danh sách phòng...

        </option>

    `;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/rooms`,
                {
                    method: "GET",

                    headers:
                        adminSeatHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminSeatGetError(
                    response
                )
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(data)
        ) {

            adminRooms =
                data;

        }
        else if (
            Array.isArray(data.data)
        ) {

            adminRooms =
                data.data;

        }
        else if (
            Array.isArray(data.items)
        ) {

            adminRooms =
                data.items;

        }
        else {

            adminRooms = [];

        }


        adminFilterRooms("");

    }
    catch (error) {

        console.error(
            "Loi tai danh sach phong:",
            error
        );


        roomSelect.innerHTML = `

            <option value="">

                Không thể tải danh sách phòng

            </option>

        `;


        adminSeatShowAlert(
            error.message ||
            "Không thể tải danh sách phòng.",
            "error"
        );

    }

}


// =====================================================
// ADMIN - FILTER PHONG THEO RAP
// =====================================================

function adminFilterRooms(
    cinemaId
) {

    const roomSelect =
        document.getElementById(
            "roomSelect"
        );


    if (!roomSelect) {

        return;

    }


    adminSelectedRoomId =
        null;


    adminClearRoomInfo();


    roomSelect.innerHTML = `

        <option value="">

            -- Chọn phòng --

        </option>

    `;


    if (!cinemaId) {

        roomSelect.disabled =
            true;

        adminShowEmptySeatMap();

        return;

    }


    const selectedCinemaId =
        Number(cinemaId);


    const filteredRooms =
        adminRooms.filter(
            function (room) {

                return (
                    Number(
                        room.cinemaId
                    ) ===
                    selectedCinemaId
                );

            }
        );


    filteredRooms.forEach(
        function (room) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                room.id;


            option.textContent =
                room.name ||
                "Phòng";


            roomSelect.appendChild(
                option
            );

        }
    );


    roomSelect.disabled =
        filteredRooms.length === 0;


    if (
        filteredRooms.length === 0
    ) {

        roomSelect.innerHTML = `

            <option value="">

                Rạp này chưa có phòng

            </option>

        `;

    }


    adminShowEmptySeatMap();

}


// =====================================================
// ADMIN - LOAD SEATS
// =====================================================

async function adminLoadSeats(
    roomId
) {

    if (!roomId) {

        adminShowEmptySeatMap();

        return;

    }


    adminShowSeatLoading();


    try {

        /*
            BACKEND HIEN TAI:

            GET /api/admin/seats?roomId=1
        */

        const response =
            await fetch(
                `${API_BASE_URL}/admin/seats?roomId=${roomId}`,
                {
                    method: "GET",

                    headers:
                        adminSeatHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminSeatGetError(
                    response
                )
            );

        }


        const data =
            await response.json();


        /*
            Backend tra ve:

            {
                room: {...},
                seats: [...]
            }
        */

        adminSeats =
            Array.isArray(data.seats)
                ? data.seats
                : [];


        adminSelectedRoomId =
            Number(roomId);


        adminDisplayRoomInfo(
            data.room
        );


        adminRenderSeats();

        adminUpdateSeatStatistics();

    }
    catch (error) {

        console.error(
            "Loi tai danh sach ghe:",
            error
        );


        adminShowSeatError(
            error.message ||
            "Không thể tải danh sách ghế."
        );

    }

}


// =====================================================
// ADMIN - HIEN THI THONG TIN PHONG
// =====================================================

function adminDisplayRoomInfo(
    room
) {

    if (!room) {

        return;

    }


    const roomInfoCard =
        document.getElementById(
            "roomInfoCard"
        );


    const roomName =
        document.getElementById(
            "selectedRoomName"
        );


    const roomInfo =
        document.getElementById(
            "selectedRoomInfo"
        );


    if (roomInfoCard) {

        roomInfoCard.style.display =
            "flex";

    }


    if (roomName) {

        roomName.textContent =
            room.name ||
            "Phòng";

    }


    if (roomInfo) {

        roomInfo.textContent =
            `${room.rows || 0} hàng × ` +
            `${room.columns || 0} cột - ` +
            `${adminSeats.length} ghế`;

    }

}


// =====================================================
// ADMIN - RENDER SEATS
// =====================================================

function adminRenderSeats() {

    const seatGrid =
        document.getElementById(
            "seatGrid"
        );


    if (!seatGrid) {

        return;

    }


    if (
        adminSeats.length === 0
    ) {

        adminShowSeatEmpty(
            "Phòng này chưa có ghế."
        );

        return;

    }


    seatGrid.innerHTML = "";


    const rows = {};


    adminSeats.forEach(
        function (seat) {

            const rowName =
                seat.rowName ||
                "A";


            if (!rows[rowName]) {

                rows[rowName] = [];

            }


            rows[rowName].push(
                seat
            );

        }
    );


    Object.keys(rows)
        .sort()
        .forEach(
            function (rowName) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "seat-grid-row";


                const rowLabel =
                    document.createElement(
                        "div"
                    );


                rowLabel.className =
                    "seat-grid-row-label";


                rowLabel.textContent =
                    rowName;


                row.appendChild(
                    rowLabel
                );


                rows[rowName]
                    .sort(
                        function (a, b) {

                            return (
                                Number(
                                    a.number
                                ) -
                                Number(
                                    b.number
                                )
                            );

                        }
                    )
                    .forEach(
                        function (seat) {

                            row.appendChild(
                                adminCreateSeat(
                                    seat
                                )
                            );

                        }
                    );


                seatGrid.appendChild(
                    row
                );

            }
        );


    const content =
        document.getElementById(
            "seatMapContent"
        );


    const empty =
        document.getElementById(
            "seatEmpty"
        );


    if (content) {

        content.style.display =
            "block";

    }


    if (empty) {

        empty.style.display =
            "none";

    }

}


// =====================================================
// ADMIN - TAO GHE
// =====================================================

function adminCreateSeat(
    seat
) {

    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    const seatName =
        (
            seat.rowName ||
            ""
        ) +
        (
            seat.number ||
            ""
        );


    const seatType =
        Number(
            seat.type
        );


    button.className =
        "admin-seat-item";


    /*
        Loai ghe
    */

    if (
        seatType === 1
    ) {

        button.classList.add(
            "vip"
        );

    }
    else if (
        seatType === 2
    ) {

        button.classList.add(
            "couple"
        );

    }
    else {

        button.classList.add(
            "standard"
        );

    }


    button.innerHTML = `

        <span>
            ${adminSeatEscapeHtml(
                seatName
            )}
        </span>

    `;


    button.title =
        `Chỉnh sửa ghế ${seatName}`;


    button.addEventListener(
        "click",
        function () {

            adminOpenSeatModal(
                seat
            );

        }
    );


    return button;

}


// =====================================================
// ADMIN - MO MODAL
// =====================================================

function adminOpenSeatModal(
    seat
) {

    const modal =
        document.getElementById(
            "seatModal"
        );


    if (!modal) {

        return;

    }


    const seatId =
        document.getElementById(
            "seatId"
        );


    const seatName =
        document.getElementById(
            "seatName"
        );


    const seatType =
        document.getElementById(
            "seatType"
        );


    const seatPrice =
        document.getElementById(
            "seatPrice"
        );


    if (seatId) {

        seatId.value =
            seat.id;

    }


    if (seatName) {

        /*
            seatName la <strong>,
            khong phai input.

            Dung textContent.
        */

        seatName.textContent =
            (
                seat.rowName ||
                ""
            ) +
            (
                seat.number ||
                ""
            );

    }


    if (seatType) {

        /*
            HTML:
            Standard / VIP / Couple

            Backend:
            0 / 1 / 2
        */

        seatType.value =
            String(
                Number(
                    seat.type
                )
            );

    }


    if (seatPrice) {

        seatPrice.value =
            Number(
                seat.price
            ) || 0;

    }


    modal.style.display =
        "flex";

}


// =====================================================
// ADMIN - DONG MODAL
// =====================================================

function adminCloseSeatModal() {

    const modal =
        document.getElementById(
            "seatModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// ADMIN - LUU GHE
// =====================================================

async function adminSaveSeat(
    event
) {

    event.preventDefault();


    const seatId =
        document.getElementById(
            "seatId"
        );


    const seatType =
        document.getElementById(
            "seatType"
        );


    const seatPrice =
        document.getElementById(
            "seatPrice"
        );


    if (!seatId) {

        return;

    }


    const id =
        seatId.value;


    /*
        0 = Standard
        1 = VIP
        2 = Couple
    */

    const type =
        Number(
            seatType
                ? seatType.value
                : 0
        );


    const price =
        Number(
            seatPrice
                ? seatPrice.value
                : 0
        );


    if (
        ![0, 1, 2].includes(type)
    ) {

        adminSeatShowAlert(
            "Loại ghế không hợp lệ.",
            "error"
        );

        return;

    }


    if (
        price < 0
    ) {

        adminSeatShowAlert(
            "Giá ghế không được nhỏ hơn 0.",
            "error"
        );

        return;

    }


    const requestData = {

        type:
            type,

        price:
            price

    };


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/seats/${id}`,
                {
                    method: "PUT",

                    headers:
                        adminSeatHeaders(
                            true
                        ),

                    body:
                        JSON.stringify(
                            requestData
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                await adminSeatGetError(
                    response
                )
            );

        }


        adminCloseSeatModal();


        adminSeatShowAlert(
            "Cập nhật ghế thành công.",
            "success"
        );


        await adminLoadSeats(
            adminSelectedRoomId
        );

    }
    catch (error) {

        console.error(
            "Loi cap nhat ghe:",
            error
        );


        adminSeatShowAlert(
            error.message ||
            "Không thể cập nhật ghế.",
            "error"
        );

    }

}


// =====================================================
// ADMIN - THONG KE GHE
// =====================================================

function adminUpdateSeatStatistics() {

    const standardCount =
        document.getElementById(
            "standardCount"
        );


    const vipCount =
        document.getElementById(
            "vipCount"
        );


    const coupleCount =
        document.getElementById(
            "coupleCount"
        );


    let standard = 0;

    let vip = 0;

    let couple = 0;


    adminSeats.forEach(
        function (seat) {

            const type =
                Number(
                    seat.type
                );


            if (type === 1) {

                vip++;

            }
            else if (type === 2) {

                couple++;

            }
            else {

                standard++;

            }

        }
    );


    if (standardCount) {

        standardCount.textContent =
            standard;

    }


    if (vipCount) {

        vipCount.textContent =
            vip;

    }


    if (coupleCount) {

        coupleCount.textContent =
            couple;

    }


    const roomInfo =
        document.getElementById(
            "selectedRoomInfo"
        );


    if (
        roomInfo &&
        adminSelectedRoomId
    ) {

        const room =
            adminRooms.find(
                function (x) {

                    return (
                        Number(x.id) ===
                        Number(
                            adminSelectedRoomId
                        )
                    );

                }
            );


        if (room) {

            roomInfo.textContent =
                `${room.rows || 0} hàng × ` +
                `${room.columns || 0} cột - ` +
                `${adminSeats.length} ghế`;

        }

    }

}


// =====================================================
// ADMIN - HIEN TRANG RONG
// =====================================================

function adminShowEmptySeatMap() {

    const seatEmpty =
        document.getElementById(
            "seatEmpty"
        );


    const seatLoading =
        document.getElementById(
            "seatLoading"
        );


    const seatContent =
        document.getElementById(
            "seatMapContent"
        );


    if (seatEmpty) {

        seatEmpty.style.display =
            "flex";

    }


    if (seatLoading) {

        seatLoading.style.display =
            "none";

    }


    if (seatContent) {

        seatContent.style.display =
            "none";

    }


    adminSeats = [];

    adminSelectedRoomId =
        null;


    adminUpdateSeatStatistics();

    adminClearRoomInfo();

}


// =====================================================
// ADMIN - HIEN LOADING
// =====================================================

function adminShowSeatLoading() {

    const seatEmpty =
        document.getElementById(
            "seatEmpty"
        );


    const seatLoading =
        document.getElementById(
            "seatLoading"
        );


    const seatContent =
        document.getElementById(
            "seatMapContent"
        );


    if (seatEmpty) {

        seatEmpty.style.display =
            "none";

    }


    if (seatLoading) {

        seatLoading.style.display =
            "flex";

    }


    if (seatContent) {

        seatContent.style.display =
            "none";

    }

}


// =====================================================
// ADMIN - HIEN LOI
// =====================================================

function adminShowSeatError(
    message
) {

    const seatEmpty =
        document.getElementById(
            "seatEmpty"
        );


    const seatLoading =
        document.getElementById(
            "seatLoading"
        );


    const seatContent =
        document.getElementById(
            "seatMapContent"
        );


    if (seatLoading) {

        seatLoading.style.display =
            "none";

    }


    if (seatContent) {

        seatContent.style.display =
            "none";

    }


    if (seatEmpty) {

        seatEmpty.style.display =
            "flex";


        seatEmpty.innerHTML = `

            <i class="bi bi-exclamation-triangle"></i>

            <h3>
                Không thể tải sơ đồ ghế
            </h3>

            <p>
                ${adminSeatEscapeHtml(
                    message
                )}
            </p>

        `;

    }

}


// =====================================================
// ADMIN - HIEN EMPTY
// =====================================================

function adminShowSeatEmpty(
    message
) {

    const seatEmpty =
        document.getElementById(
            "seatEmpty"
        );


    const seatLoading =
        document.getElementById(
            "seatLoading"
        );


    const seatContent =
        document.getElementById(
            "seatMapContent"
        );


    if (seatLoading) {

        seatLoading.style.display =
            "none";

    }


    if (seatContent) {

        seatContent.style.display =
            "none";

    }


    if (seatEmpty) {

        seatEmpty.style.display =
            "flex";


        seatEmpty.innerHTML = `

            <i class="bi bi-grid-3x3-gap"></i>

            <h3>
                ${adminSeatEscapeHtml(
                    message
                )}
            </h3>

            <p>
                Vui lòng chọn rạp và phòng.
            </p>

        `;

    }

}


// =====================================================
// ADMIN - CLEAR ROOM INFO
// =====================================================

function adminClearRoomInfo() {

    const roomInfoCard =
        document.getElementById(
            "roomInfoCard"
        );


    const roomName =
        document.getElementById(
            "selectedRoomName"
        );


    const roomInfo =
        document.getElementById(
            "selectedRoomInfo"
        );


    if (roomInfoCard) {

        roomInfoCard.style.display =
            "none";

    }


    if (roomName) {

        roomName.textContent =
            "Phòng";

    }


    if (roomInfo) {

        roomInfo.textContent =
            "0 ghế";

    }

}


// =====================================================
// ADMIN - HEADERS
// =====================================================

function adminSeatHeaders(
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


// =====================================================
// ADMIN - DOC LOI API
// =====================================================

async function adminSeatGetError(
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


    return (
        `Lỗi HTTP ${response.status}`
    );

}


// =====================================================
// ADMIN - ALERT
// =====================================================

function adminSeatShowAlert(
    message,
    type
) {

    const alertBox =
        document.getElementById(
            "seatsAlert"
        );


    if (!alertBox) {

        return;

    }


    alertBox.textContent =
        message;


    alertBox.style.display =
        "block";


    if (
        type === "error"
    ) {

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


// =====================================================
// ADMIN - ESCAPE HTML
// =====================================================

function adminSeatEscapeHtml(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text == null
            ? ""
            : String(text);


    return div.innerHTML;

}


// =====================================================
// ADMIN - LOGOUT
// =====================================================

function adminSeatLogout() {

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