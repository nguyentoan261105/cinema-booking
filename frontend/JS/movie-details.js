const API_BASE_URL = "http://localhost:5126/api";
const BACKEND_URL = "http://localhost:5126";


function getMovieId() {

    const params =
        new URLSearchParams(window.location.search);

    return params.get("id") || "1";
}


async function loadMovie() {

    const movieId = getMovieId();

    const apiUrl =
        `${API_BASE_URL}/movies/${movieId}`;

    console.log("Movie ID:", movieId);
    console.log("API:", apiUrl);


    try {

        const response = await fetch(apiUrl, {
            method: "GET",
            cache: "no-store"
        });


        console.log(
            "HTTP Status:",
            response.status
        );


        if (!response.ok) {

            if (response.status === 404) {

                showMovieError(
                    "Khong tim thay phim."
                );

                return;
            }

            throw new Error(
                "HTTP Error: " + response.status
            );
        }


        const movie =
            await response.json();


        console.log(
            "Du lieu phim tu database:",
            movie
        );


        displayMovie(movie);


    } catch (error) {

        console.error(
            "LOI LOAD CHI TIET PHIM:",
            error
        );


        showMovieError(
            "Khong the tai thong tin phim."
        );
    }
}


function displayMovie(movie) {

    // POSTER

    const moviePoster =
        document.getElementById("moviePoster");

    if (moviePoster) {

        let poster =
            movie.posterUrl;

        if (
            poster &&
            poster.startsWith("/")
        ) {

            poster =
                BACKEND_URL + poster;
        }


        if (poster) {

            moviePoster.src =
                poster;

        } else {

            moviePoster.src =
                "https://via.placeholder.com/300x450?text=No+Image";
        }
    }


    // TEN PHIM

    const movieTitle =
        document.getElementById("movieTitle");

    if (movieTitle) {

        movieTitle.textContent =
            movie.title ||
            "Chua co ten phim";
    }


    // RATING

    const movieRating =
        document.getElementById("movieRating");

    if (movieRating) {

        if (
            movie.rating !== null &&
            movie.rating !== undefined
        ) {

            movieRating.textContent =
                Number(movie.rating).toFixed(1);

        } else {

            movieRating.textContent =
                "0.0";
        }
    }


    // THOI LUONG

    const movieDuration =
        document.getElementById("movieDuration");

    if (movieDuration) {

        if (movie.durationMinutes) {

            movieDuration.textContent =
                movie.durationMinutes +
                " phut";

        } else {

            movieDuration.textContent =
                "Chua cap nhat";
        }
    }


    // NGAY PHAT HANH

    const movieRelease =
        document.getElementById("movieRelease");

    if (movieRelease) {

        movieRelease.textContent =
            formatDate(
                movie.releaseDate
            );
    }


    // THE LOAI

    const movieGenre =
        document.getElementById("movieGenre");

    if (movieGenre) {

        movieGenre.textContent =
            movie.genre ||
            "Chua cap nhat";
    }


    // DAO DIEN

    const movieDirector =
        document.getElementById("movieDirector");

    if (movieDirector) {

        movieDirector.textContent =
            movie.director ||
            "Chua cap nhat";
    }


    // DIEN VIEN

    const movieActors =
        document.getElementById("movieActors");

    if (movieActors) {

        movieActors.textContent =
            movie.actors ||
            "Chua cap nhat";
    }


    // MO TA

    const movieDescription =
        document.getElementById("movieDescription");

    if (movieDescription) {

        movieDescription.textContent =
            movie.description ||
            "Chua co mo ta cho phim.";
    }


    // TRANG THAI

    const movieStatus =
        document.getElementById("movieStatus");

    if (movieStatus) {

        if (movie.isActive) {

            movieStatus.textContent =
                "DANG CHIEU";

        } else {

            movieStatus.textContent =
                "NGUNG CHIEU";
        }
    }


    // TRAILER

    setupTrailer(
        movie.trailerUrl
    );


    // NUT DAT VE

    const bookingButton =
        document.getElementById("bookingButton");

    if (bookingButton) {

        bookingButton.href =
            "../Booking/Showtimes.html?movieId=" +
            encodeURIComponent(movie.id);

        bookingButton.textContent =
            "DAT VE NGAY";
    }
}


function formatDate(value) {

    if (!value) {

        return "Chua cap nhat";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Chua cap nhat";
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


function setupTrailer(trailerUrl) {

    const trailerButton =
        document.getElementById(
            "trailerButton"
        );


    if (!trailerButton) {

        return;
    }


    if (
        trailerUrl &&
        trailerUrl.trim() !== ""
    ) {

        trailerButton.style.display =
            "inline-flex";

        trailerButton.dataset.trailerUrl =
            trailerUrl;

    } else {

        trailerButton.style.display =
            "inline-flex";

        trailerButton.dataset.trailerUrl =
            "";
    }
}


function showTrailer() {

    const trailerButton =
        document.getElementById(
            "trailerButton"
        );


    if (!trailerButton) {

        return;
    }


    const trailerUrl =
        trailerButton.dataset.trailerUrl;


    const trailerFrame =
        document.getElementById(
            "trailerFrame"
        );


    const trailerMessage =
        document.getElementById(
            "trailerMessage"
        );


    if (
        !trailerUrl ||
        trailerUrl.trim() === ""
    ) {

        if (trailerFrame) {

            trailerFrame.style.display =
                "none";
        }


        if (trailerMessage) {

            trailerMessage.style.display =
                "block";
        }

    } else {

        if (trailerFrame) {

            trailerFrame.style.display =
                "block";

            trailerFrame.src =
                trailerUrl;
        }


        if (trailerMessage) {

            trailerMessage.style.display =
                "none";
        }
    }


    const modalElement =
        document.getElementById(
            "trailerModal"
        );


    if (!modalElement) {

        return;
    }


    const modal =
        new bootstrap.Modal(
            modalElement
        );


    modal.show();
}


function showMovieError(message) {

    const movieTitle =
        document.getElementById(
            "movieTitle"
        );


    if (movieTitle) {

        movieTitle.textContent =
            message;
    }


    const movieDescription =
        document.getElementById(
            "movieDescription"
        );


    if (movieDescription) {

        movieDescription.textContent =
            "Vui long quay lai danh sach phim va thu lai.";
    }


    const bookingButton =
        document.getElementById(
            "bookingButton"
        );


    if (bookingButton) {

        bookingButton.style.display =
            "none";
    }
}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadMovie();

    }
);