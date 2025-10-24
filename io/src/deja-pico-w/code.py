import board
import digitalio
import os
import time
import ssl
import ipaddress
import json
import socketpool
import wifi
import adafruit_minimqtt.adafruit_minimqtt as MQTT
import busio
from adafruit_servokit import ServoKit

ssid = os.getenv("CIRCUITPY_WIFI_SSID")
password = os.getenv("CIRCUITPY_WIFI_PASSWORD")
enableConfig = os.getenv('ENABLE_CONFIG')
enablePwm = os.getenv('ENABLE_PWM')
enableMqtt = os.getenv('ENABLE_MQTT')
broker = os.getenv('MQTT_BROKER')
layoutId = os.getenv('LAYOUT_ID')
deviceId = os.getenv('DEVICE_ID')
topicId = os.getenv('TOPIC_ID')
stopic = topicId + "/" + layoutId + "/" + deviceId
ptopic = topicId + "/" + layoutId + "/" + deviceId + "/messages"
pins = {}

def loadConfig():
    # Load configuration from config.json
    with open('config.json') as config_file:
        config = json.load(config_file)

    # Set up pins
    for pin_number, pin_name in config['pins'].items():
        print("Setting up pin", pin_name)
        print("Setting up pin #", pin_number)
        pin = digitalio.DigitalInOut(getattr(board, pin_name))
        pin.direction = digitalio.Direction.OUTPUT
        pins[int(pin_number)] = pin

    return pins

# Initialize the ServoKit with 16 channels
if enablePwm == "true":
    print("PWM is enabled")
    i2c = busio.I2C(scl=board.GP1, sda=board.GP0)
    kit = ServoKit(channels=16, i2c=i2c)
else:
    print("PWM is disabled")
    kit = None

# Check if configuration is enabled
if enableConfig == "true":
    print("Configuration is enabled")
    loadConfig()
else:
    print("Configuration is disabled")

# Handle MQTT messages
def message(client, topic, message):
    # This method is called when a topic the client is subscribed to
    # has a new message.
    print(f"New message on topic {topic}: {message}")
    data = json.loads(message)
    print("data")
    print(data)
    action = data.get("action")
    print("action")
    print(action)
    payload = data.get("payload")
    print("payload")
    print(payload)
    device = data.get("device")
    print("device")
    print(device)

    if device != deviceId:
        return
    
    if payload is not None:
        if action == "pin":
            handlePin(client, payload)
        elif action == "turnouts":
          handleTurnout(client, payload)
        elif action == "servo":
          handleTurnout(client, payload)
        elif action == "effects":
          handlePin(client, payload)
        else:
          print("Payload fail")

def handlePin(client, payload):
    print("handlePin")
    print(payload)
    pinNumber = int(payload["pin"])
    if payload["state"]:
        value = True
    else:
        value = False
    pins[pinNumber].value = value
    client.publish(ptopic, f"Toggled pin {pinNumber} to value {value}")
    print(pinNumber)
    print(value)
    print(pins[pinNumber].value)
    print(pins[pinNumber].value)

def handleTurnout(client,payload):
    print("handleTurnout")
    print(payload)
    servo = int(payload["servo"])
    angle = int(payload["value"])
    if kit is None:
        print("PWM is not enabled, cannot control servo")
        return
    kit.servo[servo].angle = angle
    client.publish(ptopic, f"Toggled servo {servo} to angle {angle}")
    print(f"Toggled servo {servo} to angle {angle}")

# Define callback methods which are called when events occur

# pylint: disable=unused-argument, redefined-outer-name
def connected(client, userdata, flags, rc):
    # This function will be called when the client is connected
    # successfully to the broker.
    client.subscribe(stopic)
    client.publish(ptopic, "Connected to MQTT broker " + deviceId)
    print(f"Connected to mqtt Listening for topic changes", stopic, ptopic)

def disconnected(client, userdata, rc):
    # This method is called when the client is disconnected
    print("Disconnected from MQTT broker: " + deviceId)

def subscribe(client, userdata, topic, granted_qos):
    # This method is called when the client subscribes to a new feed.
    print('Subscribed to {0} with QOS level {1}'.format(topic, granted_qos))

def runMqtt():    
    mqtt_client = MQTT.MQTT(
        broker=broker,
        port=1883,
        socket_pool=pool,
    )

    mqtt_client.on_connect = connected
    mqtt_client.on_disconnect = disconnected
    mqtt_client.on_message = message
    mqtt_client.on_subscribe = subscribe

    # Connect the client to the QTT broker.
    print("Connecting to MQTT...")
    mqtt_client.connect()

    while True:
        # Poll the message queue
        mqtt_client.loop()

#pool = socketpool.SocketPool(wifi.radio)
#socket = pool.socket()
#socket.listen(1)
#socket.setblocking(True)
 
if None in [ssid, password]:
    raise RuntimeError(
        "WiFi settings are kept in settings.toml, "
        "please add them there. The settings file must contain "
        "'CIRCUITPY_WIFI_SSID', 'CIRCUITPY_WIFI_PASSWORD', "
        "at a minimum."
    )

print()
print("Connecting to WiFi")       
        

#  connect to your SSID
try:
    wifi.radio.connect(ssid, password)
except TypeError:
    print("Could not find WiFi info. Check your settings.toml file!")
    raise

print("Connected to WiFi")

pool = socketpool.SocketPool(wifi.radio)

#  prints MAC address to REPL
print("My MAC addr:", [hex(i) for i in wifi.radio.mac_address])

#  prints IP address to REPL
print(f"My IP address is {wifi.radio.ipv4_address}")

#  pings Google
#ipv4 = ipaddress.ip_address("8.8.4.4")
#print("Ping google.com: %f ms" % (wifi.radio.ping(ipv4)*1000))

#print("Connected, IPv4 Addr: ", wifi.radio.ipv4_address)
if enableMqtt == "true":
    print("MQTT is enabled")
    runMqtt()
else:
    print("MQTT is disabled")

*-