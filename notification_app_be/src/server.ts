import app from "./app";
import { Log } from "../../logging_middleware/src/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  Log("backend", "info", "config", `Server started on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});
