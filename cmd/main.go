package main

import (
	"context"
	"errors"
	"net/http"
	"os"
        "strings"

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

        type product struct {
            Id   string
            Name string
            Hex  string
        }
        products := []product{
            {"10001", "apple - WHITE", "854bb1bbfffffff"},
            {"10002", "apple - PINK", "854b86c3fffffff"},
            {"10003", "apple - EXPENSIVE", "854b86c3fffffff"},
            {"10004", "apple - LIMITED EDITION", "854ba2d3fffffff"},
        }

        e.GET("/product/:name", func(c echo.Context) error {
            name := c.Param("name")
            type item struct {
                Id   string `json:"id"`
                Name string `json:"name"`
            }
            results := make([]item, 0)
            for _, prod := range products {
                if strings.HasPrefix(prod.Name, name) {
                    results = append(results, item{prod.Id, prod.Name})
                }
            }
            return c.JSON(http.StatusOK, results)
        })

        e.GET("/most/:hex", func (c echo.Context) error {
            hex := c.Param("hex")
            type item struct {
                Id   string `json:"id"`
                Name string `json:"name"`
            }
            results := make([]item, 0)
            for _, prod := range products {
                if prod.Hex == hex {
                    results = append(results, item{prod.Id, prod.Name})
                }
            }
            return c.JSON(http.StatusOK, results)
        })

        e.GET("/hex/:prod_id", func(c echo.Context) error {
            prod_id := c.Param("prod_id")
            results := make([]string, 0)
            for _, prod := range products {
                if prod.Id == prod_id {
                    results = append(results, prod.Hex)
                }
            }
            return c.JSON(http.StatusOK, results)
        })

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
