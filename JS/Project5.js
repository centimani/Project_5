//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ

var Bigmap= undefined; //used to save the Map reference
var startLat = 38.883881; //used for init of Map
var startLng = -94.667829; //used for init of Map
var searchBox = document.getElementById("filter"); //searchBox Value
var infoWindowsMade = 0; //used to make new infowindows pop up

var BarkerArray = ko.observableArray([ //Holds the HardCoded Data I picked
	   		{lat: "38.895180" , lng:"-94.669989", markerName:"HR HAVEN" },
	   		{lat: "38.853392" , lng:"-94.682561", markerName:"Target" },
	   		{lat: "38.885448" , lng:"-94.663601", markerName:"Mr Goodcents" },
	   		{lat: "38.885366" , lng:"-94.688313", markerName:"Hy-Vee" },
	   		{lat: "38.885676" , lng:"-94.699230", markerName:"Kindercare Switzer Commons"},
	    ]);
// all the functions are all modified at the same time, these will all share the same index in their respective Arrays, use this for searching
var MapMarkerArray = ko.observableArray([]); //populated by their creation. This holds Markers
var infoWindowArray = ko.observableArray([]); //populated by their creation. This holds infoWindows

var Model = { //Model will handle all of the calculations of the data
};

locationView = {

  activateSearchBox: function(){
    var SearchValue=searchBox.value; //gets the value of the Search Box
    
    if(SearchValue.length !== 0){ //if the search box is empty or full
      locationView.searchLocations(SearchValue); //search for stuff if the box has a value in it
    }
    else{ //else reset all markers
     ViewModel.showAllMarkers(); //shows all Markers
     mapView.closeAllInfoWindows();// closes all InfoWindows
     ViewModel.markerUnBounceAll(); //unbounces all Markers
    }
  },
  
  searchLocations: function(searchValue){
    for (var i = 0; i < MapMarkerArray().length; i++){ //for every marker in the marker array
      var markerTitle = MapMarkerArray()[i].title; //this is the value we're searching against
      var searchValueLength = searchValue.length;
    //we're going to slice the title based on the length of the searchValue
      locationView.wordSearch(markerTitle,searchValue,searchValueLength, MapMarkerArray()[i]); //this does a comparison between two values@index and inclues marker.
    }
  },
  
  wordSearch: function(MarkerTitle,SearchedWord,letterIndex,marker){
    var mTitleLC = MarkerTitle.toLowerCase();//moves the Marker Title to LowerCase
    var sWordLC = SearchedWord.toLowerCase();//moves the Searched Word to LowerCase
    var slicedTitle = mTitleLC.slice(0,letterIndex); //cuts up the Marker end for comparision
    var slicedSearch = sWordLC.slice(0,letterIndex); //custs up the search for comparasion
    
    if(slicedTitle == slicedSearch){
      ViewModel.markerBounce(marker); //make this marker bounce
      var markerIndex = MapMarkerArray().indexOf(marker); //get the index value of our marker
      mapView.openOneMarkerInfoWindow(markerIndex); //open that InfoWindow
    }
    else if(slicedTitle != slicedSearch){
      ViewModel.unBounce(marker); //Unbounce marker
      ViewModel.hideMarker(marker); //hide marker
    }
  },
};

mapView = {
  
	init: function (){ //initializes the map
		 var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: startLat, lng: startLng},
			scrollwheel: true,
			zoom: 13
		});
		Bigmap=map; //set this new map we made to be used as a global variable
	  mapView.initSearchBox();//inits the search box
	},
	
	initSearchBox: function(){
    var input = document.getElementById('pac-input'); //saves the search box to a variable
    var searchBox = new google.maps.places.SearchBox(input); // initilizes searchbox as a google search box
    Bigmap.controls[google.maps.ControlPosition.TOP_CENTER].push(input); //moves the search box into the Map Window
    // Bias the SearchBox results towards current map's viewport.
    Bigmap.addListener('bounds_changed', function() {
      searchBox.setBounds(Bigmap.getBounds());
    });

  searchBox.addListener('places_changed', function() { //listener to retrieve details of searched place
    var places = searchBox.getPlaces();

    if (places.length ===  0) {
      return;
    }
    //get the selected search option and places it on the map
    var selectedLat =(places[0].geometry.location.lat()); //get lat
    var selectedLng = (places[0].geometry.location.lng()); //get lng
    var selectedName = (places[0].name); //get name
    mapView.placeMapMarkers(selectedLat,selectedLng,selectedName);//places marker
    mapView.resizeMap(); //resize map
    var NewFocus=MapMarkerArray().length - 1; //get the last index
    var newMarker=MapMarkerArray()[NewFocus]; //get recently added marker
    ViewModel.markerBounceAll(newMarker); //make it bouuunce
    });
	},

  resizeMap: function(){
    var bounds = new google.maps.LatLngBounds();
    for(var i=0; i < MapMarkerArray().length; i++) { //adds each marker to a greater bounding function
      bounds.extend(MapMarkerArray()[i].getPosition());
    }
  Bigmap.fitBounds(bounds); //resizes map
  },
	
	placeMapMarkers: function(lat, lng, mName){
		var myLatlng = new google.maps.LatLng(lat, lng); //way to save in LatLng values so google likes it
    var newMarker = new google.maps.Marker({
			position: myLatlng, //use our newly created latlng
			map: Bigmap, //sets it to our map
			animation: google.maps.Animation.DROP,//sets drop animation when it builds
			title: mName,
		  });
		  
		  MapMarkerArray.push(newMarker);//passes this data into the MarkerArray
		  var newIndex = MapMarkerArray().indexOf(newMarker);

      newMarker.addListener('click', function(){ //Adds ClickEvent to Button
        var myInfoWindow= infoWindowArray()[newIndex];
	      myInfoWindow.open(Bigmap, newMarker);
	      ViewModel.markerBounceAll(newMarker); //should bounce when its clicked too
	      var newMarkerIndex = MapMarkerArray().indexOf(newMarker);
	      mapView.openMarkerInfoWindow(newMarkerIndex); //Highlights infoWindow. I think this is where we're erring
	    });
	    
	    mapView.buildInfoWindow(newMarker); //builds info window using our current marker information
	    return newMarker; //returns the new marker. dont' remember if I'm still using this
    },
  
  buildInfoWindow: function(passedMarker){
      var myLat = passedMarker.position.lat(); //set lat
      var myLng = passedMarker.position.lng(); //set lng
      var myName = passedMarker.title; //set title
      var markerIndex = MapMarkerArray().indexOf(passedMarker); //get index of passed marker
      mapView.retrieveData(myLat,myLng,myName, markerIndex); //use all this to to make the AJAX call
  },

  retrieveData: function(lat,lng, name, index){
  var myClientID = "3MCVEAWYXO4UL1RPEYO1XBIXQPNGEYXITVOD2X3EF5E0LT3W";
  var mySecretID = "FZFTDA0MHSVNUCDYYZXUCELLQNKLO2NIDGIXIZPNASPRNU0M";
  var ajaxURL = "https://api.foursquare.com/v2/venues/search?client_id="+myClientID+"&client_secret="+mySecretID+"&v=20130815&ll="+lat+","+lng+"&query="+name;
   
  $.get(ajaxURL ,function(data,status){
      //might do a confirmation that verified==true;
      var infoName = data.response.venues[0].name; //returns company name
      var infoPhone = data.response.venues[0].contact.formattedPhone; //returns a phone number
      var infoURL = data.response.venues[0].url; //returns the URL
      var infoBuilding = data.response.venues[0].categories[0].name; //returns the type of building
      var infoHereNow = data.response.venues[0].hereNow.summary; //returns if they're open
      var infoAddress = data.response.venues[0].location.address; //returns physical address
      var infoTwitter = data.response.venues[0].contact.twitter; //returns twitter acct name
      var infoCheckin = data.response.venues[0].stats.checkinsCount;//returns the checkins count
      mapView.makeInfoWindow(infoName,infoPhone,infoURL,infoBuilding,infoHereNow,infoAddress,infoTwitter,infoCheckin,index);
    })
      .fail(function() {
        alert("Couldn't retrieve data."); //lolfail
      });
  },
  
  makeInfoWindow: function(name,phone,url,buildingtype,herenow,address,twitter,checkin,insertIndex){
    var infoWindowBase="<span class='bTitle'>"+name+"</span><br><span>"+buildingtype+"</span>"+" - "+"<span>"+herenow+"</span><br><span>"+address+"</span><br><span>"+phone+"</span><br><span>Website: </span><a href='" +url+"'>"+name+"</a>"+",  "+"<span>Twitter: </span><a href='http://twitter.com/"+twitter+"'>"+twitter+"</a><br>"; //base for what the infoWindows will contain
    var newInfoWin = new google.maps.InfoWindow({
			content: infoWindowBase, //uses the base to make this new infowindow
		  });
    infoWindowArray.splice(insertIndex,0,newInfoWin); //adds the new info window to the array to match it's marker since they don't all process at the same time
    var newIndex= infoWindowArray().indexOf(newInfoWin);//index of the new info window
    infoWindowsMade++; //add one to keep the Barker Array markers from opening initially, but each added one would after
  
    if(infoWindowsMade > 5){//if this new infoWindow was not made from the barker array
    mapView.openMarkerInfoWindow(newIndex); //opens the new infoWindow after the initial infoWindows are made
    }
  },
  
  openMarkerInfoWindow: function(myIndex){
    var currentMarker = MapMarkerArray()[myIndex]; //gets the Map Marker at the index
    var myInfoWindow= infoWindowArray()[myIndex]; //gets the Info Window at the index
    for (i = 0; i < infoWindowArray().length; i++){ //closes ALL the infoWindows
      infoWindowArray()[i].close();
    }
    myInfoWindow.open(Bigmap,currentMarker); //opens the infoWindow
  },
  
  openOneMarkerInfoWindow: function(myIndex){ //this is for multiple infoWindows
     var currentInfoWindow = infoWindowArray()[myIndex]; //gets the infoWindow at the Index
     var currentMarker = MapMarkerArray()[myIndex]; //gets the Map Marker at the index
     currentInfoWindow.open(Bigmap,currentMarker); //opens the infoWindow
  },

	closeAllInfoWindows: function(){
	 for (i = 0; i < infoWindowArray().length; i++){ //closes ALL the infoWindows
      infoWindowArray()[i].close();
	 }
	},
};

 ViewModel= {
  
  initBuildMarkers: function(){ //builds initial Markers
    for (i = 0; i < BarkerArray().length; i++) {
     	var locallat= BarkerArray()[i].lat;
     	var locallng=BarkerArray()[i].lng;
     	var localName = BarkerArray()[i].markerName;
     	mapView.placeMapMarkers(locallat, locallng, localName); //places Map Marker
    }
  },
  
  Focus: function(focusedMarker){ //Bounces selected Marker and opens infoWindow focusedMarker
    var focusedIndex = MapMarkerArray.indexOf(focusedMarker);
		mapView.openMarkerInfoWindow(focusedIndex); //open map Marker info window
		var myMarker=MapMarkerArray()[focusedIndex]; //gets the marker at the focused Index
		ViewModel.markerBounceAll(myMarker); //makes this marker bounce
		mapView.resizeMap(); //resize map
  },
  
  markerBounceAll: function(passMarker){
    for (i = 0; i < MapMarkerArray().length; i++) {
      MapMarkerArray()[i].setAnimation(null); //Turns off the Bounce in the entire Marker Array
    }
    passMarker.setAnimation(google.maps.Animation.BOUNCE); //Turns Bounce on one we want to bounce.
  },
  
  markerUnBounceAll: function(){
    for (i = 0; i < MapMarkerArray().length; i++) {
      MapMarkerArray()[i].setAnimation(null); //Turns off the Bounce in the entire Marker Array
    }
  },
  
  markerBounce: function(passMarker){
    passMarker.setAnimation(google.maps.Animation.BOUNCE); //make a specific marker bounce
  },
  
  unBounce: function(passMarker){
    passMarker.setAnimation(null); //turns off a specific map marker
  },
  
  init: function(){ //initializes all the Map Markers
    ViewModel.initBuildMarkers();
  },
  
  removeMarker: function(markerToRemove){
    var removedIndex = MapMarkerArray.indexOf(markerToRemove); ///get the index of the marker to be removed
    MapMarkerArray.remove(markerToRemove); //removes this marker from the array
    markerToRemove.setMap(null); //removes them from the map
    infoWindowArray.splice(removedIndex, 1);
    mapView.resizeMap();
  },
  
  hideMarker: function(markerToHide){
    markerToHide.setMap(null); //hides the marker w/o removing from the array
  },
  
  showMarker: function(markerToShow){
    markerToShow.setMap(Bigmap); //shows the marker that was hidden
  },
  
  showAllMarkers: function(){
    for (var i = 0; i < MapMarkerArray().length; i++){
      MapMarkerArray()[i].setMap(Bigmap); //turns ALL markers on
    }
  },
 };

 ko.applyBindings();

