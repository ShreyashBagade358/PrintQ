import { createUploadthing, type FileRouter } from "uploadthing/next"
import { decode } from "next-auth/jwt"

const f = createUploadthing()

const COOKIE_NAME = "authjs.session-token"

export const uploadRouter = {
  documentUploader: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    blob: { maxFileSize: "32MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const cookies = (req.headers.get("cookie") || "")
        .split(";")
        .map(c => c.trim().split("="))
        .reduce<Record<string, string>>((acc, [k, v]) => { if (k) acc[k] = decodeURIComponent(v || ""); return acc }, {})

      const isSecure = !!cookies[`__Secure-${COOKIE_NAME}`]
      const actualCookieName = isSecure ? `__Secure-${COOKIE_NAME}` : COOKIE_NAME
      const tokenValue = cookies[actualCookieName]
      if (!tokenValue) throw new Error("Unauthorized")

      const token = await decode({
        token: tokenValue,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET!,
        salt: actualCookieName,
      })
      if (!token?.sub) throw new Error("Unauthorized")

      return { userId: token.sub }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url, name: file.name }
    }),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
