const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const nodemailer = require('nodemailer');
const emailValidator = require('email-validator');
const ejs = require('ejs');
const bodyParser = require('body-parser');
//const connection = require('./database/connection');

const app = express();
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true })); // Parse incoming request data
app.use(express.json())
app.set('views', './views');

// Get the logout message from the session
const connectionPool = mysql.createPool({
  connectionLimit: 1,
  host: 'localhost',
  user: 'MbuyaConnect',
  password: 'Sophia54321£',
  database: 'forum_users',
  debug: false
});

app.use(session({
  secret: 'your_secret_key',
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: true
}));

connectionPool.getConnection((err, connection) => {
  if (err) {
    console.error('Error occurred while connecting to the database:', err);
    return;
  }
  console.log('Connected to the database successfully');
  connection.release();
});


app.get('/', (req, res) => {
  // Assuming you have the user object available
 // const user = req.user; // Replace this with how you access the user object in your code

  // Retrieve all threads from the server
 // connectionPool.query('SELECT * FROM threads', (error, results, fields) => {
  //  if (error) {
   //   console.error('Error occurred while retrieving threads:', error);
  //    return res.status(500).json({ message: 'Internal server error' });
  //  }

   // const maxVisibleThreads = 5;

    // Render the forum view and pass the user and threads to it
   // res.render('index', { user: req.session.user, threads: results, maxVisibleThreads });
   res.render('index');

  });

// Set up the route for the homepage
app.get('/gallery', (req, res) => {

  res.render('gallery');

});
app.get('/comingsoon', (req, res) => {

  res.render('comingsoon');

});


// login page route
app.get('/loginReg', (req, res) => {
  const logoutMessage = req.session.logoutMessage || null; // Get the logout message from the session or set it as null
  req.session.logoutMessage = 'You have been logged out successfully.'; // Set the logout message in the session
  req.session.logoutMessage = ''; // Clear the logout message from the session
  res.render('loginReg', { logoutMessage: logoutMessage }); // Pass the logout message to the loginReg view
});


// GET /checklogin. Checks to see if the user has logged in
app.get('/checklogin', (req, res) => {
  if (req.session.user && req.session.user.isLoggedIn) {
    res.json({ login: true, email: req.session.user.email });
  } else {
    res.json({ login: false });
  }
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const email = req.body.email;
  const password = req.body.password;

  // Check if email and password are valid
  if (!emailValidator.validate(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  connectionPool.query("SELECT * FROM discussionusers WHERE email = ? AND user_pass = ?", [email, password], (error, results, fields) => {
    if (error) {
      console.error('Error occurred while connecting to the database' + JSON.stringify(error));
      return res.status(500).json({ message: 'Internal server error' });
    }

    console.log('Results: ', results);

    if (results.length > 0) {
      // Create a session for the user
      req.session.user = {
        email: email,
        isLoggedIn: true,
        userId: results[0].user_ID,
        userName: results[0].user_name // Set the user ID from the query result
      };
      res.redirect('/forum');
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  });
});

// GET /forum route
// app.get('/forum', (req, res) => {
//   // Check if the user is logged in
//   if (req.session.user && req.session.user.isLoggedIn) {
//     // Retrieve all threads from the server
//     connectionPool.query('SELECT * FROM threads', (error, results, fields) => {
//       if (error) {
//         console.error('Error occurred while retrieving threads:', error);
//         return res.status(500).json({ message: 'Internal server error' });
//       }
//       const maxVisibleThreads = 5;
//       // Render the forum view and pass the user and threads to it
//       res.render('forum', { user: req.session.user, threads: results, maxVisibleThreads });
//     });
//   } else {
//     // User is not logged in, redirect to the login page
//     res.redirect('/loginReg');
//   }
// });

// Create a new thread
app.post('/threads', (req, res) => {
  const { title, content } = req.body;
  const user_name= req.session.user.userName; // Assuming the user ID is stored in req.session.user.userId
  const date = new Date(); // Add the current date and time

  // Insert the new thread into the database
  connectionPool.query(
    'INSERT INTO threads (title, content, user_name, date) VALUES (?, ?, ?, ?)',
    [title, content, user_name, date],
    (error, results, fields) => {
      if (error) {
        console.error('Error occurred while creating a new thread:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      res.status(201).json({ message: 'Thread created successfully' });
    }
   );
 });


// Get all threads
// app.get('/threads', (req, res) => {
//   // Retrieve all threads from the database
//   connectionPool.query('SELECT * FROM threads', (error, results, fields) => {
//     if (error) {
//       console.error('Error occurred while retrieving threads:', error);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     res.json(results);
//   });
// });




// logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error occurred while destroying session' + JSON.stringify(err));
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.redirect('/');
  });
});





app.post('/register', (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;

  // Check if name, email, and password are valid
  if (!emailValidator.validate(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const user = { user_name: name, Email: email, Telephone: phone, user_pass: password };

  connectionPool.query('INSERT INTO discussionusers SET ?', user, (error, result) => {
    if (error) {
      console.error('Error occurred while inserting user', error);
      console.error('Error occurred while connecting to the database' + JSON.stringify(error));
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log(JSON.stringify(result));
    res.status(201).json({ message: 'User created successfully' });
  });
});










app.post('/', async (req, res) => {
  console.log(req.body);

  // Validate the email address
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).send('Invalid email address');
  }



  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'muzanenhamoclint@gmail.com',
      pass: 'pcinxceycypvmfkr',
    },
  });
  const mailOptions = {
    //from: `${req.body.name} <${req.body.email}>`,
    to: 'swifty2205@yahoo.co.uk',
    subject: 'New Contact Form Submission from ' + req.body.email,
    text: req.body.message,

  };





  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('There was an error sending your message.');
    } else {
      console.log('Email sent: ' + info.response);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      res.status(200).send('Your message has been sent!');
    }
  });
});




app.listen(8080);
