package main

import "github.com/gorilla/websocket"

type Player struct {
	ID   string
	Loc  Loc
	Conn *websocket.Conn
}

type Loc struct {
	ID    string `json:"id"`
	X     int64  `json:"x"`
	Y     int64  `json:"y"`
	Angle int64  `json:"a"`
}
