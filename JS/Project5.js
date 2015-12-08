
var Bigmap= undefined;
var startLat = 38.883845;
var startLng = -94.667995;
//locations View
//Search and Filter Locations here
//At least 5 locations
//lets make this the top bar
//Text area here to filter markers that already show up
//Search function will not be enough through 3rd party API, must filter myself
//knockout needs to handle List, Filter, and any other information subject to changing state. 

locationView = {

};

// Maps View
//Display Map Markers for Places of interest within this neighborhood
//additionall functionality to animate map markers
//open information window from 3rd party APIS

mapView = {

	init: function (){
		

		//initialize Map.  
		 var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: startLat, lng: startLng},
			scrollwheel: true,
			zoom: 12
		}); 
		Bigmap=map; //set this new map we made to be used as a global variable

		//For Funsies, make a rough polygon for OP
		//alt: make circles and use that to look for stoes/whatever in that radius

		//TODO, make this whole thing into a function for a handler
		////////////////
		var startMarker = new google.maps.Marker({
			position: {lat: startLat, lng: startLng},
			map: map,
			title: 'startLoc',
			//code to store this in an Array
		});
		var infowindow = new google.maps.InfoWindow({
			content: '135th and Metcalf' //this can be super complicated, its a full popup window
		});

		startMarker.addListener('click', function(){
			infowindow.open(map, startMarker);
			//center on location
		});
		//////////////////
		//////////////////

		console.log("initilized");
	},
	//resize WIP
	resize: function(){
		var mapDiv =document.getElementById("domMap");
		mapDiv.style.width = 80% 
		google.maps.event.trigger(Bigmap, "resize"); //resize the map, BigMap should be our map reference
		console.log("mapDiv");
	},
	placeMapMarkers: function(){
		//code to retrieve data from Model and then place it in here
		//code to place markers at each location of interest
	},
	clearMapMarkers: function(){
		//code to remove all map markers
		//https://developers.google.com/maps/documentation/javascript/examples/marker-remove
		//clearMarkers();
		//empty the array
	},
	popupMarker: function(){ //will pass in data in here from VM
		//code to generate a popup over selected target
	}
}

	//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ
