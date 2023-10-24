import { createClient } from "@libsql/client";
import * as http from "http";
import "dotenv/config";

const httpHost = "localhost";
const httpPort = 3000;

const databaseConfig = {
  url: "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_URL,
};
const db = createClient(databaseConfig);

function syncDatabase() {
  db.sync();
}

setInterval(syncDatabase, 1500);

const server = http.createServer(async (req, res) => {
  try {
    const rs = await db.execute("SELECT * FROM leaderboard ORDER BY score DESC");
    let rank = 1;
    const result = rs.rows.map((row) => ({
      rank: rank++,
      player: row.player,
      score: row.score,
    }));
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/json");
    res.end(JSON.stringify(result));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/json");
    res.end(JSON.stringify({ error: e.message }));
  }
});

server.listen(httpPort, httpHost);
