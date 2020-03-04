SELECT x.id, x.title, x.cost_per_night, y.start_date, avg(z.rating)
FROM properties x
  JOIN reservations y ON x.id = y.property_id
  JOIN property_reviews z ON  x.id = z.property_id
WHERE y.guest_id =1 AND y.end_date<now()
::date
GROUP BY x.id, y.id
ORDER BY y.start_date;

