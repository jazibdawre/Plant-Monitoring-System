#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <splash.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ESP8266mDNS.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <ArduinoJson.h>
#include "AsyncJson.h"
#include <FS.h>
#include "DHT.h"
#include <ESP8266HTTPClient.h>

//Hardware Definitions
#define DHTTYPE DHT11
#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

//Display setup (SPI)
#define OLED_MOSI  D7
#define OLED_CLK   D5
#define OLED_DC    D2
#define OLED_CS    D8
#define OLED_RESET D3
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, OLED_MOSI, OLED_CLK, OLED_DC, OLED_RESET, OLED_CS);

//HTTP setup
#define SERVER_IP "http://192.168.0.104:3000/esp/"
WiFiClient client_backend;
HTTPClient server_backend;

//Web Server setup
const char* ssid = "AJM";  // Enter SSID here
const char* password = "29april2001";  //Enter Password here
AsyncWebServer server(80);

//NTP client setup
const long utcOffsetInSeconds = 19800;    //+5.30
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

//OTA setup
uint16_t port = 8266;   //Default: 8266
const char* hostname = "Grasshopper";
const char* ota_password = NULL;   //Default: NULL

//DHT setup
uint8_t DHTPin = 3; //RX pin
DHT dht(DHTPin, DHTTYPE);                

//Variables
//State
String Overall_state = "NA";
String date_iso = "NA";
String date_disp = "NA";
float Temperature = 0.0;  //in °C
float Humidity = 0.0;  //in %
float Moisture = 0.0;  //in %
float Sunlight = 0.0;  //in Hours
float Tank = 50.0;  //in %. Not Implemented, default to 50
//Log
struct Log {
  String date;
  float temperature;
  float humidity;
  float moisture;
  float sunlight;
  float tank;
};
int last_log = 0;
const int log_size = 11;
Log logs[log_size];
//Pins
uint8_t MoisturePin = A0;
uint8_t MotorPin = D4;
uint8_t PowerPin = D6;
uint8_t LDRPin = A0;
uint8_t LDRpPin = 1;  //Tx
uint8_t MoisturepPin = D1;
//Hardware
const int min_fluxv = 0.0;
const int watering_time=300000;    //5min: 300000
const int seeping_time=300000;    //5min: 300000
const int dry_soil_value=1015;
const int wet_soil_value=1;
const int read_frequency = 300000;    //5min: 300000
String motor_state = "Idle";
int motor_mode = 0;
//Limits
int max_temp=35;
int min_temp=25;
int max_humid=90;
int min_humid=50;
int max_sun=8;
int min_sun=3;
int max_moist=87;
int min_moist=65;
int max_tank=100;
int min_tank=30;
//Errors
String temp_err = "NA";
String humid_err = "NA";
String sun_err = "NA";
String moist_err = "NA";
String server_err = "NA";
//Implementational
int cntr=0;
int curr_disp = 0;
unsigned long read_time = 0;
unsigned long motor_time = 0;
unsigned long disp_time = 0;
String req_json = "";
char req_json_char[320];
//Alert Settings
bool temperature_settings = true;
bool humidity_settings = false;
bool moisture_settings = true;
bool email_settings = true;
bool sms_settings = false;

void setup() {
  read_time = millis();
  //Display
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.display();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  //Pins
  pinMode(DHTPin, INPUT);
  pinMode(LDRpPin, OUTPUT);
  pinMode(MoisturepPin, OUTPUT);
  pinMode(MotorPin, OUTPUT);
  pinMode(PowerPin, OUTPUT);
  pinMode(MoisturePin, INPUT);
  digitalWrite(LDRpPin, LOW);
  digitalWrite(MoisturepPin, LOW);
  digitalWrite(MotorPin, HIGH);
  digitalWrite(PowerPin, HIGH);
  //Wifi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    cntr = (cntr>=4) ? 0 : cntr;
    if (cntr==0) {
      display.clearDisplay();
      display.setCursor(0,0);
      display.print("Connecting to ");
      display.print(ssid);
      display.display();
    } else {
      display.print(".");
    }
    display.display();
    cntr++;
  }
  display.print("\nGot IP: ");
  display.println(WiFi.localIP());
  display.display();
  //mDNS
  if (MDNS.begin("grasshopper")) {  // Start the mDNS responder for esp8266.local
    display.println("mDNS started");
  } else {
    display.println("Error starting MDNS!");
  }
  display.display();
  //Ntp
  timeClient.begin();
  //Server
  init_server();
  server.begin();
  display.println("HTTP server started");
  display.display();
  //DHT
  dht.begin();
  //OTA
  init_ota();
  ArduinoOTA.begin();
  display.println("OTA ready");
  // Initialize SPIFFS
  if(SPIFFS.begin()){
    display.println("SPIFFS mounted");
  } else {
    display.println("Error mounting SPIFFS");
  }
  display.display();
  //Footer
  display.print("\nBooted in ");
  display.print(((float)(millis() - read_time))/1000.0);
  display.print("s");
  display.display();
  delay(1500);
  //First Read
  update_time();
  read_time = millis();
  read();
  check();
  display_all();
  send_to_server();
  log_values();
}

void loop() {
  update_time();
  ArduinoOTA.handle();
  display_all();  //To update screen based on time and state
  //Power sensors here
  //Read sensors
  if (millis() - read_time >= read_frequency) {
    read_time = millis();
    read();
    display_all();
    send_to_server();
    log_values();
  }
  check();
  //Motor Control (Non-blocking!)
  if (motor_state == "Active") { 
    if (motor_mode == 0) {
      motor();  //start
      motor_time = millis();
      motor_mode = 1;
    }
    if (motor_mode == 1 && millis() - motor_time >= watering_time) {
      motor(); //stop motor
      motor_time = millis();
      motor_mode = 2;
    }
    if (motor_mode == 2 && millis() - motor_time >= seeping_time) {
      motor(); //just to make sure (stop)
      motor_mode = 0;
      motor_state == "Idle";
    }
  } else {  //aka idle
    motor_mode = 2;
    motor();  //stop
    motor_mode = 0;
  }
}

void update_time() {
  timeClient.update();
  date_iso = timeClient.getFormattedDate();
  date_disp = timeClient.getDate();
  date_disp += "  " + timeClient.getFormattedTime();
}

void display_err() {
  display.clearDisplay();
  display.setCursor(0,0);
  display.println(date_disp);
  display.println("\n       WARNING\n");
  if (temp_err != "NA") {
    display.println(temp_err);
  }
  if (humid_err != "NA") {
    display.println(humid_err);
  }
  if (sun_err != "NA") {
    display.println(sun_err);
  }
  if (moist_err != "NA") {
    display.println(moist_err);
  }
  if (server_err != "NA") {
    display.println(server_err);
  }
  display.display();
}

void display_home() {
  display.clearDisplay();
  display.setCursor(0,0);
  display.println(date_disp);
  display.print("\nOverall Status: ");
  display.println(Overall_state);
  display.print("\nTemperature = ");
  display.print(Temperature);
  display.print((char)247);   //degree symbol
  display.print("C\n");
  display.print("Humidity = ");
  display.print(Humidity);
  display.print("%\n");
  display.print("Sunlight = ");
  display.print(Sunlight);
  display.print("hrs\n");
  display.print("Moisture Level = ");
  display.print((int)Moisture);
  display.print("%\n");
  display.display();
}

void display_all() {
  if (temp_err == "NA" && humid_err == "NA" && sun_err == "NA" && moist_err == "NA") {
    display_home();
  }
  else
  {
    if (millis() - disp_time >= 2000) {  //Flash time of each screen
      disp_time = millis();
      if (!curr_disp) {
        display_home();
        curr_disp = 1;
      }
      else {
        display_err();
        curr_disp = 0;
      }
    } else {    //To update clock
      if (!curr_disp) {
        display_home();
      }
      else {
        display_err();
      }
    }
    
  }
  
}

void read() {
  update_time();
  //Temperature
  Temperature = dht.readTemperature();
  if (isnan(Temperature)) {
    Temperature = 0;
  }
  //Humidity
  Humidity = dht.readHumidity();
  if (isnan(Humidity)) {
    Humidity = 0;
  }
  //Sunlight
  digitalWrite(LDRpPin, HIGH);
  int ldr_raw = analogRead(LDRPin);
  digitalWrite(LDRpPin, LOW);
  ldr_raw = (3.3*ldr_raw)/1023.0; //Convert to voltage
  if (ldr_raw >= min_fluxv) {
    Sunlight += 0.083;
  }
  //Moisture
  digitalWrite(MoisturepPin, HIGH);
  delay(200);
  int moisture_raw = analogRead(MoisturePin);
  digitalWrite(MoisturepPin, LOW);
  if (!(moisture_raw>1021 || moisture_raw==0) ){    //Disconnected state check
    moisture_raw=constrain(moisture_raw, wet_soil_value, dry_soil_value);
    Moisture=map(moisture_raw, wet_soil_value, dry_soil_value, 100, 0);
  }
}

void check() {
  //Humidity
  if (Humidity > max_humid){
    humid_err = "[!] HUMIDITY HIGH";
  }
  else if (Humidity < min_humid){
    humid_err = "[!] HUMIDITY LOW";
  }
  else {
    humid_err = "NA";
  }
  //Temperature
  if (Temperature > max_temp){
    temp_err = "[!] TEMPERATURE HIGH";
  }
  else if (Temperature < min_temp){
    temp_err = "[!] TEMPERATURE LOW";
  }
  else {
    temp_err = "NA";
  }
  //Moisture
  if (Moisture > 100 || Moisture==0 ){
    moist_err = "[!] MOISTURE SENSOR";
  }
  else{
    if (Moisture > max_moist && Moisture <= 100){
      moist_err = "[!] MOISTURE HIGH";
    }
    else if (Moisture <= min_moist && Moisture > 0){
      moist_err = "[!] MOISTURE LOW\n[*] STARTING PUMP";
      motor_state = "Active";
      motor_mode = 0;
    }
    else {
      moist_err = "NA";
      motor_state = "Idle";
    }
  }
  //Sunlight
  if (Sunlight > min_sun){
    sun_err = "[!] SUNLIGHT HIGH";
  }
  else if (Sunlight < max_sun){
    sun_err = "[!] SUNLIGHT LOW";
  }
  else {
    sun_err = "NA";
  }
  //Overall
  if (temp_err == "NA" && humid_err == "NA" && sun_err == "NA" && moist_err == "NA") {
    Overall_state = "Good";
  } else if (temp_err != "NA" || moist_err != "NA") {
    Overall_state = "Bad";
  } else if (humid_err != "NA" || sun_err != "NA") {
    Overall_state = "Mild";
  }
}

void log_values() {
  if (last_log == log_size) {
    for (cntr = 0; cntr < log_size-1 ; cntr++) {
    logs[cntr] = logs[cntr + 1];
    }
  }
  last_log =  (last_log == log_size) ? log_size-1 : last_log;
  logs[last_log].date = date_iso;
  logs[last_log].temperature = isnan(Temperature)?0:Temperature;
  logs[last_log].humidity = isnan(Humidity)?0:Humidity;  
  logs[last_log].moisture = Moisture;
  logs[last_log].sunlight = Sunlight;
  logs[last_log].tank = Tank;
  last_log++;
}

void motor() {
  if (motor_mode == 0) {  //start motor
    digitalWrite(MotorPin, LOW);
  }
  else {
    digitalWrite(MotorPin, HIGH);
  }
}

void init_ota() {
  ArduinoOTA.setPort(port);
  ArduinoOTA.setHostname(hostname);
  ArduinoOTA.setPassword(ota_password);    //No password during development
  ArduinoOTA.onStart([]() {
    update_time();
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("OTA Request Received");
    display.print("Type: ");
    if (ArduinoOTA.getCommand() == U_FLASH)
      display.println("Sketch");
    else // U_SPIFFS
      display.println("Filesystem");
      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    display.display();
  });
  ArduinoOTA.onEnd([]() {
    display.print("\nOTA Update Successful");
    display.display();
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    display.clearDisplay();
    display.setCursor(0,0);
    display.println("OTA Request Received");
    display.print("Type: ");
    if (ArduinoOTA.getCommand() == U_FLASH)
      display.println("Sketch\n");
    else // U_SPIFFS
      display.println("Filesystem\n");
    display.printf("Progress: %u%%\r\n", (progress / (total / 100)));
    display.display();
  });
  ArduinoOTA.onError([](ota_error_t error) {
    display.printf("\nError[%u]: ", error);   //Maybe remove this
    if (error == OTA_AUTH_ERROR) display.println("[!] Auth Failed");
    else if (error == OTA_BEGIN_ERROR) display.println("[!] Begin Failed");
    else if (error == OTA_CONNECT_ERROR) display.println("[!] Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) display.println("[!] Receive Failed");
    else if (error == OTA_END_ERROR) display.println("[!] End Failed");
    display.display();
  });
}

void init_server() {
  //Web server routes config
  //Webpages
  server.serveStatic("/", SPIFFS, "/www/").setDefaultFile("index.html");
  server.on("/basic", handle_OnConnect);
  //API
  server.on("/settings", HTTP_GET, get_settings);
  server.on("/limits", HTTP_GET, get_limits);
  server.on("/status", HTTP_GET, get_status);
  server.on("/latest", HTTP_GET, get_latest);
  server.on("/logs", HTTP_GET, get_logs);
  server.on("/values", HTTP_GET, get_values);
  //POST
  server.on("/action", HTTP_POST, handle_NoBodyPOST, NULL, post_action);
  server.on("/settings", HTTP_POST, handle_NoBodyPOST, NULL, post_settings);
  server.on("/limits", HTTP_POST, handle_NoBodyPOST, NULL, post_limits);
  //CORS specific
  server.on("/action", HTTP_OPTIONS, handle_Options);
  server.on("/settings", HTTP_OPTIONS, handle_Options);
  server.on("/limits", HTTP_OPTIONS, handle_Options);
  //Reject rest
  server.on("/status", HTTP_ANY, handle_NotAllowedGET);
  server.on("/action", HTTP_ANY, handle_NotAllowedGET);
  server.on("/settings", HTTP_ANY, handle_NotAllowedGETPOST);
  server.on("/latest", HTTP_ANY, handle_NotAllowedGET);
  server.on("/limits", HTTP_ANY, handle_NotAllowedGETPOST);
  server.on("/logs", HTTP_ANY, handle_NotAllowedGET);
  server.on("/values", HTTP_ANY, handle_NotAllowedGET);
  server.onNotFound(handle_NotFound);
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
}

void send_to_server() {
  server_err = "NA";
  //Latest
  server_backend.begin(client_backend, SERVER_IP "latest");
  server_backend.addHeader("Content-Type", "application/json");
  int respl = server_backend.POST("{\"data\": [\""+Overall_state+"\",\""+motor_state+"\",\"Operational\",\""+date_iso+"\","+String(Temperature)+","+String(Humidity)+","+String(Moisture)+","+String(Sunlight)+","+String(Tank)+"]}");
  server_backend.end();
  //Status
  server_backend.begin(client_backend, SERVER_IP "status");
  server_backend.addHeader("Content-Type", "application/json");
  int resps = server_backend.POST("{\"data\":{\"status\":\""+Overall_state+"\",\"motor\":\""+motor_state+"\",\"station\":\"Operational\",\"timestamp\":\""+date_iso+"\",\"settings\":{\"temperature\":"+temperature_settings+",\"humidity\":"+humidity_settings+",\"moisture\":"+moisture_settings+",\"email\":"+email_settings+",\"sms\":"+sms_settings+"}}}");
  server_backend.end();
  //Logs
  server_backend.begin(client_backend, SERVER_IP "logs");
  server_backend.addHeader("Content-Type", "application/json");
  int respg = server_backend.POST("{\"data\": [\""+date_iso+"\","+String(Temperature)+","+String(Humidity)+","+String(Moisture)+","+String(Sunlight)+","+String(Tank)+"]}");
  server_backend.end();

  if (respl != HTTP_CODE_OK || resps != HTTP_CODE_OK || respg != HTTP_CODE_OK) {
    server_err = "SE: "+String(respl)+" | "+String(resps)+" | "+String(respg);
  }
}

void get_values(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(200, "application/json", "{\"data\": [\""+date_iso+"\","+String(Temperature)+","+String(Humidity)+","+String(Moisture)+","+String(Sunlight)+","+String(Tank)+"]}"); 
  request->send(response);
}

void handle_OnConnect(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(200, "text/html", SendHTML(Temperature, Humidity, Moisture, Sunlight)); 
  request->send(response);
}

void handle_NotFound(AsyncWebServerRequest *request) {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += request->url();
  message += "\nMethod: ";
  message += (request->method() == HTTP_GET) ? "GET" : "POST";
  AsyncWebServerResponse *response = request->beginResponse(404, "text/plain", message);
  request->send(response);
}

void handle_Options(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", "GET, POST");
  response->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response->addHeader("Access-Control-Allow-Headers", "*");
  response->addHeader("Access-Control-Max-Age", "600");
  request->send(response);
}

void handle_NotAllowedGET(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(405, "text/plain", "HTTP method not allowed. Use GET");
  response->addHeader("Allow", "GET");
  request->send(response);
}

void handle_NotAllowedGETPOST(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(405, "text/plain", "HTTP method not allowed. Use GET, POST");
  response->addHeader("Allow", "GET, POST");
  request->send(response);
}

void handle_NoBodyPOST(AsyncWebServerRequest *request) {
  AsyncWebServerResponse *response = request->beginResponse(400, "text/plain", "Body field missing");
  request->send(response);
}

void get_settings(AsyncWebServerRequest *request) {
  AsyncJsonResponse * response = new AsyncJsonResponse();
  JsonObject settings_doc = response->getRoot();

  settings_doc["temperature"] = temperature_settings;
  settings_doc["humidity"] = humidity_settings;
  settings_doc["moisture"] = moisture_settings;
  settings_doc["email"] = email_settings;
  settings_doc["sms"] = sms_settings;

  response->setLength();
  request->send(response);
}

void post_settings(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {

  if(!index) {    //start of data
    req_json = String((const char*)data);
  } else {    //midway
    req_json += String((const char*)data);
  }

  if(index + len == total) {    //End data
    req_json += "\0"; //End term
    req_json.toCharArray(req_json_char, 320);
    const size_t capacity = JSON_OBJECT_SIZE(5) + 50;
    DynamicJsonDocument doc(capacity);
    deserializeJson(doc, req_json_char);
    temperature_settings = doc["temperature"];
    humidity_settings = doc["humidity"];
    moisture_settings = doc["moisture"];
    email_settings = doc["email"];
    sms_settings = doc["sms"];

    AsyncWebServerResponse *response = request->beginResponse(200);
    request->send(response);
  }
}

void get_status(AsyncWebServerRequest *request) {
  AsyncJsonResponse * response = new AsyncJsonResponse();
  JsonObject status_doc = response->getRoot();

  JsonObject status_data = status_doc.createNestedObject("data");
  status_data["timestamp"] = date_iso;
  status_data["status"] = Overall_state;
  status_data["station"] = "Operational";
  status_data["motor"] = motor_state;

  JsonObject data_settings = status_data.createNestedObject("settings");
  data_settings["temperature"] = temperature_settings;
  data_settings["humidity"] = humidity_settings;
  data_settings["moisture"] = moisture_settings;
  data_settings["email"] = email_settings;
  data_settings["sms"] = sms_settings;

  response->setLength();
  request->send(response);
}

void post_action(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {  

  if(!index) {    //start of data
    req_json = String((const char*)data);
  } else {    //midway
    req_json += String((const char*)data);
  }

  if(index + len == total) {    //End data
    req_json += "\0";
    req_json.toCharArray(req_json_char, 320);
    const size_t capacity = JSON_OBJECT_SIZE(1) + 20;
    DynamicJsonDocument doc(capacity);
    deserializeJson(doc, req_json_char);

    if (doc["action"] == "restart") {
      // display.clearDisplay();
      // display.setCursor(0,0);
      // display.println(date_disp);
      // display.print("\n[!] Reboot command\n\nrecieved from website\nREBOOTING...");
      // display.display();
      AsyncWebServerResponse *response = request->beginResponse(200);
      request->send(response);
      delay(1000);
      ESP.restart();
    } else if (doc["action"] == "shutdown") {
      // display.clearDisplay();
      // display.setCursor(0,0);
      // display.println(date_disp);
      // display.print("\n[!] Shutdown command\n\nrecieved from website\nSHUTTING DOWN...\npress reset to reboot");
      // display.display();
      //Power sensors here
      AsyncWebServerResponse *response = request->beginResponse(200);
      request->send(response);
      timeClient.end();
      server.end();
      delay(3000);
      ESP.deepSleep(0);
    } else if (doc["action"] == "toggle") {
      if (motor_state=="Idle") {
        motor_state="Active";
        motor_mode = 0;
      } else if (motor_state=="Active") {
        motor_state="Idle";
      }
      AsyncWebServerResponse *response = request->beginResponse(200);
      request->send(response);
    }
  }
}

void get_latest(AsyncWebServerRequest *request) {
  AsyncJsonResponse * response = new AsyncJsonResponse();
  JsonObject latest_doc = response->getRoot();

  JsonArray latest_data = latest_doc.createNestedArray("data");
  latest_data.add(Overall_state);
  latest_data.add(motor_state);
  latest_data.add("Operational");
  latest_data.add(date_iso);
  latest_data.add(Temperature);
  latest_data.add(Humidity);
  latest_data.add(Moisture);
  latest_data.add(Sunlight);
  latest_data.add(Tank);

  response->setLength();
  request->send(response);
}

void get_limits(AsyncWebServerRequest *request) {
  AsyncJsonResponse * response = new AsyncJsonResponse();
  JsonObject limits_doc = response->getRoot();

  JsonArray limits_data = limits_doc.createNestedArray("data");

  JsonArray limits_data_0 = limits_data.createNestedArray();
  limits_data_0.add(min_temp);
  limits_data_0.add(min_humid);
  limits_data_0.add(min_moist);
  limits_data_0.add(min_sun);
  limits_data_0.add(min_tank);

  JsonArray limits_data_1 = limits_data.createNestedArray();
  limits_data_1.add(max_temp);
  limits_data_1.add(max_humid);
  limits_data_1.add(max_moist);
  limits_data_1.add(max_sun);
  limits_data_1.add(max_tank);

  response->setLength();
  request->send(response);
}

void post_limits(AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
  
  if(!index) {    //start of data
    req_json = String((const char*)data);
  } else {    //midway
    req_json += String((const char*)data);
  }

  if(index + len == total) {    //End data
    req_json += "\0";
    req_json.toCharArray(req_json_char, 320);
    const size_t capacity = JSON_ARRAY_SIZE(2) + 2*JSON_ARRAY_SIZE(5) + JSON_OBJECT_SIZE(1) + 10;
    DynamicJsonDocument doc(capacity);
    deserializeJson(doc, req_json_char);

    JsonArray data_0 = doc["data"][0];
    min_temp = data_0[0];
    min_humid = data_0[1];
    min_moist = data_0[2];
    min_sun = data_0[3];
    min_tank = data_0[4];

    JsonArray data_1 = doc["data"][1];
    max_temp = data_1[0];
    max_humid = data_1[1];
    max_moist = data_1[2];
    max_sun = data_1[3];
    max_tank = data_1[4];

    AsyncWebServerResponse *response = request->beginResponse(200);
    request->send(response);
  }
}

void get_logs(AsyncWebServerRequest *request) {
  AsyncJsonResponse * response = new AsyncJsonResponse();
  JsonObject logs_doc = response->getRoot();

  JsonArray logs_data = logs_doc.createNestedArray("data");

  for (cntr = 0; cntr < last_log; cntr++) {
    JsonArray data_0 = logs_data.createNestedArray();
    data_0.add(logs[cntr].date);
    data_0.add(logs[cntr].temperature);
    data_0.add(logs[cntr].humidity);
    data_0.add(logs[cntr].moisture);
    data_0.add(logs[cntr].sunlight);
    data_0.add(logs[cntr].tank);
  }

  response->setLength();
  request->send(response);
}

String SendHTML(float Temperaturestat,float Humiditystat,float Moisturestat,float Sunlightstat) {
  String ptr = "<!DOCTYPE html> <html>\n";
  ptr +="<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\"><meta charset=\"utf-8\">\n";
  ptr +="<title>ESP8266 Weather Report</title>\n";
  ptr +="<style>html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}\n";
  ptr +="body{margin-top: 50px;} h1 {color: #444444;margin: 50px auto 30px;}\n";
  ptr +="p {font-size: 24px;color: #444444;margin-bottom: 10px;}\n";
  ptr +="</style>\n";
  ptr +="</head>\n";
  ptr +="<body>\n";
  ptr +="<div id=\"webpage\">\n";
  ptr +="<h1>ESP8266 NodeMCU Weather Report</h1>\n";
  
  ptr +="<p>Temperature: ";
  ptr +=Temperaturestat;
  ptr +="°C</p>";
  ptr +="<p>Humidity: ";
  ptr +=Humiditystat;
  ptr +="%</p>";
  ptr +="<p>Moisture: ";
  ptr +=Moisturestat;
  ptr +="%</p>";
  ptr +="<p>Sunlight: ";
  ptr +=Sunlightstat;
  ptr +="hrs</p>";
  
  ptr +="</div>\n";
  ptr +="</body>\n";
  ptr +="</html>\n";
  return ptr;
}
