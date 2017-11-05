import serial
import time

ser = serial.Serial(port='/dev/ttyACM1',baudrate=9600)
time.sleep(2)

while 1:
    i = raw_input()
    ser.write(i)
