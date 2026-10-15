import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbconnect.mjs";
import corsOptions from "./config/corsOptions.mjs";
import rootRouter from "./routes/root.mjs";
import { globalErrorHandeller } from "./middleware/globalErrorHandeller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const bootstrap = (app, express) => {
  connectDB();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use(cookieParser());

  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", rootRouter);

  app.get("/ping", (req, res) => {
    const currentTime = new Date().toLocaleString("ar-EG", {
      timeZone: "Africa/Cairo",
    });
    console.log(`Server Current Time Is : ${currentTime}`);
    res.send("I am alive!");
  });

  app.all(/.*/, (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
      res.sendFile(path.join(__dirname, "views", "NotFound.html"));
    } else if (req.accepts("json")) {
      res.send({ message: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  app.use(globalErrorHandeller);
};
