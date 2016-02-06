//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ

//TODO: Largely 3rd party API interface + AJAX stuff
//Under Test we have a function that'll place a new marker into our arrays. check to make sure it goes into ALL the arrays
//We need to use the search bar to search through API calls
//We also need to populate infoWindows, which again will largely be done with API calls.
// Add a filter function, maybe make it a button that appears in the info window that'll remove itself from the arrays
//also have a recent list, so that even if we delete from above, it'll remain on our recents tab

var Bigmap= undefined; //used to save the Map reference
var startLat = 38.883881; //used for init of Map
var startLng = -94.667829; //used for init of Map
var lastMarker = undefined; // this is used to toggle bounces
var lastInfoWindow = undefined; //this is used to hold last Array

var BarkerArray = ko.observableArray([ //Holds the HardCoded Data I picked
	   		{lat: "38.895180" , lng:"-94.669989", markerName:"HR HAVEN" },
	   		{lat: "38.853392" , lng:"-94.682561", markerName:"Target" },
	   		{lat: "38.885448" , lng:"-94.663601", markerName:"Mr Goodcents" },
	   		{lat: "38.885366" , lng:"-94.688313", markerName:"Hy-Vee" },
	   		{lat: "38.885676" , lng:"-94.699230", markerName:"Kindercare Switzer Commons"},
	    ]);
// all the functions are all modified at the same time, these will all share the same index in their respective Arrays, use this for searching
var MapMarkerArray = ko.observableArray([]); //populated by their creation. This holds Markers
//var MarkerNames = ko.observableArray([]);//populated by their creation. Currently Used by the DropDown Menu
var infoWindowArray = ko.observableArray([]); //populated by their creation. This holds infoWindows

var Model = { //Model will handle all of the calculations of the data
	  searchArray: function(searchValue){ //add another value ot pass into here for what element for broader search functionality
	  
      for (var i = 0; i < MapMarkerArray().length; i++){
        if (BarkerArray()[i].markerName == searchValue){ //sub target for searchValue function
	  	    return i;
        }
      }
	  },
	  //other data generated from 3rd Party APIS
};

//locations View
//Search and Filter Locations here
//Text area here to filter markers that already show up
//Search function will not be enough through 3rd party API, must filter myself
//knockout needs to handle List, Filter, and any other information subject to changing state.

locationView = {
  //new location functions here
};

// Maps View
//open information window from 3rd party APIS

mapView = {
  
	init: function (){ //initializes the map
		 var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: startLat, lng: startLng},
			scrollwheel: true,
			zoom: 13
		});
		Bigmap=map; //set this new map we made to be used as a global variable
	  mapView.initSearchBox();
	  
		console.log("initilized");
	},
	
	initSearchBox: function(){
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    //Bigmap.controls[google.maps.ControlPosition.TOP_LEFT].push(input); //moves the search box into the Map Window

    // Bias the SearchBox results towards current map's viewport.
    Bigmap.addListener('bounds_changed', function() {
      searchBox.setBounds(Bigmap.getBounds());
    });

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length ===  0) {
      return;
    }
    //get the selected search option and places it on the map
    var selectedLat =(places[0].geometry.location.lat());
    var selectedLng = (places[0].geometry.location.lng());
    var selectedName = (places[0].name);
    mapView.placeMapMarkers(selectedLat,selectedLng,selectedName);//places marker
    //BarkerArray().push({lat: selectedLat , lng: selectedLng, markerName:selectedName });//this is redudent, but breaks the dropdown focus function, fix later
    mapView.resizeMap(); //resize map
    var NewFocus=MapMarkerArray().length - 1; //get the last index
    var newMarker=MapMarkerArray()[NewFocus]; //get recently added marker
    ViewModel.markerBounce(newMarker); //make it bouuunce
    
    
    });
	},

  resizeMap: function(){
    var bounds = new google.maps.LatLngBounds();
    for(i=0;i<MapMarkerArray().length;i++) {
      bounds.extend(MapMarkerArray()[i].getPosition());
    }
  Bigmap.fitBounds(bounds);
  },
	
	placeMapMarkers: function(lat, lng, mName){
     
		var myLatlng = new google.maps.LatLng(lat, lng); //way to save in LatLng values so google likes it
    var newMarker = new google.maps.Marker({
			position: myLatlng, //VMlat, VMlng from Model
			map: Bigmap,
			animation: google.maps.Animation.DROP,//sets drop animation when it builds
			title: mName,
		  });
		  
		  MapMarkerArray.push(newMarker);//passes this data into the MarkerArray
		  //MarkerNames.push(mName); //passes this data into the MarkerNames.Unsure about this one.
		  
		  ///This needs to be expanded and moved out to a seperate function to create a new InfoWindow
		  var newInfoWin = new google.maps.InfoWindow({
			content: mName, //this can be super complicated, its a full popup window
		  });
		  ///////////////////////////////////////////////////////////
	    
	    infoWindowArray.push(newInfoWin);
	    
	    newMarker.addListener('click', function(){ //Adds ClickEvent to Button
	      newInfoWin.open(Bigmap, newMarker);
	    });
	    
	    return newMarker;
    },

  openMarkerInfoWindow: function(myIndex){
    var currentInfoWindow = infoWindowArray()[myIndex]; //gets the Info Window at the index
    var currentMarker = MapMarkerArray()[myIndex]; //gets the Map Marker at the index
    currentInfoWindow.open(Bigmap,currentMarker); //opens the infoWindo
  },

	clearMapMarkers: function(){
		//code to remove all map markers
		//https://developers.google.com/maps/documentation/javascript/examples/marker-remove
		//clearMarkers();
		//empty the array
	},
};

 ViewModel= {
  
  initBuildMarkers: function(){ //builds initial Markers
    for (i = 0; i < BarkerArray().length; i++) {
     	var locallat= BarkerArray()[i].lat;
     	var locallng=BarkerArray()[i].lng;
     	var localName = BarkerArray()[i].markerName;
     	
     	//we'll get name+ any other thing we need for markers here later
     	mapView.placeMapMarkers(locallat, locallng, localName); //places Map Marker
      
    }
  },

  DropDownFocus: function(){ //Centers/Zooms/Bounces selected Marker from the Dropdown
    var focusValue = locationView.valueDropdown(); //returns the value we're going to search for
    var focusIndex = Model.searchArray(focusValue); //searches for the index of the dropdown box is focused on
    var iLNG = MapMarkerArray()[focusIndex].lng; //gets the LNG value from index i
    var iLAT = MapMarkerArray()[focusIndex].lat; //gets the LAT value from index i

    var focusLocation = new google.maps.LatLng(iLAT, iLNG); //best to wrap our values in this googlebox
		//Bigmap.setCenter(focusLocation); //centers on focusLocation
		Bigmap.setZoom(13); //sets Zoom
		
		if (infoWindowArray().length > 0){ //all this needs infoWindowArray to already be populated
		  mapView.openMarkerInfoWindow(focusIndex);
		  var myMarker=MapMarkerArray()[focusIndex]; //gets the marker at the focused Index
		  ViewModel.markerBounce(lastMarker); //turns off the last marker bounce
		  lastInfoWindow.close(); //closes the last infoWindow
		  ViewModel.markerBounce(myMarker); //makes this marker bounce
		  lastMarker=MapMarkerArray()[focusIndex]; //sets the new LastMarker to this one
		  lastInfoWindow=infoWindowArray()[focusIndex]; //sets the lastInfoWindow to this one
		  mapView.resizeMap();
		}
		
  },
  
   Focus: function(indexValue){ //Bounces selected Marker and opens infoWindow
		//console.log($index);
		mapView.openMarkerInfoWindow(indexValue);
		var myMarker=MapMarkerArray()[indexValue]; //gets the marker at the focused Index
		ViewModel.markerBounce(lastMarker); //turns off the last marker bounce
		lastInfoWindow.close(); //closes the last infoWindow
		ViewModel.markerBounce(myMarker); //makes this marker bounce
		lastMarker=MapMarkerArray()[indexValue]; //sets the new LastMarker to this one
		lastInfoWindow=infoWindowArray()[indexValue]; //sets the lastInfoWindow to this one
		mapView.resizeMap();
  },
  markerBounce: function(passMarker){ //Toggles Bounce of a Map Marker
    if (passMarker.getAnimation() !== null){ //Bounce: Off
      passMarker.setAnimation(null);
    }
    else {
      passMarker.setAnimation(google.maps.Animation.BOUNCE); //Bounce:On
    }
  },
  
  init: function(){ //initializes all the things
    ViewModel.initBuildMarkers();
    //locationView.populateDropdown();
    lastMarker=MapMarkerArray()[0]; //sets the lastMarker to the intitial Value
    lastMarker.setAnimation(google.maps.Animation.BOUNCE); //fixes our first item not bouncing
    lastInfoWindow = infoWindowArray()[0]; //sets our lastInfoWindow To Zero Index
    //openMarkerInfoWindow(0); //opens our starter infoWindow
  },
  
  populateInfoWindows: function(){
    //nuff said
  },
  removeMarker: function(){
    //this is where we remove a marker from the map
  },
  
  
 };
 
//This is garbage town
 Test ={
   //Function adds a marker at the specified location, and centers it
   pushKO : function(myLat, myLng, myName){
    
    myLat=39.04825;
    myLng=-94.592884;
    myName="Boogers";
     
    BarkerArray().push({lat: myLat , lng: myLng, markerName:myName }); //adds marker info to the marker
    mapView.placeMapMarkers(myLat,myLng, myName); //add the marker manually for now
    
    //center, maybe seperate this out or put it directly into the map view
    var focusLocation = new google.maps.LatLng(myLat, myLng); //best to wrap our values in this googlebox
		Bigmap.setCenter(focusLocation); //centers on focusLocation
		Bigmap.setZoom(13); //sets Zoom
    
   },
   
 };
 
 ko.applyBindings();

