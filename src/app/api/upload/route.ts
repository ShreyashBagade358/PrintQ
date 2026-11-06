import { NextResponse } from "next/server"
import { UTApi } from "uploadthing/server"
import { requireApiAuth, apiError } from "@/lib/api-auth"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 32 * 1024 * 1024 // 32MB

export async function POST(req: Request) {
  const { error } = requireApiAuth(req)
  if (error) return error

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return apiError("Expected multipart/form-data")
  }

  const file = formData.get("file")
  if (!file || !(file instanceof File)) return apiError("File is required (field: file)")

  if (file.size <= 0) return apiError("File is empty")
  if (file.size > MAX_FILE_SIZE) return apiError("File exceeds the 32MB limit")

  try {
    const utapi = new UTApi()
    const response = await utapi.uploadFiles([file])

    const result = response[0]
    if (result.data) {
      return NextResponse.json({
        success: true,
        file: {
          url: result.data.url,
          name: result.data.name,
          size: result.data.size,
          type: result.data.type,
          key: result.data.key,
        },
      })
    }

    return apiError(result.error?.message || "Upload failed", 500)
  } catch {
    return apiError("Upload failed", 500)
  }
}