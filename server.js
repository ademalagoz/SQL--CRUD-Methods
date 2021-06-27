const express = require("express");
const app = express();
const { Pool } = require("pg");
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: "admin",
  port: 5432,
});

app.get("/hotels", (req, res) => {
  pool
    .query("SELECT * FROM hotels")
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

// Add the GET endpoints /hotels and /hotels/:hotelId and try to use these endpoints, either using your browser or postman.
app.get("/hotels/:hotelId", (req, res) => {
  const hotelId = req.params.hotelId;
  console.log(hotelId);
  pool
    .query("SELECT * FROM hotels WHERE id=$1", [hotelId])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

// Add a new GET endpoint /customers to load all customers ordered by name.
app.get("/customers", (req, res) => {
  pool
    .query("SELECT name FROM customers ORDER BY name DESC")
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

// Add a new GET endpoint /customers/:customerId to load one customer by ID.

app.get("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;

  pool
    .query("SELECT * FROM customers WHERE id=$1", [customerId])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});
// Add a new GET endpoint /customers/:customerId/bookings to load all the bookings of a specific customer.
//Returns the following information: check in date, number of nights, hotel name, hotel postcode.

app.get("/customers/:customerId/bookings", (req, res) => {
  const customerId = req.params.customerId;

  pool
    .query(
      "SELECT bookings.checkin_date,bookings.nights,hotels.name,hotels.postcode FROM bookings INNER JOIN hotels ON bookings.hotel_id= hotels.id WHERE customer_id=$1",
      [customerId]
    )
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
