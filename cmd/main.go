package main

import (
	"context"
	"errors"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
)

var pool pgxpool.Pool

func main() {
	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		panic(err)
	}
	defer pool.Close()

	e := echo.New()
	e.Logger.SetLevel(log.INFO)
	e.Logger.(*log.Logger).SetHeader("${time_rfc3339} ${level} ${short_file}:L${line} ${message}")
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${time_rfc3339} ${latency_human} ${status} ${method} ${uri} err=\"${error}\"\n",
	}))

	e.GET("/hexes", func(c echo.Context) error {
		rows, _ := pool.Query(context.Background(),
			"SELECT hex, count(1) FROM \"order\" GROUP BY hex")
		type row struct {
			Id    string `json:"id"`
			Count int    `json:"count"`
		}
		hexes, err := pgx.CollectRows(rows, pgx.RowToStructByPos[row])
		if err != nil {
			_ = c.String(http.StatusBadGateway, err.Error())
			return errors.New("ERR 0001 - BAD DB")
		}
		return c.JSON(http.StatusOK, hexes)
	})

	e.Static("/s/", "web")

	e.Logger.Fatal(e.Start(os.Getenv("LISTEN")))
}
