import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'https://test-task-jet-three.vercel.app'],
}));
app.use(express.json());

const ITEMS = Array.from({ length: 1_000_000 }, (_, i) => ({
  id: i.toString(),
  name: `Item ${i + 1}`,
}));

let itemOrder = [];
let selectedItems = new Set();

app.post("/save-order", (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "Неверный формат данных" });
  }
  itemOrder = order;
  res.json({ success: true });
});

app.get("/items", (req, res) => {
  const query = req.query.query?.toLowerCase() || "";
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 20;

  let filteredItems = ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query)
  );

  let orderedItems = filteredItems
    .sort((a, b) => itemOrder.indexOf(a.id) - itemOrder.indexOf(b.id))
    .filter((item) => itemOrder.includes(item.id));

  const missingItems = filteredItems.filter(item => !itemOrder.includes(item.id));

  orderedItems = [...orderedItems, ...missingItems];

  const startIndex = (page - 1) * limit;
  const paginatedItems = orderedItems.slice(startIndex, startIndex + limit);

  res.json({
    items: paginatedItems,
    total: filteredItems.length,
    selected: Array.from(selectedItems),
  });
});

app.post("/save-selection", (req, res) => {
  const { selected } = req.body;
  if (!Array.isArray(selected)) {
    return res.status(400).json({ error: "Неверный формат данных" });
  }
  selectedItems = new Set(selected);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
