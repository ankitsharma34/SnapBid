import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`SnapBid Server is running on PORT: ${PORT}`);
});
