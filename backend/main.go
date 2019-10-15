package main

import (
	"flag"
	"github.com/gorilla/websocket"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

var lock sync.Mutex
var addr = flag.String("addr", "0.0.0.0:8080", "http service address")

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

var players map[string]Player

func main() {
	players = make(map[string]Player)
	log.Println("Starting...")
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/", userHandler)
	go loop()
	log.Fatal(http.ListenAndServe(*addr, nil))
}
