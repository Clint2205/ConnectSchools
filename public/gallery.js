// Add event listeners to pause videos on page load
window.addEventListener('load', function () {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    video.pause();
  });
});

// Define the gallery images
let sections = [
    {
      title: "Sports",
      images: [
        { src: "images/pic1.jpg", alt: "Sport Image 1" },
        { src: "images/pic2.jpg", alt: "Sport Image 2" },
        { src: "images/pic3.jpg", alt: "Sport Image 3" },
        { src: "images/pic4.jpg", alt: "Sport Image 3" }
      ]
    },
    {
      title: "Social",
      images: [
        { src: "images/pic5.jpg", alt: "Dance Image 1" },
        { src: "images/pic6.jpg", alt: "Dance Image 2" },
        { src: "images/pic7.jpg", alt: "Dance Image 3" },
        { src: "images/pic8.jpg", alt: "Dance Image 3" }
      ]
    },
    {
      title: "Drama",
      images: [
        { src: "images/pic12.jpg", alt: "Drama Image 1" },
        { src: "images/pic14.jpg", alt: "Drama Image 2" },
        { src: "images/pic15.jpg", alt: "Drama Image 3" },
        { src: "images/pic16.jpg", alt: "Drama Image 3" }
      ]
    },
    {
      title: "Classes",
      images: [
        { src: "images/pic9.jpg", alt: "Studies Image 1" },
        { src: "images/pic10.jpg", alt: "Studies Image 2" },
        { src: "images/pic11.jpg", alt: "Studies Image 3" },
        { src: "images/pic13.jpg", alt: "Studies Image 3" }
      ]
    }
  ];

 // Function to generate the gallery HTML
function generateGallery() {
    let gallery = document.getElementById("gallery");
    sections.forEach(function(section) {
      let sectionHTML = document.createElement("div");
      sectionHTML.innerHTML = "<h2>" + section.title + "</h2>";
      section.images.forEach(function(image) {
        let imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");
  
        let imageHTML = document.createElement("img");
        imageHTML.classList.add("gallery-image");
        imageHTML.src = image.src;
        imageHTML.alt = image.alt;
        imageHTML.addEventListener("click", function() {
          openModal(image.src, image.alt);
        });
  
        let message = document.createElement("div");
        message.classList.add("image-message");
        message.textContent = "Click to enlarge";
  
        imageContainer.appendChild(imageHTML);
        imageContainer.appendChild(message);
  
        sectionHTML.appendChild(imageContainer);
      });
      gallery.appendChild(sectionHTML);
    });
  }
  
  


  // Function to open the modal
  function openModal(src, alt) {
    let modal = document.getElementById("imageModal");
    let modalImage = document.getElementById("modalImage");
    let modalCaption = document.getElementById("modalCaption");
    modal.style.display = "block";
    modalImage.src = src;
    modalImage.alt = alt;
    modalCaption.textContent = alt;
  }

  // Function to close the modal
  function closeModal() {
    let modal = document.getElementById("imageModal");
    modal.style.display = "none";
  }

  // Close the modal when the close button is clicked
  document.getElementsByClassName("modal-close")[0].addEventListener("click", closeModal);

  // Close the modal when the user clicks outside the modal content
  window.addEventListener("click", function(event) {
    let modal = document.getElementById("imageModal");
    if (event.target == modal) {
      closeModal();
    }
  });

  // Generate the gallery
  generateGallery();