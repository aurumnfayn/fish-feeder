
#include "FirebaseESP8266.h"
#include <ESP8266WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <Servo.h>

Servo servo;

#define FIREBASE_HOST "https://fishfeeder-ac3fc-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "O3Dwfq6RyoMM2KRQGL4ArL8SRyk7NH4F9hscrHlX"
#define WIFI_SSID "Redmi Note 9"
#define WIFI_PASSWORD "fayn132p"

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org",19800);


FirebaseData timer,feed;
String stimer;
String Str[]={"00:00","00:00","00:00"};
int i =0;
int feednow = 0;
void setup() {
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to a");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("connected: ");
  Serial.println(WiFi.localIP());

  timeClient.begin();
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  servo.attach(D3); // Pin attached to D3
}

void loop() {
  Firebase.getInt(feed,"feednow");
  // feednow = feed.intData();
  Serial.println(feed.intData());
  if (feed.intData()==1) // Direct Feeding
  {
      Serial.println("masuk coy");
      servo.write(0); // rotate clockwise
      delay(1000); // allow to rotate for n micro seconds, you can change this to your need
      servo.write(180); // stop rotation
      feednow = 0;
      Firebase.setInt(feed, "/feednow",feednow);
      Serial.println("Fed");
  }
  else{ // Scheduling feed
    for(i=0;i<3;i++){
      String path = "timers/timer"+String(i);
      Firebase.getString(timer,path);
      stimer = timer.to<String>();
      Str[i]= stimer.substring(9,14);
    }
    timeClient.update();
    String currentTime = String(timeClient.getHours())+":"+String(timeClient.getMinutes());
    if (Str[0]==currentTime||Str[1]==currentTime||Str[2]==currentTime)
    {
      servo.writeMicroseconds(1000); // rotate clockwise
      delay(700); // allow to rotate for n micro seconds, you can change this to your need
      servo.writeMicroseconds(1500); // stop rotation
      Serial.println("Success");
      delay(60000);
    }
  }
  Str[0]="00:00";
  Str[1]="00:00";
  Str[2]="00:00";
}
