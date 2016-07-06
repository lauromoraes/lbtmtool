
var curve01 = null;
var curve02 = null;

var curve1_max = Number.MIN_VALUE;
var curve2_max = Number.MIN_VALUE;

var curve1_min = Number.MAX_VALUE;
var curve2_min = Number.MAX_VALUE;

var curve1xMax = null;
var curve2xMax = null;

var x_labels = [];
var curve1_points = [];
var curve2_points = [];

var aux1_points = [];
var aux2_points = [];

function processFields(fields) {
	// console.log(fields);
	var x = parseInt(fields[0]);
	var p1 = parseFloat(fields[1].replace(',','.'));
	var p2 = parseFloat(fields[2].replace(',','.'));

	if(p1 > curve1_max) {
		curve1_max = p1;
		curve1xMax = x;
	} else if (p1 < curve1_min) {
		curve1_min = p1;
	}

	if(p2 > curve2_max) {
		curve2_max = p2;
		curve2xMax = x;
	} else if (p2 < curve2_min) {
		curve2_min = p2;
	}

	x_labels.push(x);
	curve1_points.push(p1);
	curve2_points.push(p2);
	aux1_points.push(p1);
	aux2_points.push(p2);
}

function processLines(lines) {
	// console.log(lines);
	var numLines = lines.length;
	// console.log(numLines);
	var fields = null;
	for(var i=0; i<numLines; i++) {
		// console.log(lines[i]);
		fields = lines[i].split(';');
		
		if( fields.length > 1 && $.isNumeric(fields[0]) ) {
			processFields(fields);
		}
	}
}

function normalize() {
	var num_points = curve1_points.length;
	for(var i=0; i<num_points; i++) {
		curve1_points[i] = (curve1_points[i]-curve1_min)/(curve1_max-curve1_min);
		curve2_points[i] = (curve2_points[i]-curve2_min)/(curve2_max-curve2_min);
	}
}

function plotGraph() {
	$('#output01').empty();
	$('#output01').highcharts({
		chart:{
			zoomType: 'xy'
		},
		title: {
			text: 'Comparação das curvas',
			x: -20
		},
		subtitle: {
			text: 'Teste',
			x: -20
		},
		xAxis: {
			title: {
				text: 'Comprimento (nm)'
			},
			categories: x_labels
		},
		yAxis: {
			title: {
				text: 'Intensidade'
			}
		},
		tooltip:{
			shared:true,
			formatter: function() {
				console.log(this);
				var posA = this.points[0].point.index;
				var posB = this.points[1].point.index;

				var valA = aux1_points[posA];
				var valB = aux2_points[posB];

				var html = "<b>Comprimento:</b> " + this.x + " nm<br><hr>";
				html += "<b>Intensidades:</b><br>";
				html += "<ul>";
				html += "<li>" + this.points[1].series.name + " : " + valA + "</li><br>";
				html += "<li>" + this.points[0].series.name + " : " + valB + "</li><br>";
				html += "</ul>";
				return html;
			}
		},
		series: [{
			name: 'Target',
			data: curve1_points
		}, {
			name: 'Nanossonda',
			data: curve2_points
		}]
	});
}

function handleFile1(e) {
	var file1 = e.target.files[0]; // FileList object
	console.log(file1);
	$('body').append('<div id="output01"></div>');
	if(file1.type == 'text/csv') {
		$('#out').text('OK!');
		$('#output01').text('DONE');
		var reader = new FileReader();
		reader.onload = function(ev) {
			var lines = ev.target.result.split('\n');
			processLines(lines);
			normalize();
			plotGraph();
		}
		reader.onloadend = function(ev) {
			$('#output01').after('<div id="delta"></div>');
			$('#delta').append('<p>Max of <b>Target</b> occured on position '+curve1xMax+'</p>');
			$('#delta').append('<p>Max of <b>Nanossonda</b> occured on position '+curve2xMax+'</p>');
			$('#delta').append('<p>Delta = '+Math.abs(curve1xMax-curve2xMax)+'</p>');
		}
		reader.readAsText(file1);
	} else {
		$('#out').text('FAIL!');
		$('#output01').text('Input file must be a .csv');
	}
	
}

$(document).ready(function () {

	$('#formInput').submit(function(e) {
		e.preventDefault();
	});

	if (window.File && window.FileReader && window.FileList && window.Blob) {

		document.getElementById('curve1').addEventListener('change', handleFile1, false);

	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

});
