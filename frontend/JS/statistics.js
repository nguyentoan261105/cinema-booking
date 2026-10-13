document.addEventListener("DOMContentLoaded", function () {
    // =========================
    // CAU HINH API
    // =========================

    const API_BASE_URL = "http://localhost:5126/api";
    const DASHBOARD_API = `${API_BASE_URL}/admin/dashboard`;
    const CHARTS_API = `${API_BASE_URL}/admin/statistics/charts`;

    // =========================
    // CAC PHAN TU HTML
    // =========================
    const yearSelect = document.getElementById("yearSelect");
    const monthSelect = document.getElementById("monthSelect");
    const filterBtn = document.getElementById("filterBtn");
    const refreshBtn = document.getElementById("refreshStatisticsBtn");

    const messageBox = document.getElementById("statisticsMessage");
    const loadingBox = document.getElementById("adminLoading");
    const errorBox = document.getElementById("adminError");
    const errorText = document.getElementById("adminErrorText");
    const retryBtn = document.getElementById("adminRetryBtn");

    const sidebar = document.getElementById("adminSidebar");
    const mobileBtn = document.getElementById("adminMobileBtn");
    const sidebarOverlay = document.getElementById("adminSidebarOverlay");
    const logoutBtn = document.getElementById("adminSidebarLogout");

    // =========================
    // TRANG THAI
    // =========================
    let revenueChart = null;
    let ticketsChart = null;
    let bookingStatusChart = null;
    let movieRevenueChart = null;

    let currentRequestController = null;

    const moneyFormatter = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    });

    const numberFormatter = new Intl.NumberFormat("vi-VN");

    // =========================
    // HAM HO TRO
    // =========================
    function getElement(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        const element = getElement(id);

        if (element) {
            element.textContent = value ?? "0";
        }
    }

    function setNumber(id, value) {
        const number = Number(value);

        setText(
            id,
            numberFormatter.format(Number.isFinite(number) ? number : 0)
        );
    }

    function setMoney(id, value) {
        const number = Number(value);

        setText(
            id,
            moneyFormatter.format(Number.isFinite(number) ? number : 0)
        );
    }

    function getNumber(data, names, defaultValue = 0) {
        for (const name of names) {
            if (
                data &&
                data[name] !== undefined &&
                data[name] !== null &&
                data[name] !== ""
            ) {
                const value = Number(data[name]);

                if (Number.isFinite(value)) {
                    return value;
                }
            }
        }

        return defaultValue;
    }

    function getToken() {
        return (
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token") ||
            ""
        );
    }

    function getCurrentUser() {
        const possibleKeys = [
            "currentUser",
            "user",
            "loggedInUser"
        ];

        for (const key of possibleKeys) {
            const value = localStorage.getItem(key);

            if (!value) {
                continue;
            }

            try {
                return JSON.parse(value);
            } catch {
                continue;
            }
        }

        return null;
    }

    function showMessage(message, type = "info") {
        if (!messageBox) {
            return;
        }

        messageBox.className = `alert alert-${type} statistics-message`;
        messageBox.textContent = message;
        messageBox.classList.remove("d-none");
        messageBox.style.display = "block";
    }

    function hideMessage() {
        if (!messageBox) {
            return;
        }

        messageBox.classList.add("d-none");
        messageBox.style.display = "none";
        messageBox.textContent = "";
    }

    function showLoading(show) {
        if (!loadingBox) {
            return;
        }

        loadingBox.classList.toggle("d-none", !show);
    }

    function showError(message) {
        if (!errorBox) {
            showMessage(message, "danger");
            return;
        }

        errorBox.classList.remove("d-none");
        errorBox.style.display = "flex";

        if (errorText) {
            errorText.textContent = message;
        }
    }

    function hideError() {
        if (!errorBox) {
            return;
        }

        errorBox.classList.add("d-none");
        errorBox.style.display = "none";
    }

    function getSelectedYear() {
        const value = Number(yearSelect?.value);

        if (Number.isInteger(value) && value >= 2000 && value <= 2100) {
            return value;
        }

        return new Date().getFullYear();
    }

    function getSelectedMonth() {
        const value = Number(monthSelect?.value);

        if (Number.isInteger(value) && value >= 0 && value <= 12) {
            return value;
        }

        return new Date().getMonth() + 1;
    }

    function getMonthName(month) {
        if (month === 0) {
            return "Cả năm";
        }

        return `Tháng ${month}`;
    }

    function formatPeriod(year, month) {
        return month === 0
            ? `Cả năm ${year}`
            : `Tháng ${month}/${year}`;
    }

    // =========================
    // KHOI TAO BO LOC
    // =========================
    function initializeFilters() {
        if (!yearSelect) {
            return;
        }

        const currentYear = new Date().getFullYear();
        const selectedYear = Number(yearSelect.value);

        // Chuan hoa cac option nam trong HTML hien tai.
        const existingYears = new Set();

        Array.from(yearSelect.options).forEach(function (option) {
            const match = option.textContent.match(/\d{4}/);

            if (match) {
                option.value = match[0];
                existingYears.add(Number(match[0]));
            }
        });

        // Neu HTML chua co nam thi tao danh sach nam.
        if (yearSelect.options.length === 0) {
            for (let year = currentYear; year >= 2023; year--) {
                const option = document.createElement("option");

                option.value = String(year);
                option.textContent = `Năm ${year}`;

                yearSelect.appendChild(option);
            }
        } else {
            // Dam bao co nam hien tai trong danh sach.
            if (!existingYears.has(currentYear)) {
                const option = document.createElement("option");

                option.value = String(currentYear);
                option.textContent = `Năm ${currentYear}`;

                yearSelect.insertBefore(option, yearSelect.firstChild);
            }
        }

        if (
            Number.isInteger(selectedYear) &&
            selectedYear >= 2000 &&
            Array.from(yearSelect.options).some(
                option => Number(option.value) === selectedYear
            )
        ) {
            yearSelect.value = String(selectedYear);
        } else {
            yearSelect.value = String(currentYear);
        }

        if (monthSelect) {
            // Them tuy chon ca nam neu chua co.
            const hasAllYear = Array.from(monthSelect.options).some(
                option => option.value === "0"
            );

            if (!hasAllYear) {
                const option = document.createElement("option");

                option.value = "0";
                option.textContent = "Cả năm";

                monthSelect.insertBefore(option, monthSelect.firstChild);
            }

            // Mac dinh chon thang hien tai neu gia tri chua hop le.
            const month = Number(monthSelect.value);

            if (!Number.isInteger(month) || month < 0 || month > 12) {
                monthSelect.value = String(new Date().getMonth() + 1);
            }
        }
    }

    // =========================
    // HIEN THI THONG TIN ADMIN
    // =========================
    function renderAdminInfo() {
        const user = getCurrentUser();

        if (!user) {
            return;
        }

        const name =
            user.fullName ||
            user.FullName ||
            user.name ||
            user.Name ||
            user.userName ||
            user.UserName ||
            user.email ||
            user.Email;

        if (name) {
            setText("adminUserName", name);
        }
    }

    // =========================
    // LAY DU LIEU TU API
    // =========================
    async function fetchDashboardStatistics(year, month) {
        const token = getToken();

        const headers = {
            "Accept": "application/json"
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const url = new URL(DASHBOARD_API);

        url.searchParams.set("year", String(year));
        url.searchParams.set("month", String(month));

        if (currentRequestController) {
            currentRequestController.abort();
        }

        currentRequestController = new AbortController();

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: headers,
            signal: currentRequestController.signal
        });

        if (response.status === 401) {
            throw new Error(
                "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "Tài khoản hiện tại không có quyền truy cập trang thống kê Admin."
            );
        }

        if (!response.ok) {
            let detail = "";

            try {
                const errorData = await response.json();

                detail =
                    errorData.message ||
                    errorData.title ||
                    errorData.detail ||
                    "";
            } catch {
                // Khong co noi dung loi JSON.
            }

            throw new Error(
                detail ||
                `Không thể tải dữ liệu từ API. Mã lỗi: ${response.status}.`
            );
        }

        return await response.json();
    }
    
    async function fetchChartStatistics(year, month) {
        const token = getToken();

        const headers = {
            Accept: "application/json"
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const url = new URL(CHARTS_API);

        url.searchParams.set("year", String(year));
        url.searchParams.set("month", String(month));

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: headers,
            signal: currentRequestController?.signal
        });

        if (response.status === 401) {
            throw new Error(
                "Phien dang nhap khong hop le hoac da het han."
            );
        }

        if (response.status === 403) {
            throw new Error(
                "Tai khoan khong co quyen xem thong ke."
            );
        }

        if (!response.ok) {
            let message = "";

            try {
                const result = await response.json();
                message = result.message || result.title || result.detail || "";
            } catch {
                // Khong co noi dung loi JSON.
            }

            throw new Error(
                message || `Loi API bieu do: ${response.status}`
            );
        }

        return await response.json();
    }


    // =========================
    // CAP NHAT CAC THE THONG KE
    // =========================
    function renderStatistics(data, year, month) {
        const totalRevenue = getNumber(data, [
            "totalRevenue",
            "TotalRevenue",
            "revenue",
            "Revenue"
        ]);

        const ticketsSold = getNumber(data, [
            "ticketsSold",
            "TicketsSold",
            "totalTicketsSold",
            "TotalTicketsSold"
        ]);

        const totalMovies = getNumber(data, [
            "totalMovies",
            "TotalMovies",
            "movieCount",
            "MovieCount",
            "movies",
            "Movies"
        ]);

        const activeMovies = getNumber(data, [
            "activeMovies",
            "ActiveMovies",
            "activeMovieCount",
            "ActiveMovieCount"
        ]);

        const totalUsers = getNumber(data, [
            "totalUsers",
            "TotalUsers",
            "userCount",
            "UserCount"
        ]);

        const totalStaff = getNumber(data, [
            "totalStaff",
            "TotalStaff",
            "staffCount",
            "StaffCount"
        ]);

        const totalCinemas = getNumber(data, [
            "totalCinemas",
            "TotalCinemas",
            "cinemaCount",
            "CinemaCount"
        ]);

        const totalRooms = getNumber(data, [
            "totalRooms",
            "TotalRooms",
            "roomCount",
            "RoomCount"
        ]);

        const totalShowtimes = getNumber(data, [
            "totalShowtimes",
            "TotalShowtimes",
            "showtimeCount",
            "ShowtimeCount"
        ]);

        // Cac the thong ke tong quan.
        setMoney("totalRevenue", totalRevenue);
        setNumber("ticketsSold", ticketsSold);
        setNumber("totalMovies", totalMovies);
        setNumber("activeMovies", activeMovies);
        setNumber("totalUsers", totalUsers);
        setNumber("totalStaff", totalStaff);
        setNumber("totalCinemas", totalCinemas);
        setNumber("totalRooms", totalRooms);
        setNumber("totalShowtimes", totalShowtimes);
        setNumber("staffCountDisplay", totalStaff);

        // Khu vuc doanh thu.
        setMoney("revenueSummary", totalRevenue);
        setText("revenuePeriod", formatPeriod(year, month));
        setText("summaryMonth", getMonthName(month));
        setText("summaryYear", String(year));
        setNumber("summaryTickets", ticketsSold);

        // Danh sach thong tin he thong.
        setNumber("systemActiveMovies", activeMovies);
        setNumber("systemCinemas", totalCinemas);
        setNumber("systemRooms", totalRooms);
        setNumber("systemShowtimes", totalShowtimes);
        setNumber("systemUsers", totalUsers);

        // Cap nhat thanh hien thi doanh thu.
        const revenueLine = getElement("revenueLine");

        if (revenueLine) {
            revenueLine.style.width = totalRevenue > 0 ? "100%" : "0%";
            revenueLine.setAttribute(
                "aria-label",
                `Doanh thu ${moneyFormatter.format(totalRevenue)}`
            );
        }

        // Cap nhat mo ta theo ky.
        const revenuePeriodText = document.querySelector(
            ".statistics-card .statistics-info small"
        );

        if (revenuePeriodText) {
            revenuePeriodText.textContent = `Kỳ: ${formatPeriod(year, month)}`;
        }
    }

    // =========================
    // BIEU DO CHART.JS
    // =========================
    function destroyChart(chart) {
        if (chart) {
            chart.destroy();
        }
    }

    function showChartPlaceholder(canvasId, message) {
        const canvas = getElement(canvasId);

        if (!canvas) {
            return;
        }

        const parent = canvas.parentElement;

        if (!parent) {
            return;
        }

        let placeholder = parent.querySelector(
            `[data-chart-placeholder="${canvasId}"]`
        );

        if (!placeholder) {
            placeholder = document.createElement("div");
            placeholder.dataset.chartPlaceholder = canvasId;
            placeholder.className =
                "d-flex flex-column align-items-center justify-content-center text-secondary text-center";
            placeholder.style.position = "absolute";
            placeholder.style.inset = "0";
            placeholder.style.padding = "20px";

            parent.appendChild(placeholder);
        }

        placeholder.innerHTML = `
            <i class="bi bi-bar-chart-line fs-2 mb-2"></i>
            <div>${message}</div>
        `;

        canvas.style.display = "none";
    }

    function hideChartPlaceholder(canvasId) {
        const canvas = getElement(canvasId);

        if (!canvas) {
            return;
        }

        canvas.style.display = "block";

        const parent = canvas.parentElement;

        if (!parent) {
            return;
        }

        const placeholder = parent.querySelector(
            `[data-chart-placeholder="${canvasId}"]`
        );

        if (placeholder) {
            placeholder.remove();
        }
    }

    function createChart(canvasId, type, labels, datasets, options = {}) {
        const canvas = getElement(canvasId);

        if (!canvas || typeof Chart === "undefined") {
            return null;
        }

        if (!labels || labels.length === 0 || !datasets || datasets.length === 0) {
            showChartPlaceholder(
                canvasId,
                "Chưa có dữ liệu chi tiết từ API để hiển thị biểu đồ."
            );

            return null;
        }

        hideChartPlaceholder(canvasId);

        return new Chart(canvas, {
            type: type,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: datasets.length > 1 ||
                            type === "pie" ||
                            type === "doughnut",
                        position: "bottom"
                    },
                    tooltip: {
                        callbacks: options.moneyTooltip
                            ? {
                                label: function (context) {
                                    const value = Number(
                                        context.parsed?.y ??
                                        context.parsed ??
                                        context.raw ??
                                        0
                                    );

                                    return `${context.dataset.label || ""}: ${
                                        moneyFormatter.format(value)
                                    }`;
                                }
                            }
                            : {}
                    }
                },
                scales: type === "pie" || type === "doughnut"
                    ? {}
                    : {
                        y: {
                            beginAtZero: true,
                            ticks: options.moneyAxis
                                ? {
                                    callback: function (value) {
                                        return numberFormatter.format(value) + " ₫";
                                    }
                                }
                                : {
                                    precision: 0
                                }
                        }
                    }
            }
        });
    }

    function renderEmptyCharts() {
        destroyChart(revenueChart);
        destroyChart(ticketsChart);
        destroyChart(bookingStatusChart);
        destroyChart(movieRevenueChart);

        revenueChart = null;
        ticketsChart = null;
        bookingStatusChart = null;
        movieRevenueChart = null;

        showChartPlaceholder(
            "revenueChart",
            "Cần API doanh thu theo ngày để vẽ biểu đồ."
        );

        showChartPlaceholder(
            "ticketsChart",
            "Cần API số vé bán theo ngày để vẽ biểu đồ."
        );

        showChartPlaceholder(
            "bookingStatusChart",
            "Cần API số đơn theo trạng thái để vẽ biểu đồ."
        );

        showChartPlaceholder(
            "movieRevenueChart",
            "Cần API doanh thu theo phim để vẽ biểu đồ."
        );
    }

    // Cac ham nay co the dung khi backend da tra ve du lieu bieu do.
    // Du lieu bieu do phai duoc backend cung cap, khong tao so lieu gia.
    function renderRevenueChart(items) {
        destroyChart(revenueChart);

        if (!Array.isArray(items) || items.length === 0) {
            showChartPlaceholder(
                "revenueChart",
                "Chưa có dữ liệu doanh thu theo ngày từ API."
            );

            revenueChart = null;
            return;
        }

        revenueChart = createChart(
            "revenueChart",
            "line",
            items.map(item => item.label ?? item.date ?? ""),
            [{
                label: "Doanh thu",
                data: items.map(item =>
                    getNumber(item, ["value", "revenue", "totalRevenue"])
                ),
                borderColor: "#ed0b18",
                backgroundColor: "rgba(237, 11, 24, 0.12)",
                borderWidth: 3,
                fill: true,
                tension: 0.35
            }],
            {
                moneyAxis: true,
                moneyTooltip: true
            }
        );
    }

    function renderTicketsChart(items) {
        destroyChart(ticketsChart);

        if (!Array.isArray(items) || items.length === 0) {
            showChartPlaceholder(
                "ticketsChart",
                "Chưa có dữ liệu vé bán theo ngày từ API."
            );

            ticketsChart = null;
            return;
        }

        ticketsChart = createChart(
            "ticketsChart",
            "bar",
            items.map(item => item.label ?? item.date ?? ""),
            [{
                label: "Số vé",
                data: items.map(item =>
                    getNumber(item, ["value", "ticketsSold", "count"])
                ),
                backgroundColor: "rgba(237, 11, 24, 0.75)",
                borderRadius: 6
            }]
        );
    }

    function renderBookingStatusChart(items) {
        destroyChart(bookingStatusChart);

        if (!Array.isArray(items) || items.length === 0) {
            showChartPlaceholder(
                "bookingStatusChart",
                "Chưa có dữ liệu trạng thái đặt vé từ API."
            );

            bookingStatusChart = null;
            return;
        }

        bookingStatusChart = createChart(
            "bookingStatusChart",
            "doughnut",
            items.map(item => item.label ?? item.statusName ?? item.status ?? ""),
            [{
                label: "Số đơn",
                data: items.map(item =>
                    getNumber(item, ["value", "count", "total"])
                ),
                backgroundColor: [
                    "#16a34a",
                    "#2563eb",
                    "#f59e0b",
                    "#dc2626",
                    "#8b5cf6",
                    "#64748b"
                ],
                borderWidth: 2,
                borderColor: "#ffffff"
            }]
        );
    }

    function renderMovieRevenueChart(items) {
        destroyChart(movieRevenueChart);

        if (!Array.isArray(items) || items.length === 0) {
            showChartPlaceholder(
                "movieRevenueChart",
                "Chưa có dữ liệu doanh thu theo phim từ API."
            );

            movieRevenueChart = null;
            return;
        }

        movieRevenueChart = createChart(
            "movieRevenueChart",
            "bar",
            items.map(item => item.label ?? item.movieName ?? item.name ?? ""),
            [{
                label: "Doanh thu",
                data: items.map(item =>
                    getNumber(item, ["value", "revenue", "totalRevenue"])
                ),
                backgroundColor: "rgba(237, 11, 24, 0.75)",
                borderRadius: 6
            }],
            {
                moneyAxis: true,
                moneyTooltip: true
            }
        );
    }
    
    function renderChartStatistics(data) {
        renderRevenueChart(
            (data.dailyRevenue || []).map(item => ({
                label: item.date,
                value: item.revenue
            }))
        );

        renderTicketsChart(
            (data.dailyTickets || []).map(item => ({
                label: item.date,
                value: item.tickets
            }))
        );

        renderBookingStatusChart(
            (data.bookingStatuses || []).map(item => ({
                label: item.label,
                value: item.count
            }))
        );

        renderMovieRevenueChart(
            (data.revenueByMovie || []).map(item => ({
                label: item.movieTitle,
                value: item.revenue
            }))
        );
    }


    // =========================
    // TAI VA CAP NHAT THONG KE
    // =========================
    
    async function loadStatistics() {
        const year = getSelectedYear();
        const month = getSelectedMonth();

        hideMessage();
        hideError();
        showLoading(true);

        if (filterBtn) filterBtn.disabled = true;
        if (refreshBtn) refreshBtn.disabled = true;

        if (currentRequestController) {
            currentRequestController.abort();
        }

        currentRequestController = new AbortController();

        try {
            // Dashboard hien tai chi ho tro thang 1-12.
            const dashboardMonth = month === 0
                ? new Date().getMonth() + 1
                : month;

            const [dashboardData, chartData] = await Promise.all([
                fetchDashboardStatistics(year, dashboardMonth),
                fetchChartStatistics(year, month)
            ]);

            renderStatistics(dashboardData, year, month);
            renderChartStatistics(chartData);

            showMessage(
                `Đã tải xong thống kê ${formatPeriod(year, month)}.`,
                "success"
            );
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            console.error("Lỗi khi tải thống kê:", error);

            showError(
                error.message ||
                "Không thể tải dữ liệu thống kê. Hay kiểm tra backend."
            );
        } finally {
            showLoading(false);

            if (filterBtn) filterBtn.disabled = false;
            if (refreshBtn) refreshBtn.disabled = false;
        }
    }


    // =========================
    // MENU TREN DIEN THOAI
    // =========================
    function closeSidebar() {
        if (sidebar) {
            sidebar.classList.remove("active", "show");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active", "show");
        }

        document.body.classList.remove("admin-sidebar-open");
    }

    function toggleSidebar() {
        if (!sidebar) {
            return;
        }

        const isOpen = sidebar.classList.contains("active");

        if (isOpen) {
            closeSidebar();
            return;
        }

        sidebar.classList.add("active");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("active");
        }

        document.body.classList.add("admin-sidebar-open");
    }

    // =========================
    // DANG XUAT
    // =========================
    function logout() {
        const confirmed = window.confirm("Bạn có chắc muốn đăng xuất?");

        if (!confirmed) {
            return;
        }

        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        localStorage.removeItem("user");
        localStorage.removeItem("loggedInUser");

        window.location.href = "../Account/Login.html";
    }

    // =========================
    // GAN SU KIEN
    // =========================
    if (filterBtn) {
        filterBtn.addEventListener("click", function () {
            loadStatistics();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", function () {
            loadStatistics();
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener("click", function () {
            loadStatistics();
        });
    }

    if (yearSelect) {
        yearSelect.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                loadStatistics();
            }
        });
    }

    if (monthSelect) {
        monthSelect.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                loadStatistics();
            }
        });
    }

    if (mobileBtn) {
        mobileBtn.addEventListener("click", toggleSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    if (sidebar) {
        sidebar.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeSidebar);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // =========================
    // KHOI DONG
    // =========================
    initializeFilters();
    renderAdminInfo();
    renderEmptyCharts();
    loadStatistics();
});