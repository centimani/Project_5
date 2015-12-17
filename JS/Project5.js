//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ

var Bigmap= undefined;
var startLat = 38.883845;
var startLng = -94.667995;
var latLng = "{lat: %lat, lng: %lng}";

var BarkerArray = ko.observableArray([
	   		{lat: "38.895180" , lng:"-94.669989", markerName:"HR HAVEN" },
	   		{lat: "38.853392" , lng:"-94.682561", markerName:"Target" },
	   		{lat: "38.885448" , lng:"-94.663601", markerName:"Mr Goodcents" },
	   		{lat: "38.885366" , lng:"-94.688313", markerName:"Hy-Vee" },
	   		{lat: "38.885676" , lng:"-94.699230", markerName:"Kindercare Switzer Commons"},
	    ]);
	    
ko.applyBindings(new BarkerArray());

var Model = {
	  
	  //not sure if this should be in the model or the Map View. Decide Later
	  markerData: function(){
	    var markerObject = ko.observableArray([]);
	    
	    return markerObject;
	  },
	  
	  searchArray: function(searchValue){ //maybe we'll add another value ot pass into here for what element we're looking for IE lat,lng markerName for broader search functionality
      for (var i = 0; i < BarkerArray().length; i++){
        if (BarkerArray()[i].markerName == searchValue){ //sub target for searchValue function
	  	    return i;
        }
      }
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
  //populates the DropDown Menu
	populateDropdown: function(){
		
		var optionBase = '<option value="%value">%VisibleName</option>';

		for (i = 0; i< BarkerArray().length; i++){
			var newOption = optionBase.replace("%value", BarkerArray()[i].markerName);
				newOption = newOption.replace("%VisibleName", BarkerArray()[i].markerName);
			$("#selectBox").append(newOption);
		}
	},
	
	//returns the value of the Drop Down Menu
	focusDropdown: function(){
		var dropDownBox = document.getElementById("selectBox");
		var ddSelection = dropDownBox.options[dropDownBox.selectedIndex].value;
		console.log (ddSelection);
		
		return ddSelection;
	},

	pointOfInterestButton: function(){

	},
};

// Maps View
//Display Map Markers for Places of interest within this neighborhood
//additionall functionalit y to animate map markers
//open information window from 3rd party APIS

//TODO: Animate Selected Markers.
    //  Show Information in the infowindow for each Marker
mapView = {

	init: function (){
		
		//initialize Map.
		 var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: startLat, lng: startLng},
			scrollwheel: true,
			zoom: 12
		});
		Bigmap=map; //set this new map we made to be used as a global variable

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
		  
		  //pass this marker into an array/obj
		  
		  //could seperate this out if we want complex pop ups
		  var newInfoWin = new google.maps.InfoWindow({
			content: mName, //this can be super complicated, its a full popup window
		  });
	    
	   //Adds ClickEvent to Button
	    newMarker.addListener('click', function(){
	      newInfoWin.open(Bigmap, newMarker);
	    });
	    
	    return newMarker;
    },

  MapMarkerArray: function(){
    
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
};

	

 ViewModel= {
  
  //this one will grab info from the Model Array to build makers
  initBuildMarkers: function(){
    //Loop through here and build in the MapView
    for (i = 0; i < BarkerArray().length; i++) {
     	var locallat= BarkerArray()[i].lat;
     	var locallng=BarkerArray()[i].lng;
     	var localName = BarkerArray()[i].markerName;
     	
     	//we'll get name+ any other thing we need for markers here later
     	
     	mapView.placeMapMarkers(locallat, locallng, localName); //places Map Marker
      
    }
  },

//This function is focusing on a location we get, not a marker
// this should perhaps be changed to get marker information
  DropDownFocus: function(){
    var focusValue = locationView.focusDropdown(); //returns the value we're going to search for
    var focusIndex = Model.searchArray(focusValue); //searches for the index of the dropdown box is focused on
    
    var iLNG = BarkerArray()[focusIndex].lng; //gets the LNG value from index i
    var iLAT = BarkerArray()[focusIndex].lat; //gets the LAT value from index i

    var focusLocation = new google.maps.LatLng(iLAT, iLNG); //best to wrap our values in this googlebox
		Bigmap.setCenter(focusLocation); //centers on focusLocation
		Bigmap.setZoom(13); //sets Zoom
		
		//set marker and open
		//newInfoWin.open(Bigmap, newMarker);
  },
  
  init: function(){
    ViewModel.initBuildMarkers();
    locationView.populateDropdown();
  }
  
  
 };
 
 
//Reminder: LISTENERS should not be used on Map.
 Test ={
   pushKO : function(){
    BarkerArray().push('{lat: "39.04825" , lng:"-94.592884", markerName:"Boogers" }');
    mapView.placeMapMarkers(39.04825,-94.592884,'Boogers'); //add the marker manually for now
    console.log (BarkerArray().length);
   }
 };
 
