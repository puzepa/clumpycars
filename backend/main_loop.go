package main

import "time"

func loop() {
	t := time.NewTicker(100 * time.Millisecond)
	for {
		<-t.C
		for _, p := range players {
			var result []Loc
			for _, p1 := range players {
				if p.ID == p1.ID {
					continue
				}
				result = append(result, p1.Loc)
			}
			p.Conn.WriteJSON(&result)
		}
	}
}
