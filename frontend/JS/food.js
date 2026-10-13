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

// =====================================================
    // ADMIN QUAN LY DO AN
// =====================================================

const ADMIN_FOODS_API = `${API_BASE_URL}/foods`;
const ADMIN_CATEGORIES_API = `${API_BASE_URL}/foodcategories`;

let adminFoodsData = [];
let adminFoodCategories = [];

function adminFoodsPageExists() {
    return document.getElementById("foodsTable") !== null;
}

function adminFoodsGetToken() {
    const keys = [
        "token",
        "accessToken",
        "jwtToken",
        "authToken",
        "cinemaToken"
    ];

    for (const key of keys) {
        const value = localStorage.getItem(key);

        if (!value) continue;

        try {
            const parsed = JSON.parse(value);

            if (typeof parsed === "string") {
                return parsed;
            }

            if (parsed && typeof parsed === "object") {
                return parsed.token ||
                    parsed.accessToken ||
                    parsed.access_token ||
                    "";
            }
        } catch {
            return value;
        }
    }

    return "";
}

async function adminFoodsRequest(url, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const token = adminFoodsGetToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        let message = `Lỗi API: ${response.status}`;

        try {
            const text = await response.text();

            if (text) {
                try {
                    const data = JSON.parse(text);
                    message = data.message ||
                        data.title ||
                        data.detail ||
                        data.error ||
                        text;
                } catch {
                    message = text;
                }
            }
        } catch {
            // Khong doc duoc noi dung loi.
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();

    return text ? JSON.parse(text) : null;
}

function adminFoodsList(data) {
    if (Array.isArray(data)) return data;

    if (!data || typeof data !== "object") return [];

    for (const key of [
        "items",
        "data",
        "results",
        "foods",
        "categories",
        "$values"
    ]) {
        if (Array.isArray(data[key])) {
            return data[key];
        }
    }

    return [];
}

function adminFoodsId(item) {
    return item?.id ?? item?.Id ?? "";
}

function adminFoodsName(item) {
    return item?.name ?? item?.Name ?? "";
}

function adminFoodsCategoryId(food) {
    return food?.foodCategoryId ??
        food?.FoodCategoryId ??
        food?.categoryId ??
        food?.CategoryId ??
        food?.foodCategory?.id ??
        food?.foodCategory?.Id ??
        food?.category?.id ??
        food?.category?.Id ??
        "";
}

function adminFoodsCategoryName(food) {
    const embedded =
        food?.foodCategory ||
        food?.FoodCategory ||
        food?.category ||
        food?.Category;

    if (embedded) {
        return adminFoodsName(embedded);
    }

    const id = adminFoodsCategoryId(food);

    const category = adminFoodCategories.find(
        item => String(adminFoodsId(item)) === String(id)
    );

    return category
        ? adminFoodsName(category)
        : "Chưa phân loại";
}

function adminFoodsActive(food) {
    const value = food?.isActive ??
        food?.IsActive ??
        food?.isAvailable ??
        food?.IsAvailable;

    if (value === undefined || value === null) {
        return true;
    }

    return value === true ||
        value === 1 ||
        value === "true";
}

function adminFoodsEscape(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );
}


function adminFoodsMoney(value) {
    const price = Number(value);

    if (!Number.isFinite(price)) {
        return "0 ₫";
    }

    return Math.round(price).toLocaleString("vi-VN") + " ₫";
}



function adminFoodsImage(url) {
    if (!url) return "";

    url = String(url).trim();

    // Neu la URL day du thi giu nguyen
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    // Neu URL bat dau bang //
    if (url.startsWith("//")) {
        return window.location.protocol + url;
    }

    // Neu la duong dan tu goc website
    if (url.startsWith("/")) {
        return BACKEND_URL + url;
    }

    // Neu la duong dan tuong doi
    return `${BACKEND_URL}/${url}`;
}


function adminFoodsAlert(message, type = "success") {
    const element = document.getElementById("foodsAlert");

    if (!element) {
        alert(message);
        return;
    }

    element.textContent = message;
    element.style.display = "block";

    element.classList.remove(
        "alert-success",
        "alert-danger",
        "alert-warning",
        "alert-info"
    );

    element.classList.add(
        type === "success" ? "alert-success" :
        type === "warning" ? "alert-warning" :
        type === "info" ? "alert-info" :
        "alert-danger"
    );

    clearTimeout(adminFoodsAlert.timer);

    adminFoodsAlert.timer = setTimeout(() => {
        element.style.display = "none";
    }, 5000);
}

// -----------------------------------------------------
// TAI DU LIEU
// -----------------------------------------------------

async function adminFoodsLoadCategories() {
    try {
        const data = await adminFoodsRequest(
            ADMIN_CATEGORIES_API
        );

        adminFoodCategories = adminFoodsList(data);

        adminFoodsRenderCategoryOptions();
        adminFoodsStatistics();
    } catch (error) {
        console.error("Loi tai danh muc:", error);

        adminFoodsAlert(
            "Không tải được danh mục. Hãy kiểm tra API danh mục.",
            "danger"
        );
    }
}


async function adminFoodsLoad() {
    const table = document.getElementById("foodsTable");

    if (table) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Đang tải dữ liệu...
                </td>
            </tr>
        `;
    }

    try {
        // Lay ca san pham dang kinh doanh va ngung kinh doanh
        const data = await adminFoodsRequest(
            `${ADMIN_FOODS_API}?includeInactive=true`
        );

        adminFoodsData = adminFoodsList(data);

        adminFoodsRenderTable();
        adminFoodsStatistics();

        console.log("Danh sach san pham:", adminFoodsData);
    } catch (error) {
        console.error("Loi tai san pham:", error);

        if (table) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center;">
                        Không thể tải danh sách sản phẩm.
                    </td>
                </tr>
            `;
        }

        adminFoodsAlert(error.message, "danger");
    }
}


// -----------------------------------------------------
// DANH MUC
// -----------------------------------------------------

function adminFoodsRenderCategoryOptions() {
    const filter = document.getElementById(
        "foodCategoryFilter"
    );

    const select = document.getElementById("foodCategory");

    const oldFilter = filter?.value || "";
    const oldSelect = select?.value || "";

    if (filter) {
        filter.innerHTML =
            '<option value="">Tất cả danh mục</option>';

        adminFoodCategories.forEach(category => {
            filter.insertAdjacentHTML(
                "beforeend",
                `<option value="${adminFoodsEscape(
                    adminFoodsId(category)
                )}">${adminFoodsEscape(
                    adminFoodsName(category)
                )}</option>`
            );
        });

        filter.value = oldFilter;
    }

    if (select) {
        select.innerHTML =
            '<option value="">Chọn danh mục</option>';

        adminFoodCategories.forEach(category => {
            select.insertAdjacentHTML(
                "beforeend",
                `<option value="${adminFoodsEscape(
                    adminFoodsId(category)
                )}">${adminFoodsEscape(
                    adminFoodsName(category)
                )}</option>`
            );
        });

        select.value = oldSelect;
    }

    adminFoodsRenderCategoryManager();
}

function adminFoodsRenderCategoryManager() {
    const modal = document.getElementById(
        "foodCategoryModal"
    );

    const content = modal?.querySelector(
        ".admin-modal-content"
    );

    const footer = content?.querySelector(
        ".admin-modal-footer"
    );

    if (!content || !footer) return;

    let list = document.getElementById(
        "foodCategoryManagerList"
    );

    if (!list) {
        list = document.createElement("div");
        list.id = "foodCategoryManagerList";
        list.className = "p-3";

        content.insertBefore(list, footer);
    }

    if (adminFoodCategories.length === 0) {
        list.innerHTML = "<p>Chưa có danh mục.</p>";
        return;
    }

    list.innerHTML = `
        <h3 style="font-size:16px;">Danh sách danh mục</h3>

        <table class="admin-table">
            <thead>
                <tr>
                    <th>Tên danh mục</th>
                    <th>Thao tác</th>
                </tr>
            </thead>

            <tbody>
                ${adminFoodCategories.map(category => `
                    <tr>
                        <td>${adminFoodsEscape(
                            adminFoodsName(category)
                        )}</td>

                        <td>
                            <div class="food-actions">
                                <button
                                    type="button"
                                    class="food-edit-btn"
                                    data-category-action="edit"
                                    data-id="${adminFoodsEscape(
                                        adminFoodsId(category)
                                    )}">
                                    <i class="bi bi-pencil-square"></i>
                                </button>

                                <button
                                    type="button"
                                    class="food-delete-btn"
                                    data-category-action="delete"
                                    data-id="${adminFoodsEscape(
                                        adminFoodsId(category)
                                    )}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
}

function adminFoodsOpenCategoryModal() {
    document.getElementById("foodCategoryForm")?.reset();
    document.getElementById("foodCategoryId").value = "";
    document.getElementById(
        "foodCategoryModalTitle"
    ).textContent = "Thêm danh mục";

    document.getElementById(
        "saveFoodCategoryBtn"
    ).textContent = "Lưu danh mục";

    adminFoodsRenderCategoryManager();

    const modal = document.getElementById(
        "foodCategoryModal"
    );

    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function adminFoodsCloseCategoryModal() {
    const modal = document.getElementById(
        "foodCategoryModal"
    );

    if (modal) modal.style.display = "none";

    adminFoodsRestoreScroll();
}

function adminFoodsEditCategory(id) {
    const category = adminFoodCategories.find(
        item => String(adminFoodsId(item)) === String(id)
    );

    if (!category) return;

    document.getElementById("foodCategoryId").value =
        adminFoodsId(category);

    document.getElementById("foodCategoryName").value =
        adminFoodsName(category);

    document.getElementById(
        "foodCategoryModalTitle"
    ).textContent = "Cập nhật danh mục";

    document.getElementById(
        "saveFoodCategoryBtn"
    ).textContent = "Cập nhật danh mục";
}

async function adminFoodsSaveCategory(event) {
    event.preventDefault();

    const id = document.getElementById(
        "foodCategoryId"
    ).value;

    const name = document.getElementById(
        "foodCategoryName"
    ).value.trim();

    const button = document.getElementById(
        "saveFoodCategoryBtn"
    );

    if (!name) {
        adminFoodsAlert(
            "Vui lòng nhập tên danh mục.",
            "warning"
        );
        return;
    }

    try {
        button.disabled = true;

        await adminFoodsRequest(
            id
                ? `${ADMIN_CATEGORIES_API}/${encodeURIComponent(id)}`
                : ADMIN_CATEGORIES_API,
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify({ name })
            }
        );

        await adminFoodsLoadCategories();
        await adminFoodsLoad();

        document.getElementById(
            "foodCategoryForm"
        ).reset();

        document.getElementById("foodCategoryId").value = "";

        adminFoodsAlert(
            id ? "Đã cập nhật danh mục." : "Đã thêm danh mục.",
            "success"
        );
    } catch (error) {
        adminFoodsAlert(error.message, "danger");
    } finally {
        button.disabled = false;

        button.textContent = document.getElementById(
            "foodCategoryId"
        ).value
            ? "Cập nhật danh mục"
            : "Lưu danh mục";
    }
}

async function adminFoodsDeleteCategory(id) {
    const category = adminFoodCategories.find(
        item => String(adminFoodsId(item)) === String(id)
    );

    if (!category) return;

    if (!confirm(
        `Bạn có chắc muốn xóa danh mục "${adminFoodsName(category)}"?`
    )) {
        return;
    }

    try {
        await adminFoodsRequest(
            `${ADMIN_CATEGORIES_API}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        await adminFoodsLoadCategories();
        await adminFoodsLoad();

        adminFoodsAlert("Đã xóa danh mục.", "success");
    } catch (error) {
        adminFoodsAlert(error.message, "danger");
    }
}

// -----------------------------------------------------
// THONG KE
// -----------------------------------------------------


function adminFoodsStatistics() {
    const total = adminFoodsData.length;

    const activeFoods = adminFoodsData.filter(function (food) {
        return adminFoodsActive(food);
    });

    const active = activeFoods.length;

    const prices = activeFoods
        .map(function (food) {
            return Number(food.price ?? food.Price);
        })
        .filter(function (price) {
            return Number.isFinite(price) && price > 0
        });

    const average = prices.length > 0
        ? prices.reduce(function (sum, price) {
            return sum + price;
        }, 0) / prices.length
        : 0;

    const totalElement = document.getElementById("totalFoods");
    const activeElement = document.getElementById("activeFoods");
    const categoryElement = document.getElementById("totalFoodCategories");
    const averageElement = document.getElementById("averageFoodPrice");

    if (totalElement) totalElement.textContent = total;
    if (activeElement) activeElement.textContent = active;
    if (categoryElement) {
        categoryElement.textContent = adminFoodCategories.length;
    }
    if (averageElement) {
        averageElement.textContent = adminFoodsMoney(average);
    }
}


// -----------------------------------------------------
// BANG SAN PHAM
// -----------------------------------------------------

function adminFoodsRenderTable() {
    const table = document.getElementById("foodsTable");

    if (!table) return;

    const keyword = (
        document.getElementById("foodSearch")?.value || ""
    ).trim().toLowerCase();

    const categoryId = document.getElementById(
        "foodCategoryFilter"
    )?.value || "";

    const status = document.getElementById(
        "foodStatusFilter"
    )?.value || "";

    const filtered = adminFoodsData.filter(food => {
        const name = adminFoodsName(food).toLowerCase();

        const description = String(
            food.description ?? food.Description ?? ""
        ).toLowerCase();

        const categoryName =
            adminFoodsCategoryName(food).toLowerCase();

        const matchesText =
            name.includes(keyword) ||
            description.includes(keyword) ||
            categoryName.includes(keyword);

        const matchesCategory =
            !categoryId ||
            String(adminFoodsCategoryId(food)) ===
                String(categoryId);

        const active = adminFoodsActive(food);

        const matchesStatus =
            status === "" || String(active) === status;

        return matchesText && matchesCategory && matchesStatus;
    });

    const result = document.getElementById("foodsResultText");

    if (result) {
        result.textContent =
            `Hiển thị ${filtered.length} / ${adminFoodsData.length} sản phẩm`;
    }

    if (!filtered.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;">
                    Không tìm thấy sản phẩm.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filtered.map((food, index) => {
        const id = adminFoodsId(food);
        const name = adminFoodsName(food);

        const image = adminFoodsImage(
            food.imageUrl ??
            food.ImageUrl ??
            food.image ??
            food.Image ??
            ""
        );

        const active = adminFoodsActive(food);

        const imageHtml = image
            ? `<img src="${adminFoodsEscape(image)}"
                    alt="${adminFoodsEscape(name)}"
                    onerror="this.style.display='none'">`
            : `<i class="bi bi-image fs-3"></i>`;

        return `
            <tr>
                <td>${index + 1}</td>

                <td>
                    <div class="food-item-info">
                        ${imageHtml}
                        <div class="food-item-name">
                            ${adminFoodsEscape(name)}
                        </div>
                    </div>
                </td>

                <td>${adminFoodsEscape(
                    adminFoodsCategoryName(food)
                )}</td>

                <td>
                    <strong>${adminFoodsMoney(
                        food.price ?? food.Price
                    )}</strong>
                </td>

                <td>
                    <span class="food-status ${
                        active ? "active" : "inactive"
                    }">
                        ${active ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                    </span>
                </td>

                <td>
                    <div class="food-actions">
                        <button
                            type="button"
                            class="food-edit-btn"
                            data-food-action="edit"
                            data-id="${adminFoodsEscape(id)}"
                            title="Sửa">
                            <i class="bi bi-pencil-square"></i>
                        </button>

                        <button
                            type="button"
                            class="food-delete-btn"
                            data-food-action="delete"
                            data-id="${adminFoodsEscape(id)}"
                            title="Xóa">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// -----------------------------------------------------
// MODAL SAN PHAM
// -----------------------------------------------------

function adminFoodsOpenModal() {
    const modal = document.getElementById("foodModal");

    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function adminFoodsCloseModal() {
    const modal = document.getElementById("foodModal");

    if (modal) modal.style.display = "none";

    adminFoodsRestoreScroll();
}

function adminFoodsRestoreScroll() {
    const foodModal = document.getElementById("foodModal");
    const categoryModal = document.getElementById(
        "foodCategoryModal"
    );

    if (
        foodModal?.style.display !== "flex" &&
        categoryModal?.style.display !== "flex"
    ) {
        document.body.style.overflow = "";
    }
}

function adminFoodsResetForm() {
    document.getElementById("foodForm")?.reset();
    document.getElementById("foodId").value = "";
    document.getElementById("foodStatus").checked = true;

    const preview = document.getElementById(
        "foodPreviewImage"
    );

    if (preview) {
        preview.src = "";
        preview.style.display = "none";
    }

    document.getElementById(
        "foodModalTitle"
    ).textContent = "Thêm sản phẩm";

    document.getElementById(
        "saveFoodBtn"
    ).textContent = "Lưu sản phẩm";
}

function adminFoodsAdd() {
    adminFoodsResetForm();
    adminFoodsRenderCategoryOptions();
    adminFoodsOpenModal();
}

function adminFoodsEdit(id) {
    const food = adminFoodsData.find(
        item => String(adminFoodsId(item)) === String(id)
    );

    if (!food) return;

    adminFoodsResetForm();
    adminFoodsRenderCategoryOptions();

    document.getElementById("foodId").value =
        adminFoodsId(food);

    document.getElementById("foodName").value =
        adminFoodsName(food);

    document.getElementById("foodCategory").value =
        adminFoodsCategoryId(food);

    document.getElementById("foodPrice").value =
        food.price ?? food.Price ?? 0;

    document.getElementById("foodImage").value =
        food.imageUrl ?? food.ImageUrl ?? "";

    document.getElementById("foodDescription").value =
        food.description ?? food.Description ?? "";

    document.getElementById("foodStatus").checked =
        adminFoodsActive(food);

    document.getElementById(
        "foodModalTitle"
    ).textContent = "Cập nhật sản phẩm";

    document.getElementById(
        "saveFoodBtn"
    ).textContent = "Cập nhật sản phẩm";

    adminFoodsPreviewImage();
    adminFoodsOpenModal();
}

function adminFoodsPreviewImage() {
    const input = document.getElementById("foodImage");
    const preview = document.getElementById(
        "foodPreviewImage"
    );

    if (!input || !preview) return;

    const url = adminFoodsImage(input.value);

    if (!url) {
        preview.removeAttribute("src");
        preview.style.display = "none";
        return;
    }

    preview.onload = () => {
        preview.style.display = "block";
    };

    preview.onerror = () => {
        preview.style.display = "none";
    };

    preview.src = url;
}

async function adminFoodsSave(event) {
    event.preventDefault();

    const id = document.getElementById("foodId").value;
    const name = document.getElementById("foodName").value.trim();
    const categoryId = document.getElementById(
        "foodCategory"
    ).value;

    const price = Number(
        document.getElementById("foodPrice").value
    );

    const button = document.getElementById("saveFoodBtn");

    if (!name || !categoryId || !Number.isFinite(price) || price < 0) {
        adminFoodsAlert(
            "Vui lòng kiểm tra tên, danh mục và đơn giá.",
            "warning"
        );
        return;
    }

    const oldFood = adminFoodsData.find(
        item => String(adminFoodsId(item)) === String(id)
    );

    const payload = {
        name,
        categoryId: Number(categoryId),
        foodCategoryId: Number(categoryId),
        price,
        imageUrl:
            document.getElementById("foodImage").value.trim() || null,
        description:
            document.getElementById("foodDescription").value.trim() || null,
        isActive:
            document.getElementById("foodStatus").checked,
        isAvailable:
            document.getElementById("foodStatus").checked
    };

    const quantity =
        oldFood?.quantity ?? oldFood?.Quantity;

    if (quantity !== undefined) {
        payload.quantity = Number(quantity);
    }

    try {
        button.disabled = true;
        button.textContent = "Đang lưu...";

        await adminFoodsRequest(
            id
                ? `${ADMIN_FOODS_API}/${encodeURIComponent(id)}`
                : ADMIN_FOODS_API,
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(payload)
            }
        );

        adminFoodsCloseModal();

        await adminFoodsLoad();

        adminFoodsAlert(
            id
                ? "Cập nhật sản phẩm thành công."
                : "Thêm sản phẩm thành công.",
            "success"
        );
    } catch (error) {
        adminFoodsAlert(error.message, "danger");
    } finally {
        button.disabled = false;
        button.textContent = "Lưu sản phẩm";
    }
}

async function adminFoodsDelete(id) {
    const food = adminFoodsData.find(
        item => String(adminFoodsId(item)) === String(id)
    );

    if (!food) return;

    if (!confirm(
        `Bạn có chắc muốn xóa "${adminFoodsName(food)}"?`
    )) {
        return;
    }

    try {
        await adminFoodsRequest(
            `${ADMIN_FOODS_API}/${encodeURIComponent(id)}`,
            { method: "DELETE" }
        );

        await adminFoodsLoad();

        adminFoodsAlert(
            "Xóa sản phẩm thành công.",
            "success"
        );
    } catch (error) {
        adminFoodsAlert(error.message, "danger");
    }
}

// -----------------------------------------------------
// GAN SU KIEN CHO TRANG ADMIN
// -----------------------------------------------------

function adminFoodsSetupEvents() {
    document.getElementById("addFoodBtn")
        ?.addEventListener("click", adminFoodsAdd);

    document.getElementById("closeFoodModal")
        ?.addEventListener("click", adminFoodsCloseModal);

    document.getElementById("cancelFoodBtn")
        ?.addEventListener("click", adminFoodsCloseModal);

    document.getElementById("foodForm")
        ?.addEventListener("submit", adminFoodsSave);

    document.getElementById("foodImage")
        ?.addEventListener("input", adminFoodsPreviewImage);

    document.getElementById("foodImage")
        ?.addEventListener("change", adminFoodsPreviewImage);

    document.getElementById("foodSearch")
        ?.addEventListener("input", adminFoodsRenderTable);

    document.getElementById("foodCategoryFilter")
        ?.addEventListener("change", adminFoodsRenderTable);

    document.getElementById("foodStatusFilter")
        ?.addEventListener("change", adminFoodsRenderTable);

    document.getElementById("filterFoodsBtn")
        ?.addEventListener("click", adminFoodsRenderTable);

    document.getElementById("resetFoodsBtn")
        ?.addEventListener("click", () => {
            document.getElementById("foodSearch").value = "";
            document.getElementById("foodCategoryFilter").value = "";
            document.getElementById("foodStatusFilter").value = "";

            adminFoodsRenderTable();
        });

    document.getElementById("refreshFoodsBtn")
        ?.addEventListener("click", async () => {
            await adminFoodsLoadCategories();
            await adminFoodsLoad();
        });

    document.getElementById("addFoodCategoryBtn")
        ?.addEventListener("click", adminFoodsOpenCategoryModal);

    document.getElementById("closeFoodCategoryModal")
        ?.addEventListener("click", adminFoodsCloseCategoryModal);

    document.getElementById("cancelFoodCategoryBtn")
        ?.addEventListener("click", adminFoodsCloseCategoryModal);

    document.getElementById("foodCategoryForm")
        ?.addEventListener("submit", adminFoodsSaveCategory);

    document.getElementById("foodsTable")
        ?.addEventListener("click", event => {
            const button = event.target.closest(
                "button[data-food-action]"
            );

            if (!button) return;

            if (button.dataset.foodAction === "edit") {
                adminFoodsEdit(button.dataset.id);
            } else if (button.dataset.foodAction === "delete") {
                adminFoodsDelete(button.dataset.id);
            }
        });

    document.getElementById("foodCategoryModal")
        ?.addEventListener("click", event => {
            if (event.target.id === "foodCategoryModal") {
                adminFoodsCloseCategoryModal();
                return;
            }

            const button = event.target.closest(
                "button[data-category-action]"
            );

            if (!button) return;

            if (button.dataset.categoryAction === "edit") {
                adminFoodsEditCategory(button.dataset.id);
            } else if (button.dataset.categoryAction === "delete") {
                adminFoodsDeleteCategory(button.dataset.id);
            }
        });

    document.getElementById("foodModal")
        ?.addEventListener("click", event => {
            if (event.target.id === "foodModal") {
                adminFoodsCloseModal();
            }
        });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            adminFoodsCloseModal();
            adminFoodsCloseCategoryModal();
        }
    });
}

// =====================================================
// KHOI DONG CHUNG
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {
    // Chi chay phan quan tri neu dang o Foods.html.
    // Trang dat do an cua khach hang khong bi anh huong.
    if (!adminFoodsPageExists()) {
        return;
    }

    adminFoodsSetupEvents();

    await adminFoodsLoadCategories();
    await adminFoodsLoad();
});

/* CAP NHAT CHU THICH TRANG THAI KINH DOANH */
document.addEventListener("DOMContentLoaded", function () {
    const foodStatus = document.getElementById("foodStatus");
    const foodStatusText = document.getElementById("foodStatusText");

    if (!foodStatus || !foodStatusText) return;

    function updateFoodStatusText() {
        if (foodStatus.checked) {
            foodStatusText.textContent = "Đang kinh doanh";
            foodStatusText.classList.remove("inactive");
        } else {
            foodStatusText.textContent = "Ngừng kinh doanh";
            foodStatusText.classList.add("inactive");
        }
    }

    foodStatus.addEventListener("change", updateFoodStatusText);
    updateFoodStatusText();
});
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