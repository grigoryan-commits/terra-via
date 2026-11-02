<?php
require __DIR__ . '/db.php';

$where = ['t.is_active = 1'];
$params = [];

if (!empty($_GET['country'])) {
    $where[] = 'c.id_country = ?';
    $params[] = (int)$_GET['country'];
}
if (!empty($_GET['type'])) {
    $where[] = 't.tour_type = ?';
    $params[] = clean($_GET['type'], 30);
}
if (!empty($_GET['stars'])) {
    $where[] = 'h.stars >= ?';
    $params[] = max(1, min(5, (int)$_GET['stars']));
}
if (!empty($_GET['q'])) {
    $where[] = '(t.title LIKE ? OR h.city LIKE ? OR c.name LIKE ?)';
    $like = '%' . clean($_GET['q'], 60) . '%';
    array_push($params, $like, $like, $like);
}

$depWhere = ['d.date_start >= CURDATE()', 'd.seats_left > 0'];
$depParams = [];
if (!empty($_GET['dateFrom']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET['dateFrom'])) {
    $depWhere[] = 'd.date_start >= ?';
    $depParams[] = $_GET['dateFrom'];
}
if (!empty($_GET['priceMax'])) {
    $depWhere[] = 'd.price <= ?';
    $depParams[] = (float)$_GET['priceMax'];
}

$order = match ($_GET['sort'] ?? '') {
    'price_desc' => 'min_price DESC',
    'date' => 'nearest_date ASC',
    'stars' => 'h.stars DESC, min_price ASC',
    default => 'min_price ASC',
};

$sql = 'SELECT t.id_tour, t.title, t.tour_type, t.image, h.name AS hotel, h.city, h.stars, h.food_type,
               c.id_country, c.name AS country, MIN(d.price) AS min_price, MIN(d.date_start) AS nearest_date,
               MIN(d.nights) AS nights, ROUND(AVG(r.rating), 1) AS rating
        FROM tours t
        JOIN hotels h ON h.id_hotel = t.id_hotel
        JOIN countries c ON c.id_country = h.id_country
        JOIN departures d ON d.id_tour = t.id_tour AND ' . implode(' AND ', $depWhere) . '
        LEFT JOIN reviews r ON r.id_tour = t.id_tour AND r.is_published = 1
        WHERE ' . implode(' AND ', $where) . '
        GROUP BY t.id_tour
        ORDER BY ' . $order;

$stmt = $pdo->prepare($sql);
$stmt->execute(array_merge($depParams, $params));
respond(['tours' => $stmt->fetchAll()]);
