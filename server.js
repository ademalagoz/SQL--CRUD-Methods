const express = require("express");
const app = express();
// const bodyParser = require("body-parser");
// app.use(bodyParser.json());
const { Pool } = require("pg");
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_hotels",
  password: "admin",
  port: 5432,
});

// Exercise 1

app.get("/hotels", (req, res) => {
  pool
    .query("SELECT * FROM hotels")
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

// Exercise 2
// Add the GET endpoints /hotels and /hotels/:hotelId and try to use these endpoints, either using your browser or postman.
app.get("/hotels/:id", (req, res) => {
  const hotelId = req.params.id;
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

app.get("/customers/:id", (req, res) => {
  const customerId = req.params.id;

  pool
    .query("SELECT * FROM customers WHERE id=$1", [customerId])
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});
// Add a new GET endpoint /customers/:customerId/bookings to load all the bookings of a specific customer.
//Returns the following information: check in date, number of nights, hotel name, hotel postcode.

app.get("/customers/:id/bookings", (req, res) => {
  const customerId = req.params.id;

  pool
    .query(
      "SELECT bookings.checkin_date,bookings.nights,hotels.name,hotels.postcode FROM bookings INNER JOIN hotels ON bookings.hotel_id= hotels.id WHERE customer_id=$1",
      [customerId]
    )
    .then((result) => res.json(result.rows))
    .catch((err) => console.error(err));
});

// Exercise 3

// Create a new POST endpoint /hotels to create a new hotel. Make sure to add validation for the number of rooms.
//Test your new API endpoint with Postman and check that the new hotel has been correctly created in your database.

app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = parseInt(req.body.rooms);
  console.log(newHotelRooms);
  console.log(req.body.rooms);
  console.log(req.body);
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer.");
  }

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((e) => console.error(e));
      }
    });
});

// Add a new POST API endpoint to create a new customer in the customers table.
// Add validation to check that there is no other customer with the same name in the customers table before creating a new customer.
app.post("/customers", (req, res) => {
  const nameOfCustomer = req.body.name;
  const emailOfCustomer = req.body.email;
  const newCity = req.body.city;
  const postcodeCustomer = req.body.postcode;

  pool
    .query("SELECT *FROM customers WHERE name=$1", [nameOfCustomer])
    .then((result) => {
      if (result.rows.length > 0) {
        return res.status(400).send(`Same name already exists!`);
      } else {
        pool
          .query(
            "INSERT INTO customers(name,email,city,postcode) VALUES($1,$2,$3,$4)",
            [nameOfCustomer, emailOfCustomer, newCity, postcodeCustomer]
          )
          .then(() => res.send(`New Customer added`))
          .catch((error) => console.log(error));
      }
    });
});

// Exercise 4

// Add the PUT endpoint /customers/:customerId and verify you can update a customer email using Postman.
// Add validation for the email before updating the customer record in the database. If the email is empty, return an error message.
// Add the possibility to also update the address, the city, the postcode and the country of a customer. Be aware that if you want to update the city only for example, the other fields should not be changed!

app.put("/customers/:id", function (req, res) {
  const customerId = req.params.id;
  const newName = req.body.name;
  const newEmail = req.body.email;

  pool
    .query("SELECT *FROM customers WHERE email=$1", [newEmail])
    .then((result) => {
      if (result.rows.length === null) {
        return res.status(400).send(`Email address is empty!`);
      } else {
        pool
          .query("UPDATE customers SET name=$1,email=$2 WHERE id=$3", [
            newName,
            newEmail,
            customerId,
          ])
          .then(() => res.send(`Customer ${customerId} updated!`))
          .catch((error) => console.log(error));
      }
    });
});

// Exercise 5
// Add the DELETE endpoint /customers/:customerId above and verify you can delete a customer along their bookings with Postman.

app.delete("/customers/:id/bookings", function (req, res) {
  const customerId = req.params.id;

  pool
    .query("DELETE FROM bookings WHERE customer_id=$1", [customerId])
    .then(() => {
      pool
        .query("DELETE FROM customers WHERE id=$1", [customerId])
        .then(() => res.send(`Customer ${customerId} deleted!`))
        .catch((e) => console.error(e));
    });
});

// Add a new DELETE endpoint /hotels/:hotelId to delete a specific hotel.

app.delete("/hotels/", function (req, res) {
  const hotelName = req.body.name;

  pool
    .query("DELETE FROM customers WHERE name=$1", [hotelName])
    .then(() => res.send(`${hotelName} deleted!`))
    .catch((e) => console.error(e));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
