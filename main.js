var express = require('express');
var pdf = require('pdfkit')
var mysql = require('mysql');
var fs = require('fs')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '111111',
  database : 'new_database'
});
connection.connect();

var app = express();

app.get('/', function (req, res) {
  res.sendfile('form.html');
});

app.get('/form', function(req, res){ 
    var username = req.query.username; 

	connection.query('SELECT * from USER WHERE firstName = ' + '\'' +username + '\'', function(err, rows, fields) {
	  if (!err){

	  	console.log(rows)

	  	if (rows.length >= 1){  	

	  	generatePDF(rows)
	  	updatePDF(rows[0], connection)
	  	var user = {
		    description: []
		};
		user.description.push({
			"firstName": rows[0].firstName,
			"lastName": rows[0].lastName,
			"image": rows[0].image,
		})
		console.log(user);
		res.send("Your user is" + JSON.stringify(user, null, 2));

		}
		else{
			res.send("Your user has not been found");
		}

		}
	  else{
	    console.log('Error while performing Query.');
		}	
	});

	

});


function generatePDF(rows) {
    var myDoc = new pdf;
    myDoc.pipe(fs.createWriteStream('user.pdf'));

    myDoc.font('Times-Roman')
       .fontSize(20)
       .text(rows[0].firstName + " " +rows[0].lastName +" " + rows[0].image , 100, 100)
    myDoc.end();
}

function updatePDF (row, connection){

	var stats = fs.statSync("user.pdf")
	var fileSizeInBytes = stats["size"]

	fs.open('user.pdf', 'r', function (status, fd) {
	    if (status) {
	        console.log(status.message);
	        return;
	    }
	    var buffer = new Buffer(fileSizeInBytes);
	    fs.read(fd, buffer, 0, fileSizeInBytes, 0, function (err, num) {
	    connection.query('UPDATE USER SET pdf = ? WHERE firstName = ?', [buffer, row.firstName])
	  });
	});
}


app.listen(3000, function () {
  console.log('app listening on port 3000');
});