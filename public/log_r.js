const loginForm = document.getElementById('login');
const registerForm = document.getElementById('register');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

loginBtn.addEventListener('click', () => {
  loginBtn.style.display = 'none';
  registerBtn.style.display = 'inline-block';
  loginForm.classList.toggle('hidden');
  registerForm.classList.add('hidden'); // hide loginForm
});

registerBtn.addEventListener('click', () => {
  registerBtn.style.display = 'none';
  loginBtn.style.display = 'inline-block';
  loginForm.classList.add('hidden'); // hide loginForm
  registerForm.classList.remove('hidden');
});


  
$(document).ready(function() {
  var loginForm = $('#login-form');

  $('#login-form').submit(function(event) {
    // Prevent the form from submitting via the browser
    event.preventDefault();

    // Get the form data
    var formData = $(this).serialize();

    // Send the AJAX request
    $.ajax({
      type: 'POST',
      url: '/login',
      data: formData,
      contentType: 'application/x-www-form-urlencoded',
      success: function(response) {
        // Handle the response from the server
        // alert('Logged in successfully!');
        window.location.href = '/forum';
        loginForm[0].reset();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Handle errors
        // alert('Error: ' + textStatus + ' - ' + errorThrown);
        $('#login').append('<p class="error-message">Email or password is incorrect!</p>');
        loginForm[0].reset(); // Clear the form fields
        setTimeout(function() {
          $('.error-message').remove();
          $('#login').append(loginForm);
        }, 5000);
      }
    });
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
}


$(document).ready(function() {
  $('#register-form').submit(function(event) {
    // Prevent the form from submitting via the browser
    event.preventDefault();

    // Get the form data
    var formData = $(this).serialize();

    // Get the password input
    var password = $('#password').val();

    // Perform password validation
    if (!isPasswordValid(password)) {
      // Display an error message or handle invalid password
      $('#password-error').text('Password does not meet the requirements.');
      $('#register-form')[0].reset();
      setTimeout(function () {
        $('#password-error').text(''); // Clear the password error message
        
      }, 5000);
        
      return;
    }

    // Send the AJAX request
    $.ajax({
      type: 'POST',
      url: '/register',
      data: formData,
      contentType: 'application/x-www-form-urlencoded',
      success: function(response) {
        // Handle the response from the server
        $('#register-form').html('<p class="success-message">Registered successfully!</p>');
        // Reset the form
        $('#register-form')[0].reset();
        $('#password-error').text(''); // Clear the password error message

      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Handle errors
        // alert('Error: ' + textStatus + ' - ' + errorThrown);
        $('#register-form').html('<p class="success-message">Registration unsuccessful!</p>');
      }
    });
  });


});

 
 