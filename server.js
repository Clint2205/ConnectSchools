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
  app.listen(8080);
  console.log('Server started on localhost 8080');

  connection.release();
});


app.get('/', (req, res) => {
  // Assuming you have the user object available
  const user = req.user; // Replace this with how you access the user object in your code

  // Retrieve all threads from the server
  connectionPool.query('SELECT * FROM threads', (error, results, fields) => {
    if (error) {
      console.error('Error occurred while retrieving threads:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const maxVisibleThreads = 5;

    // Render the forum view and pass the user and threads to it
    res.render('index', { user: req.session.user, threads: results, maxVisibleThreads });
  });
});
// Set up the route for the homepage
app.get('/gallery', (req, res) => {

  res.render('gallery');

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

// Handle GET requests to the password reset page
app.get('/password-reset', (req, res) => {
  res.render('password-reset'); // Render the 'password-reset.ejs' view
});
app.get('/check-email-exists', (req, res) => {
  const email = req.query.email; // Get the email from the query parameter

  // Perform a database query to check if the email exists
  connectionPool.query(
    'SELECT COUNT(*) AS emailCount FROM discussionusers WHERE Email = ?',
    [email],
    (error, results) => {
      if (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Check if the email exists in the database
      const emailCount = results[0].emailCount;
      const exists = emailCount > 0;

      // Send a JSON response indicating whether the email exists
      res.json({ exists: exists });
    }
  );
});

// Generate a random token
function generateToken() {
  const length = 16; // Set the desired length of the token
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  console.log(token);
  return token;
}

// Send a password reset email
function sendPasswordResetEmail(email, resetToken) {
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
    from: 'muzanenhamoclint@gmail.com', // Replace with your email address
    to: email, // The recipient's email address
    subject: 'Password Reset Request',
    html: `
      <p>You have requested to reset your password. Click the link below to reset your password. Link expires in 10 minutes:</p>
      <a href="http://localhost:8080/password-reset-form?token=${resetToken}">Reset Password</a>


    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Password reset email sent:', info.response);
    }
  });
}



app.post('/password-reset', (req, res) => {
  const { email } = req.body;

  // Validate the email address (you can use email-validator or your validation method)
  if (!emailValidator.validate(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Generate a unique reset token (you can use your own method)
  const resetToken = generateToken(); // Implement the generateToken function

  // Query the user's ID based on their email address
  connectionPool.query(
    'SELECT id FROM discussionusers WHERE Email = ?',
    [email],
    (queryError, queryResults) => {
      if (queryError) {
        console.error('Error occurred while querying the user ID:', queryError);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (queryResults.length === 0) {
        // Handle the case where the user's email doesn't exist
        console.error('User with email not found:', email);
        return res.status(404).json({ message: 'User not found' });
      }

      // Extract the user ID from the query results
      const userId = queryResults[0].id;

      // Calculate the expiration time in minutes (e.g., 10 minutes)
      const expirationTimeInMinutes = 10;
      const expirationTimeMillis = expirationTimeInMinutes * 60 * 1000; // Convert minutes to milliseconds

      // Calculate the expiration time as a JavaScript Date object
      const currentDatetime = new Date();
      const expirationDatetime = new Date(currentDatetime.getTime() + expirationTimeMillis);

      // Store the reset token and user information in your database
      connectionPool.query(
        'INSERT INTO password_reset_tokens (user_id, token, expiration_time) VALUES (?, ?, ?)',
        [userId, resetToken, expirationDatetime],
        (insertError, insertResults) => {
          if (insertError) {
            if (insertError.code === 'ER_DUP_ENTRY') {
              // Handle the case where a token with the same value already exists
              console.error('Token already exists:', insertError);
              return res.status(400).json({ message: 'Token already exists' });
            } else {
              console.error('Error occurred while storing the token:', insertError);
              return res.status(500).json({ message: 'Internal server error' });
            }
          }

          // Send a password reset email to the user's email address
          sendPasswordResetEmail(email, resetToken); // Implement the sendPasswordResetEmail function

         // res.status(200).json({ message: 'Password reset instructions sent to your email.' });
        }
      );
    }
  );
});

//reset the form
app.get('/password-reset-form', (req, res) => {
  const token = req.query.token; // Get the reset token from the URL query parameter
  res.render('password-reset-form', { token }); // Render the reset password form with the token
});

app.post('/password-reset-form', (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Log the received token for debugging
  console.log('Received token:', token);

  //  validation for newPassword and confirmPassword (e.g., length, matching)
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }
console.log('Token to check:', token); 
  // Verify the reset token in  database
  connectionPool.query(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND expiration_time > UTC_TIMESTAMP()',
    [token],
    (error, results, fields) => {
      if (error) {
        console.error('Error occurred while verifying the token:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

       // Log the results for debugging
       console.log('Token query results:', results);


      // Check if the token exists and is valid
      if (results.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Token is valid, update the user's password
      const userId = results[0].user_id; // Get the user ID associated with the token
        // Log the user ID for debugging
        console.log('User ID associated with token:', userId);

      // Update the user's password in the database
      connectionPool.query(
        'UPDATE discussionusers SET user_pass = ? WHERE id = ?',
        [newPassword, userId],
        (updateError, updateResults, updateFields) => {
          if (updateError) {
            console.error('Error occurred while updating the password:', updateError);
            return res.status(500).json({ message: 'Internal server error' });
          }

          // Password updated successfully, you can remove the used token
          connectionPool.query(
            'DELETE FROM password_reset_tokens WHERE token = ?',
            [token],
            (deleteError, deleteResults, deleteFields) => {
              if (deleteError) {
                console.error('Error occurred while deleting the token:', deleteError);
                return res.status(500).json({ message: 'Internal server error' });
              }

              // Redirect the user to the login page or send a success response
              res.redirect('/loginReg');
            }
          );
        }
      );
    }
  );
});



// GET /forum route
app.get('/forum', (req, res) => {
  // Check if the user is logged in
  if (req.session.user && req.session.user.isLoggedIn) {
    // Retrieve all threads from the server
    connectionPool.query('SELECT * FROM threads', (error, results, fields) => {
      if (error) {
        console.error('Error occurred while retrieving threads:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      const maxVisibleThreads = 5;
      // Render the forum view and pass the user and threads to it
      res.render('forum', { user: req.session.user, threads: results, maxVisibleThreads });
    });
  } else {
    // User is not logged in, redirect to the login page
    res.redirect('/loginReg');
  }
});

// Create a new thread

app.post('/threads', (req, res) => {
  const { title, content } = req.body;
  const user_name = req.session.user.userName; // Assuming the user ID is stored in req.session.user.userId
  const date = new Date(); // Add the current date and time
  console.log('User ID associated with token:', user_name);
  // Insert the new thread into the database
  connectionPool.query(
    'INSERT INTO threads (title, content, user_name, date) VALUES (?, ?, ?, ?)',
    [title, content, user_name, date],
    (error, results, fields) => {
      if (error) {
        console.error('Error occurred while creating a new thread:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
      console.log(title, content, user_name, date);

      res.status(201).json({ message: 'Thread created successfully' });
    }
  );
});


// Get all threads
app.get('/threads', (req, res) => {
  // Retrieve all threads from the database
  connectionPool.query('SELECT * FROM threads', (error, results, fields) => {
    if (error) {
      console.error('Error occurred while retrieving threads:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    res.json(results);
  });
});




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

function isPasswordValid(password) {
  // Password validation logic
  if (password.length < 8) {
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  if (!/[a-z]/.test(password)) {
    return false;
  }
  if (!/[0-9]/.test(password)) {
    return false;
  }
  return true;
};


function isEmailValid(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}


app.post('/register', (req, res) => {
  console.log(req.body);
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // Check if name, email, and password are valid
  if (!isEmailValid(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Perform password validation on the server-side
  if (!isPasswordValid(password)) {
    return res.status(400).json({ message: 'Password does not meet the requirements' });
  }

  const user = { user_name: name, Email: email, user_pass: password };

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
    from: `${req.body.name} <${req.body.email}>`,
    to: 'Connectschoolmbuya@gmail.com',
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





