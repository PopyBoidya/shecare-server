const express = require("express");
const cors = require("cors"); // add this
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // to parse JSON body

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@shecare.r5fmqpq.mongodb.net/?retryWrites=true&w=majority&appName=shecare`;

// Create MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB (Native)");

    const db = client.db("shecare"); // database name
    const volunteersCollection = db.collection("volunteers"); // collection name
    const padrequest = db.collection("padrequest"); // collection name
    const availabilityCollection = db.collection("availability"); // collection for availability
    const taskAssignCollection = db.collection("task-assign");
    const adminCollection = db.collection("admin-register");

    // ✅ POST — Register a new admin
    app.post("/admin-register", async (req, res) => {
      try {
        const adminData = {
          ...req.body,
          role: "admin",
          createdAt: new Date(),
        };

        const result = await adminCollection.insertOne(adminData);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
    // ✅ Commit: "Added POST /admin-register route to register new admin"

    // 📥 GET — Get all registered admins
    app.get("/admin-register", async (req, res) => {
      try {
        const result = await adminCollection.find().toArray();
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    // ✅ Commit: "Added GET /admin-register route to get all admins"

    // ✏️ PUT — Update admin info by ID
    app.put("/admin-register/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        const result = await adminCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });
    // ✅ Commit: "Added PUT /admin-register/:id route to update admin info"

    // ❌ DELETE — Remove an admin by ID
    app.delete("/admin-register/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await adminCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json({ message: "Admin deleted successfully" });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // --- GET all volunteers ---
    app.get("/volunteers", async (req, res) => {
      try {
        const data = await volunteersCollection.find().toArray();
        res.json(data);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // --- POST volunteers (any shape) ---
    app.post("/volunteers", async (req, res) => {
      try {
        const result = await volunteersCollection.insertOne(req.body);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // GET all pad-request data
    app.get("/pad-request", async (req, res) => {
      try {
        const data = await padrequest.find({ type: "pad-request" }).toArray();
        res.json(data);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST pad-request data
    app.post("/pad-request", async (req, res) => {
      try {
        // amra ekhane data er sathe "type: 'pad-request'" add korbo jate differentiate kora jai
        const doc = { ...req.body, type: "pad-request" };
        const result = await padrequest.insertOne(doc);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // PUT (update) pad-request data
    app.put("/pad-request/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: updateData,
        };

        const result = await padrequest.updateOne(filter, updateDoc);
        res.json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // DELETE pad-request data
    app.delete("/pad-request/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };

        const result = await padrequest.deleteOne(filter);
        res.json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // === Department API ===

    // GET all departments
    app.get("/department", async (req, res) => {
      try {
        const departments = await client
          .db("shecare")
          .collection("department")
          .find()
          .toArray();
        res.json(departments);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST new department
    app.post("/department", async (req, res) => {
      try {
        const doc = req.body;
        const result = await client
          .db("shecare")
          .collection("department")
          .insertOne(doc);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // DELETE department by ID
    app.delete("/department/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      try {
        const result = await client
          .db("shecare")
          .collection("department")
          .deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Department not found" });
        }
        res.json({ message: "Department deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // === Year API ===

    // GET all years
    app.get("/year", async (req, res) => {
      try {
        const years = await client
          .db("shecare")
          .collection("year")
          .find()
          .toArray();
        res.json(years);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST new year
    app.post("/year", async (req, res) => {
      try {
        const doc = req.body;
        const result = await client
          .db("shecare")
          .collection("year")
          .insertOne(doc);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // DELETE year by ID
    app.delete("/year/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      try {
        const result = await client
          .db("shecare")
          .collection("year")
          .deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Year not found" });
        }
        res.json({ message: "Year deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // GET all availability
    app.get("/availability", async (req, res) => {
      try {
        const availabilities = await availabilityCollection.find({}).toArray();
        res.json(availabilities);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // POST availability
    app.post("/availability", async (req, res) => {
      try {
        const data = req.body; // expecting { availability: [...] } or any object
        if (!data || Object.keys(data).length === 0) {
          return res
            .status(400)
            .json({ message: "Availability data required" });
        }
        const result = await availabilityCollection.insertOne(data);
        res.status(201).json({ _id: result.insertedId, ...data });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
    });

    // DELETE availability by id
    app.delete("/availability/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await availabilityCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Availability not found" });
        }
        res.json({ message: "Availability deleted" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // === Building API ===

    // GET all buildings
    app.get("/building", async (req, res) => {
      try {
        const buildings = await client
          .db("shecare")
          .collection("building")
          .find()
          .toArray();
        res.json(buildings);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST new building
    app.post("/building", async (req, res) => {
      try {
        const doc = req.body;
        const result = await client
          .db("shecare")
          .collection("building")
          .insertOne(doc);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // DELETE building by ID
    app.delete("/building/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      try {
        const result = await client
          .db("shecare")
          .collection("building")
          .deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Building not found" });
        }
        res.json({ message: "Building deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // === Floor API ===

    // GET all floors
    app.get("/floor", async (req, res) => {
      try {
        const floors = await client
          .db("shecare")
          .collection("floor")
          .find()
          .toArray();
        res.json(floors);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // POST new floor
    app.post("/floor", async (req, res) => {
      try {
        const doc = req.body;
        const result = await client
          .db("shecare")
          .collection("floor")
          .insertOne(doc);
        res.status(201).json(result);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    });

    // DELETE floor by ID
    app.delete("/floor/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).json({ message: "Invalid ID" });

      try {
        const result = await client
          .db("shecare")
          .collection("floor")
          .deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Floor not found" });
        }
        res.json({ message: "Floor deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    app.get("/", (req, res) => {
      res.send("Hello World (MongoDB Native)");
    });

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
