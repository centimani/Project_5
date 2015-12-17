//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ

var Bigmap= undefined;
var startLat = 38.883845;
var startLng = -94.667995;
var latLng = "{lat: %lat, lng: %lng}";

var Model = {
	//init: function(){
	  //populate and build the marker Array which will be used to place markers
	  rawData: function(){ //this is for points of interest
	  	var MarkerArray = ko.observableArray([
	   		{lat: "38.895180" , lng:"-94.669989", markerName:"HR HAVEN" },
	   		{lat: "38.853392" , lng:"-94.682561", markerName:"Target" },
	   		{lat: "38.885448" , lng:"-94.663601", markerName:"Mr Goodcents" },
	   		{lat: "38.885366" , lng:"-94.688313", markerName:"Hy-Vee" },
	   		{lat: "38.885676" , lng:"-94.699230", markerName:"Kindercare Switzer Commons"},
	    ]);
		//ko.applyBindings(new MarkerArray()); not sure if i need this, leave it heere just in case
		return MarkerArray();
	  },
	  searchArray: function(){
	  	var localArray = Model.rawData();
	  	var indexNumb = localArray.indexOf('markerName: HR HAVEN');
	  	console.log(indexNumb);
	  },
	  //other data generated from 3rd Party APIS
};


//locations View
//Search and Filter Locations here
//At least 5 locations
//lets make this the top bar
//Text area here to filter markers that already show up
//Search function will not be enough through 3rd party API, must filter myself
//knockout needs to handle List, Filter, and any other information subject to changing state.

locationView = {

	populateDropdown: function(){
		//var dropDownBox = document.getElementById("selectBox"); //possibly move this to a global variable

		var localArray = Model.rawData();
		var optionBase = '<option value="%value">%VisibleName</option>';

		for (i = 0; i< localArray.length; i++){
			var newOption = optionBase.replace("%value", localArray[i].markerName);
				newOption = newOption.replace("%VisibleName", localArray[i].markerName);
			$("#selectBox").append(newOption);
		}
	},
	//this function will focus and zoom on the selected Drop Down Menu Option
	focusDropdown: function(){
		var dropDownBox = document.getElementById("selectBox");
		var ddSelection = dropDownBox.options[dropDownBox.selectedIndex].value; 
		
		//search the array
		var arrayvalue= Model.rawData().indexOf('ddSelection');
		console.log (arrayvalue);


		var focusLocation = new google.maps.LatLng(38.885366, -94.688313); //best to wrap our values in this googlebox
		Bigmap.setCenter(focusLocation);
		Bigmap.setZoom(15);
	},

	pointOfInterestButton: function(){

	},
};

// Maps View
//Display Map Markers for Places of interest within this neighborhood
//additionall functionalit y to animate map markers
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
    
    	mapView.placeMapMarkers(startLat, startLng, "135th and Metcalf");

		console.log("initilized");
	},
	//resize WIP
	resize: function(){
		var mapDiv =document.getElementById("domMap");
		mapDiv.style.width = 80%
		google.maps.event.trigger(Bigmap, "resize"); //resize the map, BigMap should be our map reference
		console.log("mapDiv");
	},
	
	placeMapMarkers: function(lat, lng, mName){ //think we'll need to pass data into this function
     
		var myLatlng = new google.maps.LatLng(lat, lng); //way to save in LatLng values so google likes it
     	var newMarker = new google.maps.Marker({
			position: myLatlng, //VMlat, VMlng from Model
			map: Bigmap,
			title: mName,
		  });
		  
		  //could seperate this out if we want complex pop ups
		  var newInfoWin = new google.maps.InfoWindow({
			content: mName, //this can be super complicated, its a full popup window
		  });
	    
	   //Adds ClickEvent to Button
	    newMarker.addListener('click', function(){
	      newInfoWin.open(Bigmap, newMarker);
	    });
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

	

 ViewModel= {
  
  //this one will grab info from the Model Array to build makers
  //name can be changed later to avoid confusion
  init: function(){
  	//Grab info from the Model
	var localArray = Model.rawData();
    
    //Loop through here and build in the MapView
    for (i = 0; i < localArray.length; i++) {
     	var locallat= localArray[i].lat;
     	var locallng=localArray[i].lng;
     	var localName = localArray[i].markerName;
     	//we'll get name+ any other thing we need for markers here later
     	mapView.placeMapMarkers(locallat, locallng, localName);

    }
  },

 };
 
//ViewModel.init();
