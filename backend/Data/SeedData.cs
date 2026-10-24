using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class SeedData
{
    public static async Task InitializeAsync(ApplicationDbContext db)
    {
        // =========================
        // 1. DATABASE
        // =========================
        await db.Database.MigrateAsync();

        // =========================
        // 2. USERS
        // =========================
        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new ApplicationUser
                {
                    FullName = "Administrator",
                    Email = "admin@cinema.com",
                    PasswordHash = "123456",
                    Phone = "0900000001",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                },
                new ApplicationUser
                {
                    FullName = "Nguyen Van User",
                    Email = "user@cinema.com",
                    PasswordHash = "123456",
                    Phone = "0900000002",
                    Role = "User",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            );

            await db.SaveChangesAsync();
        }

        // =========================
        // 3. MOVIES
        // =========================
        var movies = await db.Movies.ToListAsync();

        if (!movies.Any())
        {
            movies = new List<Movie>
            {
                new Movie
                {
                    Title = "Avengers: Endgame",
                    Description = "Biet doi Avengers doi mat voi tan cuoc chien lon nhat de bao ve vu tru.",
                    DurationMinutes = 181,
                    ReleaseDate = new DateTime(2019, 4, 26),
                    PosterUrl = "/images/movie-1.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=TcMBFSGVi1c",
                    IsActive = true
                },

                new Movie
                {
                    Title = "Spider-Man: No Way Home",
                    Description = "Spider-Man phai doi mat voi nhung ke thu den tu cac vu tru khac.",
                    DurationMinutes = 148,
                    ReleaseDate = new DateTime(2021, 12, 17),
                    PosterUrl = "/images/spider-man-no-way-home.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=JfVOs4VSpmA",
                    IsActive = true
                },

                new Movie
                {
                    Title = "Avatar: The Way of Water",
                    Description = "Gia dinh Sully tiep tuc hanh trinh bao ve Pandora.",
                    DurationMinutes = 192,
                    ReleaseDate = new DateTime(2022, 12, 16),
                    PosterUrl = "/images/avatar-the-way-of-water.jpg",
                    TrailerUrl = "https://www.youtube.com/watch?v=d9MyW72ELq0",
                    IsActive = true
                },

                new Movie
                {
                    Title = "Doraemon: Nobita va vung dat ly tuong tren bau troi",
                    Description = "Doraemon va Nobita bat dau mot hanh trinh moi tren vung dat tren bau troi.",
                    DurationMinutes = 107,
                    ReleaseDate = new DateTime(2023, 3, 3),
                    PosterUrl = "/images/movie-4.jpg",
                    TrailerUrl = "https://www.youtube.com/",
                    IsActive = true
                }
            };

            db.Movies.AddRange(movies);
            await db.SaveChangesAsync();
        }

        var additionalMovies = new[]
        {
            new Movie
            {
                Title = "Inside Out 2",
                Description = "Riley bước vào tuổi thiếu niên và khám phá những cảm xúc mới.",
                DurationMinutes = 96,
                ReleaseDate = new DateTime(2024, 6, 14),
                PosterUrl = "/images/movie-5.jpg",
                IsActive = true,
                Rating = 7.6m,
                Genre = "Hoạt hình, Phiêu lưu",
                Director = "Kelsey Mann",
                Actors = "Amy Poehler, Maya Hawke"
            },
            new Movie
            {
                Title = "Interstellar",
                Description = "Một nhóm phi hành gia lên đường tìm kiếm hy vọng sống mới cho nhân loại.",
                DurationMinutes = 169,
                ReleaseDate = new DateTime(2014, 11, 7),
                PosterUrl = "/images/movie-6.jpg",
                IsActive = true,
                Rating = 8.7m,
                Genre = "Khoa học viễn tưởng, Phiêu lưu",
                Director = "Christopher Nolan",
                Actors = "Matthew McConaughey, Anne Hathaway"
            },
            new Movie
            {
                Title = "La La Land",
                Description = "Một nhạc công jazz và nữ diễn viên trẻ theo đuổi ước mơ tại Los Angeles.",
                DurationMinutes = 128,
                ReleaseDate = new DateTime(2016, 12, 9),
                PosterUrl = "/images/movie-8.jpg",
                IsActive = true,
                Rating = 8.0m,
                Genre = "Nhạc kịch, Lãng mạn",
                Director = "Damien Chazelle",
                Actors = "Ryan Gosling, Emma Stone"
            },
            new Movie
            {
                Title = "The Conjuring",
                Description = "Hai nhà điều tra hiện tượng siêu nhiên giúp một gia đình đối mặt với nỗi ám ảnh.",
                DurationMinutes = 112,
                ReleaseDate = new DateTime(2013, 7, 19),
                PosterUrl = "/images/movie-7.jpg",
                IsActive = true,
                Rating = 7.5m,
                Genre = "Kinh dị, Bí ẩn",
                Director = "James Wan",
                Actors = "Vera Farmiga, Patrick Wilson"
            },
            new Movie
            {
                Title = "The Batman",
                Description = "Batman lần theo dấu vết một kẻ sát nhân và những bí mật trong thành phố Gotham.",
                DurationMinutes = 176,
                ReleaseDate = new DateTime(2022, 3, 4),
                PosterUrl = "/images/movie-9.jpg",
                IsActive = true,
                Rating = 7.8m,
                Genre = "Hành động, Tội phạm",
                Director = "Matt Reeves",
                Actors = "Robert Pattinson, Zoë Kravitz"
            },
            new Movie
            {
                Title = "Dune: Part Two",
                Description = "Paul Atreides đồng hành cùng Chani và người Fremen trên hành tinh Arrakis, tìm cách bảo vệ họ trước những thế lực đang tranh giành quyền kiểm soát gia vị. Khi đứng trước lựa chọn giữa tình yêu và con đường của một nhà lãnh đạo, Paul phải đối mặt với những dự báo về tương lai và hậu quả có thể làm thay đổi cả thiên hà.",
                DurationMinutes = 166,
                ReleaseDate = new DateTime(2024, 3, 1),
                PosterUrl = "/images/movie11.jpg",
                IsActive = true,
                Rating = 8.5m,
                Genre = "Khoa học viễn tưởng, Phiêu lưu, Hành động",
                Director = "Denis Villeneuve",
                Actors = "Timothée Chalamet, Zendaya, Rebecca Ferguson, Florence Pugh, Austin Butler"
            },
            new Movie
            {
                Title = "Oppenheimer",
                Description = "Bộ phim theo chân nhà vật lý J. Robert Oppenheimer trong quá trình dẫn dắt Dự án Manhattan, nỗ lực nghiên cứu tạo ra vũ khí nguyên tử giữa thời chiến. Thành công khoa học đưa ông đến vị trí có ảnh hưởng lớn, nhưng đồng thời buộc ông đối diện với hậu quả đạo đức và chính trị của phát minh ấy. Những phiên điều trần sau chiến tranh hé lộ cuộc đấu tranh giữa lương tâm, danh tiếng và quyền lực.",
                DurationMinutes = 180,
                ReleaseDate = new DateTime(2023, 7, 21),
                PosterUrl = "/images/movie10.jpg",
                IsActive = true,
                Rating = 8.3m,
                Genre = "Chính kịch, Lịch sử, Tiểu sử",
                Director = "Christopher Nolan",
                Actors = "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh"
            },
            new Movie
            {
                Title = "The Super Mario Bros. Movie",
                Description = "Hai anh em thợ sửa ống nước Mario và Luigi bị cuốn khỏi thế giới quen thuộc đến một vương quốc đầy màu sắc. Khi Luigi bị chia cách, Mario lên đường tìm em và gặp những đồng minh mới trên hành trình vượt qua nhiều thử thách. Cả nhóm phải hợp sức ngăn chặn kế hoạch của kẻ đang đe dọa vương quốc, trong một chuyến phiêu lưu hài hước về lòng can đảm và tình thân.",
                DurationMinutes = 92,
                ReleaseDate = new DateTime(2023, 4, 5),
                PosterUrl = "/images/movie12.jpg",
                IsActive = true,
                Rating = 7.0m,
                Genre = "Hoạt hình, Phiêu lưu, Hài",
                Director = "Aaron Horvath, Michael Jelenic",
                Actors = "Chris Pratt, Anya Taylor-Joy, Charlie Day, Jack Black, Keegan-Michael Key"
            }
        };

        foreach (var movie in additionalMovies)
        {
            var existingMovie = await db.Movies
                .FirstOrDefaultAsync(x => x.Title == movie.Title);

            if (existingMovie == null)
            {
                db.Movies.Add(movie);
            }
            else if (existingMovie.PosterUrl != movie.PosterUrl)
            {
                existingMovie.PosterUrl = movie.PosterUrl;
            }
        }

        var coreMoviePosters = new[]
        {
            (Title: "Spider-Man: No Way Home", PosterUrl: "/images/spider-man-no-way-home.jpg"),
            (Title: "Avatar: The Way of Water", PosterUrl: "/images/avatar-the-way-of-water.jpg")
        };

        foreach (var (title, posterUrl) in coreMoviePosters)
        {
            var movie = await db.Movies
                .FirstOrDefaultAsync(x => x.Title == title);

            if (movie != null && movie.PosterUrl != posterUrl)
            {
                movie.PosterUrl = posterUrl;
            }
        }

        var movieTrailers = new[]
        {
            (Title: "Avengers: Endgame", TrailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c"),
            (Title: "Spider-Man: No Way Home", TrailerUrl: "https://www.youtube.com/watch?v=JfVOs4VSpmA"),
            (Title: "Avatar: The Way of Water", TrailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0"),
            (Title: "Doraemon: Nobita va vung dat ly tuong tren bau troi", TrailerUrl: "https://www.youtube.com/watch?v=JvrF88ym3_0"),
            (Title: "Inside Out 2", TrailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0"),
            (Title: "Interstellar", TrailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E"),
            (Title: "La La Land", TrailerUrl: "https://www.youtube.com/watch?v=0pdqf4P9MB8"),
            (Title: "The Conjuring", TrailerUrl: "https://www.youtube.com/watch?v=k10ETZ41q5o"),
            (Title: "The Batman", TrailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4"),
            (Title: "Dune: Part Two", TrailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"),
            (Title: "Oppenheimer", TrailerUrl: "https://www.youtube.com/watch?v=bK6ldnjE3Y0"),
            (Title: "The Super Mario Bros. Movie", TrailerUrl: "https://www.youtube.com/watch?v=TnGl01FkMMo")
        };

        foreach (var (title, trailerUrl) in movieTrailers)
        {
            var movie = await db.Movies
                .FirstOrDefaultAsync(x => x.Title == title);

            if (movie != null && movie.TrailerUrl != trailerUrl)
            {
                movie.TrailerUrl = trailerUrl;
            }
        }

        var movieCatalogDetails = new[]
        {
            (
                Title: "Avengers: Endgame",
                Description: "Sau cú búng tay khiến một nửa sinh vật trong vũ trụ biến mất, những Avengers còn sống phải tìm cách vượt qua mất mát và hàn gắn thế giới. Khi một cơ hội bất ngờ mở ra, nhóm tập hợp lần cuối để thực hiện kế hoạch đưa các đồng minh trở về và đối đầu với Thanos. Trận chiến quyết định không chỉ đặt tương lai của Trái Đất mà còn cả vận mệnh của toàn vũ trụ vào tay họ.",
                Genre: "Hành động, Phiêu lưu, Khoa học viễn tưởng",
                Director: "Anthony Russo, Joe Russo",
                Actors: "Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson, Jeremy Renner",
                Rating: 8.4m
            ),
            (
                Title: "Spider-Man: No Way Home",
                Description: "Sau khi danh tính Spider-Man bị tiết lộ, Peter Parker tìm đến Doctor Strange với hy vọng đưa cuộc sống của mình trở lại bình thường. Một phép thuật gặp trục trặc khiến ranh giới giữa các thế giới bị phá vỡ, kéo theo những đối thủ nguy hiểm từ các vũ trụ khác. Peter phải lựa chọn giữa mong muốn được sống như một chàng trai bình thường và trách nhiệm bảo vệ những người mình yêu quý.",
                Genre: "Hành động, Phiêu lưu, Khoa học viễn tưởng",
                Director: "Jon Watts",
                Actors: "Tom Holland, Zendaya, Benedict Cumberbatch, Jacob Batalon, Willem Dafoe",
                Rating: 8.2m
            ),
            (
                Title: "Avatar: The Way of Water",
                Description: "Nhiều năm sau khi lựa chọn ở lại Pandora, Jake Sully và Neytiri xây dựng cuộc sống bên các con. Khi một mối đe dọa cũ quay trở lại, gia đình họ buộc phải rời khu rừng và tìm nơi trú ẩn giữa tộc Metkayina sống bên đại dương. Tại vùng biển xa lạ, họ học cách thích nghi với một nền văn hóa mới, đồng thời đối mặt với những thử thách buộc cả gia đình phải đoàn kết để bảo vệ mái nhà và hành tinh Pandora.",
                Genre: "Khoa học viễn tưởng, Phiêu lưu, Hành động",
                Director: "James Cameron",
                Actors: "Sam Worthington, Zoe Saldaña, Sigourney Weaver, Stephen Lang, Kate Winslet",
                Rating: 7.5m
            ),
            (
                Title: "Doraemon: Nobita va vung dat ly tuong tren bau troi",
                Description: "Trong chuyến phiêu lưu mới, Nobita cùng Doraemon và những người bạn tìm đến Paradapia, một hòn đảo bí ẩn trôi giữa bầu trời, nơi mọi người đều được xem là hoàn hảo. Tại đây, họ gặp người bạn mới và khám phá những bí mật ẩn sau vẻ yên bình của hòn đảo. Khi nguy hiểm đe dọa Paradapia, cả nhóm phải vận dụng lòng dũng cảm, tình bạn và những bảo bối quen thuộc để bảo vệ nơi này.",
                Genre: "Hoạt hình, Phiêu lưu, Khoa học viễn tưởng",
                Director: "Takumi Doyama",
                Actors: "Wasabi Mizuta, Megumi Ōhara, Yumi Kakazu, Subaru Kimura, Tomokazu Seki",
                Rating: 6.8m
            ),
            (
                Title: "Inside Out 2",
                Description: "Riley bước vào tuổi thiếu niên và chuẩn bị tham gia trại khúc côn cầu, trong khi Trung tâm điều khiển cảm xúc của cô bất ngờ được mở rộng. Joy, Sadness, Anger, Fear và Disgust phải làm quen với những cảm xúc mới như Anxiety, Envy, Ennui và Embarrassment. Khi Anxiety cố kiểm soát mọi quyết định để giúp Riley hòa nhập, các cảm xúc cũ và mới phải tìm cách hiểu nhau để cô bé có thể chấp nhận con người đang dần thay đổi của mình.",
                Genre: "Hoạt hình, Phiêu lưu, Hài",
                Director: "Kelsey Mann",
                Actors: "Amy Poehler, Maya Hawke, Kensington Tallman, Liza Lapira, Tony Hale",
                Rating: 7.5m
            ),
            (
                Title: "Interstellar",
                Description: "Khi môi trường sống trên Trái Đất ngày càng suy kiệt, cựu phi công Cooper được mời tham gia một nhiệm vụ bí mật nhằm tìm kiếm nơi ở mới cho nhân loại. Anh cùng một nhóm nhà khoa học du hành qua một lỗ sâu ngoài không gian, khám phá những hành tinh xa lạ nơi thời gian và trọng lực vận hành khác thường. Trong hành trình đầy hiểm nguy ấy, Cooper phải cân bằng giữa trách nhiệm với tương lai loài người và lời hứa trở về với các con.",
                Genre: "Khoa học viễn tưởng, Phiêu lưu, Chính kịch",
                Director: "Christopher Nolan",
                Actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine, Mackenzie Foy",
                Rating: 8.7m
            ),
            (
                Title: "La La Land",
                Description: "Tại Los Angeles, Mia vừa theo đuổi ước mơ trở thành diễn viên vừa chật vật với những buổi thử vai liên tiếp, còn Sebastian là nghệ sĩ piano say mê dòng nhạc jazz truyền thống. Cuộc gặp gỡ tình cờ đưa họ đến gần nhau và cùng khích lệ nhau theo đuổi hoài bão. Khi cơ hội nghề nghiệp mở ra, những lựa chọn và hy sinh dần thử thách tình yêu của họ, đặt ra câu hỏi về cái giá của thành công và những con đường mỗi người sẽ chọn.",
                Genre: "Nhạc kịch, Lãng mạn, Chính kịch",
                Director: "Damien Chazelle",
                Actors: "Ryan Gosling, Emma Stone, John Legend, Rosemarie DeWitt, J. K. Simmons",
                Rating: 8.0m
            ),
            (
                Title: "The Conjuring",
                Description: "Vợ chồng Ed và Lorraine Warren, hai nhà điều tra những hiện tượng siêu nhiên, được một gia đình mời đến trang trại hẻo lánh ở Rhode Island. Những sự việc kỳ lạ ngày càng dữ dội khiến các thành viên trong nhà sống trong sợ hãi và buộc gia đình Warren phải tìm hiểu lịch sử đen tối của căn nhà. Khi nguy hiểm áp sát, họ phải dựa vào kinh nghiệm, niềm tin và sự gắn bó để tìm cách bảo vệ những người đang bị đe dọa.",
                Genre: "Kinh dị, Bí ẩn, Giật gân",
                Director: "James Wan",
                Actors: "Vera Farmiga, Patrick Wilson, Lili Taylor, Ron Livingston, Joey King",
                Rating: 7.5m
            ),
            (
                Title: "The Batman",
                Description: "Trong năm thứ hai hoạt động tại Gotham, Batman điều tra một loạt vụ án do kẻ sát nhân bí ẩn Riddler dàn dựng. Những manh mối dẫn anh qua thế giới ngầm của thành phố và hé lộ các bí mật liên quan đến những gia đình quyền lực, trong đó có cả quá khứ của gia đình Wayne. Cùng Selina Kyle, Batman phải lần theo sự thật trước khi âm mưu của Riddler đẩy Gotham đến bờ vực hỗn loạn, đồng thời định hình anh muốn trở thành người bảo vệ như thế nào.",
                Genre: "Hành động, Tội phạm, Bí ẩn",
                Director: "Matt Reeves",
                Actors: "Robert Pattinson, Zoë Kravitz, Paul Dano, Jeffrey Wright, Colin Farrell",
                Rating: 7.8m
            ),
            (
                Title: "Dune: Part Two",
                Description: "Paul Atreides đồng hành cùng Chani và người Fremen trên hành tinh Arrakis, tìm cách bảo vệ họ trước những thế lực đang tranh giành quyền kiểm soát gia vị. Khi đứng trước lựa chọn giữa tình yêu và con đường của một nhà lãnh đạo, Paul phải đối mặt với những dự báo về tương lai và hậu quả có thể làm thay đổi cả thiên hà.",
                Genre: "Khoa học viễn tưởng, Phiêu lưu, Hành động",
                Director: "Denis Villeneuve",
                Actors: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Florence Pugh, Austin Butler",
                Rating: 8.5m
            ),
            (
                Title: "Oppenheimer",
                Description: "Bộ phim theo chân nhà vật lý J. Robert Oppenheimer trong quá trình dẫn dắt Dự án Manhattan, nỗ lực nghiên cứu tạo ra vũ khí nguyên tử giữa thời chiến. Thành công khoa học đưa ông đến vị trí có ảnh hưởng lớn, nhưng đồng thời buộc ông đối diện với hậu quả đạo đức và chính trị của phát minh ấy. Những phiên điều trần sau chiến tranh hé lộ cuộc đấu tranh giữa lương tâm, danh tiếng và quyền lực.",
                Genre: "Chính kịch, Lịch sử, Tiểu sử",
                Director: "Christopher Nolan",
                Actors: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh",
                Rating: 8.3m
            ),
            (
                Title: "The Super Mario Bros. Movie",
                Description: "Hai anh em thợ sửa ống nước Mario và Luigi bị cuốn khỏi thế giới quen thuộc đến một vương quốc đầy màu sắc. Khi Luigi bị chia cách, Mario lên đường tìm em và gặp những đồng minh mới trên hành trình vượt qua nhiều thử thách. Cả nhóm phải hợp sức ngăn chặn kế hoạch của kẻ đang đe dọa vương quốc, trong một chuyến phiêu lưu hài hước về lòng can đảm và tình thân.",
                Genre: "Hoạt hình, Phiêu lưu, Hài",
                Director: "Aaron Horvath, Michael Jelenic",
                Actors: "Chris Pratt, Anya Taylor-Joy, Charlie Day, Jack Black, Keegan-Michael Key",
                Rating: 7.0m
            )
        };

        foreach (var details in movieCatalogDetails)
        {
            var movie = await db.Movies
                .FirstOrDefaultAsync(x => x.Title == details.Title);

            if (movie == null)
            {
                continue;
            }

            movie.Description = details.Description;
            movie.Genre = details.Genre;
            movie.Director = details.Director;
            movie.Actors = details.Actors;
            movie.Rating = details.Rating;
        }

        var posterReleaseDates = new[]
        {
            (Title: "La La Land", ReleaseDate: new DateTime(2016, 12, 16)),
            (Title: "The Conjuring", ReleaseDate: new DateTime(2022, 1, 14))
        };

        foreach (var (title, releaseDate) in posterReleaseDates)
        {
            var movie = await db.Movies
                .FirstOrDefaultAsync(x => x.Title == title);

            if (movie != null)
            {
                movie.ReleaseDate = releaseDate;
            }
        }

        await db.SaveChangesAsync();

        // =========================
        // 4. CINEMAS
        // =========================
        var cinemaDefinitions = new[]
        {
            new Cinema
            {
                Name = "Cinema Center Quan 1",
                Address = "123 Nguyen Hue, Quan 1, TP.HCM"
            },
            new Cinema
            {
                Name = "Cinema Center Thu Duc",
                Address = "456 Vo Van Ngan, Thu Duc, TP.HCM"
            },
            new Cinema
            {
                Name = "Cinema Center Quan 7",
                Address = "88 Nguyen Thi Thap, Quan 7, TP.HCM"
            },
            new Cinema
            {
                Name = "Cinema Center Binh Thanh",
                Address = "120 Dien Bien Phu, Binh Thanh, TP.HCM"
            },
            new Cinema
            {
                Name = "Cinema Center Go Vap",
                Address = "210 Quang Trung, Go Vap, TP.HCM"
            }
        };

        foreach (var cinemaDefinition in cinemaDefinitions)
        {
            if (!await db.Cinemas.AnyAsync(x => x.Name == cinemaDefinition.Name))
            {
                db.Cinemas.Add(cinemaDefinition);
            }
        }

        await db.SaveChangesAsync();
        var cinemas = await db.Cinemas.ToListAsync();

        // =========================
        // 5. ROOMS
        // =========================
        var rooms = await db.Rooms.ToListAsync();

        foreach (var cinema in cinemas)
        {
            for (var roomNumber = 1; roomNumber <= 5; roomNumber++)
            {
                var roomName = $"Phong {roomNumber}";

                if (rooms.Any(x => x.CinemaId == cinema.Id && x.Name == roomName))
                {
                    continue;
                }

                var room = new Room
                {
                    CinemaId = cinema.Id,
                    Name = roomName,
                    Rows = 5,
                    Columns = 10
                };

                db.Rooms.Add(room);
                rooms.Add(room);
            }
        }

        await db.SaveChangesAsync();
        rooms = await db.Rooms.ToListAsync();

        // =========================
        // 6. SEATS
        // =========================
        foreach (var room in rooms)
        {
            bool hasSeats = await db.Seats.AnyAsync(x => x.RoomId == room.Id);

            if (hasSeats)
                continue;

            var seats = new List<Seat>();

            string[] rowNames =
            {
                "A",
                "B",
                "C",
                "D",
                "E"
            };

            foreach (var row in rowNames)
            {
                for (int number = 1; number <= 10; number++)
                {
                    int type;
                    decimal price;

                    if (row == "A" || row == "B")
                    {
                        // Standard
                        type = 0;
                        price = 75000;
                    }
                    else if (row == "C" || row == "D")
                    {
                        // VIP
                        type = 1;
                        price = 95000;
                    }
                    else
                    {
                        // Couple
                        type = 2;
                        price = 150000;
                    }

                    seats.Add(new Seat
                    {
                        RoomId = room.Id,
                        RowName = row,
                        Number = number,
                        Type = type,
                        Price = price
                    });
                }
            }

            db.Seats.AddRange(seats);
        }

        await db.SaveChangesAsync();

        // =========================
        // 7. SHOWTIMES
        // =========================
        var movieList = await db.Movies
            .Where(x => x.IsActive)
            .OrderBy(x => x.Id)
            .ToListAsync();

        var roomList = await db.Rooms
            .OrderBy(x => x.CinemaId)
            .ThenBy(x => x.Id)
            .ToListAsync();

        var showtimes = await db.Showtimes
            .Include(x => x.Room)
            .ToListAsync();

        var startTimes = new[]
        {
            new TimeSpan(11, 0, 0),
            new TimeSpan(13, 0, 0),
            new TimeSpan(15, 0, 0),
            new TimeSpan(17, 0, 0),
            new TimeSpan(19, 0, 0),
            new TimeSpan(21, 0, 0),
            new TimeSpan(23, 0, 0)
        };

        for (var day = 0; day < 7; day++)
        {
            var date = DateTime.Today.AddDays(day);

            foreach (var movie in movieList)
            {
                var targetShowtimes = 7 + (movie.Id + day) % 2;
                var scheduledCount = showtimes.Count(showtime =>
                    showtime.MovieId == movie.Id &&
                    showtime.StartTime.Date == date.Date);
                var randomSeed =
                    date.Year * 1000 +
                    date.DayOfYear * 31 +
                    movie.Id * 7919;
                var random = new Random(randomSeed);
                var orderedStartTimes = startTimes
                    .OrderBy(_ => random.Next())
                    .ToArray();
                var orderedCinemas = cinemas
                    .OrderBy(_ => random.Next())
                    .ToList();
                var cinemaPriorities = orderedCinemas
                    .Select((cinema, index) => new { cinema.Id, index })
                    .ToDictionary(item => item.Id, item => item.index);
                var roomPriorities = roomList
                    .OrderBy(_ => random.Next())
                    .Select((room, index) => new { room.Id, index })
                    .ToDictionary(item => item.Id, item => item.index);

                foreach (var cinema in orderedCinemas.OrderBy(cinema =>
                        showtimes.Count(showtime =>
                        showtime.MovieId == movie.Id &&
                        showtime.Room.CinemaId == cinema.Id &&
                        showtime.StartTime.Date == date.Date)
                    ).ThenBy(cinema => cinemaPriorities[cinema.Id]))
                {
                    var alreadyScheduledAtCinema = showtimes.Any(showtime =>
                        showtime.MovieId == movie.Id &&
                        showtime.Room.CinemaId == cinema.Id &&
                        showtime.StartTime.Date == date.Date);

                    if (alreadyScheduledAtCinema)
                    {
                        continue;
                    }

                    var scheduled = false;
                    var cinemaRooms = roomList
                        .Where(room => room.CinemaId == cinema.Id)
                        .OrderBy(room => showtimes.Count(showtime =>
                                showtime.RoomId == room.Id &&
                                showtime.StartTime.Date == date.Date)
                            )
                        .ThenBy(room => roomPriorities[room.Id]);

                    foreach (var room in cinemaRooms)
                    {
                        foreach (var time in orderedStartTimes)
                        {
                            var start = date.Date.Add(time);
                            var end = start.AddMinutes(movie.DurationMinutes);
                            var hasConflict = showtimes.Any(showtime =>
                                showtime.RoomId == room.Id &&
                                start < showtime.EndTime &&
                                end > showtime.StartTime);

                            if (hasConflict)
                            {
                                continue;
                            }

                            var showtime = new Showtime
                            {
                                MovieId = movie.Id,
                                RoomId = room.Id,
                                Room = room,
                                StartTime = start,
                                EndTime = end,
                                BasePrice = 75000
                            };

                            db.Showtimes.Add(showtime);
                            showtimes.Add(showtime);
                            scheduledCount++;
                            scheduled = true;
                            break;
                        }

                        if (scheduled)
                        {
                            break;
                        }
                    }

                    if (!scheduled)
                    {
                        throw new InvalidOperationException(
                            $"Khong tim thay phong va gio chieu trong ngay cho phim '{movie.Title}' tai rap '{cinema.Name}'.");
                    }
                }

                while (scheduledCount < targetShowtimes)
                {
                    var scheduled = false;
                    var cinemaOptions = cinemas
                        .OrderBy(cinema => showtimes.Count(showtime =>
                            showtime.MovieId == movie.Id &&
                            showtime.Room.CinemaId == cinema.Id &&
                            showtime.StartTime.Date == date.Date))
                        .ThenBy(cinema => cinemaPriorities[cinema.Id]);

                    foreach (var cinema in cinemaOptions)
                    {
                        var cinemaRooms = roomList
                            .Where(room => room.CinemaId == cinema.Id)
                            .OrderBy(room => showtimes.Count(showtime =>
                                    showtime.RoomId == room.Id &&
                                    showtime.StartTime.Date == date.Date)
                                )
                            .ThenBy(room => roomPriorities[room.Id]);

                        foreach (var room in cinemaRooms)
                        {
                            foreach (var time in orderedStartTimes)
                            {
                                var start = date.Date.Add(time);
                                var end = start.AddMinutes(movie.DurationMinutes);
                                var hasConflict = showtimes.Any(showtime =>
                                    showtime.RoomId == room.Id &&
                                    start < showtime.EndTime &&
                                    end > showtime.StartTime);

                                if (hasConflict)
                                {
                                    continue;
                                }

                                var showtime = new Showtime
                                {
                                    MovieId = movie.Id,
                                    RoomId = room.Id,
                                    Room = room,
                                    StartTime = start,
                                    EndTime = end,
                                    BasePrice = 75000
                                };

                                db.Showtimes.Add(showtime);
                                showtimes.Add(showtime);
                                scheduledCount++;
                                scheduled = true;
                                break;
                            }

                            if (scheduled)
                            {
                                break;
                            }
                        }

                        if (scheduled)
                        {
                            break;
                        }
                    }

                    if (!scheduled)
                    {
                        throw new InvalidOperationException(
                            $"Khong tim thay phong va gio chieu trong ngay cho phim '{movie.Title}' tai cac rap.");
                    }
                }
            }
        }

        await db.SaveChangesAsync();

        // =========================
        // 8. SHOWTIME SEATS
        // =========================
        foreach (var showtime in showtimes)
        {
            bool hasShowtimeSeats = await db.ShowtimeSeats
                .AnyAsync(x => x.ShowtimeId == showtime.Id);

            if (hasShowtimeSeats)
                continue;

            var seats = await db.Seats
                .Where(x => x.RoomId == showtime.RoomId)
                .ToListAsync();

            foreach (var seat in seats)
            {
                db.ShowtimeSeats.Add(new ShowtimeSeat
                {
                    ShowtimeId = showtime.Id,
                    SeatId = seat.Id,
                    Status = 0,
                    BookingId = null,
                    HeldByUserId = null,
                    HoldUntil = null
                });
            }
        }

        await db.SaveChangesAsync();

        // =========================
        // 9. FOOD CATEGORY
        // =========================
        if (!await db.FoodCategories.AnyAsync())
        {
            db.FoodCategories.AddRange(
                new FoodCategory
                {
                    Name = "Combo"
                },

                new FoodCategory
                {
                    Name = "Bap rang"
                },

                new FoodCategory
                {
                    Name = "Nuoc uong"
                }
            );

            await db.SaveChangesAsync();
        }

        // =========================
        // 10. FOOD
        // =========================
        if (!await db.Foods.AnyAsync())
        {
            var comboCategory = await db.FoodCategories
                .FirstAsync(x => x.Name == "Combo");

            var popcornCategory = await db.FoodCategories
                .FirstAsync(x => x.Name == "Bap rang");

            var drinkCategory = await db.FoodCategories
                .FirstAsync(x => x.Name == "Nuoc uong");

            db.Foods.AddRange(

                new Food
                {
                    Name = "Combo 1 - Bap + Pepsi",
                    Price = 129000,
                    Quantity = 100,
                    ImageUrl = "/images/food-combo1.jpg",
                    FoodCategoryId = comboCategory.Id
                },

                new Food
                {
                    Name = "Combo 2 - Bap + 2 Pepsi",
                    Price = 219000,
                    Quantity = 100,
                    ImageUrl = "/images/food-combo2.jpg",
                    FoodCategoryId = comboCategory.Id
                },

                new Food
                {
                    Name = "Bap rang bo",
                    Price = 69000,
                    Quantity = 100,
                    ImageUrl = "/images/popcorn.jpg",
                    FoodCategoryId = popcornCategory.Id
                },

                new Food
                {
                    Name = "Pepsi",
                    Price = 39000,
                    Quantity = 100,
                    ImageUrl = "/images/pepsi.jpg",
                    FoodCategoryId = drinkCategory.Id
                },

                new Food
                {
                    Name = "Coca Cola",
                    Price = 39000,
                    Quantity = 100,
                    ImageUrl = "/images/coca.jpg",
                    FoodCategoryId = drinkCategory.Id
                },

                new Food
                {
                    Name = "7UP",
                    Price = 39000,
                    Quantity = 100,
                    ImageUrl = "/images/7up.jpg",
                    FoodCategoryId = drinkCategory.Id
                }
            );

            await db.SaveChangesAsync();
        }

        Console.WriteLine("==========================================");
        Console.WriteLine(" SEED DATA COMPLETED");
        Console.WriteLine(" Movies       : " + await db.Movies.CountAsync());
        Console.WriteLine(" Cinemas      : " + await db.Cinemas.CountAsync());
        Console.WriteLine(" Rooms        : " + await db.Rooms.CountAsync());
        Console.WriteLine(" Seats        : " + await db.Seats.CountAsync());
        Console.WriteLine(" Showtimes    : " + await db.Showtimes.CountAsync());
        Console.WriteLine(" ShowtimeSeat : " + await db.ShowtimeSeats.CountAsync());
        Console.WriteLine(" Foods        : " + await db.Foods.CountAsync());
        Console.WriteLine("==========================================");
    }
}