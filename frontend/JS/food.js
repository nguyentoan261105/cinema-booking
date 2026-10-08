const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";


// =====================================================
// DỮ LIỆU ĐỒ ĂN TỪ DATABASE
// =====================================================

let foodProducts = {};


// =====================================================
// SỐ LƯỢNG ĐỒ ĂN ĐÃ CHỌN
// =====================================================

let quantities = {};


// =====================================================
// THÔNG TIN ĐẶT VÉ
// =====================================================

function getBookingInfo() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return {

        showtimeId:
            params.get("showtimeId") || "",

        movieId:
            params.get("movieId") || "",

        date:
            params.get("date") ||
            "",

        time:
            params.get("time") ||
            "",

        cinema:
            params.get("cinema") ||
            "",

        seats:
            params.get("seats") ||
            ""

    };

}


// =====================================================
// LẤY THÔNG TIN PHIM / SUẤT CHIẾU THẬT
// =====================================================

async function loadBookingInfo() {

    const info =
        getBookingInfo();


    /*
        Nếu có showtimeId thì lấy
        dữ liệu thật từ database.
    */

    if (info.showtimeId) {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/showtimes/${info.showtimeId}`
                );


            if (response.ok) {

                const showtime =
                    await response.json();


                info.movieId =
                    showtime.movie?.id ||
                    showtime.movieId ||
                    info.movieId;


                info.date =
                    getDateFromDateTime(
                        showtime.startTime
                    );


                info.time =
                    getTimeFromDateTime(
                        showtime.startTime
                    );


                info.cinema =
                    showtime.cinema?.name ||
                    info.cinema;


                const movieTitle =
                    showtime.movie?.title ||
                    "Không có tên phim";


                document.getElementById(
                    "summaryMovie"
                ).textContent =
                    movieTitle;


                document.getElementById(
                    "summaryCinema"
                ).textContent =
                    info.cinema;


                document.getElementById(
                    "summaryTime"
                ).textContent =
                    formatDate(info.date) +
                    " - " +
                    info.time;

            }

        } catch (error) {

            console.error(
                "Lỗi lấy suất chiếu:",
                error
            );

        }

    } else {

        /*
            Hỗ trợ URL cũ nếu chưa có showtimeId.
        */

        const movieTitles = {

            1: "Avengers: End Game",

            2: "Avatar: The Way of Water",

            3: "Spider-Man",

            4: "The Batman",

            5: "Inside Out",

            6: "Interstellar",

            7: "The Conjuring",

            8: "La La Land"

        };


        const movieTitle =
            movieTitles[info.movieId] ||
            "Avengers: End Game";


        document.getElementById(
            "summaryMovie"
        ).textContent =
            movieTitle;


        document.getElementById(
            "summaryCinema"
        ).textContent =
            info.cinema ||
            "Chưa có thông tin";


        document.getElementById(
            "summaryTime"
        ).textContent =
            info.time ||
            "Chưa có thông tin";

    }


    document.getElementById(
        "summarySeats"
    ).textContent =
        info.seats
            ? info.seats.split(",").join(", ")
            : "Chưa chọn ghế";

}


// =====================================================
// LẤY ĐỒ ĂN TỪ DATABASE
// =====================================================

async function loadFoods() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/foods`
            );


        if (!response.ok) {

            throw new Error(
                "Không thể lấy danh sách đồ ăn."
            );

        }


        const foods =
            await response.json();


        /*
            Chuyển dữ liệu API thành
            cấu trúc giống foodProducts cũ.
        */

        foodProducts = {};


        quantities = {};


        foods.forEach(function (food) {

            const id =
                getOldFoodId(food);


            if (!id) {

                return;

            }


            foodProducts[id] = {

                id: food.id,

                name:
                    food.name,

                price:
                    Number(food.price) || 0,

                quantity:
                    Number(food.quantity) || 0,

                imageUrl:
                    food.imageUrl || ""

            };


            quantities[id] = 0;

        });


        /*
            Cập nhật dữ liệu thật
            vào giao diện HTML cũ.
        */

        updateFoodInterface();


        console.log(
            "Danh sách đồ ăn từ database:",
            foodProducts
        );

    } catch (error) {

        console.error(
            "Lỗi lấy đồ ăn:",
            error
        );


        alert(
            "Không thể tải danh sách đồ ăn từ database."
        );

    }

}


// =====================================================
// MAP ID DATABASE -> ID CŨ TRÊN HTML
// =====================================================

function getOldFoodId(food) {

    /*
        Database hiện tại:

        1 = Combo 1
        2 = Combo 2
        3 = Popcorn
        4 = Pepsi
        5 = Coca Cola
        6 = 7UP
    */

    const idMap = {

        1: "combo1",

        2: "combo2",

        3: "popcorn",

        4: "pepsi",

        5: "coca",

        6: "sevenup"

    };


    if (idMap[food.id]) {

        return idMap[food.id];

    }


    /*
        Nếu sau này ID database
        thay đổi thì tìm theo tên.
    */

    const name =
        (food.name || "")
            .toLowerCase();


    if (
        name.includes("combo 1") ||
        name.includes("combo couple")
    ) {

        return "combo1";

    }


    if (
        name.includes("combo 2") ||
        name.includes("combo family")
    ) {

        return "combo2";

    }


    if (
        name.includes("popcorn") ||
        name.includes("bắp")
    ) {

        return "popcorn";

    }


    if (
        name.includes("pepsi")
    ) {

        return "pepsi";

    }


    if (
        name.includes("coca")
    ) {

        return "coca";

    }


    if (
        name.includes("7up") ||
        name.includes("seven")
    ) {

        return "sevenup";

    }


    return null;

}


// =====================================================
// CẬP NHẬT DỮ LIỆU VÀO GIAO DIỆN CŨ
// =====================================================

function updateFoodInterface() {

    Object.keys(
        foodProducts
    ).forEach(function (id) {

        const product =
            foodProducts[id];


        /*
            Tìm nút + của món
            để tìm đúng food-card.
        */

        const button =
            document.querySelector(
                `.quantity-btn[data-id="${id}"]`
            );


        if (!button) {

            return;

        }


        const card =
            button.closest(
                ".food-card"
            );


        if (!card) {

            return;

        }


        /*
            Tên món
        */

        const nameElement =
            card.querySelector(
                ".food-content h3"
            );


        if (nameElement) {

            nameElement.textContent =
                product.name;

        }


        /*
            Giá
        */

        const priceElement =
            card.querySelector(
                ".food-bottom strong"
            );


        if (priceElement) {

            priceElement.textContent =
                formatMoney(
                    product.price
                );

        }


        /*
            Ảnh
        */

        const image =
            card.querySelector(
                ".food-image img"
            );


        if (
            image &&
            product.imageUrl
        ) {

            let imageUrl =
                product.imageUrl;


            if (
                imageUrl.startsWith("/")
            ) {

                imageUrl =
                    BACKEND_URL +
                    imageUrl;

            }


            image.src =
                imageUrl;


            image.alt =
                product.name;

        }


        /*
            Lưu ID database vào card
        */

        card.dataset.foodId =
            product.id;


        /*
            Lưu tồn kho
        */

        card.dataset.quantity =
            product.quantity;


        /*
            Nếu hết hàng
            thì khóa nút +
        */

        const plusButton =
            card.querySelector(
                ".quantity-btn.plus"
            );


        if (plusButton) {

            plusButton.disabled =
                product.quantity <= 0;

        }


        /*
            Nút -
            ban đầu chưa chọn gì
        */

        const minusButton =
            card.querySelector(
                ".quantity-btn.minus"
            );


        if (minusButton) {

            minusButton.disabled =
                true;

        }

    });

}


// =====================================================
// NÚT + / -
// =====================================================

function setupQuantityButtons() {

    const buttons =
        document.querySelectorAll(
            ".quantity-btn"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const id =
                    button.dataset.id;


                if (
                    !foodProducts[id]
                ) {

                    return;

                }


                const product =
                    foodProducts[id];


                /*
                    NÚT +
                */

                if (
                    button.classList.contains(
                        "plus"
                    )
                ) {

                    if (
                        quantities[id] >=
                        product.quantity
                    ) {

                        alert(
                            "Món " +
                            product.name +
                            " đã hết số lượng."
                        );

                        return;

                    }


                    quantities[id]++;

                }


                /*
                    NÚT -
                */

                else {

                    if (
                        quantities[id] > 0
                    ) {

                        quantities[id]--;

                    }

                }


                updateQuantity(id);

                updateFoodSummary();

            }
        );

    });

}


// =====================================================
// CẬP NHẬT SỐ LƯỢNG TRÊN CARD
// =====================================================

function updateQuantity(id) {

    const element =
        document.getElementById(
            "quantity-" + id
        );


    if (!element) {

        return;

    }


    element.textContent =
        quantities[id];


    const button =
        document.querySelector(
            `.quantity-btn[data-id="${id}"]`
        );


    if (!button) {

        return;

    }


    const card =
        button.closest(
            ".food-card"
        );


    if (!card) {

        return;

    }


    const minusButton =
        card.querySelector(
            ".quantity-btn.minus"
        );


    const plusButton =
        card.querySelector(
            ".quantity-btn.plus"
        );


    /*
        Khóa nút -
        nếu số lượng = 0
    */

    if (minusButton) {

        minusButton.disabled =
            quantities[id] <= 0;

    }


    /*
        Khóa nút +
        nếu đã đạt tồn kho
    */

    if (plusButton) {

        plusButton.disabled =
            quantities[id] >=
            foodProducts[id].quantity;

    }

}


// =====================================================
// TÍNH TỔNG TIỀN
// =====================================================

function calculateFoodTotal() {

    let total = 0;


    Object.keys(
        foodProducts
    ).forEach(function (id) {

        total +=
            quantities[id] *
            foodProducts[id].price;

    });


    return total;

}


// =====================================================
// HIỂN THỊ ĐỒ ĂN ĐÃ CHỌN
// =====================================================

function updateFoodSummary() {

    const list =
        document.getElementById(
            "foodOrderList"
        );


    if (!list) {

        return;

    }


    let html = "";


    Object.keys(
        foodProducts
    ).forEach(function (id) {

        const quantity =
            quantities[id];


        if (
            !quantity ||
            quantity <= 0
        ) {

            return;

        }


        const product =
            foodProducts[id];


        const itemTotal =
            quantity *
            product.price;


        html +=

            '<div class="food-order-item">' +

                '<span class="food-order-name">' +

                    escapeHtml(
                        product.name
                    ) +

                '</span>' +

                '<span class="food-order-quantity">' +

                    "x" +
                    quantity +

                '</span>' +

                '<span class="food-order-price">' +

                    formatMoney(
                        itemTotal
                    ) +

                '</span>' +

            '</div>';

    });


    if (html === "") {

        html =
            '<p class="empty-food">' +
            'Chưa chọn đồ ăn.' +
            '</p>';

    }


    list.innerHTML =
        html;


    document.getElementById(
        "foodTotal"
    ).textContent =
        formatMoney(
            calculateFoodTotal()
        );

}


// =====================================================
// TẠO URL SANG CONFIRM
// =====================================================

function createBookingUrl(
    targetPage
) {

    const info =
        getBookingInfo();


    const foodItems = [];


    Object.keys(
        quantities
    ).forEach(function (id) {

        if (
            quantities[id] > 0
        ) {

            /*
                Lưu:

                databaseId:quantity

                Ví dụ:

                1:2,3:1,4:2
            */

            const databaseId =
                foodProducts[id].id;


            foodItems.push(

                databaseId +
                ":" +
                quantities[id]

            );

        }

    });


    const params =
        new URLSearchParams();


    /*
        Nếu có showtimeId
        thì ưu tiên truyền showtimeId.
    */

    if (info.showtimeId) {

        params.set(
            "showtimeId",
            info.showtimeId
        );

    }


    if (info.movieId) {

        params.set(
            "movieId",
            info.movieId
        );

    }


    if (info.date) {

        params.set(
            "date",
            info.date
        );

    }


    if (info.time) {

        params.set(
            "time",
            info.time
        );

    }


    if (info.cinema) {

        params.set(
            "cinema",
            info.cinema
        );

    }


    if (info.seats) {

        params.set(
            "seats",
            info.seats
        );

    }


    if (foodItems.length > 0) {

        params.set(
            "food",
            foodItems.join(",")
        );

    }


    return (
        targetPage +
        "?" +
        params.toString()
    );

}


// =====================================================
// TIẾP TỤC
// =====================================================

function continueBooking() {

    window.location.href =
        createBookingUrl(
            "Confirm.html"
        );

}


// =====================================================
// BỎ QUA
// =====================================================

function skipFood() {

    /*
        Xóa đồ ăn đã chọn
        nếu người dùng bấm Bỏ qua.
    */

    quantities = {};


    Object.keys(
        foodProducts
    ).forEach(function (id) {

        quantities[id] = 0;

        updateQuantity(id);

    });


    window.location.href =
        createBookingUrl(
            "Confirm.html"
        );

}


// =====================================================
// FORMAT TIỀN
// =====================================================

function formatMoney(value) {

    return (
        Number(value || 0)
            .toLocaleString("vi-VN") +
        "đ"
    );

}


// =====================================================
// FORMAT NGÀY
// =====================================================

function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

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
// LẤY NGÀY TỪ DATETIME
// =====================================================

function getDateFromDateTime(
    dateTime
) {

    if (!dateTime) {

        return "";

    }


    return dateTime.substring(
        0,
        10
    );

}


// =====================================================
// LẤY GIỜ TỪ DATETIME
// =====================================================

function getTimeFromDateTime(
    dateTime
) {

    if (!dateTime) {

        return "";

    }


    return dateTime.substring(
        11,
        16
    );

}


// =====================================================
// TRÁNH HTML INJECTION
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
// KHỞI ĐỘNG
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
            1. Lấy thông tin phim,
               rạp, giờ, ghế
        */

        await loadBookingInfo();


        /*
            2. Lấy đồ ăn thật
               từ database
        */

        await loadFoods();


        /*
            3. Gắn nút + / -
        */

        setupQuantityButtons();


        /*
            4. Hiển thị tổng tiền
        */

        updateFoodSummary();


        /*
            5. Nút tiếp tục
        */

        const continueButton =
            document.getElementById(
                "continueFoodButton"
            );


        if (continueButton) {

            continueButton.addEventListener(
                "click",
                continueBooking
            );

        }


        /*
            6. Nút bỏ qua
        */

        const skipButton =
            document.getElementById(
                "skipFoodButton"
            );


        if (skipButton) {

            skipButton.addEventListener(
                "click",
                skipFood
            );

        }

    }
);