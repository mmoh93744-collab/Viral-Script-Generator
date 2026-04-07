// src/app.ts
import express, { Request, Response } from "express";
import pinoHttp from "pino-http";

const app = express();
const logger = pinoHttp();

// تسجيل كل طلب
app.use(logger);

// مثال على صفحة رئيسية
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// إضافة أي Routes إضافية هنا
app.get("/about", (req: Request, res: Response) => {
  res.send("About Page");
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
