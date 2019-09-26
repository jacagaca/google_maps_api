//rsl from radius check box zmiana rsl i radius na check boxach

var heatmap; 

var elevationMiddleAndMarker = [], distanceBetweenMiddleAndMarker = [],heatmapEmpty = [], 
	dataLocationPath = [], dataElevation = [], tangensMaxArray = [];
var map = null, lastClickTime, clckTimeOut, circles = [],
    active_circle = null,
    loaded = !1;
var MarkersTitle = [], getColor = [], ActiveCircleTitle = [], draggedAndPlacedCircles = [],
    mapMarkers = [ ], insideCircles = [];
var allLatLng = [];  var markersEle = []; circles = [];
var CircleColor = "black", radiusD, RSL, EIRP, GR, radiusInsideCircles, radiusInsideCirclesZero, RSL3;

google.load('visualization', '1', {packages: ['columnchart']});

	
var mIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillOpacity: 1,
    fillColor: '#fff',
    strokeOpacity: 1,
    strokeWeight: 1,
    strokeColor: '#333',
    scale: 12
};
  
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function init() {
	
    var a = document.getElementById("map_canvas");
    map = new google.maps.Map(a, {
        center: new google.maps.LatLng(50.672434,  17.949983),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    google.maps.event.addListener(map, "click", function(a) {
        mapClick(a.latLng)
    });
    google.maps.event.addListener(map, "dblclick", function(a) {
        mapClick(a.latLng)
    });
    input_circles && createInitialCircles(map, input_circles);
    loaded = !0;
    saveLink()
	
	
	var elevator = new google.maps.ElevationService;


		map.addListener('click', function(event) {
	  displayLocationElevation(event.latLng, elevator);
	});


   function displayLocationElevation(location, elevator) {
	elevator.getElevationForLocations({
	  'locations': [location]
	}, function(results, status) {


		if (results[0]) {
		  markersEle.push(results[0]);
		} 
	  
	});
  }

	
}

function mapClick(a) {
    var b = (new Date).getTime();
    if (10 > b - lastClickTime) return 0;
    lastClickTime = b;
    clckTimeOut ? (window.clearTimeout(clckTimeOut), clckTimeOut = null) : clckTimeOut = window.setTimeout(function() {
        singleClick(a)
    }, 500)
}

function singleClick(a) {
    window.clearTimeout(clckTimeOut);
    clckTimeOut = null;
	towerNumber  = circles.length + 1;
    createCircleTool(map, a, "Tower #" + towerNumber)
}

function showAddress() {
    var addressInput = $("input#addressInput").val().split(",");
	var lt = new google.maps.LatLng(addressInput[0], addressInput[1]);
	
	if(addressInput.length >=2){
		createCircleTool(map, lt, "Tower #" + circles.length);
	}else{
		alert(addressInput + " not found");
	}
	
}

function createCircleWithOptions(map, ltLng, title, radius){
	createCircleTool(map, ltLng, title , radius);
}

function createCircleTool(a, b, f, c, ActiveCircleTitle) {
    var e = new DistanceWidget(a, b, f, c);
    google.maps.event.addListener(e, "distance_changed", function() {
        displayInfo(e);
    });
    google.maps.event.addListener(e, "position_changed", function() {
        displayInfo(e);
    });

    circles.push(e);
    active_circle && active_circle.set("active", !1);
    active_circle = e;
    saveLink();
    loaded && 1 == circles.length && zoomToAllCircles();

	//saves distance between radius widget and marker, lat and lng, circlcolor, stroke color on creating marker
	 saveTodraggedAndPlacedCircles();
}

function createInitialCircles(a, b) {
    len = b.length;
    for (i = 0; i < len; i++) circle = b[i], point = new google.maps.LatLng(circle[1], circle[2]), createCircleTool(a, point, "", circle[0]), modifyActiveCircle(circle[0], circle[3], circle[4], circle[5]);
	loaded = !0;
    zoomToAllCircles();
}
	  
	  
function DistanceWidget(marker = [], b, f, c) {
    this.set("map", marker);
    this.set("position", b);
    this.set("active", !0);
    this.set("name", f);
	
	var myOptions = {
        content: f,
        boxStyle: {
            background: '#FFFFFF',
            border: "1px solid black",
            textAlign: "center",
            fontSize: "7pt",
            width: "5%",
        },
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(-37, 0),
        position: b,
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true
    };
	
	var label = new InfoBox(myOptions);
	label.bindTo("map", this);
	
	
    marker = new google.maps.Marker({
        draggable: !0,
        title: f,
        map: map,
		animation: google.maps.Animation.DROP
    });
	document.getElementById("myCheck").disabled = true;
	document.getElementById("EIRP").disabled = true;
	document.getElementById("GR").disabled = true;
	document.getElementById("radius").disabled = true;
	document.getElementById("radius_unit").disabled = true;
	
	mapMarkers[i] = marker;
    marker.bindTo("map", this);
    marker.bindTo("position", this);
    radius = c ? c : getInputRadius();
    c = new RadiusWidget(radius);
    this.set("radiusWidget", c);
    c.bindTo("map", this);
    c.bindTo("active", this);
    c.bindTo("center", this, "position");
    this.bindTo("distance", c);
    this.bindTo("bounds", c);
	MarkersTitle.push(f);
    var e = this;
	displayInfo(e);
		google.maps.event.addListener(marker, "click", function() {
			if (active_circle != null) {
				active_circle.set("active", !1);
				displayInfo(e);
			}
			else {
				active_circle = null;
				active_circle && active_circle.set("active", !1);
			}
			
			e.set("active", !0);
			active_circle = e;
			label.setPosition(e.position);
			ActiveCircleTitle.push(f);
		});

		saveTodraggedAndPlacedCircles();
		

		google.maps.event.addListener(marker, "dragend", function() {
		if (active_circle != null) {
			active_circle.set("active", !1);
		}
		else {
			active_circle = null;
			active_circle && active_circle.set("active", !1);
		}
			
        e.set("active", !0);
        active_circle = e;
		label.setPosition(e.position);
		ActiveCircleTitle.push(f);
		removeAllInsideCircles();
		//document.getElementById("calculateCoverage").style.display='inline-block';
        saveTodraggedAndPlacedCircles();
		
    });
}
DistanceWidget.prototype = new google.maps.MVCObject;

function enableButtonCalcCoverage() {
	document.getElementById("calculateCoverage").disabled = false;
}
		
		
function removeAllInsideCircles() {
  for(var i in insideCircles) {
	insideCircles[i].setMap(null);
  }
  insideCircles = []; 
}

function ResetAll() {
  for(var i in mapMarkers) {
	mapMarkers[i].setMap(null)
}
if (heatmap != null){
heatmap.setMap(null);
}
var spanContent = document.getElementById("errorTowers");
spanContent.innerHTML = "Errors: none";

 	document.getElementById("myCheck").disabled = false;
    document.getElementById("EIRP").disabled = false;
	document.getElementById("GR").disabled = false;
	document.getElementById("radius").disabled = false;
	document.getElementById("radius_unit").disabled = false;
	
	elevations = [];
	removeAllInsideCircles();
	CircleColor = "black";
	latOfAllMarkers = [];
	lngOfAllMarkers = [];
	draggedAndPlacedCircles = [];
	
elevationMiddleAndMarker = [], distanceBetweenMiddleAndMarker = [],heatmapEmpty = [];
MarkersTitle = [], getColor = [], ActiveCircleTitle = [], draggedAndPlacedCircles = [], mapMarkers = [ ], insideCircles = [];
allLatLng = [], markersEle = [], circles = [], dataLocationPath = [], dataElevation = [], tangensMaxArray = [];
	
	heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapEmpty,
    radius: 50
});
	

}
		
var saveTodraggedAndPlacedCircles = function() {
	len = circles.length;
			for (i = 0; i < len; i++) {
				var b = circles[i];
				draggedAndPlacedCircles[i] = [];
				draggedAndPlacedCircles[i].push(parseFloat(b.get("radiusWidget").get("distance").toFixed(2)));
				draggedAndPlacedCircles[i].push(parseFloat(b.get("position").lat().toFixed(5)));
				draggedAndPlacedCircles[i].push(parseFloat(b.get("position").lng().toFixed(5)));
				draggedAndPlacedCircles[i].push(b.get("radiusWidget").get("circle").get("fillColor"));
				draggedAndPlacedCircles[i].push(b.get("radiusWidget").get("circle").get("strokeColor"))
			}
			circle_define_string = encodeURIComponent(JSON.stringify(draggedAndPlacedCircles));
			url = "" + circle_define_string;
			
			for (k = 0; k < 10; k++)
			console.log((k+1) + ": " + draggedAndPlacedCircles[k]);
}


latOfAllMarkers = [];

var getDistance = function() {


	heatmap = new google.maps.visualization.HeatmapLayer({
	  data: dataLocationPath,
	  map: map
	});

			// Get lat of all markers on the map from "draggedAndPlacedCircles"
			len = draggedAndPlacedCircles.length;

			 for (i = 0; i < len; i++) {
					a = circles[i];
					latOfAllMarkers[i] = [];
					latOfAllMarkers[i].push(parseFloat(a.get("position").lat().toFixed(7)));
			}
			circle_define_string = encodeURIComponent(JSON.stringify(latOfAllMarkers));
			url = "" + circle_define_string;

			// Get lng of all markers on the map "draggedAndPlacedCircles"
			lngOfAllMarkers = [];
			 for (j = 0; j < len; j++) {
					a = circles[j];
					lngOfAllMarkers[j] = [];
					lngOfAllMarkers[j].push(parseFloat(a.get("position").lng().toFixed(7)));
			}
			circle_define_string = encodeURIComponent(JSON.stringify(lngOfAllMarkers));
			url = "" + circle_define_string;

			// Get lng and lat of all markers on the map		
			var allLatLng = []; 
			for (x = 0; x < len; x ++) {			
			al = new google.maps.LatLng(latOfAllMarkers[x],lngOfAllMarkers[x]);
			allLatLng.push(al);
			}


			// Get color of all markers on the map
			for (l = 0; l < len; l++) {
					a = circles[l];
					getColor[l] = [];
					getColor[l].push(a.get("radiusWidget").get("circle").get("fillColor"));	
			}

		
		/*
			var getDistance = [];	
			for (l = 0; l < len; l++) {
					b = circles[l];
					getDistance[l] = [];
					getDistance[l].push(parseFloat(b.get("radiusWidget").get("distance").toFixed(2)));
			}
		*/


			
						
			var distance;


			var errorFields = false;
			var errorTowers = [];




	//Calculate d distance between towers of the same color
			for ( i = 0; i < allLatLng.length; ++i) {
						a = circles[i];
						getColor[i] = [];
						getColor[i].push(a.get("radiusWidget").get("circle").get("fillColor"));	
						
						//b = circles[i];
						//getDistance[i] = [];
						//getDistance[i].push(parseFloat(b.get("radiusWidget").get("distance").toFixed(2)));

						
				for(let k = i + 1; k < allLatLng.length; ++k) {
					var getDistanceB = function() {
						if(getColor[i] == "red" && getColor[k] == "red"){
						distance = google.maps.geometry.spherical.computeDistanceBetween(allLatLng[k], allLatLng[i]);
							if(distance < radiusD){
								errorFields=true;
								firstTowerNumber = i  + 1;
								secondTowerNumber = k  + 1;								
								errorTowers += "Error! Change position of red towers " + firstTowerNumber + " and " + secondTowerNumber + "\n";
							}						
						}
						if(getColor[i] == "blue" && getColor[k] == "blue"){
						distance = google.maps.geometry.spherical.computeDistanceBetween(allLatLng[k], allLatLng[i]);
							if(distance < radiusD){	
								errorFields=true;
								firstTowerNumber = i  + 1;
								secondTowerNumber = k  + 1;								
								errorTowers += "Error! Change position of blue towers " + firstTowerNumber + " and " + secondTowerNumber + "\n";
							}						
						}
						if(getColor[i] == "green" && getColor[k] == "green"){
						distance = google.maps.geometry.spherical.computeDistanceBetween(allLatLng[k], allLatLng[i]);
							if(distance < radiusD){
								errorFields=true;
								firstTowerNumber = i  + 1;
								secondTowerNumber = k  + 1;
								errorTowers += "Error! Change position of green towers " + firstTowerNumber + " and " + secondTowerNumber + "\n";			
							}						
						}
						if(getColor[i] == "black" && getColor[k] == "black"){
						distance = google.maps.geometry.spherical.computeDistanceBetween(allLatLng[k], allLatLng[i]);	   
							if(distance < radiusD){
								errorFields=true;
								firstTowerNumber = i  + 1;
								secondTowerNumber = k  + 1;
								errorTowers += "Error! Change position of black towers " + firstTowerNumber + " and " + secondTowerNumber + "\n";										
							}
						}	
					}	
					getDistanceB();	
				}	
	
			}	
			
			document.getElementById("errorTowers").innerHTML = errorTowers;
	

			
	if(radius_unit != 99){
	getInputRadius();		
	RSLCircles();
	}
	else{
	getInputRadius();	
	strefyPoly();
	}

}

  // Load the Visualization API and the columnchart package.
      google.load('visualization', '1', {packages: ['columnchart']});


	
var RSLCircles = function() {
	var select = document.getElementById('radius_unit');	
	var RSLtext = select.value;
	RSLtext = -RSLtext;
	
		if(radius_unit != 0){
		var select = document.getElementById('radius_unit');
		var value = select.value;
		RSL2 = -value;
	
		for( j = 0; j < 4; j++ ){


			radiusInsideCircles = (RSL2 + EIRP + GR - 106 ) / 20 ;
			radiusInsideCircles = Math.pow(10, radiusInsideCircles);
			radiusInsideCircles = radiusInsideCircles * 1000;
			var RSLNum = '-' + RSL2;
			
			for( i = 0; i < latOfAllMarkers.length; i++ ) {
				var circlePosition = new google.maps.LatLng(latOfAllMarkers[i], lngOfAllMarkers[i]);
				var insideCircle = new google.maps.Circle({
				   map : map,
				   center: circlePosition,
				   radius: radiusInsideCircles,    
				   strokeWeight: 0.5,
				   fillOpacity : 0,
					click: (function (e) {
						return function () {
							$('#'+modalType).modal({
								remote: modalURL+e
							});
						};
					})
				});
				var bearing = 30;
				var newPoint = google.maps.geometry.spherical.computeOffset(circlePosition,insideCircle.getRadius(), bearing);
				var marker2 = new google.maps.Marker({
					map:map, 
					position:newPoint,
					icon: mIcon,
					label: {color: '#000', fontSize: '12px', fontWeight: '600', text: RSLNum}
					});
				map.fitBounds(insideCircle.getBounds());
				insideCircles.push(insideCircle, marker2);
			}

			if (j > 0){
				RSL2 = RSL2 - 5;	
			}
		}
	}		
		
		
		

		else if(radius_unit == 0){
				for( j = 0; j < 4; j++ ){
					// create 7 inside circle, 7 points and push them in to an array



					radiusInsideCirclesZero = (RSL3  + EIRP + GR - 106 ) / 20 ;
					radiusInsideCirclesZero = Math.pow(10, radiusInsideCirclesZero);
					radiusInsideCirclesZero = radiusInsideCirclesZero * 1000;
	
					var RSLNum = '-' + RSL3;
					for( i = 0; i < latOfAllMarkers.length; i++ ) {
						var circlePosition = new google.maps.LatLng(latOfAllMarkers[i], lngOfAllMarkers[i]);
						
						var insideCircle = new google.maps.Circle({
						   map : map,
						   center: circlePosition,
							strokeWeight: 0.5,						   
						   radius: radiusInsideCirclesZero,    
						   fillOpacity : 0,
							click: (function (e) {
								return function () {
									$('#'+modalType).modal({
										remote: modalURL+e
									});
								};
							})
						});

						var bearing = 30;
						var newPoint = google.maps.geometry.spherical.computeOffset(circlePosition,insideCircle.getRadius(), bearing);
						var marker2 = new google.maps.Marker({
							map:map, 
							position:newPoint,
							icon: mIcon,
							label: {color: '#000', fontSize: '12px', fontWeight: '600', text: RSLNum}
							});
						map.fitBounds(insideCircle.getBounds());
						
						insideCircles.push(insideCircle, marker2);
					}
					RSL3 = RSL3 - 5;
				}
				}

 zoomToAllCircles()
}




var strefyPoly = function() {
 var broadHeight = document.getElementById("broadcastHeight").value;
var broadcastHeight = parseInt(broadHeight);

var receiHeight = document.getElementById("receivingHeight").value;
var receivingHeight = parseInt(receiHeight);		
			if(radius_unit == 99){
				for( j = 0; j < 3; j++ ) {
					RSL3 = RSL3 - 5;
	
					radiusInsideCirclesZero = (RSL3  + EIRP + GR - 106 ) / 20 ;
					radiusInsideCirclesZero = Math.pow(10, radiusInsideCirclesZero);
					radiusInsideCirclesZero = radiusInsideCirclesZero * 1000;
					
					var RSLNum = 'RSL -' + RSL3;
					
						for( i = 0; i < latOfAllMarkers.length; i++ ) {
							
							var bearing = 120;
		  
						
							for( k = 0; k < 3; k++ ) {		
							var circlePosition = new google.maps.LatLng(latOfAllMarkers[i], lngOfAllMarkers[i]);
							var insideCircle2 = new google.maps.Circle({
							   map : map,
							   center: circlePosition,
								strokeWeight: 0.5,						   
							   radius: radiusInsideCirclesZero,    
							   fillOpacity : 0,
								click: (function (e) {
									return function () {
										$('#'+modalType).modal({
											remote: modalURL+e
										});
									};
								})
							});
								
							var bearing2 = 30;
							var newPoint2 = google.maps.geometry.spherical.computeOffset(circlePosition,insideCircle2.getRadius(), bearing2);
							var marker3 = new google.maps.Marker({
								map:map, 
								position:newPoint2,
								icon: mIcon,
								label: {color: '#000', fontSize: '12px', fontWeight: '600', text: RSLNum}
								});
							map.fitBounds(insideCircle2.getBounds());
							
							

							var insideCircle = new google.maps.Circle({
							   map : map,
							   center: circlePosition,
								strokeWeight: 0,						   
							   radius: radius,    
							   fillOpacity : 0
							});	



							var newPoint = google.maps.geometry.spherical.computeOffset(circlePosition,insideCircle.getRadius(), bearing);
							
							var polyLinePath = [circlePosition, newPoint];
					

							var insidePolylinePath = new google.maps.Polyline({
							  path: polyLinePath,
							  geodesic: true,
			
							  strokeOpacity: 1.0,
							  strokeWeight: 2,
							  strokeColor: getColor[i]
							});
							
							insideCircles.push(insideCircle, insideCircle2, marker3, insidePolylinePath);
							
							insidePolylinePath.setMap(map);
							bearing = bearing + 120;
						}
						}
				}


			var elevator = new google.maps.ElevationService;	

			for(let i = 0; i < mapMarkers.length; i++ ) {
				
				var pathRequest = null;
				
				var circlePosition = new google.maps.LatLng(latOfAllMarkers[i], lngOfAllMarkers[i]);
				
				calculateElevationForTheCircle(elevator, 0, 0, circlePosition, insideCircle, 1);
	  
			}
		zoomToAllCircles();	
	}
}

		
function calculateElevationForTheCircle(elevator, pointOnCircleIndex, bearing, circlePosition, insideCircle, sleepIndex) {			
	
			for( pointOnCircleIndex; pointOnCircleIndex < 36; pointOnCircleIndex++ ) {
				var newPoint3 = google.maps.geometry.spherical.computeOffset(circlePosition,insideCircle.getRadius(), bearing);
			
				let path = [
					circlePosition,
					newPoint3];
					

					
						new google.maps.Polyline({
						path: path,
						strokeColor: '#0000CC',
						strokeOpacity: 0,
						map: map
						});
						
						var numberOfSamples = 50;

						let pathRequest = {
							'path': path,
							'samples': numberOfSamples
						}
						var markersOnTheMap = mapMarkers.length	;
						
						
						numberOfRequestsWhenSleepNeeded = (350 / numberOfSamples) / markersOnTheMap ;
						
						var numberOfRequestsExceed = (pointOnCircleIndex+1) > numberOfRequestsWhenSleepNeeded * sleepIndex+1;
						if (numberOfRequestsExceed) {
							
							let pointOnCircleIndexToContinue = pointOnCircleIndex;
							
							sleep(2500).then(() => {

								calculateElevationForTheCircle(elevator, pointOnCircleIndexToContinue, bearing, circlePosition, insideCircle, sleepIndex+1); 
								
							});
							return;
						}
						else{
							
							elevator.getElevationAlongPath(pathRequest, plotElevation);
						}
				bearing = bearing + 10;						
			}
			
			
		}
		

function plotElevation(elevations, status) {
	
var chartDiv = document.getElementById('elevation_chart');

//console.log("elevations: "+elevations.length);
//console.log("status "+status);

var tangensMax;

for (var i = 0; i < elevations.length; i++) {
			
	if(elevations[0].elevation >= elevations[i].elevation && elevations[i+1].elevation < elevations[i].elevation){
		
		//tangens
		var elevationMax = elevations[i].elevation;
		var locationMax = elevations[i].location;
		
		var distanceBetweenMiddleAndMarkerMax = google.maps.geometry.spherical.computeDistanceBetween(elevations[0].location, locationMax);
		//distanceBetweenMiddleAndMarker.push(distanceBetweenMiddleAndMarkerMax);
		
		var elevationMiddleAndMarkerMax = elevationMax - elevations[0].elevation;
		//elevationMiddleAndMarker.push(elevationMiddleAndMarkerMax);
	
		var tangensMax = elevationMiddleAndMarkerMax / distanceBetweenMiddleAndMarkerMax;
		
		tangensMaxArray.push(tangensMax);
		

		if(tangensMaxArray[i+1] < tangensMaxArray[i]){
			dataElevation.push(elevations[i].elevation);
			dataLocationPath.push(elevations[i].location);					
		}
		
	}
	if(elevations[0].elevation < elevations[i].elevation){
		
		//tangens
		var elevationMax = elevations[i].elevation;
		var locationMax = elevations[i].location;
		
		
		var distanceBetweenMiddleAndMarkerMax = google.maps.geometry.spherical.computeDistanceBetween(elevations[0].location, locationMax);
		//distanceBetweenMiddleAndMarker.push(distanceBetweenMiddleAndMarkerMax);
		
		var elevationMiddleAndMarkerMax = elevationMax - elevations[0].elevation;

		
		var elevationMiddleAndMarkerMax = elevationMax - elevations[0].elevation;

			dataElevation.push(elevations[i].elevation);
			dataLocationPath.push(elevations[i].location);					

	}
	
	//else if(elevations[0].elevation < elevations[i].elevation && elevations[i+1].elevation < elevations[i].elevation){
	//		break;
	//}
}
	//console.log("dataElevation length "+dataElevation.length);
	var chart = new google.visualization.ColumnChart(chartDiv);

	var data = new google.visualization.DataTable();
	data.addColumn('string', 'Sample');
	data.addColumn('number', 'Elevation');
		
	for (var i = 0; i < elevations.length; i++) {
	  data.addRow(['', elevations[i].elevation]);
	}

	chart.draw(data, {
	  height: 150,
	  legend: 'none',
	  titleY: 'Elevation (m)'
	});
}	
				
function toggleHeatmap() {
	heatmap.setMap(heatmap.getMap() ? null : map);

}
	

function calculateCoverage() {
heatmap.setMap(map);				

		toggleHeatmap();
		toggleHeatmap();
		changeRadius();
		
 }


function checkSpanButton (){

var spanContent = document.getElementById("errorTowers");
    if(spanContent.innerHTML ==  ""){
        spanContent.innerHTML = "Errors: none";
    }
    else{
       
    }
};

 function changeRadius() {
	
	  var gradient = [
	  'rgba(0, 255, 255, 0)',
	  'rgba(0, 255, 255, 1)',
	  'rgba(0, 191, 255, 1)',
	  'rgba(0, 127, 255, 1)',
	  'rgba(0, 63, 255, 1)',
	  'rgba(0, 0, 255, 1)',
	  'rgba(0, 0, 223, 1)',
	  'rgba(0, 0, 191, 1)',
	  'rgba(0, 0, 159, 1)',
	  'rgba(0, 0, 127, 1)',
	  'rgba(63, 0, 91, 1)',
	  'rgba(127, 0, 63, 1)',
	  'rgba(191, 0, 31, 1)',
	  'rgba(255, 0, 0, 1)'
	]
	heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);

	heatmap.set('radius', heatmap.get('radius') ? null : 22);
	executed = true;
}


		
function RadiusWidget(a) {
    var b = new google.maps.Circle({
        strokeWeight: 1,
        fillColor: CircleColor,
		strokeColor: getStrokeColor()
    });
    this.set("circle", b);
    this.set("distance", a);
    this.bindTo("bounds", b);
    b.bindTo("center", this);
    b.bindTo("map", this);
    b.bindTo("radius", this);
    this.addSizer_();

	setColorForNextCircle(b);
}
RadiusWidget.prototype = new google.maps.MVCObject;

RadiusWidget.prototype.distance_changed = function() {
    this.set("radius", this.get("distance"))
};

RadiusWidget.prototype.addSizer_ = function(f) {

if (radius_unit == 0) {
	RSL3 = RSL3.toFixed(2);
	var RSLstring = -RSL3;
	var RSLss = "RSL " + RSLstring.toString();
	}
	else{
	var select = document.getElementById('radius_unit');
	var value = select.value;
	var RSLstring = value;
	var RSLss = "RSL " + RSLstring.toString();
	}
	
	if (radius_unit == 99) {
	RSL3 = RSL3.toFixed(2);
	var RSLstring = -RSL3;
	var RSLss = "RSL " + RSLstring.toString();
	}
	
    var a = new google.maps.Marker({
        //map: this.get("map"),
        //draggable: !0,
		//title: 'RSL',
		//icon: mIcon,
		//label: {color: '#000', fontSize: '12px', fontWeight: '600', text: RSLss}
		visible: false
    });
    title: "Drag me!"
    this.set("sizer", a);
    a.bindTo("map", this);
    a.bindTo("position", this, "sizer_position");
    a.bindTo("active", this);
    var b = this;
	

    google.maps.event.addListener(a, "drag", function() {
		ActiveCircleTitle.push(f);
		saveLink();
        b.setDistance()
    });
    google.maps.event.addListener(a, "active_changed", function() {
        b.get("active") ? b.showSizer() : b.hideSizer()
    })
};


RadiusWidget.prototype.hideSizer = function() {
    if (sizer = this.get("sizer")) sizer.unbind("map"), sizer.setMap(null)
};
RadiusWidget.prototype.showSizer = function() {
    this.get("sizer") && (sizer = this.get("sizer"), sizer.bindTo("map", this))
};
RadiusWidget.prototype.center_changed = function() {
    var a = this.get("bounds");
    a && (a = a.getNorthEast().lng(), a = new google.maps.LatLng(this.get("center").lat(), a), this.set("sizer_position", a));
    saveLink()
};
RadiusWidget.prototype.distanceBetweenPoints_ = function(a, b) {
    return a && b ? d = google.maps.geometry.spherical.computeDistanceBetween(a, b) : 0
};
RadiusWidget.prototype.setDistance = function() {
    var a = this.get("sizer_position"),
        b = this.get("center"),
        a = this.distanceBetweenPoints_(b, a);
    this.set("distance", a);
    saveLink()
};

function displayInfo(a) {
    document.getElementById("info").innerHTML = "Position: " + a.get("position") + ", Radius: " + a.get("distance").toFixed(2) + " Meters"
}

function getInputRadius() {
    radius = parseFloat($("input#radius").val());
    if (1 > radius.length || !$.isNumeric(radius)) return alert("Enter a numeric radius"), !1;
    radius_unit = $("select#radius_unit").val();
	
	EIRP = $("select#EIRP").val();
	EIRP = parseFloat($("input#EIRP").val());
	if (1 > EIRP.length  || !$.isNumeric(EIRP)){
		return alert("Enter a numeric EIRP"), !1;
	}
	else if(EIRP > 31){
		return alert("Enter a valid EIRP"), !1;
	}
	GR = $("select#GR").val();
	GR = parseFloat($("input#GR").val());
	if (1 > GR.length || !$.isNumeric(GR)){
		return alert("Enter a numeric GR"), !1;
	}
	else if(GR > 31){
		return alert("Enter a valid GR"), !1;
	}
	

	
	
    switch (radius_unit) {
		case "-40":
			RSL = 40;
			calculateRadius();
            return radius
        case "-45":
			RSL = 45;
			calculateRadius();
            return radius	
		case "-50":
			RSL = 50;
			calculateRadius();
            return radius
        case "-55":
			RSL = 55;
			calculateRadius();
            return radius	
		case "-60":
			RSL = 60;
			calculateRadius();
            return radius
        case "-65":
			RSL = 65;
			calculateRadius();
            return radius	
        case "-70":
			RSL = 70;
			calculateRadius();
            return radius
		case "-75":
			RSL = 75;
			calculateRadius();
            return radius
        case "-80":
			RSL = 80;
			calculateRadius();
            return radius		
        case "-85":
			RSL = 85;
			calculateRadius();
            return radius
		case "-90":
			RSL = 90;
			calculateRadius();
            return radius	
		case "-95":
			RSL = 95;
			calculateRadius();
            return radius	
			
		case "0":
			radius2 = radius;
			
			radius2 = radius2 / 1000;
			LP = 106 + (20 * (Math.log10(radius2)));
			RSL3 = EIRP - LP + GR;
			RSL3 = -RSL3;
				
			radiusD = radius * Math.sqrt(12);
            return radius
			
		case "99":
			radius2 = radius;
			
			radius2 = radius2 / 1000;
			LP = 106 + (20 * (Math.log10(radius2)));
			RSL3 = EIRP - LP + GR;
			RSL3 = -RSL3;
				
			radiusD = radius * Math.sqrt(12);
			
			return radius
        default:
            return console.log(radius), !1
    }

}


function calculateRadius() {
	radius = (RSL + EIRP + GR - 106 ) / 20 ;
	radius = Math.pow(10, radius);
	radius = radius * 1000;
	radiusD = radius * Math.sqrt(12);
}

function checkColorDeleteActive() {

	if (CircleColor == "red" ){
	CircleColor = "black";
	}
	else if (CircleColor == "blue" ){
	CircleColor = "red";
	}
	else if (CircleColor == "green" ){
	CircleColor = "blue";
	}
	else if (CircleColor == "black" ){
	CircleColor = "green";
	}
}


function getStrokeColor() {
    var a = "#" + $("input#stroke_color").val();
    return validHexColor(a) ? a : "#000000"
}

function validHexColor(a) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)
}

function modifyActiveCircle(a, f, c) {
    active_circle && (CircleColor = CircleColor ? CircleColor: active_circle.get("radiusWidget").get("circle").setOptions({
        fillColor: CircleColor
    }), strokeColor = f ? f : getStrokeColor(), active_circle.get("radiusWidget").get("circle").setOptions({
        strokeColor: strokeColor
    }), radius = a ? a : getInputRadius(), "undefined" != typeof c ? active_circle.get("radiusWidget").get("circle").setOptions({
       // fillOpacity: c
    }) : active_circle.get("radiusWidget").get("circle").setOptions({
        //fillOpacity: getFillOpacity()
    }), active_circle.get("radiusWidget").set("distance", radius), active_circle.get("radiusWidget").center_changed(), loaded && saveLink())
	
}

function changeCheck() {
  var checkBox = document.getElementById("myCheck");
  var getRadiusUnit = document.getElementById("radius_unit");
	var tooltipHidden = document.getElementById("tooltipHidden");
	var radiusHidden = document.getElementById("radiusHidden");
	
	
  if (checkBox.checked == true){
	getRadiusUnit.style.display = "none"; 
    tooltipHidden.style.display = "none";
	radiusHidden.style.display = "block";
	document.getElementById("radius").style.display='block';
	document.getElementById("radius_unit").selectedIndex = 0;
	document.getElementById("radius") == 0;
	document.getElementById("calculateCoverage").style.display='none';
	
	

  } else {
	getRadiusUnit.style.display = "block";	
	 tooltipHidden.style.display = "block";
	 radiusHidden.style.display = "none";
	document.getElementById("radius").style.display='none';
	
	document.getElementById("radius_unit").selectedIndex = "5";

	

	document.getElementById("calculateCoverage").style.display='none';
	

  }
}

function changetextbox() { 

var e = document.getElementById("radius_unit");
	var strUser = e.options[e.selectedIndex].value;

  	if(strUser != 0){
		document.getElementById("radius").disabled = true;
		document.getElementById("radius") == 0;
		document.getElementById("radius").style.display='none';
		document.getElementById("calculateCoverage").style.display='none';
		document.getElementById('stationHeight').style.display = "none";
	}
	else {
		document.getElementById("radius").disabled = false;
		document.getElementById("calculateCoverage").style.display='none';
		document.getElementById("radius").style.display='inline-block';
		document.getElementById('stationHeight').style.display = "none";
	}
	

	
	if(strUser == 99){
		document.getElementById("radius").disabled = false;
		document.getElementById("calculateCoverage").style.display='inline-block';
		document.getElementById("radius").style.display='inline-block';
		document.getElementById("stationHeight").style.display='inline-block';
	}
}

function setColorForNextCircle(b) {
	if (b.get("fillColor") == "black") {
    b.setOptions({
      fillColor: "red",
      strokeColor: getStrokeColor()
    });
	CircleColor = "red";
	strokeColor: getStrokeColor()
	
    } else if (b.get("fillColor") == "red") {
    b.setOptions({
      fillColor: "blue",
      strokeColor: getStrokeColor()
    });
	CircleColor = "blue";
	strokeColor: getStrokeColor()
	
    } else if (b.get("fillColor") == "blue") {
    b.setOptions({
      fillColor: "green",
      strokeColor: getStrokeColor()
    });
	CircleColor = "green";
	strokeColor: getStrokeColor()
	
	} else if (b.get("fillColor") == "green") {
    b.setOptions({
      fillColor: "black",
      strokeColor: getStrokeColor()
    });
	CircleColor = "black";
	strokeColor: getStrokeColor()
	}
}

function deleteActiveCircle() {
	if(MarkersTitle[MarkersTitle.length-1] == ActiveCircleTitle[ActiveCircleTitle.length-1]){
			if (active_circle){
				for (active_circle.set("map", null), len = circles.length, i = 0; i < len; i++) 
				{active_circle == circles[i] && (circles.splice(i, 1), active_circle = null)}
				checkColorDeleteActive();
				MarkersTitle.splice(-1,1);
			latOfAllMarkers.splice(-1,1)}
			}
			else{console.log("Please select and delete towers from the last you have created ");
		}
}



function saveLink() {
        len = circles.length;
        data = [];
		
        for (i = 0; i < len; i++) {
            var b = circles[i];
            data[i] = [];
            data[i].push(parseFloat(b.get("radiusWidget").get("distance").toFixed(2)));
            data[i].push(parseFloat(b.get("position").lat().toFixed(7)));
            data[i].push(parseFloat(b.get("position").lng().toFixed(7)));
            data[i].push(b.get("radiusWidget").get("circle").get("CircleColor"));
            data[i].push(b.get("radiusWidget").get("circle").get("strokeColor"))
        }
        circle_define_string = encodeURIComponent(JSON.stringify(data));
        url = "" + circle_define_string;
}


function zoomToAllCircles() {
    bounds = new google.maps.LatLngBounds;
    len = circles.length;
    data = [];
    for (i = 0; i < len; i++) bounds.union(circles[i].get("radiusWidget").get("bounds"));
    map.fitBounds(bounds)
}
google.maps.event.addDomListener(window, "load", init);


