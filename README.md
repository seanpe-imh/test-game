# test-game

A tiny **in-browser free-throw** demo built to show **Cursor** driving a small full-stack slice: **Go** serves the assets; **HTML/CSS/JS** run the game in the canvas.

## Original prompt

> I have been tasked with creating a test-game to demonstrate Cursor usage. I'm thinking an in-browser basketball game with Go as a foundation. The user would be at the free-throw line and try to make it in the basket. Side-profile view please. Pressing the space bar shoots out a line that moves back and forth, indicating the power of the shot. Something like that.

## The game

- **View:** Side profile — you shoot from the free-throw line toward the hoop on the right.
- **Controls:** **Space** starts a **power meter** (a line that sweeps back and forth). **Space** again locks power and shoots. After the ball settles, **Space** resets for another try.
- **Goal:** Time the second press so the ball drops through the hoop plane — makes add to your score in the HUD.

## Run it

Requires [Go](https://go.dev/) 1.22+.

```bash
go run .
```

Open [http://localhost:8080](http://localhost:8080).

## Stack

| Piece | Role |
|--------|------|
| `main.go` | `embed`s `web/` and serves it with `net/http` |
| `web/game.js` | Canvas drawing, input, projectile physics, scoring |
| `web/index.html` / `style.css` | Page shell and styling |

No external JS dependencies — easy to fork and tweak constants (power range, meter speed, hoop position) in `web/game.js`.
