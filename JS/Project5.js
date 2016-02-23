
var Bigmap= undefined; 
var startLat = 38.883881; 
var startLng = -94.667829; 
var searchBoxValue =ko.observable('');
var globalInfoWindow=undefined;
var infoWindowStr= "";
var BarkerArray = ko.observableArray([ 
		{lat: "38.895180" , lng:"-94.669989", markerName:"HR HAVEN" },
		{lat: "38.853392" , lng:"-94.682561", markerName:"Target" },
		{lat: "38.885448" , lng:"-94.663601", markerName:"Mr Goodcents" },
		{lat: "38.885366" , lng:"-94.688313", markerName:"Hy-Vee" },
		{lat: "38.885676" , lng:"-94.699230", markerName:"Kindercare Switzer Commons"},
	]);

var MapMarkerArray = ko.observableArray([]); 
var infoWindowSTRArray = ko.observableArray([]);

var Model = { 
};

locationView = {

	query: ko.observable(''), 
	
	fakeMapMarkerArray : ko.observableArray([]), 
/*This runs through the fakeMapMarkerArray to attempt to match the title of the marker to the qurey value.*/
	search: function(value) {
		locationView.fakeMapMarkerArray.removeAll();
		mapView.hideAllMarkers();
		for(var i in MapMarkerArray()) {
			if(MapMarkerArray()[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) { 
				var addMarker= MapMarkerArray()[i]; 
				locationView.fakeMapMarkerArray.push(addMarker); 
				mapView.showMarker(addMarker);
				mapView.resizeMap();
			}
			else{
			//console.log("fail");
			}
		}
	}
};

mapView = {

	init: function (){ 
		var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: startLat, lng: startLng},
			scrollwheel: false, 
			disableDefaultUI: true,
			zoom: 13
		});
	Bigmap=map;
	mapView.initSearchBox();
	ViewModel.initBuildMarkers();
	mapView.initInfoWindow();
	},
	/*Initializes the Google search box. Creates the element, sets it to a google value, moves the box to desired location in the map, and biases the search results to map bounds. The listening event returns data from the google maps API */
	initSearchBox: function(){
	var input = document.getElementById('pac-input'); 
	var searchBox = new google.maps.places.SearchBox(input); 
	Bigmap.controls[google.maps.ControlPosition.TOP_CENTER].push(input); 
	Bigmap.addListener('bounds_changed', function() {
		searchBox.setBounds(Bigmap.getBounds());
	});

	searchBox.addListener('places_changed', function() { //listener to retrieve details of searched place
		var places = searchBox.getPlaces();
		if (places.length ===	0) {
			return;
		}
		var selectedLat =(places[0].geometry.location.lat()); 
		var selectedLng = (places[0].geometry.location.lng()); 
		var selectedName = (places[0].name); 
		mapView.placeMapMarkers(selectedLat,selectedLng,selectedName);
		mapView.resizeMap();
		var NewFocus=MapMarkerArray().length - 1; 
		var newMarker=MapMarkerArray()[NewFocus];
		ViewModel.markerBounceAll(newMarker);
		});
	},
	
	/*When the markers and infoWindows were being built, sometimes they wouldn't be matched in the right order. Sort is called when the body finishes loaded to make sure everything is in the right place*/
	sort: function(){ 
	var infoWindow = infoWindowSTRArray()[0]; 
	var mapMarker = MapMarkerArray()[0];
	var tempArray = ["","","","",""]; 
	
	for (i = 0; i < MapMarkerArray().length; i++){
		var correctIndex =infoWindowSTRArray()[i].slice(4,5); 
		if( correctIndex != i){
			var strToMove = infoWindowSTRArray()[i];
			tempArray.splice(correctIndex,1, strToMove);
		}
		else{
			tempArray.splice(i,1,infoWindowSTRArray()[i]);
		}
	}
	infoWindowSTRArray= ko.observableArray(tempArray);
	},
	
	initInfoWindow: function(){
		globalInfoWindow = new google.maps.InfoWindow({content: infoWindowStr,});
	},
	/*Rounds up and breaks down Marker information we need to make our AJAX call to foursquare*/
	buildInfoWindow: function(passedMarker){
		var myLat = passedMarker.position.lat(); 
		var myLng = passedMarker.position.lng(); 
		var myName = passedMarker.title; 
		var markerIndex = MapMarkerArray().indexOf(passedMarker); 
		mapView.retrieveData(myLat,myLng,myName, markerIndex); 
	},
	
	/*Makes the AJAX call to foursquare and retrives the data we need to build our generated infoWindows*/
	retrieveData: function(lat,lng, name, index){
		var myClientID = "3MCVEAWYXO4UL1RPEYO1XBIXQPNGEYXITVOD2X3EF5E0LT3W";
		var mySecretID = "FZFTDA0MHSVNUCDYYZXUCELLQNKLO2NIDGIXIZPNASPRNU0M";
		var ajaxURL = "https://api.foursquare.com/v2/venues/search?client_id="+myClientID+"&client_secret="+mySecretID+"&v=20130815&ll="+lat+","+lng+"&query="+name;
	
		$.get(ajaxURL ,function(data,status){
	
		var infoName = data.response.venues[0].name; 
		if( infoName === undefined){
			infoName = "Name unavailable";
		}
		var infoPhone = data.response.venues[0].contact.formattedPhone;
		if( infoPhone === undefined){
			infoPhone = "Phone Number unavailable";
		}
		var infoURL = data.response.venues[0].url;
		if( infoURL === undefined){
			infoURL = "URL unavailable";
		}
		var infoBuilding = data.response.venues[0].categories[0].name;
		if( infoBuilding === undefined){
			infoBuilding = "Building Type unavailable";
		}
		var infoHereNow = data.response.venues[0].hereNow.summary;
		if( infoHereNow === undefined){
			infoHereNow = "People Here Now is unavailable";
		}
		var infoAddress = data.response.venues[0].location.address; 
		if( infoAddress === undefined){
			infoAddress = "Address unavailable";
		}
		var infoTwitter = data.response.venues[0].contact.twitter;
		if( infoTwitter === undefined){
			infoTwitter="Twitter Unavailable";
		}
		var infoCheckin = data.response.venues[0].stats.checkinsCount;
		if(infoCheckin === undefined){
			infoCheckin ="Check In Unavailable";
		}
	
	mapView.makeInfoWindow(infoName,infoPhone,infoURL,infoBuilding,infoHereNow,infoAddress,infoTwitter,infoCheckin,index);
	})
		.fail(function() {
		alert("Couldn't retrieve data."); 
		});
	},
	/*Gathers all the information entered into it from foursquare and then modifies links depending on their search results*/
	makeInfoWindow: function(name,phone,url,buildingtype,herenow,address,twitter,checkin,insertIndex){
	var infoWindowBase ="<!--"+insertIndex+"--><span class='bTitle'>"+name+"</span><br><span>"+buildingtype+"</span>"+" - "+"<span>"+herenow+"</span><br><span>"+address+"</span><br><span>"+phone+"</span><br><span>Website: </span>";
	
	if (url === "URL unavailable"){
		infoWindowBase = infoWindowBase.concat("<span>"+name+"</span>"); 
	}
	else {
		infoWindowBase = infoWindowBase.concat("<a href='" +url+"'>"+name+"</a>"); 
	}
	
	if (twitter === "Twitter Unavailable"){
		infoWindowBase = infoWindowBase.concat(" "+",	"+"<span>Twitter: </span><span>"+twitter+"</span><br>");
	}
	else {
		infoWindowBase = infoWindowBase.concat(" "+",	"+"<span>Twitter: </span><a href='http://twitter.com/"+twitter+"'>"+twitter+"</a><br>");
	}
	
	infoWindowSTRArray.splice(insertIndex, 0, infoWindowBase); 
	},
	/*Places a map marker. Creates a map marker, adds it to MapMarkerArray and fakeMapMarkerArray, and then creates the click event. Click event searches for matching data, opens the infoWindow at the correct index(which changes based on search values), bounces that marker, and then resizes the window*/
	placeMapMarkers: function(lat, lng, mName){
		var myLatlng = new google.maps.LatLng(lat, lng);
		var newMarker = new google.maps.Marker({
			position: myLatlng, 
			map: Bigmap, 
			animation: google.maps.Animation.DROP,
			title: mName,
		});
		MapMarkerArray.push(newMarker);
		locationView.fakeMapMarkerArray.push(newMarker);
		var newIndex = MapMarkerArray().indexOf(newMarker);
		newMarker.addListener('click', function(){ 
			var listIndex = MapMarkerArray().indexOf(newMarker); 
			for(i = 0; i < locationView.fakeMapMarkerArray().length; i++){ 
				var goodIndex = (locationView.fakeMapMarkerArray()[i].title);
				var newIndex = MapMarkerArray().indexOf(locationView.fakeMapMarkerArray()[i]);
				var rightMarker = MapMarkerArray()[newIndex];
				if(locationView.fakeMapMarkerArray()[listIndex] === MapMarkerArray()[newIndex] ){ 
					infoWindowStr = infoWindowSTRArray()[newIndex];
					globalInfoWindow.setContent(infoWindowStr);
					var correctMarker = locationView.fakeMapMarkerArray()[listIndex];
					globalInfoWindow.open(Bigmap, correctMarker); 
					ViewModel.markerBounceAll(correctMarker); 
					mapView.resizeMap();
				}
			}
		});
		mapView.buildInfoWindow(newMarker); 
	},
	/*Opens the infoWindow @ the given index*/
	openMarkerInfoWindow: function(myIndex){
		var currentMarker = MapMarkerArray()[myIndex];
		globalInfoWindow.open(Bigmap,currentMarker); 
	},
	
	resizeMap: function(){
		var bounds = new google.maps.LatLngBounds();
		for(var i=0; i < MapMarkerArray().length; i++) { 
			bounds.extend(MapMarkerArray()[i].getPosition());
		}
		Bigmap.fitBounds(bounds);
	},
	
	googleMapsAPIError: function(){ 
		alert("Google Maps could not be loaded");
	},
	
	hideAllMarkers: function(){
		for (var i=0; i <MapMarkerArray().length; i++){
			MapMarkerArray()[i].setVisible(false);
		}
	},
	
	showMarker: function(markerToShow){
		markerToShow.setVisible(true);
	}
	
};

 ViewModel= {
	
	/*The Initial building of the precoded Map Markers */
	initBuildMarkers: function(){
		for (i = 0; i < BarkerArray().length; i++) {
			var locallat= BarkerArray()[i].lat;
			var locallng=BarkerArray()[i].lng;
			var localName = BarkerArray()[i].markerName;
			mapView.placeMapMarkers(locallat, locallng, localName); 
		}
	},
	/*A function that triggers the click event of the passed in Marker */
	Focus: function(focusedMarker) {
		var fakeIndex=locationView.fakeMapMarkerArray().indexOf(focusedMarker);
		var realMarker=MapMarkerArray()[fakeIndex];
		google.maps.event.trigger(realMarker, 'click');
	},
	/*Loops through the MarkerArray and turns off all the bounce before turning on the passMarker's bounce animation */
	markerBounceAll: function(passMarker){
		for (i = 0; i < MapMarkerArray().length; i++) {
			MapMarkerArray()[i].setAnimation(null);
		}
	window.setTimeout(ViewModel.markerBounce(passMarker),2100);
	},
	/*This function just turns one Marker's animation on without toggling th rest off*/
	markerBounce: function(passMarker){
		passMarker.setAnimation(google.maps.Animation.BOUNCE);
	},
	/*Removes a marker from the Map Marker Array. This is called by the X button created for each location. Removes from the MapMarkerArray, InfoWindowArray, turns off the map, and removes from the fakeMapMarkerArray */
	removeMarker: function(markerToRemove){
		var removedIndex = MapMarkerArray.indexOf(markerToRemove); 
		MapMarkerArray.remove(markerToRemove);
		markerToRemove.setMap(null); 
		infoWindowSTRArray.splice(removedIndex, 1, markerToRemove);
		mapView.resizeMap();
		var fakeRemoved = locationView.fakeMapMarkerArray()[removedIndex];
		locationView.fakeMapMarkerArray.remove(fakeRemoved);
	},
};
/*This subscribe makes sure that the query value in the search always returns the value of what is in the search box*/
locationView.query.subscribe(locationView.search);
ko.applyBindings(locationView);


