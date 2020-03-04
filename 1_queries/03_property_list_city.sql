SELECT x.id, x.title, x.cost_per_night, avg(y.rating) as average_rating
FROM properties x JOIN property_reviews y ON y.property_id = x.id
WHERE city LIKE '%ancouv%'
GROUP BY x.id
HAVING avg(y.rating)>=4
ORDER BY cost_per_night
LIMIT 10;

