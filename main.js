import express from "express";
import cors from "cors";
import GremlinClient from "./GremlinClient";

const app = express();
const gremlinClient = new GremlinClient();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const response = await gremlinClient.getAllVertices();
  res.json(response);
});

app.get("/:id", async (req, res) => {
  const response = await gremlinClient.getVertex(req.params.id);
  res.json(response);
});

app.post("/", async (req, res) => {
  const response = await gremlinClient.createVertex(req.body);
  res.json(response);
});

app.put("/:id", async (req, res) => {
  const vertex = await gremlinClient.getVertex(req.params.id);
  if (!vertex) {
    res.status(404);
    res.json();
  }
  await gremlinClient.updateVertex(vertex, req.body);
  res.status(204);
  res.json();
});

app.delete("/:id", async (req, res) => {
  const vertex = await gremlinClient.getVertex(req.params.id);
  if (!vertex) {
    res.status(404);
    res.json();
  }
  await gremlinClient.deleteVertex(req.params.id);
  res.status(204);
  res.json();
});

app.listen(3001, () => console.log("Running on: http://localhost:3001/"));
