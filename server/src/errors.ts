import { NextFunction, Request, Response } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err?.status && err?.message) {
    return res.status(err.status).json({ code: err.code || "ERROR", message: err.message });
  }

  return res.status(500).json({ code: "INTERNAL", message: "Something went wrong" });
}
