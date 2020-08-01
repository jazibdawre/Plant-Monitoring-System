# Plant Monitoring System
_A complete plant care ecosystem_

## Overview

The system is composed of four major components
1. Website (GUI)
2. Express Server (Backend)
3. Hardware (ESP8266)
4. Database (MongoDB)

## Features

PMS uses ESP8266 board as the main controller as well as remote connectivity, the DHT11 temperature and humidity sensor, a resistive soil moisture sensor and a LDR for measuring the light flux.

PMS tracks the Temperature, Humidity, Soil Moisture and the
Sunlight Hours and will autonomously water individual plants based upon the reports.

It requires less than 250mA per reading, and using the Deepsleep function can be used to create a battery efficient system

PMS can be updated over the air, and when coupled with a BMS, creates a remote weather station

## Deployment

The code in this repository is configured to work in a local network.

```javascript
//In: server/public/js/scripts.js and in arduino/data/www/js/scripts.js

var server_url="http://192.168.0.104/"; //Set this to your computer's ip (Express server)
```
```javascript
//In: server/config.js
{
    'espUrl': 'http://192.168.0.103/',  //IP os the ESP8266 on the LAN
    'mongoUrl' : 'mongodb://localhost:27017/PMS'    //IP of the Mongo database
}
```
```c++
//IN: arduino/Monitoring_System_v_2.0.ino
#define SERVER_IP "http://192.168.0.104/"   //IP of the Express server
```

Minor changes are required to deploy this code on the web (bypass website->esp requests if your ISP too blocks incoming connections) or else just change the above stated variables.

### Web deployment

The GUI populated with dummy data can be found here: https://jazibdawre.github.io/Plant-Monitoring-System-GUI/

The website and the REST api are served via an express server on heroku. The MongoDB database is hosted on MongoDB Atlas and is accessible via the express server. Check out the site at: https://pms-express-server.herokuapp.com/

Since running a separate hosting for the website, backend and the database is not needed for local usage of the system, the REST api is reimplemented in the ESP8266 on a web server along with a copy of the website files. The ESP8266 has mDNS and hence the website can be accessed either via its ip address or through http://grasshopper.local if connected to the same network witht he only downside being that the log size is limited to 11 data points due to storage constraints.

## Details

### Website

The website is designed to display the readings from the PMS in an easily readable way. Javascript is used for page manipulation as the readings get continuously updated every five minutes.

- The website has Graphs plotted based in previous data and are updated as each new reading is taken

- The Logs page displays all the readings along with their timestamp in an excel sheet which is downloadable in csv format

- The website is created using Bootstrap v4.4.1

- Axios library is used for client-server communication

- Graphs are plotted using Highcharts v8.1.0

- Excel Sheets are displayed using Handsontable v7.4.2

- Jquery is used for DOM and HTML manipulation

- Moment.js library is used for time related processing

- The Libraries are supplied via cloudflare CDN, the website contains fallback code which reverts to the local copy of the libraries if the CDN were to fail.

### Web server

The Web server is implemented in NodeJS using Express. The web server serves as a REST api as well as a static file server for the website

- On a http request, the server queries the MongoDB database to return a json string
- The webserver has a separate endpoint for website as well as the ESP8266 module
- Database is updated when the ESP8266 sends a POST request, generally at an interval of 5 mins
- Mongoose is used for managing schema's for MongoDB

### Hardware

The weather station is a group of sensors connected to the ESP8266 microcontroller programmed in C++.

- It keeps track of the Temperature, Humidity, Moisture, Sunlight and the Tank water level
- The ESP8266 runs a webserver implemented in C++ to respond to user actions and to send values to the Express server
- The backend api (Express) is reimplemented in the ESP8266 for local usage without the need of hosting
- The ESP8266 also has a copy of the website files and can act as a static file server if needed
- The weather station can hence function independently with the GUI and the backend implemented onboard for remote usage

### Database

A MongoDB database is used for storing the logs, settings and the current values

- Data is stored in separate collections for each: status, latest, logs and limits
- logs, latest, status are updated via the Express server on a POST request by ESP8266
- limits, settings are updated via the website
- The state of the system is stored on the database as well (since heroku provides volatile file system)