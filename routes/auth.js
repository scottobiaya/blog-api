var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const User  = require('../models/user');



/* Signup */
router.post('/signup', async function(req, res, next) {
   // Our register logic starts here
   try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).send({
        message: 'Please provide all input'
      });
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send({
        message: 'User Already Exist. Please Login'
      });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.status(400).json({'message': 'An Error occured, please contact admin'});
  }
});

/** Login  */
router.post('/login', async function(req, res, next) {
    // Our login logic starts here
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            return res.status(400).send({
              message: 'Please provide all input'
            });
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
              { user_id: user._id, email },
              process.env.SECRET_KEY,
              {
              expiresIn: "1h",
              }
          );

          // save user token
          user.token = token;

          // user
          return res.status(200).json(user);
        }
        return res.status(400).send({
          message: 'Invalid credentials'
        });
    } catch (err) {
        console.log(err);
        return res.status(400).send({
          message: 'An error occurred, please contact admin'
        });
  }
  });

module.exports = router;
