//My Google Maps API Key:  AIzaSyACeu3Nlk0hCOlOHFX0bKVc5m2gFrcNTiQ

//make sure the filter is working proper, fix w/ 1 infoWindow
//remove infoWindow info when a marker is removed

var Bigmap= undefined; //used to save the Map reference
var startLat = 38.883881; //used for init of Map
var startLng = -94.667829; //used for init of Map
var searchBoxValue =ko.observable('');
var globalInfoWindow=undefined;
var infoWindowStr= ""; //this might be a KO binding
var BarkerArray = ko.observableArray([ //Holds the HardCoded Data I picked
        {lat: "38.895180" , lng:"-94.669989", markerName:"HR HAVEN" },
        {lat: "38.853392" , lng:"-94.682561", markerName:"Target" },
        {lat: "38.885448" , lng:"-94.663601", markerName:"Mr Goodcents" },
        {lat: "38.885366" , lng:"-94.688313", markerName:"Hy-Vee" },
        {lat: "38.885676" , lng:"-94.699230", markerName:"Kindercare Switzer Commons"},
      ]);
// all the functions are all modified at the same time, these will all share the same index in their respective Arrays, use this for searching
var MapMarkerArray = ko.observableArray([]); //populated by their creation. This holds Markers
var infoWindowSTRArray = ko.observableArray([]);//tesssssst

var Model = { //Model will handle all of the calculations of the data
};

locationView = {

  query: ko.observable(''), //binds to the search box
  
  fakeMapMarkerArray : ko.observableArray([]), //our Array that is used to display our markers on the html page
  
  search: function(value) {
      locationView.fakeMapMarkerArray.removeAll(); //empties and returns as an array

      for(var i in MapMarkerArray()) {
        if(MapMarkerArray()[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) { //comparing the mapmarker array and the query value
          var addMarker= MapMarkerArray()[i]; //retrieve the marker data from our data driven array to place into our Visual array
          locationView.fakeMapMarkerArray.push(addMarker); //adds the marker and all of his data from the data array to the visual array
        }
        else{
          //console.log("fail");
        }
      }
    }

};

mapView = {
  
	init: function (){ //initializes the map
		 var map = new google.maps.Map(document.getElementById('domMap'),{
			center: {lat: startLat, lng: startLng},
			scrollwheel: false, //maybe change this for depending on screen width? not super important
			disableDefaultUI: true, //cleans up the map UI on mobile
			zoom: 13
		});
    Bigmap=map; //set this new map we made to be used as a global variable
    mapView.initSearchBox();//inits the search box
    ViewModel.initBuildMarkers();
    mapView.initInfoWindow();
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
	
	sort: function(){ //I was correct, when it does occur, the mismatch is based on how fast they finish and are added into the array.
    var infoWindow = infoWindowSTRArray()[0]; //fifth character in is our should be index
    var mapMarker = MapMarkerArray()[0];
    var tempArray = ["","","","",""]; //make more empties based on the length of the map marker array
	  
    for (i = 0; i < MapMarkerArray().length; i++){
      var correctIndex =infoWindowSTRArray()[i].slice(4,5); //this will need to be expanded in the future for multiple digits
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
    //google.maps.event.addListener(globalInfoWindow,'closeclick', mapView.getMarker());
		  //console.log("init'd InfoWindow");
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
      if( infoName === undefined){
        infoName = "Name unavailable";
      }
      var infoPhone = data.response.venues[0].contact.formattedPhone; //returns a phone number
      if( infoPhone === undefined){
        infoPhone = "Phone Number unavailable";
      }
      var infoURL = data.response.venues[0].url; //returns the URL
      if( infoURL === undefined){
        infoURL = "URL unavailable"; //also try to break the URL Link
      }
      var infoBuilding = data.response.venues[0].categories[0].name; //returns the type of building
      if( infoBuilding === undefined){
        infoBuilding = "Building Type unavailable";
      }
      var infoHereNow = data.response.venues[0].hereNow.summary; //returns if they're open
       if( infoHereNow === undefined){
        infoHereNow = "People Here Now is unavailable";
      }
      var infoAddress = data.response.venues[0].location.address; //returns physical address
       if( infoAddress === undefined){
        infoAddress = "Address unavailable";
      }
      var infoTwitter = data.response.venues[0].contact.twitter; //returns twitter acct name
      if( infoTwitter === undefined){
        infoTwitter="Twitter Unavailable";//try to break the link later
      }
      var infoCheckin = data.response.venues[0].stats.checkinsCount;//returns the checkins count
      if(infoCheckin === undefined){
        infoCheckin ="Check In Unavailable";
      }
      
      mapView.makeInfoWindow(infoName,infoPhone,infoURL,infoBuilding,infoHereNow,infoAddress,infoTwitter,infoCheckin,index);
    })
      .fail(function() {
        alert("Couldn't retrieve data."); //lolfail
      });
  },
  
  makeInfoWindow: function(name,phone,url,buildingtype,herenow,address,twitter,checkin,insertIndex){
    var infoWindowBase ="<!--"+insertIndex+"--><span class='bTitle'>"+name+"</span><br><span>"+buildingtype+"</span>"+" - "+"<span>"+herenow+"</span><br><span>"+address+"</span><br><span>"+phone+"</span><br><span>Website: </span>";
    
    //breaks website link
    if (url === "URL unavailable"){
      infoWindowBase = infoWindowBase.concat("<span>"+name+"</span>"); //if not available, a becomes a span
    }
    else {
      infoWindowBase = infoWindowBase.concat("<a href='" +url+"'>"+name+"</a>"); //its a link now
    }
    
    //breaks twitter link
    if (twitter === "Twitter Unavailable"){
      infoWindowBase = infoWindowBase.concat(" "+",  "+"<span>Twitter: </span><span>"+twitter+"</span><br>");
    }
    else {
      infoWindowBase = infoWindowBase.concat(" "+",  "+"<span>Twitter: </span><a href='http://twitter.com/"+twitter+"'>"+twitter+"</a><br>");
    }
    
    infoWindowSTRArray.splice(insertIndex, 0, infoWindowBase); //add it to the array
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
      locationView.fakeMapMarkerArray.push(newMarker);
      var newIndex = MapMarkerArray().indexOf(newMarker);
      newMarker.addListener('click', function(){ //Adds ClickEvent to Button
       var listIndex = MapMarkerArray().indexOf(newMarker); //this returns the index value of the button on the list
    
       for(i = 0; i < locationView.fakeMapMarkerArray().length; i++){ //we're going to look throught he visible array for it's matching in the data array
         var goodIndex = (locationView.fakeMapMarkerArray()[i].title);
         var newIndex = MapMarkerArray().indexOf(locationView.fakeMapMarkerArray()[i]);
         var rightMarker = MapMarkerArray()[newIndex];

          if(locationView.fakeMapMarkerArray()[listIndex] === MapMarkerArray()[newIndex] ){ //if the List button title has the same value as the Map Marker then
            infoWindowStr = infoWindowSTRArray()[newIndex]; //sets the value
            globalInfoWindow.setContent(infoWindowStr);
            //this next part is not opening at the right spot
            var correctMarker = locationView.fakeMapMarkerArray()[listIndex];
            globalInfoWindow.open(Bigmap, correctMarker); //open the infowindow
            ViewModel.markerBounceAll(correctMarker); //should bounce when its clicked too
            mapView.resizeMap();
          }
         }
      });
      mapView.buildInfoWindow(newMarker); //builds info window using our current marker information
    },
  
  openMarkerInfoWindow: function(myIndex){
    var currentMarker = MapMarkerArray()[myIndex]; //gets the Map Marker at the index
    globalInfoWindow.open(Bigmap,currentMarker); //opens the infoWindow
  },
  
  resizeMap: function(){
    var bounds = new google.maps.LatLngBounds();
    for(var i=0; i < MapMarkerArray().length; i++) { //adds each marker to a greater bounding function
      bounds.extend(MapMarkerArray()[i].getPosition());
    }
  Bigmap.fitBounds(bounds); //resizes map
  },
  
	googleMapsAPIError: function(){ //error message
    alert("Google Maps could not be loaded");
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
  
  Focus: function(focusedMarker) {
    var fakeIndex=locationView.fakeMapMarkerArray().indexOf(focusedMarker);
    var realMarker=MapMarkerArray()[fakeIndex];
    google.maps.event.trigger(realMarker, 'click');
    },
  
  markerBounceAll: function(passMarker){
    for (i = 0; i < MapMarkerArray().length; i++) {
      MapMarkerArray()[i].setAnimation(null); //Turns off the Bounce in the entire Marker Array
    }
    window.setTimeout(ViewModel.markerBounce(passMarker),2100);
      //passMarker.setAnimation(google.maps.Animation.BOUNCE); //Turns Bounce on one we want to bounce. Put a setTimeout on this bitch
  },

  markerBounce: function(passMarker){
    passMarker.setAnimation(google.maps.Animation.BOUNCE); //make a specific marker bounce
  },
  
  removeMarker: function(markerToRemove){
    var removedIndex = MapMarkerArray.indexOf(markerToRemove); ///get the index of the marker to be removed
    MapMarkerArray.remove(markerToRemove); //removes this marker from the array
    markerToRemove.setMap(null); //removes them from the map
    infoWindowSTRArray.splice(removedIndex, 1, markerToRemove); //removes the infoWindow
    mapView.resizeMap();
    var fakeRemoved = locationView.fakeMapMarkerArray()[removedIndex];
    locationView.fakeMapMarkerArray.remove(fakeRemoved);
  },
 };

 

locationView.query.subscribe(locationView.search);
ko.applyBindings(locationView);
 

