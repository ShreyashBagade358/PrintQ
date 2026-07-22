"use server"

import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const registerSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  shopSlug: z.string().min(2, "Shop slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pinCode: z.string().min(4, "Pin code must be at least 4 characters"),
  shopPhone: z.string().min(10, "Phone must be at least 10 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function loginAction(_prevState: unknown, formData: FormData) {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { error: validated.error.errors[0].message }
  }

  try {
    const expectedRole = formData.get("expectedRole") as string | null

    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    })

    const user = await prisma.user.findUnique({
      where: { email: validated.data.email },
      select: { role: true },
    })

    if (expectedRole === "CUSTOMER" && user?.role !== "CUSTOMER") {
      return { error: "This email is registered as a shop account. Please use Shop Login." }
    }
    if (expectedRole === "SHOP" && user?.role !== "SHOP_OWNER" && user?.role !== "STAFF") {
      return { error: "This email is registered as a customer account. Please use Customer Login." }
    }

    const redirect = user?.role === "SHOP_OWNER" || user?.role === "STAFF"
      ? "/shop/dashboard"
      : user?.role === "CUSTOMER"
      ? "/customer/dashboard"
      : "/"

    return { success: true, redirect }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}

export async function registerAction(_prevState: unknown, formData: FormData) {
  try {
    const validated = registerSchema.safeParse({
      shopName: formData.get("shopName"),
      shopSlug: formData.get("shopSlug"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      pinCode: formData.get("pinCode"),
      shopPhone: formData.get("shopPhone"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!validated.success) {
      return { error: validated.error.errors[0].message }
    }

    const { shopName, shopSlug, address, city, state, pinCode, shopPhone, name, email, phone, password } = validated.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "Email already registered" }
    }

    const existingShop = await prisma.shop.findUnique({ where: { slug: shopSlug } })
    if (existingShop) {
      return { error: "Shop slug already taken" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "SHOP_OWNER",
        emailVerified: new Date(),
      },
    })

    await prisma.shop.create({
      data: {
        name: shopName,
        slug: shopSlug,
        address,
        city,
        state,
        pinCode,
        phone: shopPhone,
        email,
        ownerId: user.id,
        status: "ACTIVE",
      },
    })

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
    } catch {
      // signIn may fail if session isn't ready; redirect anyway
    }
    return { success: true, redirect: "/shop/dashboard" }
  } catch (e) {
    console.error("Registration error:", e)
    return { error: e instanceof Error ? e.message : "Registration failed. Please try again." }
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/auth/login" })
}

const customerRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export async function customerRegisterAction(_prevState: unknown, formData: FormData) {
  try {
    const validated = customerRegisterSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!validated.success) {
      return { error: validated.error.errors[0].message }
    }

    const { name, email, phone, password } = validated.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "Email already registered" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "CUSTOMER",
        emailVerified: new Date(),
      },
    })

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
    } catch {
      // signIn may fail if session isn't ready; redirect anyway
    }
    return { success: true, redirect: "/customer/dashboard" }
  } catch (e) {
    console.error("Customer registration error:", e)
    return { error: e instanceof Error ? e.message : "Registration failed. Please try again." }
  }
}
