
//locations View
//Search and Filter Locations here
//At least 5 locations
//Text area here to filter markers that already show up
//Search function will not be enough through 3rd party API, must filter myself
//knockout needs to handle List, Filter, and any other information subject to changing state. 
//Things knockout shouldn't be used for: MAP API stuff, 
locationView = {

};

// Maps View
//Google Maps API HERE
//Display Map Markers for Places of interest within this neighborhood
//additionall functionality to animate map markers
//open information window from 3rd party APIS

mapView = {

	init: function (){
		//initialize Map.  
		var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: 38.883845, lng: -94.667995},
			scrollwheel: true,
			zoom: 12
		}); 
		console.log("initilized");
	},
}




	//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ
