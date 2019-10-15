package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
)

func userHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("New client %v\n", r.RemoteAddr)
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	id := RandomID(5)
	player := Player{
		ID: id,
		Loc: Loc{
			ID: id,
		},
		Conn: c,
	}
	lock.Lock()
	players[c.RemoteAddr().String()] = player
	lock.Unlock()
	c.WriteJSON(struct {
		ID string `json:"id"`
	}{
		player.ID,
	})
	var loc Loc
	for {
		mt, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			lock.Lock()
			if _, ok := players[c.RemoteAddr().String()]; ok {
				delete(players, c.RemoteAddr().String())
			}
			lock.Unlock()
			break
		}
		if mt != websocket.TextMessage {
			continue
		}
		log.Printf("recv: %s", msg)
		err = json.Unmarshal(msg, &loc)
		if err != nil {
			log.Println(err, string(msg))
		}

		updateLoc(c.RemoteAddr().String(), loc)
	}
}

func updateLoc(addr string, loc Loc) {
	lock.Lock()
	defer lock.Unlock()
	player, ok := players[addr]
	if !ok {
		return
	}
	player.Loc = loc
	players[addr] = player
}
