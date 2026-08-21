/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "GeoMatchingLibrary",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "Libraries" ],
  "name" : "Geo Matching Library",
  "description" : "Methods for match codes and matching based on latitude and longitude coordinates",
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
/*
 * The following functions are intended for use outside this library:
 *
 *** function getDistanceFromLatLonInMeters(lat1,lon1,lat2,lon2)
 * Find the distance between two points in meters. Assumes the earth is a perfect sphere, so tidal and centrifugal force effect on our planets shape are ignored.
 *
 *** function matchCodes(lat,lon)
 * Provides match codes that will send points less than 500 meter apart to matching, and never send points more than 2500 meter apart to matching.
 *
 *** function matchScore(lat1,lon1,lat2,lon2,minScoreDist,maxScoreDist)
 * to get a match score based on the distance between two points.
 * var maxScoreDist: If this is set to 500, any distance below 500 is score 100
 * var minScoreDist: If this is set to 1000, any distance above 1000 is score 0
 * Linear scale in between, so distance 750 would score 50.
 */
 
function getDistanceFromLatLonInMeters(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d*1000;
}
 
function matchScore(lat1,lon1,lat2,lon2,minScoreDist,maxScoreDist) {
    var dist = getDistanceFromLatLonInMeters(lat1,lon1,lat2,lon2);
    if(dist>=minScoreDist){
        return 0;
    }
    if(dist<=maxScoreDist){
        return 100;
    }
    return 100-parseInt(100 / ( (minScoreDist-maxScoreDist) / 	(dist-maxScoreDist) ));
}
 
function deg2rad(deg) {
    return deg * (Math.PI/180)
}
 
function rndc(coord, precision){
    return Math.round((coord * precision ), 0) / precision;
}
 
function formatCode(lat, lon) {
    var slat = lat;
    var slon = lon;
    while (slat.length<10){
        slat = slat+"0";
    }
    while (slon.length<10){
        slon = slon+"0";
    }
    var retval = slat+ "-x-"+slon;    
    return retval;
 
}
 
function getLonMatchBoxWidth(lat){
    // lonMatchBoxWidth determines the size of the match code boxes in longitude direction. Larger size means larger matchcode box.
    // Optimally, to use 4 boxes, we want lonMatchBoxWidth to span just over 1000m, never less.
    var lonMatchBoxWidth = 0.15;
 
    if(Math.abs(lat)<87) {
        lonMatchBoxWidth = 0.14;
    }
    if(Math.abs(lat)<84) {
        lonMatchBoxWidth = 0.1;
    }
    if(Math.abs(lat)<81) {
        lonMatchBoxWidth = 0.07;
    }
    if(Math.abs(lat)<78) {
        lonMatchBoxWidth = 0.045;
    }
    if(Math.abs(lat)<71) {
        lonMatchBoxWidth = 0.035;
    }
    if(Math.abs(lat)<65) {
        lonMatchBoxWidth = 0.024;
    }
    if(Math.abs(lat)<50) {
        lonMatchBoxWidth = 0.018;
    }
    if(Math.abs(lat)<40) {
        lonMatchBoxWidth = 0.013;
    }
    if(Math.abs(lat)<30) {
        lonMatchBoxWidth = 0.012;
    }
    return lonMatchBoxWidth ; 
}
 
function matchCodeAtLatForPoint(lat, lon) {
 
    var matchCodeArray = [];
    var nextSquareLong = getLonMatchBoxWidth(lat);
    var roundFact = 1.0 / nextSquareLong;
    
    var roundLon =  (rndc(lon,roundFact));
    matchCodeArray.push(formatCode(rndc(lat,1000), roundLon));
    if(((0.0+lon)-roundLon)<0.0){        
        matchCodeArray.push(formatCode(rndc(lat,1000), (rndc(roundLon-nextSquareLong,roundFact))));
    } else {
        matchCodeArray.push(formatCode(rndc(lat,1000), (rndc(roundLon+nextSquareLong,roundFact))));
    }
 
    return matchCodeArray;
}
 
function matchCodes(lat,lon) {
    var nextSqareLat = 0.005;
    var roundLat = 0.0+rndc(lat, 100);
    var m2;
    if(((0.0+lat)-roundLat)<0.0){        
        m2 	= matchCodeAtLatForPoint(roundLat-nextSqareLat, lon);
    } else {
        m2  = matchCodeAtLatForPoint(roundLat+nextSqareLat, lon);
    }
    var matchCodeArray 			    = matchCodeAtLatForPoint(roundLat, lon);
 
    for (ia=0;ia<m2.length;++ia){
        matchCodeArray.push(m2[ia]);
    }
 
    return matchCodeArray;
}
 
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getDistanceFromLatLonInMeters = getDistanceFromLatLonInMeters
exports.matchScore = matchScore
exports.deg2rad = deg2rad
exports.rndc = rndc
exports.formatCode = formatCode
exports.getLonMatchBoxWidth = getLonMatchBoxWidth
exports.matchCodeAtLatForPoint = matchCodeAtLatForPoint
exports.matchCodes = matchCodes