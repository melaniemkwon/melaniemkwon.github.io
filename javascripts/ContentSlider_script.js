$(document).ready(function() {
	// Set Options
	var speed = 500; 			// Fade speed from transition in milliseconds
	var autoswitch = true;		// Autoslider option
	var autoswitch_speed = 4000; // Auto slider speed
	
	// Add initial active class
	$('.slide').first().addClass('active');
	
	// Hide all slides
	$('.slide').hide();
	
	// Show first slide
	$('.active').show();
	
	//when item inside the next div is clicked, then run a function
	$('#next').on('click', nextSlide);
	
	$('#prev').on('click', prevSlide);
	
	// Auto slider handler
	if(autoswitch == true) {
		setInterval(nextSlide, autoswitch_speed);
	}
	
	// Function to switch to next slide
	function nextSlide() {
		//take 'active' class off the current image
		$('.active').removeClass('active').addClass('oldActive'); 	//so we know its the last image that had active class
		if($('.oldActive').is(':last-child')) { 					//if this is the last slide, we want to go back to first
			$('.slide').first().addClass('active');
		} else {
			$('.oldActive').next().addClass('active');
		}
		$('.oldActive').removeClass('oldActive');
		$('.slide').fadeOut(speed);
		$('.active').fadeIn(speed);
	}
	
	function prevSlide() {
		$('.active').removeClass('active').addClass('oldActive'); 
		if($('.oldActive').is(':first-child')) { 
			$('.slide').last().addClass('active');
		} else {
			$('.oldActive').prev().addClass('active');
		}
		$('.oldActive').removeClass('oldActive');
		$('.slide').fadeOut(speed);
		$('.active').fadeIn(speed);
	}
}); 
