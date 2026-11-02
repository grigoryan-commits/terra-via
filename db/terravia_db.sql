SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS `terravia_db`;
CREATE DATABASE `terravia_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `terravia_db`;

CREATE TABLE `users` (
  `id_user` INT AUTO_INCREMENT PRIMARY KEY,
  `last_name` VARCHAR(60) NOT NULL,
  `first_name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('client','manager','admin') NOT NULL DEFAULT 'client',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE `countries` (
  `id_country` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL UNIQUE,
  `region` VARCHAR(60) NOT NULL,
  `visa_required` TINYINT(1) NOT NULL DEFAULT 0,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE `hotels` (
  `id_hotel` INT AUTO_INCREMENT PRIMARY KEY,
  `id_country` INT NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `city` VARCHAR(80) NOT NULL,
  `stars` TINYINT NOT NULL,
  `food_type` ENUM('RO','BB','HB','FB','AI','UAI') NOT NULL DEFAULT 'BB',
  `description` TEXT NULL,
  CONSTRAINT `fk_hotel_country` FOREIGN KEY (`id_country`) REFERENCES `countries`(`id_country`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_stars` CHECK (`stars` BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE `tours` (
  `id_tour` INT AUTO_INCREMENT PRIMARY KEY,
  `id_hotel` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `tour_type`
ENUM('Пляжный','Экскурсионный','Горнолыжный','Гастрономический','Активный') NOT NULL,
  `description` TEXT NULL,
  `image` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT `fk_tour_hotel` FOREIGN KEY (`id_hotel`) REFERENCES `hotels`(`id_hotel`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `departures` (
  `id_departure` INT AUTO_INCREMENT PRIMARY KEY,
  `id_tour` INT NOT NULL,
  `departure_city` VARCHAR(60) NOT NULL DEFAULT 'Москва',
  `date_start` DATE NOT NULL,
  `nights` TINYINT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `seats_total` SMALLINT NOT NULL,
  `seats_left` SMALLINT NOT NULL,
  CONSTRAINT `fk_dep_tour` FOREIGN KEY (`id_tour`) REFERENCES `tours`(`id_tour`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `chk_seats` CHECK (`seats_left` >= 0 AND `seats_left` <= `seats_total`),
  CONSTRAINT `chk_price` CHECK (`price` > 0)
) ENGINE=InnoDB;

CREATE TABLE `bookings` (
  `id_booking` INT AUTO_INCREMENT PRIMARY KEY,
  `id_user` INT NOT NULL,
  `id_departure` INT NOT NULL,
  `persons` TINYINT NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `status` ENUM('new','confirmed','paid','cancelled') NOT NULL DEFAULT 'new',
  `comment` VARCHAR(500) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_book_user` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_book_dep` FOREIGN KEY (`id_departure`) REFERENCES `departures`(`id_departure`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_persons` CHECK (`persons` BETWEEN 1 AND 10)
) ENGINE=InnoDB;

CREATE TABLE `payments` (
  `id_payment` INT AUTO_INCREMENT PRIMARY KEY,
  `id_booking` INT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `method` ENUM('Карта','СБП','Наличные') NOT NULL,
  `paid_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_pay_book` FOREIGN KEY (`id_booking`) REFERENCES
`bookings`(`id_booking`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `reviews` (
  `id_review` INT AUTO_INCREMENT PRIMARY KEY,
  `id_user` INT NOT NULL,
  `id_tour` INT NOT NULL,
  `rating` TINYINT NOT NULL,
  `content` TEXT NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_rev_user` FOREIGN KEY (`id_user`) REFERENCES `users`(`id_user`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_rev_tour` FOREIGN KEY (`id_tour`) REFERENCES `tours`(`id_tour`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `chk_rating` CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE `requests` (
  `id_request` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(120) NULL,
  `topic` ENUM('Подбор тура','Бронирование','Визы и документы','Другое') NOT NULL DEFAULT 'Подбор тура',
  `message` VARCHAR(1000) NULL,
  `status` ENUM('new','in_work','closed') NOT NULL DEFAULT 'new',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


INSERT INTO `users` (`last_name`, `first_name`, `email`, `phone`, `password_hash`, `role`, `created_at`) VALUES
('Григорьян', 'Рубен', 'admin@terravia.ru', '+7 (495) 120-45-00', '$2y$10$BlxL/UJSBae2InbA0sMdy.4Tc7PyQD6paVHyvRroZ5BBZI6hWJG7q', 'admin', '2026-01-10 09:00:00'),
('Орлова', 'Мария', 'manager@terravia.ru', '+7 (495) 120-45-01',
'$2y$10$h.USpYOEy4ONI1oLKc3toOe6eXvmkn1Ao6/iK.3tj4wwYviK.l29m', 'manager', '2026-01-12 10:00:00'),
('Иванов', 'Алексей', 'ivanov@mail.ru', '+7 (916) 210-33-41',
'$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-03-02 18:20:00'),
('Смирнова', 'Екатерина', 'smirnova.k@yandex.ru', '+7 (903) 555-12-90', '$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-04-15 12:05:00'),
('Кузнецов', 'Дмитрий', 'kuznetsov.d@gmail.com', '+7 (925) 704-18-62', '$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-05-20 21:40:00'),
('Попова', 'Анна', 'anna.popova@mail.ru', '+7 (977) 381-90-14',
'$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-06-11 08:30:00'),
('Волков', 'Сергей', 'volkov.s@yandex.ru', '+7 (999) 123-87-65',
'$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-07-03 14:10:00'),
('Морозова', 'Ольга', 'morozova.o@gmail.com', '+7 (926) 640-25-73', '$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-08-25 19:55:00'),
('Лебедев', 'Никита', 'lebedev.n@mail.ru', '+7 (915) 902-44-10',
'$2y$10$PVMQgbz28FLaVAfqlwwwAOBydGx22SH9Q9793XnSSmhjCi8dRHwqa', 'client', '2026-09-14 11:15:00');

INSERT INTO `countries` (`name`, `region`, `visa_required`, `description`, `image`) VALUES
('Турция', 'Ближний Восток', 0, 'Тёплое море, система «всё включено» и богатая история от Стамбула до Каппадокии.', 'turkey.jpg'),
('ОАЭ', 'Ближний Восток', 0, 'Небоскрёбы Дубая, пустынные сафари и пляжи Персидского залива круглый год.', 'uae.jpg'),
('Египет', 'Африка', 1, 'Красное море, коралловые рифы и пирамиды Гизы. Виза оформляется по прилёте.', 'egypt.jpg'),
('Таиланд', 'Азия', 0, 'Острова Андаманского моря, тайская кухня и буддийские храмы.', 'thailand.jpg'),
('Мальдивы', 'Азия', 0, 'Виллы над водой, белый песок и лучший дайвинг Индийского океана.', 'maldives.jpg'),
('Россия', 'Россия', 0, 'Сочи, Алтай, Байкал и Калининград: от горнолыжных курортов до морских прогулок.', 'russia.jpg'),
('Грузия', 'Кавказ', 0, 'Тбилиси, винные дороги Кахетии и горы Казбеги.', 'georgia.jpg'),
('Вьетнам', 'Азия', 0, 'Нячанг, Фукуок и бухта Халонг. Лучшее время - с ноября по апрель.', 'vietnam.jpg');

INSERT INTO `hotels` (`id_country`, `name`, `city`, `stars`, `food_type`, `description`) VALUES
(1, 'Rixos Premium Belek', 'Белек', 5, 'UAI', 'Ультра всё включено: рестораны a la carte, напитки премиальных марок, аквапарк на территории.'),
(1, 'Barut Hemera', 'Сиде', 5, 'AI', 'Всё включено: трёхразовое питание, напитки и снеки в течение дня, анимация.'),
(1, 'Sultanahmet Palace', 'Стамбул', 4, 'BB', 'Завтраки включены. Удобное расположение для самостоятельных прогулок.'),
(2, 'Atlantis The Palm', 'Дубай', 5, 'HB', 'Полупансион: завтрак и ужин. Подходит для тех, кто днём на экскурсиях.'),
(2, 'Rove Downtown', 'Дубай', 3, 'BB', 'Завтраки включены. Удобное расположение для самостоятельных прогулок.'),
(3, 'Steigenberger Alcazar', 'Шарм-эль-Шейх', 5, 'AI', 'Всё включено: трёхразовое питание, напитки и снеки в течение дня, анимация.'),
(3, 'Albatros Palace', 'Хургада', 5, 'AI', 'Всё включено: трёхразовое питание, напитки и снеки в течение дня, анимация.'),
(4, 'Kata Beach Resort', 'Пхукет', 4, 'BB', 'Завтраки включены. Удобное расположение для самостоятельных прогулок.'),
(5, 'Sun Siyam Iru Fushi', 'Атолл Нуну', 5, 'FB', 'Полный пансион: завтрак, обед и ужин в основном ресторане.'),
(6, 'Rosa Ski Inn', 'Сочи, Роза Хутор', 4, 'HB', 'Полупансион: завтрак и ужин. Подходит для тех, кто днём на экскурсиях.'),
(6, 'Altay Resort', 'Алтай, Чемал', 4, 'FB', 'Полный пансион: завтрак, обед и ужин в основном ресторане.'),
(7, 'Stamba Hotel', 'Тбилиси', 5, 'BB', 'Завтраки включены. Удобное расположение для самостоятельных прогулок.'),
(8, 'Vinpearl Resort Nha Trang', 'Нячанг', 5, 'AI', 'Всё включено: трёхразовое питание, напитки и снеки в течение дня, анимация.'),
(6, 'Байкал Вью', 'Листвянка', 3, 'HB', 'Полупансион: завтрак и ужин. Подходит для тех, кто днём на экскурсиях.');

INSERT INTO `tours` (`id_hotel`, `title`, `tour_type`, `description`, `image`) VALUES
(1, 'Белек: семейный отдых с аквапарком', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'turkey_belek.jpg'),
(2, 'Сиде: античный город у моря', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'turkey_side.jpg'),
(3, 'Стамбул за 5 дней', 'Экскурсионный', 'Программа с русскоговорящим гидом, входные билеты и трансферы по программе включены.', 'istanbul.jpg'),
(4, 'Дубай: Пальма Джумейра', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'dubai_palm.jpg'),
(5, 'Дубай: город будущего', 'Экскурсионный', 'Программа с русскоговорящим гидом, входные билеты и трансферы по программе включены.', 'dubai_city.jpg'),
(6, 'Шарм-эль-Шейх: рифы Красного моря', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'sharm.jpg'),
(7, 'Хургада + экскурсия в Луксор', 'Экскурсионный', 'Программа с русскоговорящим гидом, входные билеты и трансферы по программе включены.', 'hurghada.jpg'),
(8, 'Пхукет: пляж Ката', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'phuket.jpg'),
(9, 'Мальдивы: вилла над водой', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'maldives_villa.jpg'),
(10, 'Роза Хутор: горнолыжный сезон', 'Горнолыжный', 'Ски-пасс на все дни, трансфер до подъёмников, прокат снаряжения со скидкой 20%.', 'rosa.jpg'),
(11, 'Алтай: Чемал и Катунь', 'Активный', 'Небольшие группы до 12 человек, сопровождение инструктора, всё снаряжение выдаётся.', 'altai.jpg'),
(12, 'Грузия: вино и горы', 'Гастрономический', 'Дегустации в трёх винодельнях, мастер-класс по хинкали, поездка в Казбеги.', 'georgia_wine.jpg'),
(13, 'Нячанг: остров Винперл', 'Пляжный', 'Перелёт, трансфер, проживание и страховка включены. Пляж в нескольких минутах от номера.', 'nhatrang.jpg'),
(14, 'Байкал: зимний лёд', 'Активный', 'Небольшие группы до 12 человек, сопровождение инструктора, всё снаряжение выдаётся.', 'baikal.jpg');

INSERT INTO `departures` (`id_tour`, `departure_city`, `date_start`, `nights`, `price`, `seats_total`, `seats_left`) VALUES
(1, 'Москва', '2027-02-08', 7, 132100, 20, 16),
(1, 'Москва', '2027-03-03', 7, 128300, 24, 22),
(1, 'Москва', '2027-04-19', 10, 164400, 30, 30),
(2, 'Москва', '2027-03-19', 10, 124500, 24, 24),
(2, 'Москва', '2026-11-14', 7, 98100, 24, 20),
(2, 'Москва', '2026-12-24', 10, 124100, 20, 20),
(3, 'Москва', '2027-01-14', 4, 63500, 30, 30),
(3, 'Санкт-Петербург', '2027-05-19', 4, 63700, 30, 30),
(3, 'Москва', '2026-11-08', 4, 67100, 20, 18),
(4, 'Москва', '2027-01-24', 6, 194800, 24, 24),
(4, 'Санкт-Петербург', '2027-02-24', 6, 182300, 20, 20),
(4, 'Казань', '2026-12-14', 6, 192100, 24, 24),
(5, 'Казань', '2027-01-14', 5, 106000, 30, 30),
(5, 'Москва', '2027-02-14', 5, 108200, 20, 20),
(5, 'Москва', '2026-11-19', 5, 100400, 20, 20),
(6, 'Казань', '2027-01-19', 9, 107600, 24, 22),
(6, 'Москва', '2027-02-08', 9, 102800, 24, 24),
(6, 'Москва', '2026-11-14', 7, 94500, 30, 30),
(7, 'Санкт-Петербург', '2027-01-19', 8, 83500, 24, 24),
(7, 'Санкт-Петербург', '2027-03-19', 8, 84200, 24, 24),
(7, 'Казань', '2026-11-03', 8, 87300, 24, 24),
(8, 'Москва', '2027-05-08', 9, 131000, 30, 30),
(8, 'Москва', '2026-11-19', 9, 123500, 20, 20),
(8, 'Казань', '2026-12-03', 9, 124700, 20, 20),
(9, 'Москва', '2027-01-14', 7, 451900, 20, 20),
(9, 'Казань', '2026-11-24', 7, 433200, 30, 30),
(9, 'Казань', '2026-12-24', 10, 519700, 30, 30),
(10, 'Москва', '2027-01-19', 5, 74600, 20, 20),
(10, 'Санкт-Петербург', '2027-02-08', 5, 75800, 24, 24),
(10, 'Москва', '2027-03-08', 5, 73400, 24, 20),
(11, 'Казань', '2027-01-08', 6, 70000, 30, 29),
(11, 'Москва', '2027-02-24', 6, 77200, 24, 22),
(11, 'Москва', '2026-11-03', 6, 67500, 20, 18),
(12, 'Москва', '2027-01-14', 6, 87400, 30, 26),
(12, 'Санкт-Петербург', '2026-11-14', 6, 81200, 24, 24),
(12, 'Санкт-Петербург', '2026-12-03', 6, 82700, 30, 30),
(13, 'Санкт-Петербург', '2027-01-24', 11, 136600, 20, 20),
(13, 'Казань', '2027-05-19', 11, 137200, 24, 24),
(13, 'Москва', '2026-12-24', 11, 134400, 20, 20),
(14, 'Москва', '2027-01-24', 5, 64800, 30, 26),
(14, 'Москва', '2027-03-14', 5, 64400, 30, 30),
(14, 'Санкт-Петербург', '2026-12-24', 5, 61100, 30, 30),
(1, 'Москва', '2026-07-12', 7, 118000, 20, 16),
(4, 'Москва', '2026-09-12', 7, 189000, 20, 17),
(6, 'Москва', '2026-07-12', 7, 87000, 20, 14),
(8, 'Москва', '2026-07-12', 7, 126000, 20, 19);

INSERT INTO `bookings` (`id_user`, `id_departure`, `persons`, `total_price`, `status`, `comment`, `created_at`) VALUES
(3, 43, 2, 236000, 'paid', NULL, '2026-05-11 11:38:00'),
(4, 44, 3, 567000, 'paid', NULL, '2026-05-25 13:30:00'),
(5, 45, 2, 174000, 'paid', NULL, '2026-05-30 12:30:00'),
(6, 46, 1, 126000, 'paid', NULL, '2026-05-16 20:50:00'),
(7, 43, 2, 236000, 'paid', NULL, '2026-05-19 12:30:00'),
(8, 45, 4, 348000, 'paid', NULL, '2026-06-22 11:35:00'),
(3, 40, 4, 259200, 'paid', NULL, '2026-08-17 17:47:00'),
(4, 2, 2, 256600, 'paid', NULL, '2026-05-24 16:49:00'),
(5, 5, 4, 392400, 'confirmed', NULL, '2026-06-19 12:10:00'),
(6, 16, 2, 215200, 'confirmed', NULL, '2026-04-12 18:55:00'),
(7, 31, 1, 70000, 'new', NULL, '2026-10-03 15:00:00'),
(8, 1, 4, 528400, 'new', NULL, '2026-09-06 14:41:00'),
(9, 39, 1, 134400, 'cancelled', NULL, '2026-06-14 12:41:00'),
(3, 33, 2, 135000, 'paid', NULL, '2026-04-08 15:59:00'),
(4, 32, 2, 154400, 'confirmed', NULL, '2026-06-25 20:12:00'),
(5, 34, 4, 349600, 'new', NULL, '2026-07-08 12:55:00'),
(6, 9, 2, 134200, 'paid', NULL, '2026-06-14 11:32:00'),
(7, 30, 4, 293600, 'confirmed', NULL, '2026-09-26 18:14:00');

INSERT INTO `payments` (`id_booking`, `amount`, `method`, `paid_at`) VALUES
(1, 236000, 'СБП', '2026-05-12 11:38:00'),
(2, 567000, 'СБП', '2026-05-26 13:30:00'),
(3, 174000, 'СБП', '2026-05-31 12:30:00'),
(4, 126000, 'Карта', '2026-05-17 20:50:00'),
(5, 236000, 'Карта', '2026-05-20 12:30:00'),
(6, 348000, 'Карта', '2026-06-23 11:35:00'),
(7, 259200, 'Карта', '2026-08-18 17:47:00'),
(8, 256600, 'Карта', '2026-05-25 16:49:00'),
(14, 135000, 'Карта', '2026-04-09 15:59:00'),
(17, 134200, 'Карта', '2026-06-15 11:32:00');

INSERT INTO `reviews` (`id_user`, `id_tour`, `rating`, `content`, `is_published`, `created_at`) VALUES
(3, 1, 5, 'Отель отличный, аквапарк дети не хотели покидать. Трансфер встретил вовремя, менеджер была на связи всю поездку.', 1, '2026-07-02 20:10:00'),
(4, 4, 5, 'Atlantis превзошёл ожидания. Отдельное спасибо за ранний заезд, который организовал туроператор.', 1, '2026-08-14 11:00:00'),
(5, 6, 4, 'Риф прямо у отеля, маски можно взять бесплатно. Минус один - долгий паспортный контроль в аэропорту.', 1, '2026-08-30 09:45:00'),
(6, 8, 5, 'Ката - самый спокойный пляж Пхукета. Документы прислали за неделю, всё было понятно.', 0, '2026-09-18 16:20:00'),
(8, 6, 5, 'Удобно бронировать через сайт: выбрал даты, оплатил, через час уже было подтверждение.', 1, '2026-10-03 18:00:00');

INSERT INTO `requests` (`name`, `phone`, `email`, `topic`, `message`, `status`, `created_at`) VALUES
('Татьяна', '+7 (916) 340-11-22', 'tanya.v@mail.ru', 'Подбор тура', 'Хотим на Новый год в тёплую страну, 2 взрослых + ребёнок 6 лет, бюджет до 350 000.', 'new', '2026-10-13 10:12:00'),
('Игорь', '+7 (903) 900-47-81', NULL, 'Визы и документы', 'Нужна ли виза в Египет для граждан РФ и сколько она стоит?', 'new', '2026-10-14 17:40:00'),
('Марина', '+7 (925) 118-62-05', 'marina.k@yandex.ru', 'Бронирование', 'Можно ли поменять даты уже оплаченного тура в Дубай?', 'in_work', '2026-10-09 12:00:00'),
('Павел', '+7 (977) 222-31-90', 'pavel.ski@gmail.com', 'Подбор тура', 'Интересует Роза Хутор на февраль, группа 4 человека.', 'closed', '2026-09-29 09:30:00'),
('Елена', '+7 (999) 765-43-21', 'elena.m@mail.ru', 'Другое', 'Есть ли у вас подарочные сертификаты?', 'new', '2026-10-15 08:55:00');


CREATE OR REPLACE VIEW `view1_tours_catalog` AS
SELECT t.id_tour, t.title, t.tour_type, c.name AS country, h.city, h.name AS hotel, h.stars, h.food_type,
       MIN(d.price) AS min_price, MIN(d.date_start) AS nearest_date
FROM tours t
JOIN hotels h ON h.id_hotel = t.id_hotel
JOIN countries c ON c.id_country = h.id_country
LEFT JOIN departures d ON d.id_tour = t.id_tour AND d.date_start >= CURDATE() AND d.seats_left > 0
WHERE t.is_active = 1
GROUP BY t.id_tour, t.title, t.tour_type, c.name, h.city, h.name, h.stars, h.food_type;

CREATE OR REPLACE VIEW `view2_available_departures` AS
SELECT d.id_departure, t.title, c.name AS country, d.departure_city, d.date_start, d.nights, d.price, d.seats_left
FROM departures d
JOIN tours t ON t.id_tour = d.id_tour
JOIN hotels h ON h.id_hotel = t.id_hotel
JOIN countries c ON c.id_country = h.id_country
WHERE d.date_start >= CURDATE() AND d.seats_left > 0;

CREATE OR REPLACE VIEW `view3_bookings_full` AS
SELECT b.id_booking, CONCAT(u.last_name, ' ', u.first_name) AS client, u.phone, t.title AS tour,
       d.date_start, d.nights, b.persons, b.total_price, b.status, b.created_at
FROM bookings b
JOIN users u ON u.id_user = b.id_user
JOIN departures d ON d.id_departure = b.id_departure
JOIN tours t ON t.id_tour = d.id_tour;

CREATE OR REPLACE VIEW `view4_revenue_by_country` AS
SELECT c.name AS country, COUNT(DISTINCT b.id_booking) AS bookings_count, COALESCE(SUM(p.amount), 0) AS revenue
FROM countries c
LEFT JOIN hotels h ON h.id_country = c.id_country
LEFT JOIN tours t ON t.id_hotel = h.id_hotel
LEFT JOIN departures d ON d.id_tour = t.id_tour
LEFT JOIN bookings b ON b.id_departure = d.id_departure AND b.status <> 'cancelled'
LEFT JOIN payments p ON p.id_booking = b.id_booking
GROUP BY c.name;

CREATE OR REPLACE VIEW `view5_popular_tours` AS
SELECT t.id_tour, t.title, COUNT(b.id_booking) AS bookings_count, COALESCE(SUM(b.persons), 0) AS tourists
FROM tours t
LEFT JOIN departures d ON d.id_tour = t.id_tour
LEFT JOIN bookings b ON b.id_departure = d.id_departure AND b.status <> 'cancelled'
GROUP BY t.id_tour, t.title;

CREATE OR REPLACE VIEW `view6_client_stats` AS
SELECT u.id_user, CONCAT(u.last_name, ' ', u.first_name) AS client, u.email,
       COUNT(b.id_booking) AS bookings_count, COALESCE(SUM(b.total_price), 0) AS total_spent
FROM users u
LEFT JOIN bookings b ON b.id_user = u.id_user AND b.status <> 'cancelled'
WHERE u.role = 'client'
GROUP BY u.id_user, u.last_name, u.first_name, u.email;

CREATE OR REPLACE VIEW `view7_tour_ratings` AS
SELECT t.id_tour, t.title, ROUND(AVG(r.rating), 2) AS avg_rating, COUNT(r.id_review) AS reviews_count
FROM tours t
LEFT JOIN reviews r ON r.id_tour = t.id_tour AND r.is_published = 1
GROUP BY t.id_tour, t.title;

CREATE OR REPLACE VIEW `view8_new_requests` AS
SELECT id_request, name, phone, email, topic, message, created_at
FROM requests
WHERE status = 'new';

CREATE OR REPLACE VIEW `view9_occupancy` AS
SELECT d.id_departure, t.title, d.date_start, d.seats_total, d.seats_left,
       ROUND((d.seats_total - d.seats_left) * 100 / d.seats_total, 1) AS occupancy_percent
FROM departures d
JOIN tours t ON t.id_tour = d.id_tour;

CREATE OR REPLACE VIEW `view10_monthly_sales` AS
SELECT DATE_FORMAT(b.created_at, '%Y-%m') AS month, COUNT(*) AS bookings_count,
       SUM(b.persons) AS tourists, SUM(b.total_price) AS total_sum
FROM bookings b
WHERE b.status <> 'cancelled'
GROUP BY DATE_FORMAT(b.created_at, '%Y-%m');

SET FOREIGN_KEY_CHECKS = 1;
