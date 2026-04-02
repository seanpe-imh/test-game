package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed web/*
var webFS embed.FS

func main() {
	fsys, err := fs.Sub(webFS, "web")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/", http.FileServer(http.FS(fsys)))
	addr := ":8080"
	log.Printf("Free-throw demo: http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
