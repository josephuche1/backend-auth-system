import prisma from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/password";
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from "../../errors/AppError";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET as string

export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new ConflictError("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword,
    },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError("User not found.")
  }

  const isValid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!isValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (token: string) => {
  let decoded: { userId: string; role: string };

  try {
    decoded = jwt.verify(token, JWT_SECRET) as { 
      userId: string;
      role: string;
    };
  } catch {
    throw new UnauthorizedError("Invalid Token");
  }

  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) {
    throw new Error("Something unexpected happened");
  }

  const now = new Date();

  if (refreshToken.expiresAt < now) {
    throw new UnauthorizedError("Token Expired");
  }

  const accessToken = generateAccessToken(decoded.userId, decoded.role);

  return {
    accessToken,
  };
};

export const logoutUser = async (token: string) => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) {
    throw new Error("Something unexpected happened");
  }

  await prisma.refreshToken.delete({
    where: { token },
  });

  return { message: "Logged out successfully" };
};