import argon2 from "argon2";
export const hashPassword = async (password: string) => {
  const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
  return hashedPassword;
};
