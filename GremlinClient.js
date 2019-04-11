import gremlin from "gremlin";

export default class GremlinClient {
  constructor() {
    console.log("Creating a Gremlin Client");
    /*
      Since Cosmos DB Gremlin API doesn't support byte code we'll keep
      to the scripts work flow (Not fluent API)
    */
    this.client = new gremlin.driver.Client("ws://localhost:8182/gremlin", {
      traversalSource: "g"
    });
  }

  async getAllVertices() {
    var resultSets = await this.client.submit("g.V()");
    var results = [];
    resultSets._items.forEach(resultSet => {
      results.push(this.resultSetToJson(resultSet));
    });
    return results;
  }

  async getVertex(vertexId) {
    var resultSets = await this.client.submit("g.V(vId)", { vId: vertexId });
    if (resultSets._items.length)
      return this.resultSetToJson(resultSets.first());
    return null;
  }

  async createVertex(payload) {
    var query = "g.addV(vLabel)";
    Object.entries(payload.properties).forEach(([key, value]) => {
      query += `.property('${key}', '${value}')`;
    });
    var resultSets = await this.client.submit(query, { vLabel: payload.label });
    return this.resultSetToJson(resultSets.first());
  }

  async deleteVertex(vertexId) {
    this.client.submit("g.V(vId).drop()", { vId: vertexId });
  }

  async updateVertex(vertex, newValues) {
    var query = "g.V(vId)";
    Object.entries(newValues.properties).forEach(([key, value]) => {
      query += `.property('${key}', '${value}')`;
    });
    await this.client.submit(query, { vId: vertex.id });
    const propertiesToRemove = this.determinePropertiesToRemove(
      vertex.properties,
      newValues.properties
    );
    if (propertiesToRemove.length) {
      var query = `g.V(vId).properties(${propertiesToRemove.toString()}).drop()`;
      await this.client.submit(query, { vId: vertex.id });
    }
  }

  resultSetToJson(resultSet) {
    var json = {
      id: resultSet.id,
      label: resultSet.label,
      properties: {}
    };
    if (!resultSet.properties) return json;
    Object.entries(resultSet.properties).forEach(([key, data]) => {
      json["properties"][key] = data[0].value;
    });
    return json;
  }

  determinePropertiesToRemove(oldProperties, newProperties) {
    const remove = [];
    Object.keys(oldProperties).forEach(key => {
      if (!(key in newProperties)) {
        remove.push(`'${key}'`);
      }
    });
    return remove;
  }
}
