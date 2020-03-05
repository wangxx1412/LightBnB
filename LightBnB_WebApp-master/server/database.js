const properties = require("./json/properties.json");
const users = require("./json/users.json");
const db = require("./db");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return db
    .query(
      `
  SELECT * FROM users
  WHERE email = $1
  `,
      [email]
    )
    .then(res => {
      const user = res.rows;
      if (user) {
        return Promise.resolve(user[0]);
      } else {
        return Promise.resolve(null);
      }
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return db
    .query(
      `
SELECT * FROM users
WHERE id = $1
`,
      [id]
    )
    .then(res => {
      const user = res.rows;
      if (user) {
        return Promise.resolve(user[0]);
      } else {
        return Promise.resolve(null);
      }
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  return db
    .query(
      `
INSERT INTO users(name,email,password)
VALUES($1,$2,$3)
RETURNING *;
`,
      [user.name, user.email, user.password]
    )
    .then(res => {
      const user = res.rows;
      if (user) {
        return Promise.resolve(user[0]);
      } else {
        return Promise.resolve(null);
      }
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return db
    .query(
      `SELECT * FROM reservations WHERE guest_id =$1
    LIMIT $2`,
      [guest_id, limit]
    )
    .then(res => {
      const reservations = res.rows;
      if (reservations) {
        return Promise.resolve(reservations);
      } else {
        return Promise.resolve(null);
      }
    });
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_reviews.property_id
  `;

  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `WHERE owner_id = $${queryParams.length} `;
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += `AND properties.owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    queryString += `AND properties.cost_per_night >= $${queryParams.length} `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    queryString += `AND properties.cost_per_night <= $${queryParams.length} `;
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `
    GROUP BY properties.id
    HAVING avg(property_reviews.rating) >= $${queryParams.length} 
    ORDER BY cost_per_night`;
  }

  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  LIMIT $${queryParams.length};
  `;

  return db.query(queryString, queryParams).then(res => res.rows);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const queryParams = [];

  let queryString = `
  INSERT INTO properties (  
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
    country,
    street,
    city,
    province,
    post_code )
  VALUES(  `;

  //owner_id
  queryParams.push(`${property.owner_id}`);
  queryString += `$${queryParams.length}, `;

  //title
  queryParams.push(`${property.title}`);
  queryString += `$${queryParams.length}, `;

  //description
  if (property.description) {
    queryParams.push(`${property.owner_id}`);
    queryString += `$${queryParams.length}, `;
  } else {
    queryParams.push(null);
    queryString += `$${queryParams.length}, `;
  }

  //thumbnail_photo_url
  queryParams.push(`${property.thumbnail_photo_url}`);
  queryString += `$${queryParams.length}, `;

  //cover_photo_url
  queryParams.push(`${property.cover_photo_url}`);
  queryString += `$${queryParams.length}, `;

  //cost_per_night
  queryParams.push(`${property.cost_per_night}`);
  queryString += `$${queryParams.length}, `;

  //parking_spaces
  queryParams.push(`${property.parking_spaces}`);
  queryString += `$${queryParams.length}, `;

  //number_of_bathrooms
  queryParams.push(`${property.number_of_bathrooms}`);
  queryString += `$${queryParams.length}, `;

  //number_of_bedrooms
  queryParams.push(`${property.number_of_bedrooms}`);
  queryString += `$${queryParams.length}, `;

  //country
  queryParams.push(`${property.country}`);
  queryString += `$${queryParams.length}, `;

  //street
  queryParams.push(`${property.street}`);
  queryString += `$${queryParams.length}, `;

  //city
  queryParams.push(`${property.city}`);
  queryString += `$${queryParams.length}, `;

  //province
  queryParams.push(`${property.province}`);
  queryString += `$${queryParams.length}, `;

  //post_code
  queryParams.push(`${property.post_code}`);
  queryString += `$${queryParams.length}) RETURNING *;`;

  return db.query(queryString, queryParams).then(res => res.rows);
};
exports.addProperty = addProperty;
