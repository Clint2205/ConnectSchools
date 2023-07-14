

$(document).ready(function() {
  // Activate the carousel
  $("#carouselExampleIndicators").carousel();

  // Enable carousel indicators click
  $(".carousel-indicators li").click(function() {
    var slideTo = $(this).attr("data-slide-to");
    $("#carouselExampleIndicators").carousel(parseInt(slideTo));
  });
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


// Open the modal
function openModal(image, caption) {
  var modal = document.getElementById("teamMemberModal");
  var modalImage = document.getElementById("teamMemberImage");
  var modalCaption = document.querySelector(".modal-caption");

  modal.style.display = "block";
  modalImage.src = image;
  modalCaption.textContent = caption;
}

// Close the modal
function closeModal() {
  var modal = document.getElementById("teamMemberModal");
  modal.style.display = "none";
}

// Add "Click to enlarge" message to team member images
var teamMemberImages = document.getElementsByClassName("team-member-image");
for (var i = 0; i < teamMemberImages.length; i++) {
  var image = teamMemberImages[i];
  var caption = image.alt;
  
  var message = document.createElement("div");
  message.classList.add("image-message");
  message.textContent = "Click to enlarge";
  
  var teamMember = image.parentNode;
  teamMember.appendChild(message);
  
  image.addEventListener("click", function() {
    var image = this.src;
    var caption = this.alt;
    openModal(image, caption);
  });
}

// Close the modal when the close button is clicked
document.querySelector(".modal-close").addEventListener("click", closeModal);

// Close the modal when the user clicks outside the modal content
window.addEventListener("click", function(event) {
  var modal = document.getElementById("teamMemberModal");
  if (event.target === modal) {
    closeModal();
  }
});





    $(function() {
      $('#contact-form').submit(function(event) {
        event.preventDefault();
        let formData = {
          name: $('#name').val(),
          email: $('#email').val(),
          phone: $('#telephone').val(),
          message: $('#message').val()
        };
        $.ajax({
          type: 'POST',
          url: '/',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          success: function(res) {
            $('#contact-form').append('<p class="success-message">Message sent successfully!</p>');
        
       setTimeout(function() {
        $('.success-message').remove();
        //$('#login').append(loginForm);
      }, 5000);
            $('#name').val('');
            $('#email').val('');
            $('#telephone').val('');
            $('#message').val('');
          },
          error: function(err) {
            console.error(err);
            alert('There was an error sending your message.');
          }
        });
      });
    });
    
  
    
    const formContainer = document.querySelector('.form-container');
    const showFormButton = document.getElementById('show-form');

    showFormButton.addEventListener('click', function() {
      if (formContainer.style.display === 'none') {
        formContainer.style.display = 'block';
      } else {
        formContainer.style.display = 'none';
      }
    });



  
  
  
    
  
