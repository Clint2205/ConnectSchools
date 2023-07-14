$(document).ready(function() {
    // ...
    
    // Logout button click event
    $('#logout-button').click(function() {
      $.get('/logout', function(response) {
        // Redirect to the login page
        window.location.href = '/loginReg';
      });
    });
   
  });
  
  // Add an event listener to the form submit button
 // Add an event listener to the form submit button
  document.getElementById('thread-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the form data
    var formData = {
      title: document.getElementById('title').value,
      content: document.getElementById('content').value,
      userId: '<%= user.user_ID %>' // Get the user ID from the server-side rendering
    };

    // Send the form data via AJAX
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/threads');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 201) {
        // Thread created successfully
        //console.log('Thread created successfully');
        $('#thread-form').append('<p class="success-message">Comment added successfully!</p>');
        // Reset the form
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
       // location.reload(); // Refresh the page
       setTimeout(function() {
        $('.success-message').remove();
        //$('#login').append(loginForm);
      }, 5000);
      } else {
        // Error occurred
        //console.error('Error creating thread:', xhr.responseText);
        $('#thread-form').html('<p class="error-message">Comment added unsuccessfully!</p>');
        setTimeout(function() {
          $('.error-message').remove();
          //$('#login').append(loginForm);
        }, 3000);
        location.reload(); // Refresh the page

      }
    };
    xhr.send(JSON.stringify(formData));

  });
  window.addEventListener('scroll', scrollFunction, { passive: true });

  function scrollFunction() {
    if (window.pageYOffset > 20) {
      document.getElementById("myBtn").style.display = "block";
    } else {
      document.getElementById("myBtn").style.display = "none";
    }
  }
  
  function topFunction() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  

  
  