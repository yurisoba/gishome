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

        e.GET("/stats/:hex", func(c echo.Context) error {
                hex := c.Param("hex")
                rows, _ := pool.Query(context.Background(),
                        `SELECT *
FROM (
        SELECT name, SUBSTRING(t::TEXT,0, 11), row_number() OVER (PARTITION BY (t) ORDER BY c DESC) AS row_numb, c
	FROM (
		SELECT p.name, date_trunc('month', order_creation_time) AS t, count(1) AS c
		FROM "order" o
		JOIN product p
			ON (p.id = o.product_id)
		JOIN suppliers s
			ON (p.supplier_id = s.id)
                WHERE hex = $1
                AND p.id IS NOT NULL
                AND s.id IS NOT NULL
		GROUP BY (p.name, t)
	) f1
) f2
WHERE row_numb <= 3`, hex)
                type row struct {
                    Name string `json:"name"`
                    T    string `json:"month"`
                    R    int    `json:"ranking"`
                    C    int    `json:"count"`
                }
                results, err := pgx.CollectRows(rows, pgx.RowToStructByPos[row])
		if err != nil {
			_ = c.String(http.StatusBadGateway, err.Error())
			return errors.New("ERR 0001 - BAD DB")
		}
		return c.JSON(http.StatusOK, results)
        })

        e.GET("/loyal/:hex", func(c echo.Context) error {
                hex := c.Param("hex")
                rows, _ := pool.Query(context.Background(),
                        `SELECT customer_id, count(1) AS c
FROM "order" o
JOIN product p
    ON (p.id = o.product_id)
JOIN suppliers s
    ON (p.supplier_id = s.id)
WHERE hex = $1
AND p.id IS NOT NULL
AND s.id IS NOT NULL
GROUP BY (customer_id)
ORDER BY c DESC LIMIT 3`, hex)
                type row struct {
                    CID  string `json:"customer_id"`
                    C    int    `json:"sales_volumn"`
                }
                results, err := pgx.CollectRows(rows, pgx.RowToStructByPos[row])
		if err != nil {
			_ = c.String(http.StatusBadGateway, err.Error())
			return errors.New("ERR 0001 - BAD DB")
		}
		return c.JSON(http.StatusOK, results)
        })

	e.GET("/most/:hex", func(c echo.Context) error {
		hex := c.Param("hex")
		rows, _ := pool.Query(context.Background(),
			`WITH sales_table AS (
SELECT product_id, hex, COUNT(cart_id) AS sales_volumn
	FROM "order"
	GROUP BY (product_id, hex)
	ORDER BY hex, sales_volumn DESC
),
sales_table_row_num AS (
	SELECT *, ROW_NUMBER() OVER(PARTITION BY hex ORDER BY sales_volumn DESC) AS row_number
	FROM sales_table
),
product_table AS (
	SELECT distinct(id), name
	FROM product
)
SELECT product_id, name
FROM sales_table_row_num
JOIN product_table
ON product_id=id
WHERE row_number < 10
AND hex=$1
ORDER BY sales_volumn`, hex)
		type row struct {
			Id   string `json:"id"`
			Name string `json:"name"`
		}
		results, err := pgx.CollectRows(rows, pgx.RowToStructByPos[row])
		if err != nil {
			_ = c.String(http.StatusBadGateway, err.Error())
			return errors.New("ERR 0001 - BAD DB")
		}
		return c.JSON(http.StatusOK, results)
	})


	e.GET("/heatmap/:hex", func(c echo.Context) error {
            return c.JSON(http.StatusOK, map[string]interface{}{
                "array": []map[string]interface{}{
                    {
                        "name": "854bb1affffffff",
                        "count": 122,
                    },
                    {
                        "name": "854bb183fffffff",
                        "count": 17213,
                    },
                    {
                        "name": "854ba293fffffff",
                        "count": 44,
                    },
                    {
                        "name": "854ba283fffffff",
                        "count": 9001,
                    },
                    {
                        "name": "854ba1dbfffffff",
                        "count": 12301,
                    },
                    {
                        "name": "854ba14bfffffff",
                        "count": 5993,
                    },
                    {
                        "name": "854ba0bbfffffff",
                        "count": 1404,
                    },
                },
            })

	})

        e.GET("/suppliers/:customer", func(c echo.Context) error {
            return c.JSON(http.StatusOK, map[string]interface{}{
                "array": []map[string]interface{}{
                    {
                        "name": "Supplier 1",
                        "count": 122,
                    },
                    {
                        "name": "Supplier 2",
                        "count": 233,
                    },
                    {
                        "name": "Supplier 3",
                        "count": 44,
                    },
                },
            })
        })

        e.GET("/categories/:customer", func(c echo.Context) error {
            return c.JSON(http.StatusOK, map[string]interface{}{
                "array": []map[string]interface{}{
                    {
                        "name": "Cat 1",
                        "count": 122,
                    },
                    {
                        "name": "Cat 2",
                        "count": 233,
                    },
                    {
                        "name": "Cat 3",
                        "count": 44,
                    },
                },
            })
        })

        e.GET("/time/customer/:customer", func(c echo.Context) error {
            return c.JSON(http.StatusOK, map[string]interface{}{
                "array": []map[string]interface{}{
                    {
                        "time": "2011-02-01 00:00:00",
                        "count": 122,
                    },
                    {
                        "name": "2011-03-01 00:00:00",
                        "count": 233,
                    },
                    {
                        "name": "2011-04-01 00:00:00",
                        "count": 44,
                    },
                    {
                        "name": "2011-05-01 00:00:00",
                        "count": 445,
                    },
                    {
                        "name": "2011-06-01 00:00:00",
                        "count": 15,
                    },
                    {
                        "name": "2012-01-01 00:00:00",
                        "count": 45,
                    },
                },
            })
        })

        e.GET("/time/product/:product", func(c echo.Context) error {
            return c.JSON(http.StatusOK, map[string]interface{}{
                "array": []map[string]interface{}{
                    {
                        "time": "2011-02-01 00:00:00",
                        "count": 122,
                    },
                    {
                        "name": "2011-03-01 00:00:00",
                        "count": 233,
                    },
                    {
                        "name": "2011-04-01 00:00:00",
                        "count": 44,
                    },
                    {
                        "name": "2011-05-01 00:00:00",
                        "count": 445,
                    },
                    {
                        "name": "2011-06-01 00:00:00",
                        "count": 15,
                    },
                    {
                        "name": "2012-01-01 00:00:00",
                        "count": 45,
                    },
                },
            })
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
			`SELECT hex, count(1)
FROM "order"
JOIN product p on "order".product_id = p.id
GROUP BY hex`)
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
