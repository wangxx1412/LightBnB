SELECT x.city, count(y.id) as total_reservations
FROM properties x
  JOIN reservations y ON x.id = y.property_id
GROUP BY x.city
ORDER BY count(y.id) DESC;

